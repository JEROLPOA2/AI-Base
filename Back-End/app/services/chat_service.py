import base64
import io
import json

from click import prompt
from fastapi.responses import StreamingResponse
import requests
from openai import OpenAI
import openai

from app.repository.chat_repository import ChatRepository
from app.utils.openai_event_handler import EventHandler
from app.constants import OPENAI_API_KEY, INTENTION_ASSISTANT, DATABASE_ASSISTANT, GRAPH_ASSISTANT, CHAT_ASSISTANT
from typing import Optional, Tuple, Union
from app.repository.database_repository import DatabaseRepository
from typing import Any

class ChatService:
    
    def __init__(self):
        self.client = OpenAI(api_key=OPENAI_API_KEY)

        self.chat_repository = ChatRepository()
        self.database_repository = DatabaseRepository()

        self.intention_assistant = INTENTION_ASSISTANT
        self.database_assistant = DATABASE_ASSISTANT
        self.graph_assistant = GRAPH_ASSISTANT
        self.chat_assistant = CHAT_ASSISTANT


    def create_thread(self, thread):
        return thread or self.client.beta.threads.create().id

    
    def get_response_from_intention_assistant(self, prompt: str, thread_id: str = "") -> Tuple[str, str]:

        assistant = self.client.beta.assistants.retrieve(assistant_id=self.intention_assistant)
        thread = self.create_thread(thread_id)

        self.client.beta.threads.messages.create(
            thread_id=thread,
            role="user",
            content=prompt
        )

        try:
            handler = EventHandler()
            with self.client.beta.threads.runs.stream(
                thread_id=thread,
                assistant_id=assistant.id,
                event_handler=handler
            ) as stream:
                stream.until_done()

            return handler.response, thread
    
        except Exception as e:
            return f"An error occurred: {e}", ""


    def get_response_from_database_assistant(self, prompt: str, thread_id: str = "") -> Tuple[str, str]:
        """
        Sends data to the GPT database assistant and requests a query.

        Args:
            prompt (str): Prompt for generating a query.
            thread_id (str): ID of assistant thread.

        Returns:
            str: The assistant's response or an error message.
        """
        assistant = self.client.beta.assistants.retrieve(assistant_id=self.database_assistant)

        thread = self.create_thread(thread_id)

        self.client.beta.threads.messages.create(
            thread_id=thread,
            role="user",
            content=f"Return the database query for: {prompt}"
        )

        try:
            handler = EventHandler()
            with self.client.beta.threads.runs.stream(
                thread_id=thread,
                assistant_id=assistant.id,
                event_handler=handler
            ) as stream:
                stream.until_done()

            return handler.response, thread
        
        except Exception as e:
            return f"An error occurred: {e}"


    def execute_query(self, prompt: str, max_attempts: int = 3, thread_id: str = "") -> Tuple[any, str, str]:
        
        """Executes a query using the database assistant, retrying up to max_attempts on failure.

        Args:
            prompt (str): The prompt to generate the query.
            max_attempts (int): Maximum retry attempts on failure.

        Returns:
            Tuple[Optional[dict], str, str]: Query result, assistant ID, and thread ID."""
        

        for attempt in range(max_attempts):
            # Get query from the assistant
            
            query, thread = self.get_response_from_database_assistant(prompt=prompt, thread_id=thread_id)

            print(prompt)
            print(query)

            if not query:
                print(f"No query returned on attempt {attempt + 1}. Returning last query result.")
                return {}, query, thread

            # Execute the query
            query_result = self.database_repository.execute_select_query(query)

            if "ERROR" not in query_result:
                return query_result, query, thread

            error_message = query_result
            prompt = f"Please correct this query: {query}. Error: {error_message}."
            print(f"Attempt {attempt + 1} failed, retrying...")

        print("Max attempts reached. Returning last query result.")
        
        return query_result, query, thread
    

    """def execute_query(self, prompt: str, thread_id: str = "") -> Tuple[any, str, str]:

        query, thread = self.get_response_from_database_assistant(prompt=prompt, thread_id=thread_id)

        if not query:
                return {}, query, thread
        
        query_result = self.database_repository.execute_select_query(query)

        return query_result, query, thread"""


    def get_response_from_graph_assistant(self, prompt: str, data: dict, thread_id: str = "") -> Tuple[str, str]:
        """
        Envía datos en formato de diccionario al asistente 'asst_N4qMjkrCJFLlZ3LBwDcbH3Nr'
        y devuelve la respuesta.

        Args:
            data (Dict): Datos para ser utilizados en el prompt del asistente.

        Returns:
            Tuple[str, str]: La respuesta del asistente y el ID del hilo.
        """

        assistant = self.client.beta.assistants.retrieve(assistant_id=self.graph_assistant)
        thread = self.create_thread(thread_id)

        # Convertimos el diccionario de datos en un string formateado para el prompt
        prompt_content = f"{prompt}, teniendo en cuenta los siguientes datos: {data}"

        # Enviamos el mensaje al asistente
        self.client.beta.threads.messages.create(
            thread_id=thread,
            role="user",
            content=prompt_content
        )

        try:
            # Manejador de eventos para la transmisión del stream
            handler = EventHandler()
            with self.client.beta.threads.runs.stream(
                thread_id=thread,
                assistant_id=assistant.id,
                event_handler=handler
            ) as stream:
                stream.until_done()

        except Exception as e:
            pass

        return handler.response, thread

    
    def make_graph(self, query_result, prompt: str, thread_id: str = "") -> Union[Any, str]:
        """
        Genera un gráfico basado en el resultado de un query ejecutado por el asistente.

        Args:
            prompt (str): El prompt del usuario para generar el gráfico.

        Returns:
            Union[any, Optional[bytes], str]: Datos de consulta, Imagen codificada, Consulta generada
        """

        # Paso 2: Generar el gráfico utilizando los datos devueltos por el query
        response, thread = self.get_response_from_graph_assistant(prompt, query_result, thread_id)

        print(response)
        # Llama a la API para obtener el último archivo generado (que debería ser la última imagen)
        
        headers_1 = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        files_url = f"https://api.openai.com/v1/files"
        files_response = requests.get(files_url, headers=headers_1)

        files_response = files_response.json()
        file_id = files_response["data"][0]["id"]

        headers_2 = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
        img_file_url = f"https://api.openai.com/v1/files/{file_id}/content"
        img_file_response = requests.get(img_file_url, headers=headers_2)

        img_response = img_file_response.content
        encoded_img = base64.b64encode(img_response).decode('utf-8')

        return encoded_img, thread


    def get_user_chats(self, email: str):
        
        result = self.chat_repository.get_user_chats(email)
        columns = result.keys()
        table_data = [dict(zip(columns, row)) for row in result.fetchall()]

        return table_data

    
    def insert_chat(self, email: str, thread_id: str):
        return self.chat_repository.insert_chat(email, thread_id)

    
    def insert_chat_message(self, message, chat_email, chat_thread_id, from_user):
        return self.chat_repository.insert_chat_message(message, chat_email, chat_thread_id, from_user)
    

    def get_chat_messages(self, email: str, thread_id: str):
        return self.chat_repository.get_chat_messages(email, thread_id)




    

