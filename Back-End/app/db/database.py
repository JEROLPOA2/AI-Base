import psycopg2
from contextlib import contextmanager
from psycopg2 import connect
from sqlalchemy import create_engine
from sqlalchemy.engine import Connection
from typing import Generator
from app.constants import HOST, USER, PASSWORD, DATABASE

class DatabaseConnector:
    def __init__(self):
        self.engine = create_engine(
            "postgresql+psycopg2://",
            creator=self.getconn,
            pool_size=5,
            max_overflow=10
        )

    @staticmethod
    def getconn() -> connect:
        conn = psycopg2.connect(database=DATABASE, user=USER, host=HOST, password=PASSWORD, port=6543)
        return conn

    @contextmanager
    def db_connection(self) -> Generator[Connection, None, None]:
        conn = self.engine.connect()
        try:
            yield conn
        finally:
            conn.close()

    @staticmethod
    def close_connection(connection):
        connection.close()


