import json
from sqlalchemy import column

from app.repository.database_repository import DatabaseRepository
from app.models.database import TableReferencesResponse, TableSchemaResponse, TableDataResponse, Field

class DatabaseService:

    def __init__(self):
        self.database_repository = DatabaseRepository()

    def get_table_names(self):
        result = self.database_repository.get_table_names()
        return DatabaseService._build_table_names_response(result)


    def get_table_data(self, table_name: str):
        result = self.database_repository.get_table_data(table_name)
        return DatabaseService._build_table_data_response(table_name, result)


    def get_table_schema(self, table_name: str):
        result = self.database_repository.get_table_schema(table_name)
        return DatabaseService._build_table_schema_response(table_name, result)


    def get_table_references(self, table_name: str):
        
        result = self.database_repository.get_table_references(table_name)
        return DatabaseService._build_table_references_response(result)


    def delete_row(self, table_name: str, row: str):
        self.database_repository.delete_row(table_name, row)
        return


    def update_row(self, table_name, row):
        if "id" not in row:
            raise ValueError("El campo 'id' es obligatorio para actualizar una fila.")

        return self.database_repository.update_row(table_name, row)


    def save_data_entry(self, table_name, row_data, table_schemma):
        return self.database_repository.save_data_entry(table_name, row_data, table_schemma)


    @staticmethod
    def _build_table_names_response(result):
        json_structure = {}

        for table, column, data_type in result:
            json_structure.setdefault(table, [])
            json_structure[table].append({"column": column, "data_type": data_type})

        return json_structure


    @staticmethod
    def _build_table_data_response(table_name: str, result) -> TableDataResponse:
        columns = result.keys()
        table_data = [dict(zip(columns, row)) for row in result.fetchall()]

        return TableDataResponse(table_name=table_name, data=table_data)


    @staticmethod
    def _build_table_references_response(result) -> TableReferencesResponse:
        columns = result.keys()
        table_data = [dict(zip(columns, row)) for row in result.fetchall()]

        return TableReferencesResponse(references=table_data)

    
    @staticmethod
    def _build_table_schema_response(table_name: str, result) -> TableSchemaResponse:
        fields = []
        for row in result:
            print(row)
            field = Field(
                column_name=row[0],
                data_type=row[1],
                character_maximum_length=row[2],
                is_nullable=row[3],
                column_default=row[4],
                is_foreign_key=row[5],
                foreign_table=row[6],
                foreign_column=row[7],
                is_primary_key=row[8]
            )
            fields.append(field)
        return TableSchemaResponse(table_name=table_name, fields=fields)
        