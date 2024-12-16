from app.repository.bill_repository import BillRepository
from app.models.entities import Client, Provider, Product
from datetime import datetime
from typing import List, Any, Dict


class BillService:

    def __init__(self):
        self.bill_repository = BillRepository()

    def get_entities(self, entitie: str):
        result = self.bill_repository.get_entities(entitie)
        
        match entitie:
            case "cliente":
                print(f"QUERY RESULT {result}")
                response =  BillService._build_client_response(result)
            case "proveedor":
                response = BillService._build_provider_response(result)
            case "materia_prima":
                response = BillService._build_products_response(result)
            case "producto_terminado":
                response = BillService._build_products_response(result)

        return {
            "entity": entitie,  # Nombre de la entidad (ej. "Clientes")
            "data": [data.to_dict() for data in response]  # Lista de diccionarios
        }

    def save_bill_data(self, data: dict):
        
        match data.get("tipoFactura"):
            case "cliente":
                return self._save_bill_client_data(data)
            case "proveedor":
                return self._save_bill_supplier_data(data)

    def _save_bill_client_data(self, data: dict):
        factura_data = []
        
        fecha_actual = datetime.now()
        fecha_formateada = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")

        for item in data["productos"]:

            factura_data.append({
                "fecha": fecha_formateada,
                "id_cliente": data["entity"]["client_id"],
                "id_producto_terminado": item["producto"]["producto_id"],
                "cantidad": item["cantidad"],
                "comentario": data["comentario"],
                "id_empleado": None,
            })

        return self.bill_repository.save_bill_data(factura_data)

    def _save_bill_supplier_data(self, data: dict):
        
        factura_data = []

        fecha_actual = datetime.now()
        fecha_formateada = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")

        for item in data["productos"]:

            print("ITEM", item)
            print()

            factura_data.append({
                "fecha": fecha_formateada,
                "id_proveedor": data["entity"]["client_id"],
                "id_materia_prima": item["producto"]["producto_id"],
                "cantidad": item["cantidad"],
                "comentario": data["comentario"],
                "id_empleado": None,
            })
        return self.bill_repository.save_bill_data(factura_data)

    @staticmethod
    def _build_client_response(result) -> List[Client]:
        fields = []
        print(f"RESULT ENTITY RESPONSE {result}")
        for row in result:
            # Usa row._mapping para acceder a los datos como diccionario
            field = Client(
                client_id=row["id"],
                nombre=row["nombre"],
                direccion=row["direccion"],
                telefono=row["telefono"],
                celular=row["celular"],
                fecha_registro=row["fecha_registro"],
                fecha_nacimiento=row["fecha_nacimiento"]
            )
            fields.append(field)
        return fields

    @staticmethod
    def _build_provider_response(result) -> List[Provider]:
        fields = []
        for row in result:
            # Usa row._mapping para acceder a los datos como diccionario
            field = Provider(
                client_id=row["id"],
                nombre=row["nombre"],
                direccion=row["direccion"],
                telefono=row["telefono"],
                celular=row["celular"],
                fecha_registro=row["fecha_registro"]
            )
            fields.append(field)
        return fields
    

    @staticmethod
    def _build_products_response(result) -> List[Product]:
        fields = []
        
        for row in result:
            # Usa row._mapping para acceder a los datos como diccionario
            field = Product(
                product_id=row["id"],
                precio_unidad=row["precio_unidad"]
            )
            fields.append(field)
        
        return fields
