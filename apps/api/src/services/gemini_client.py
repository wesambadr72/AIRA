import logging
from typing import List, Dict, Any, Generator
from google import genai
from google.genai import types
from src.config import GEMINI_API_KEY, GEMINI_MODEL_NAME

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize the Gemini client
try:
    client = genai.Client(api_key=GEMINI_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Gemini client: {e}")
    client = None


def generate_embedding(text: str) -> List[float]:
    """Generates embedding vector for the text using text-embedding-004."""
    if not client:
        logger.error("Gemini client is not initialized.")
        return []
    try:
        response = client.models.embed_content(
            model="models/gemini-embedding-2",
            contents=text
        )
        if response.embeddings:
            return response.embeddings[0].values
        return []
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return []

def generate_chat_stream(
    prompt: str, 
    history: List[Dict[str, str]] = None,
    system_instruction: str = None
) -> Generator[str, None, None]:
    """Generates streaming responses using the Gemini chat interface."""
    if not client:
        logger.error("Gemini client is not initialized.")
        yield "Error: Gemini client is not initialized. Please check your API key."
        return

    try:
        # Convert frontend history to SDK history
        sdk_history = []
        if history:
            for msg in history:
                role = "user" if msg["role"] == "user" else "model"
                sdk_history.append(
                    types.Content(
                        role=role,
                        parts=[types.Part.from_text(text=msg["content"])]
                    )
                )

        config = types.GenerateContentConfig()
        if system_instruction:
            config.system_instruction = system_instruction

        chat = client.chats.create(
            model=GEMINI_MODEL_NAME,
            history=sdk_history,
            config=config
        )

        response_stream = chat.send_message_stream(prompt)
        for chunk in response_stream:
            if chunk.text:
                yield chunk.text
    except Exception as e:
        logger.error(f"Error during generative chat streaming: {e}")
        yield f"\n[AI Error: {str(e)}]"