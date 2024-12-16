from sqlalchemy import text
from app.db.database import DatabaseConnector

class BillRepository:
    def __init__(self):
        # Inicializa el conector de base de datos al crear una instancia de BillRepository
        self.db_connector = DatabaseConnector()

    def get_entities(self, entitie: str):
        """
        Obtiene todas las filas de la tabla especificada.

        Args:
            entitie (str): Nombre de la tabla desde la cual se obtendrán los datos.

        Returns:
            list: Lista de resultados donde cada fila es accesible como un mapeo (diccionario-like).
        """
        try:
            with self.db_connector.db_connection() as connection:
                query = text(f"SELECT * FROM {entitie}")
                print(f"Executing query: {query}")
                result = connection.execute(query)

                rows = result.mappings().all()
                #print(rows)

                return rows
        except Exception as e:
            print(f"Error during database query: {e}")
            return f"An error occurred: {e}"

    def save_bill_data(self, data_list: list):
        """
        Guarda datos de facturación en la tabla compra_venta.

        Args:
            data_list (list): Lista de diccionarios con los datos a insertar.

        Returns:
            str: Mensaje de éxito o error.
        """
        query = text("""
            INSERT INTO compra_venta (
                id, id_cliente, id_proveedor, id_materia_prima, 
                id_producto_terminado, cantidad, fecha,
                comentario, id_empleado
            ) VALUES (
                DEFAULT, :id_cliente, :id_proveedor, :id_materia_prima, 
                :id_producto_terminado, :cantidad, :fecha,
                :comentario, :id_empleado
            )
        """)

        try:
            with self.db_connector.db_connection() as connection:
                # Inicia una transacción en el bloque 'with'
                with connection.begin():
                    for data in data_list:

                        print("DATA", data)
                        params = {
                            "id_cliente": data.get("id_cliente"),
                            "id_proveedor": data.get("id_proveedor"),
                            "id_materia_prima": data.get("id_materia_prima"),
                            "id_producto_terminado": data.get("id_producto_terminado"),
                            "cantidad": data["cantidad"],
                            "fecha": data["fecha"],
                            "comentario": data["comentario"],
                            "id_empleado": data["id_empleado"]
                        }
                        connection.execute(query, params)
            return "Bill data saved successfully."
        except Exception as e:
            return f"An error occurred: {e}"
        


