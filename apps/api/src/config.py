import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Resolve absolute path to .env file (located at apps/api/.env)
current_dir = os.path.dirname(os.path.abspath(__file__))
# current_dir is apps/api/src -> parent is apps/api
dotenv_path = os.path.join(os.path.dirname(current_dir), '.env')

if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
else:
    load_dotenv()

# Gemini Configs
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL_NAME: str = os.getenv("GEMINI_MODEL_NAME")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set in environment variables.")

# RAG / Text Splitting Configs
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", 0))
CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", 0))
RETRIEVAL_TOP_K: int = int(os.getenv("RETRIEVAL_TOP_K", 0))

# Server Configs
SERVER_HOST: str = os.getenv("SERVER_HOST")
SERVER_PORT: int = int(os.getenv("SERVER_PORT", 0))
