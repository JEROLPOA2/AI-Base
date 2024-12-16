from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    assistant_key: str
    thread_id: Optional[str] = None

