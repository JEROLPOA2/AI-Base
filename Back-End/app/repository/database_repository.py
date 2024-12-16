import datetime
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from app.db.database import DatabaseConnector
from typing import Optional
from typing import Union

class DatabaseRepository:

    def __init__(self):
        self.database_connector = DatabaseConnector()


    def get_table_names(self):
        
        with self.database_connector.db_connection() as connection:
            
            try:
                query = text(f"""
                    SELECT
                        table_name AS nombre_tabla,
                        column_name AS nombre_columna,
                        data_type AS tipo_dato
                    FROM
                        information_schema.columns
                    WHERE
                        table_schema = 'public'
                    ORDER BY
                        table_name,
                        ordinal_position;
                """)
                result = connection.execute(query)

                return result.fetchall()
            
            finally:
                self.database_connector.close_connection(connection)


    def get_table_data(self, table_name: str):
        
        with self.database_connector.db_connection() as connection:
            
            try:
                
                query_columns = text("""
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_name = :table_name;
                """)
                
                columns = connection.execute(query_columns, {"table_name": table_name}).fetchall()

                query_primary_keys = text("""
                    SELECT kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                    WHERE tc.table_name = :table_name AND tc.constraint_type = 'PRIMARY KEY';
                """)
                
                primary_keys = [row[0] for row in
                                connection.execute(query_primary_keys, {"table_name": table_name}).fetchall()]

                query_foreign_keys = text("""
                    SELECT kcu.column_name AS foreign_key, ccu.table_name AS referenced_table, ccu.column_name AS referenced_column
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.table_name = :table_name AND tc.constraint_type = 'FOREIGN KEY';
                """)
                
                foreign_keys = connection.execute(query_foreign_keys, {"table_name": table_name}).fetchall()

                select_columns = []
                joins = []
                
                for column in columns:
                    
                    col_name = column[0]
                    col_type = column[1]

                    
                    if col_name in primary_keys and col_type == 'uuid':
                        continue

                    foreign_key = next((fk for fk in foreign_keys if fk[0] == col_name), None)
                    
                    if foreign_key:
                        
                        ref_table = foreign_key[1]
                        ref_column = foreign_key[2]

                        query_check_nombre = text("""
                            SELECT column_name
                            FROM information_schema.columns
                            WHERE table_name = :ref_table AND column_name = 'nombre';
                        """)

                        has_nombre = connection.execute(query_check_nombre, {"ref_table": ref_table}).fetchone()
                        
                        if has_nombre:
                            alias = f"{col_name}_nombre"
                            joins.append(f"LEFT JOIN {ref_table} ON {table_name}.{col_name} = {ref_table}.{ref_column}")
                            select_columns.append(f"{ref_table}.nombre AS {alias}")
                        
                        else:
                            select_columns.append(f"{table_name}.{col_name}")
                    
                    else:
                        select_columns.append(f"{table_name}.{col_name}")


                select_clause = ", ".join(select_columns)
                join_clause = " ".join(joins)
                
                final_query = text(f"""
                    SELECT {select_clause} FROM {table_name} {join_clause};
                """)

                result = connection.execute(final_query)
                return result
            
            finally:
                self.database_connector.close_connection(connection)


    def get_table_schema(self, table_name: str):
        
        with self.database_connector.db_connection() as connection:
            
            try:
                
                query = text(""" 
                    SELECT 
                        col.column_name, 
                        col.data_type, 
                        col.character_maximum_length, 
                        col.is_nullable, 
                        col.column_default,
                        CASE 
                            WHEN fk.constraint_type = 'FOREIGN KEY' THEN 'YES' 
                            ELSE 'NO' 
                        END AS is_foreign_key,
                        fk.foreign_table,
                        fk.foreign_column,
                        CASE 
                            WHEN pk.constraint_type IS NOT NULL AND pk.constraint_type = 'PRIMARY KEY' THEN 'YES' 
                            ELSE 'NO' 
                        END AS is_primary_key
                    FROM
                        information_schema.columns AS col
                    LEFT JOIN (
                        SELECT
                            kcu.column_name,
                            ccu.table_name AS foreign_table,
                            ccu.column_name AS foreign_column,
                            tc.constraint_type
                        FROM
                            information_schema.key_column_usage AS kcu
                        JOIN 
                            information_schema.constraint_column_usage AS ccu
                            ON ccu.constraint_name = kcu.constraint_name
                        JOIN 
                            information_schema.table_constraints AS tc
                            ON tc.constraint_name = kcu.constraint_name
                        WHERE
                            tc.constraint_type = 'FOREIGN KEY'
                            AND kcu.table_name = :table_name
                    ) AS fk
                    ON col.column_name = fk.column_name
                    AND col.table_name = :table_name
                    LEFT JOIN (
                        SELECT 
                            kcu.column_name,
                            tc.constraint_type
                        FROM 
                            information_schema.key_column_usage AS kcu
                        JOIN 
                            information_schema.table_constraints AS tc
                            ON tc.constraint_name = kcu.constraint_name
                        WHERE 
                            tc.constraint_type = 'PRIMARY KEY'
                            AND kcu.table_name = :table_name
                    ) AS pk
                    ON col.column_name = pk.column_name
                    WHERE 
                        col.table_name = :table_name
                """)

                result = connection.execute(query, {"table_name": table_name})
                
                return result
            
            finally:
                self.database_connector.close_connection(connection)


    def update_row(self, table_name: str, row_data: dict):
        
        with self.database_connector.db_connection() as connection:

            columns = [f"{key} = :{key}" for key in row_data.keys() if key != "id"]

            query = text(f"""
                UPDATE {table_name}
                SET {', '.join(columns)}
                WHERE id = :id
            """)

            result = connection.execute(query, row_data)
            connection.commit()

            return {"rows_affected": result.rowcount}


    def delete_row(self, table_name: str, row: str):
        
        valid_tables = ["cliente", "compra_venta", "empleado", 
                        "horario", "inventario", "materia_prima", 
                        "producto_terminado", "proveedor", "receta"]
        
        if table_name not in valid_tables:
            return f"Invalid table name: {table_name}"
        
        query = text(f"DELETE FROM public.{table_name} WHERE id = :row")

        with self.database_connector.db_connection() as connection:
            
            try:

                connection.execute(query, {"row": row})
                connection.commit()

                return f"Row with id {row} deleted successfully from {table_name}"
            
            except Exception as e:
                return f"An error occurred: {e}"
        

    def get_table_references(self, table_name: str):
        
        with self.database_connector.db_connection() as connection:
            
            try:
                
                query = text(f"""
                             SELECT
                             tc.table_name
                             FROM
                             information_schema.table_constraints AS tc
                             JOIN
                             information_schema.constraint_column_usage AS ccu
                             ON ccu.constraint_name = tc.constraint_name
                             AND ccu.constraint_schema = tc.constraint_schema
                             WHERE
                             tc.constraint_type = 'FOREIGN KEY'
                             AND ccu.table_name = '{table_name}';
                             """)
                
                result = connection.execute(query)
                return result
            
            finally:
                self.database_connector.close_connection(connection)


    def execute_select_query(self, query: str) -> Union[any, str]:
        
        with self.database_connector.db_connection() as connection:
            
            try:

                result = connection.execute(text(query))
                columns = result.keys()
                result_dict = [dict(zip(columns, row)) for row in result.fetchall()]
                
                return result_dict
            
            except SQLAlchemyError as e:
                return str(e)
            
            finally:
                self.database_connector.close_connection(connection)
    

    def save_data_entry(self, table_name: str, row_data: dict, table_schemma):
        
        """
        Genera y ejecuta una consulta SQL de tipo INSERT basada en un esquema y datos proporcionados.
        Las fechas se formatean a 'YYYY-MM-DD'.
        
        :param schema: Lista de diccionarios que describen las columnas de la tabla.
        :param data: Diccionario con los datos a insertar.
        :param table_name: Nombre de la tabla.
        :return: None
        """
        
        columns = []
        values = []

        for field in table_schemma:

            if field["column_default"] != None:
                
                columns.append(field["column_name"])
                values.append("DEFAULT")
                continue
            
            elif field["is_foreign_key"] == "YES":
                
                columns.append(field["column_name"])

                if row_data[field["column_name"]] == "":
                    
                    values.append(None)
                    continue
                
                else:
                    
                    values.append(f'{row_data[field["column_name"]]}')
                    continue
            
            else:
                
                columns.append(field["column_name"])
                values.append(f'{row_data[field["column_name"]]}')
        
        column_str = ", ".join(columns)
        value_str = ", ".join(f"'{value}'" if value is not None and value != 'DEFAULT' else 'NULL' if value is None else 'DEFAULT' for value in values)
        sql_query = text(f"INSERT INTO {table_name} ({column_str}) VALUES ({value_str});")

        with self.database_connector.db_connection() as connection:
            
            try:
                
                connection.execute(sql_query)
                connection.commit()
                return
            
            except Exception as e:
                return f"An error occurred: {e}"
            
            finally:
                self.database_connector.close_connection(connection)


