from pyee import EventEmitter
from app.services.chat_service import ChatService
from typing import Any, Optional, Tuple, Union

class EventHandler:

    def __init__(self):

        self.current_data = None

        self.event_emitter = EventEmitter()
        self.chat_service = ChatService()

        self.event_emitter.on("MAKE_QUERY", self.chat_service.execute_query)
        self.event_emitter.on("MAKE_GRAPH", self.chat_service.make_graph)
        self.event_emitter.on("MAKE_QUERY_AND_GRAPH", self.chat_service.make_graph)


    def event_handler(self, intention: str, prompt: str, database_thread: str, graph_thread: str) -> Union[any, any, str, str, str]:
        """
        Handles events based on the provided intention.

        Args:
            intention (str): The intention determining which event to trigger.
            prompt (str): User's input prompt.

        Returns:
            (str, str, str): The result of the executed event.
        """

        if intention == "MAKE_QUERY":
            listeners = self.event_emitter.listeners("MAKE_QUERY")
            self.current_data, query, database_thread = listeners[0](prompt, thread_id=database_thread)
            return self.current_data, "", query, database_thread, ""

        elif intention == "MAKE_GRAPH":
            listeners = self.event_emitter.listeners("MAKE_GRAPH")

            encoded_img, graph_thread = listeners[0](self.current_data, prompt, graph_thread)

            return "", encoded_img, "", database_thread, graph_thread

        elif intention == "MAKE_QUERY_AND_GRAPH":
            listeners = self.event_emitter.listeners("MAKE_QUERY")
            self.current_data, query, database_thread = listeners[0](prompt, thread_id=database_thread)

            listeners_plot = self.event_emitter.listeners("MAKE_QUERY_AND_GRAPH")
            encoded_img, graph_thread = listeners_plot[0](self.current_data, prompt, graph_thread)

            print(f"THREAD ID IN EVENT HANDLER {graph_thread}")

            return "", encoded_img, query, database_thread, graph_thread

        elif intention == "CHAT":
            return "", "", "", "", ""

