from typing import Dict, List, Any

class InMemoryDatabase:
    def __init__(self):
        # Maps session_id -> {file_id -> {id: str, name: str, size: str, type: str, raw_text: str, size_bytes: int}}
        self.documents: Dict[str, Dict[str, Dict[str, Any]]] = {}
        # Maps session_id -> list of chunks: [{file_id: str, text: str, embedding: List[float]}]
        self.chunks: Dict[str, List[Dict[str, Any]]] = {}

    def ensure_session(self, session_id: str):
        """Initializes empty storage structures for a new session if needed."""
        if session_id not in self.documents:
            self.documents[session_id] = {}
        if session_id not in self.chunks:
            self.chunks[session_id] = []

    def add_document(self, session_id: str, file_id: str, name: str, size: str, file_type: str, raw_text: str, size_bytes: int, file_bytes: bytes = None):
        self.ensure_session(session_id)
        self.documents[session_id][file_id] = {
            "id": file_id,
            "name": name,
            "size": size,
            "type": file_type,
            "raw_text": raw_text,
            "size_bytes": size_bytes,
            "file_bytes": file_bytes
        }

    def add_chunk(self, session_id: str, file_id: str, text: str, embedding: List[float] = None):
        self.ensure_session(session_id)
        self.chunks[session_id].append({
            "file_id": file_id,
            "text": text,
            "embedding": embedding or []
        })

    def delete_document(self, session_id: str, file_id: str):
        if session_id in self.documents and file_id in self.documents[session_id]:
            del self.documents[session_id][file_id]
        if session_id in self.chunks:
            self.chunks[session_id] = [
                chunk for chunk in self.chunks[session_id] if chunk["file_id"] != file_id
            ]

    def get_all_documents(self, session_id: str) -> List[Dict[str, Any]]:
        if session_id not in self.documents:
            return []
        return list(self.documents[session_id].values())

    def get_chunks_for_files(self, session_id: str, file_ids: List[str]) -> List[Dict[str, Any]]:
        if session_id not in self.chunks:
            return []
        return [chunk for chunk in self.chunks[session_id] if chunk["file_id"] in file_ids]

    def get_total_size(self, session_id: str) -> int:
        """Returns the sum of sizes (in bytes) of all documents uploaded for the session."""
        if session_id not in self.documents:
            return 0
        return sum(doc.get("size_bytes", 0) for doc in self.documents[session_id].values())

# Singleton instance
db = InMemoryDatabase()

