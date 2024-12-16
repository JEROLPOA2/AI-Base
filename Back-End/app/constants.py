import os
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HOST")
USER = os.getenv("DB_USER")
PASSWORD = os.getenv("DB_PASSWORD")
DATABASE = os.getenv("DATABASE")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
INTENTION_ASSISTANT = os.getenv("INTENTION_ASSISTANT")
DATABASE_ASSISTANT = os.getenv("DATABASE_ASSISTANT")
GRAPH_ASSISTANT = os.getenv("GRAPH_ASSISTANT")
CHAT_ASSISTANT = os.getenv("CHAT_ASSISTANT")