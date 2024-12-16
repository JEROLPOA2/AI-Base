class Client:
    def __init__(self, client_id, nombre, direccion, telefono, celular, fecha_registro, fecha_nacimiento):
        self.client_id = client_id
        self.nombre = nombre
        self.direccion = direccion
        self.telefono = telefono
        self.celular = celular
        self.fecha_registro = fecha_registro
        self.fecha_nacimiento = fecha_nacimiento

    def to_dict(self):
        return {
            "client_id": self.client_id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "celular": self.celular,
            "fecha_registro": self.fecha_registro,
            "fecha_nacimiento": self.fecha_nacimiento,
        }

class Provider:
    def __init__(self, client_id, nombre, direccion, telefono, celular, fecha_registro):
        self.client_id = client_id
        self.nombre = nombre
        self.direccion = direccion
        self.telefono = telefono
        self.celular = celular
        self.fecha_registro = fecha_registro

    def to_dict(self):
        return {
            "client_id": self.client_id,
            "nombre": self.nombre,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "celular": self.celular,
            "fecha_registro": self.fecha_registro,
        }


class Product:
    def __init__(self, product_id, precio_unidad):
        self.producto_id = product_id
        self.precio_unidad = precio_unidad

    def to_dict(self):
        return {
            "producto_id": self.producto_id,
            "precio_unidad": self.precio_unidad
        }
