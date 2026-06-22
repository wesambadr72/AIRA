import json
import asyncio
import logging
from typing import List, Dict, Any, Generator
from src.services.gemini_client import generate_chat_stream

logger = logging.getLogger(__name__)

class DecisionWriterAgent:
    def __init__(self):
        pass

    def get_system_instruction(self, lang: str, action_type: str) -> str:
        """Constructs the system instructions based on language and action type."""
        lang_instruction = "Arabic (RTL layout format, use Arabic language for output)" if lang == "ar" else "English (use English language for output)"
        
        instruction = (
            f"You are AIRA, a highly professional, state-of-the-art AI Research Assistant. "
            f"Your output must be written entirely in {lang_instruction}.\n\n"
            f"Ground all statements strictly in the provided document excerpts. If the information is not in the context, "
            f"state clearly that you cannot find it in the uploaded documents. Do not make up facts.\n\n"
            f"Formatting rules based on action type:\n"
        )
        
        if action_type == "summarize":
            instruction += (
                "- Format the output as an executive summary.\n"
                "- Use headings, bullet points, and highlight key stats/milestones.\n"
                "- Keep it professional, structured, and easy to read."
            )
        elif action_type == "compare":
            instruction += (
                "- Format the output as a Markdown table (e.g. | Parameter | Document A | Document B | Variance |).\n"
                "- Include specific parameters/metrics from the documents.\n"
                "- Highlight differences, pros, cons, and anomalies clearly."
            )
        elif action_type == "recommend":
            instruction += (
                "- Format the output as a clear roadmap with clear headings.\n"
                "- Provide Short-Term (1-2 Weeks), Medium-Term (1 Month), and Long-Term (Q3 2026/Future) actionable recommendations.\n"
                "- End with a 'Confidence Score' expressed as a percentage (e.g. 96%), explaining the reasoning based on data completeness."
            )
        else:
            instruction += (
                "- Answer the user's custom question directly and professionally.\n"
                "- Use rich markdown formatting (bolding, lists, alerts where appropriate)."
            )
            
        return instruction

    async def stream_response(
        self, 
        query: str, 
        context: str, 
        history: List[Dict[str, str]], 
        action_type: str, 
        lang: str
    ) -> Generator[str, None, None]:
        """Orchestrates progress step notifications and streams the final Gemini response."""
        
        # Define localized steps
        steps = [
            "🔍 Reading uploaded documents..." if lang == "en" else "🔍 قراءة المستندات المرفوعة...",
            "⚙️ Parsing structural data & tables..." if lang == "en" else "⚙️ تحليل الجداول والبيانات الهيكلية...",
            "🧠 Processing queries through AIRA Neural Engine..." if lang == "en" else "🧠 معالجة الاستعلامات عبر محرك AIRA...",
            "✍️ Drafting output response..." if lang == "en" else "✍️ كتابة مسودة استجابة المخرجات..."
        ]

        # 1. Stream the agent status transitions first to simulate multi-agent thinking in the UI
        for step in steps:
            yield f"data: {json.dumps({'type': 'status', 'message': step})}\n\n"
            # Add a small delay so the user can see each agent's activity
            await asyncio.sleep(1)

        # 2. Prepare prompt
        prompt = (
            f"Document Context:\n{context}\n\n"
            f"User Query: {query}\n\n"
            f"Analyze the context and generate the final response according to your system instructions."
        )

        system_instruction = self.get_system_instruction(lang, action_type)

        # 3. Stream model tokens
        logger.info("DecisionWriterAgent: Starting chat response streaming from Gemini...")
        try:
            # Run the generator in an executor or call it directly if it's fast. 
            # Since generating is a synchronous generator, we can run it safely in a loop.
            token_count = 0
            for token in generate_chat_stream(prompt, history=history, system_instruction=system_instruction):
                token_count += 1
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                # Small sleep to yield control to the event loop
                await asyncio.sleep(0.01)
                
            logger.info(f"DecisionWriterAgent: Streamed {token_count} content chunks.")
        except Exception as e:
            logger.error(f"Error streaming response from DecisionWriterAgent: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

        # 4. Stream completion event
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

decision_writer_agent = DecisionWriterAgent()
