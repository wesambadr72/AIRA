import math
import logging
from typing import List, Dict, Any
from src.services.database import db
from src.services.gemini_client import generate_embedding
from src.config import RETRIEVAL_TOP_K

logger = logging.getLogger(__name__)

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.0
    dot_prod = sum(a * b for a, b in zip(v1, v2))
    norm1 = math.sqrt(sum(a * a for a in v1))
    norm2 = math.sqrt(sum(b * b for b in v2))
    if norm1 == 0.0 or norm2 == 0.0:
        return 0.0
    return dot_prod / (norm1 * norm2)

def keyword_overlap_score(query: str, text: str) -> float:
    """Fallback keyword overlap matching score."""
    q_words = set(query.lower().split())
    t_words = set(text.lower().split())
    if not q_words:
        return 0.0
    intersection = q_words.intersection(t_words)
    # Simple term frequency metric adjusted by document length log
    return float(len(intersection)) / (math.log(len(t_words) + 2.0))

class RetrievalAgent:
    def __init__(self):
        pass

    def retrieve_context(self, session_id: str, query: str, file_ids: List[str], top_k: int = RETRIEVAL_TOP_K) -> List[Dict[str, Any]]:
        """Retrieves top_k relevant chunks for the query from selected files."""
        if not file_ids:
            logger.info("No active files selected for retrieval.")
            return []

        # Get relevant chunks from the database filtered by session
        active_chunks = db.get_chunks_for_files(session_id, file_ids)
        if not active_chunks:
            logger.info("No text chunks found for selected files in DB.")
            return []

        logger.info(f"Retrieval Agent: Searching across {len(active_chunks)} chunks for files: {file_ids}")

        # Try to generate embedding for the query
        query_embedding = generate_embedding(query)
        use_embeddings = len(query_embedding) > 0

        scored_chunks = []
        for chunk in active_chunks:
            chunk_embedding = chunk.get("embedding")
            
            if use_embeddings and chunk_embedding and len(chunk_embedding) == len(query_embedding):
                score = cosine_similarity(query_embedding, chunk_embedding)
            else:
                score = keyword_overlap_score(query, chunk["text"])
            
            # Retrieve file name for display/reference
            doc_meta = db.documents.get(session_id, {}).get(chunk["file_id"], {})
            doc_name = doc_meta.get("name", "Unknown File")
            
            scored_chunks.append({
                "text": chunk["text"],
                "file_id": chunk["file_id"],
                "file_name": doc_name,
                "score": score
            })

        # Sort by score descending
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)

        # Return top K chunks
        retrieved = scored_chunks[:top_k]
        
        # Log top retrieved chunk scores
        if retrieved:
            logger.info(f"Top retrieved chunk score: {retrieved[0]['score']:.4f} (file: {retrieved[0]['file_name']})")
        
        return retrieved

retrieval_agent = RetrievalAgent()
