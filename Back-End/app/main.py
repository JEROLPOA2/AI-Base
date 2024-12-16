# main.py
from fastapi import FastAPI
from app.controllers.chat_controller import ChatController
from app.controllers.bill_controller import BillController
from app.controllers.database_controller import DatabaseController
from app.middlewares.cors_middleware import CORS

class App:
    def __init__(self):
        self.app = FastAPI()
        self.cors_middleware = CORS()
        self._configure_middlewares()
        self._configure_routes()

    def _configure_middlewares(self):
        self.cors_middleware.add(self.app)

    def _configure_routes(self):
        chat_controller = ChatController()
        bill_controller = BillController()
        database_controller = DatabaseController()

        self.app.include_router(database_controller.router)
        self.app.include_router(bill_controller.router)
        self.app.include_router(chat_controller.router)

    def get_app(self):
        return self.app

app_instance = App()
app = app_instance.get_app()
