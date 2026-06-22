import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class AnalysisAgent:
    def __init__(self):
        pass

    def prepare_analysis_context(self, retrieved_chunks: List[Dict[str, Any]]) -> str:
        """Formats retrieved chunks into a structured context block for the LLM."""
        if not retrieved_chunks:
            return "No relevant document context was found."
            
        formatted_parts = []
        # Group chunks by document name to make the context more coherent
        by_doc = {}
        for chunk in retrieved_chunks:
            doc_name = chunk["file_name"]
            if doc_name not in by_doc:
                by_doc[doc_name] = []
            by_doc[doc_name].append(chunk["text"])
            
        for doc_name, texts in by_doc.items():
            formatted_parts.append(f"=== Document: {doc_name} ===")
            for i, text in enumerate(texts):
                formatted_parts.append(f"[Excerpt {i+1}]:\n{text}\n")
                
        return "\n".join(formatted_parts)

    def get_analysis_guidelines(self, action_type: str) -> str:
        """Returns background analysis instructions based on query action type."""
        if action_type == "summarize":
            return (
                "Perform an executive summarization of the document context. Focus on key findings, "
                "operational milestones, capital activity, and potential bottlenecks. Present information clearly."
            )
        elif action_type == "compare":
            return (
                "Perform a comparative analysis of the metrics, projects, or parameters described in the context. "
                "Identify variances, compare against market standards if applicable, and point out highlights and risks."
            )
        elif action_type == "recommend":
            return (
                "Develop actionable recommendations based on the context. Provide short-term (1-2 weeks), "
                "medium-term (1 month), and long-term (Q3 2026 / future) roadmap goals. Include a confidence score "
                "based on the completeness of the data."
            )
        else:
            return (
                "Analyze the document context to answer the user's custom question. Ensure your answer is fully "
                "grounded in the provided context. If the context does not contain the answer, state that clearly."
            )

analysis_agent = AnalysisAgent()
