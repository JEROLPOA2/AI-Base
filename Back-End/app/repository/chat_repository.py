from datetime import date, datetime
import json

from sqlalchemy.exc import SQLAlchemyError

from app.db.database import DatabaseConnector
from sqlalchemy import text

class ChatRepository:

    def __init__(self):
        self.database_connector = DatabaseConnector()


    def get_user_chats(self, email: str):
        with self.database_connector.db_connection() as connection:

            query = text("SELECT thread_id FROM admin.chat WHERE email = :email ORDER BY time DESC")
            result = connection.execute(query, {"email": email})

            return result
    

    def insert_chat_message(self, message: dict, chat_email: str, chat_thread_id: str, from_user: bool):
    
        query = text("""
            INSERT INTO admin.message (message, chat_email, chat_thread_id, from_user, time)
            VALUES (:message, :chat_email, :chat_thread_id, :from_user, :time)
        """)

        try:

            message = self.serialize_for_json(message)
            
            with self.database_connector.db_connection() as connection:
                connection.execute(query, {
                    "message": json.dumps(message),
                    "chat_email": chat_email,
                    "chat_thread_id": chat_thread_id,
                    "from_user": from_user,
                    "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })

                connection.commit()
        
            return "Success Query"
    
        except Exception as e:
            print(f"Error al insertar el mensaje: {e}")
            raise


    def insert_chat(self, email: str, thread_id: str):
        
        fecha_actual = datetime.now()
        fecha_formateada = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")

        with self.database_connector.db_connection() as connection:
            try:
                query = text("""
                    INSERT INTO admin.chat (email, thread_id, time)
                    VALUES (:email, :thread_id, :time) ON CONFLICT (email, thread_id) DO NOTHING
                """)
                connection.execute(query, {"email": email, "thread_id": thread_id, "time":fecha_formateada})
                connection.commit()

                return "Succesful insertion"

            except SQLAlchemyError as e:
                raise Exception(f"Error inserting chat: {e}")

            finally:
                self.database_connector.close_connection(connection)
    

    def get_chat_messages(self, email: str, thread_id: str):
        
        with self.database_connector.db_connection() as connection:
            try:
                # Define the SELECT query to fetch the messages ordered by time
                query = text("""
                    SELECT message, from_user, time
                    FROM admin.message
                    WHERE chat_email = :email
                    AND chat_thread_id = :thread_id
                    ORDER BY time ASC
                """)
                
                # Execute the query with the provided email and thread_id
                result = connection.execute(query, {"email": email, "thread_id": thread_id})
                result = result.all()
                
                messages = [
                    {
                    "message": item[0],
                    "from_user": item[1],
                    "time": item[2]
                    } 
                    for item in result]


                print(messages, "MESAGEEEEEEEEEEEEEES")

                # Return the list of messages, or handle it as needed
                return messages

            except SQLAlchemyError as e:
                raise Exception(f"Error fetching chat messages: {e}")

            finally:
                self.database_connector.close_connection(connection)
    

    def serialize_for_json(self, obj):
        """
        Generaliza la serialización para manejar cualquier objeto no serializable en JSON.
        Convierte:
        - Fechas y DateTime a cadenas ISO 8601.
        - Diccionarios y listas se procesan recursivamente.
        - Otros objetos no serializables se convierten a cadenas usando str().
        """
        if isinstance(obj, dict):
            # Procesar diccionarios recursivamente
            return {key: self.serialize_for_json(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            # Procesar listas recursivamente
            return [self.serialize_for_json(item) for item in obj]
        elif isinstance(obj, (date, datetime)):
            # Convertir fechas y datetimes a formato ISO 8601
            return obj.isoformat()
        else:
            try:
                # Intentar serializar usando json.dumps
                json.dumps(obj)
                return obj  # Si funciona, devolver el objeto tal cual
            except (TypeError, ValueError):
                # Si falla, convertir a cadena
                return str(obj)