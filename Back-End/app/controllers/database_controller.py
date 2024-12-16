from fastapi import status
from fastapi import APIRouter, Request
from app.services.database_service import DatabaseService

class DatabaseController:
    def __init__(self):
        self.router = APIRouter(prefix="/api")
        self.database_service = DatabaseService()

        self.router.add_api_route("/table-names", self.get_table_names, methods=["GET"])
        self.router.add_api_route("/table-schema/{table_name}", self.get_table_schema, methods=["GET"])
        self.router.add_api_route("/table-data/{table_name}", self.get_table_data, methods=["GET"])
        self.router.add_api_route("/table-references/{table_name}", self.get_table_references, methods=["GET"])
        self.router.add_api_route("/delete-row/{table_name}/{row_id}", self.delete_row, methods=["DELETE"])
        self.router.add_api_route("/update-row/{table_name}", self.update_row, methods=["POST"])
        self.router.add_api_route("/save-data-entry/{table_name}", self.save_data_entry, methods=["POST"])

    def get_table_names(self):
        return self.database_service.get_table_names()


    def get_table_schema(self, table_name: str):
        return self.database_service.get_table_schema(table_name)


    def get_table_data(self, table_name: str):
        return self.database_service.get_table_data(table_name)

    
    def get_table_references(self, table_name: str):
        return self.database_service.get_table_references(table_name)


    def delete_row(self, table_name: str, row_id: str):
        return self.database_service.delete_row(table_name, row_id)


    async def update_row(self, table_name: str, request: Request):
        row_data = await request.json()
        return self.database_service.update_row(table_name, row_data)

    
    async def save_data_entry(self, table_name: str, request: Request):

        payload = await request.json()
        row_data = payload.get("row_data")
        table_schemma = payload.get("table_schemma")

        return self.database_service.save_data_entry(table_name, row_data, table_schemma)

    