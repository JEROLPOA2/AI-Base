export interface Bill {
  cliente: string | null;
  proveedor: string | null;
  fecha: any;
  materia_prima: string | null;
  producto_terminado: string;
  cantidad: number;
  comentario: string | null;
  empleado: string | null;
}
