import json
from fastapi import APIRouter, Request
from app.models.chat import ChatRequest
from app.services.chat_service import ChatService
from app.utils.event_handler import EventHandler
import datetime
from app.repository.chat_repository import ChatRepository

class ChatController:

    def __init__(self):

        self.event_handler = EventHandler()

        self.chat_service = ChatService()
        self.router = APIRouter(prefix="/api")
        self.router.add_api_route("/chat", self.get_chat_response, methods=["POST"])
        self.router.add_api_route("/get-user-chats/{email}", self.get_user_chats, methods=["GET"])
        self.router.add_api_route("/get-chat-messages/{email}/{thread_id}", self.get_chat_messages, methods=["GET"])

    async def get_chat_response(self, chat: Request):
        
        chat_request = await chat.json()
        print(chat_request)

        prompt = chat_request.get("quest_resp_chat_text")
        database_thread = chat_request.get("database_thread")
        graph_thread = chat_request.get("graph_thread")
        intention_thread = chat_request.get("intention_thread")
        email = chat_request.get("email")

        response, thread_intention = self.chat_service.get_response_from_intention_assistant(prompt, intention_thread)
        
        json_response = json.loads(response)

        prompt = json_response.get("prompt")
        intention = json_response.get("intention")
        holder_message = json_response.get("answer")
        
        # Process prompt with EventHandler
        query_result, encoded_img, query, database_thread, graph_thread = self.event_handler.event_handler(intention=intention, 
                                                                                                           prompt=prompt, 
                                                                                                           database_thread=database_thread, 
                                                                                                           graph_thread=graph_thread)


        request_dict = {
            "intention_thread": thread_intention,
            "database_thread": database_thread,
            "graph_thread": graph_thread,
            "quest_resp_chat_text":prompt,
            "data": None,
            "graph_data": None,
            "intention": None
        }
        
        response_dict = {
            "intention_thread": thread_intention,
            "database_thread": database_thread,
            "graph_thread": graph_thread,
            "quest_resp_chat_text": f"{holder_message}\n{query} ",
            "data": query_result,
            "graph_data": encoded_img,
            "intention": intention
        }

        self.chat_service.insert_chat(email, thread_intention)
        self.chat_service.insert_chat_message(request_dict, email, thread_intention, True)
        self.chat_service.insert_chat_message(response_dict, email, thread_intention, False)

        return response_dict


    def get_user_chats(self, email: str):
        return self.chat_service.get_user_chats(email)
    
    def get_chat_messages(self, email: str, thread_id: str):
        return self.chat_service.get_chat_messages(email, thread_id)