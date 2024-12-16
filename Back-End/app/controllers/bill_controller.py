from sys import prefix

from fastapi import APIRouter, Request, status
from app.services.bill_service import BillService


class BillController:

    def __init__(self):
        self.router = APIRouter(prefix="/api")
        self.bill_service = BillService()

        self.router.add_api_route("/get-entity/{entity}", self.get_entities, methods=["GET"])
        self.router.add_api_route("/get-products/{entity}", self.get_entities, methods=["GET"])
        self.router.add_api_route("/save-bill-data", self.save_bill_data, methods=["POST"])
        

    def get_entities(self, entity: str):
        return self.bill_service.get_entities(entity)

    async def save_bill_data(self, bill_data: Request):
        request_body = await bill_data.json()
        return self.bill_service.save_bill_data(request_body)
