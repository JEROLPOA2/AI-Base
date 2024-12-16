from typing import Any, List

class Field:
    def __init__(self, column_name: str, data_type: str, 
                 character_maximum_length: Any, is_nullable: str, 
                 column_default: Any, is_foreign_key: str,
                 foreign_table: str, foreign_column: str,
                 is_primary_key: str
    ):
        self.column_name = column_name
        self.data_type = data_type
        self.character_maximum_length = character_maximum_length
        self.is_nullable = is_nullable
        self.column_default = column_default
        self.is_foreign_key = is_foreign_key
        self.foreign_table = foreign_table
        self.foreign_column = foreign_column
        self.is_primary_key = is_primary_key

class TableSchemaResponse:
    def __init__(self, table_name: str, fields: List[Field]):
        self.table_name = table_name
        self.fields = fields

class TableDataResponse:
    def __init__(self, table_name: str, data: List[Any]):
        self.table_name = table_name
        self.data = data

class TableReferencesResponse:
    def __init__(self, references: List[Any]):
        self.references = references