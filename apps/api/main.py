import os
import uuid
import logging
import time
import collections
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn

from src.services.database import db
from src.agents.ingestion import ingestion_agent
from src.agents.retrieval import retrieval_agent
from src.agents.analysis import analysis_agent
from src.agents.decision_writer import decision_writer_agent
from src.config import SERVER_HOST, SERVER_PORT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AIRA AI Research Assistant API", version="1.0.0")

# Setup CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aira-front-three.vercel.app",
        "https://aira-front-three.vercel.app/",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str
    fileIds: List[str]
    history: List[Dict[str, str]] = []
    actionType: str = "normal"
    lang: str = "en"
    sessionId: str

@app.get("/")
def home():
    return {"message": "AIRA API is running"}


@app.get("/api/files")
async def list_files(sessionId: str):
    """Lists all uploaded documents metadata for a specific session."""
    docs = db.get_all_documents(sessionId)
    # Format return to match the frontend expectations
    return [
        {
            "id": doc["id"],
            "name": doc["name"],
            "size": doc["size"],
            "type": doc["type"],
            "status": "completed",
            "progress": 100
        }
        for doc in docs
    ]

@app.post("/api/upload")
async def upload_file(sessionId: str, file: UploadFile = File(...)):
    """Ingests, parses and generates embeddings for an uploaded document under a sessionId, enforcing size checks."""
    if not sessionId:
        raise HTTPException(status_code=400, detail="Missing sessionId")

    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    extension = filename.split(".")[-1].lower()
    if extension not in ["pdf", "docx"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: .{extension}. Only PDF and DOCX files are allowed."
        )

    try:
        # Read file content bytes
        contents = await file.read()
        size_bytes = len(contents)
        
        # 1. Validate file size (10MB limit per file)
        if size_bytes > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit per file.")
            
        # 2. Validate total size for the session (10MB limit overall)
        current_total = db.get_total_size(sessionId)
        if current_total + size_bytes > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400, 
                detail="Total upload limit reached. The sum of all files in this session cannot exceed 10MB."
            )

        # Format size string
        if size_bytes > 1024 * 1024:
            formatted_size = f"{size_bytes / (1024 * 1024):.1f} MB"
        else:
            formatted_size = f"{size_bytes / 1024:.0f} KB"

        file_id = str(uuid.uuid4())[:8]

        logger.info(f"Session {sessionId}: Uploading file {filename} ({formatted_size})...")
        
        # Trigger Ingestion Agent workflow
        ingestion_agent.ingest_file(
            session_id=sessionId,
            file_id=file_id,
            file_name=filename,
            file_size=formatted_size,
            file_type=extension,
            file_bytes=contents
        )

        return {
            "id": file_id,
            "name": filename,
            "size": formatted_size,
            "type": extension,
            "status": "completed",
            "progress": 100
        }
    except HTTPException:
        raise
    except ValueError as val_err:
        logger.error(f"Validation error in file ingestion: {val_err}")
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        logger.error(f"Internal error during file upload: {e}")
        raise HTTPException(status_code=500, detail=f"In-memory Ingestion Error: {str(e)}")

@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str, sessionId: str):
    """Removes a document from the session in-memory database."""
    logger.info(f"Request from session {sessionId} to delete file ID: {file_id}")
    
    session_docs = db.documents.get(sessionId, {})
    if file_id not in session_docs:
         raise HTTPException(status_code=404, detail="File not found in this session")
    
    db.delete_document(sessionId, file_id)
    return {"status": "success", "message": f"Document {file_id} deleted."}

@app.get("/api/files/{file_id}/content")
async def get_file_content(file_id: str, sessionId: str):
    """Retrieves raw text content of a document."""
    session_docs = db.documents.get(sessionId, {})
    if file_id not in session_docs:
         raise HTTPException(status_code=404, detail="File not found in this session")
    return {
        "id": file_id,
        "name": session_docs[file_id]["name"],
        "content": session_docs[file_id]["raw_text"]
    }

@app.get("/api/files/{file_id}/view")
async def view_file_content(file_id: str, sessionId: str):
    """Serves the original document bytes."""
    session_docs = db.documents.get(sessionId, {})
    if file_id not in session_docs:
         raise HTTPException(status_code=404, detail="File not found in this session")
    doc = session_docs[file_id]
    file_bytes = doc.get("file_bytes")
    if not file_bytes:
        raise HTTPException(status_code=404, detail="File binary content not found")
    media_type = "application/pdf" if doc["type"] == "pdf" else "application/octet-stream"
    headers = {
        "Content-Disposition": f"inline; filename=\"{doc['name']}\""
    }
    return Response(content=file_bytes, media_type=media_type, headers=headers)

# Global rate limit state for chat sessions
chat_limits = collections.defaultdict(list)

@app.post("/api/chat")
async def chat_completion(request: ChatRequest):
    """Handles multi-agent chatbot streaming query isolated by session."""
    logger.info(f"Session {request.sessionId}: Received query: '{request.query}'")
    
    # Rate limit check (20 messages per minute)
    now = time.time()
    window_start = now - 60
    # Clean up timestamps outside the 60-second window
    chat_limits[request.sessionId] = [t for t in chat_limits[request.sessionId] if t > window_start]
    if len(chat_limits[request.sessionId]) >= 20:
        raise HTTPException(
            status_code=429,
            detail="Too many messages. Please wait a minute before sending more messages." if request.lang == "en" else "تجاوزت الحد المسموح للرسائل. يرجى الانتظار دقيقة قبل إرسال المزيد من الرسائل."
        )
    # Record the request timestamp
    chat_limits[request.sessionId].append(now)

    # 1. Retrieval Agent finds top-K context
    retrieved_chunks = retrieval_agent.retrieve_context(
        session_id=request.sessionId,
        query=request.query,
        file_ids=request.fileIds,
        top_k=6
    )
    
    # 2. Analysis Agent formats context
    context_text = analysis_agent.prepare_analysis_context(retrieved_chunks)
    
    # 3. Decision Writer Agent streams SSE response
    response_stream = decision_writer_agent.stream_response(
        query=request.query,
        context=context_text,
        history=request.history,
        action_type=request.actionType,
        lang=request.lang
    )
    
    return StreamingResponse(
        response_stream,
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Encoding": "none"
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=True)
