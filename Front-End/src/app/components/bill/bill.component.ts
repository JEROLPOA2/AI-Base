import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Bill } from '../../models/ProductModel/product.model';
import { BillService } from '../../services/BillService/bill.service';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { DinamycFormComponent } from '../dinamyc-form/dinamyc-form.component';
import { TableService } from '../../services/TableService/table.service';

@Component({
  selector: 'app-bill',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    RadioButtonModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
  ],
  templateUrl: './bill.component.html',
  styleUrls: ['./bill.component.scss'],
})

export class BillComponent implements OnInit {
  
  billForm: FormGroup;
  entities: any[] = []; // Store Cliente / Proveedor options
  entitie: string = '';
  products: any[] = [];

  bill: Bill = {
    cliente: '',
    proveedor: '',
    fecha: new Date().toLocaleString(),
    materia_prima: '',
    producto_terminado: '',
    cantidad: 0,
    comentario: '',
    empleado: '',
  };


  constructor(
    private fb: FormBuilder,
    private tableService: TableService,
    private billService: BillService,
    private messageService: MessageService,
    public dialogRef: MatDialogRef<BillComponent>,
    private dialog: MatDialog
  ) {
    
    this.billForm = this.fb.group({
      tipoFactura: ['', Validators.required],
      entity: ['', Validators.required],
      fecha: [new Date().toLocaleString(), Validators.required],
      productos: this.fb.array([]),
      comentario: [''],
    });

    this.addProduct();
  }


  ngOnInit(): void {}


  get productos() {
    return this.billForm.get('productos') as FormArray;
  }


  get selectedEntity(): string {
    
    return (this.billForm.get('tipoFactura')?.value ?? '') === 'cliente'
      ? this.bill.cliente ?? ''
      : this.bill.proveedor ?? '';
  }


  set selectedEntity(value: string) {
    
    if ((this.billForm.get('tipoFactura')?.value ?? '') === 'cliente') {
      
      this.bill.cliente = value;
      this.bill.proveedor = null;
      console.log(this.bill.cliente, this.bill.proveedor);
    } 
    
    else {
      
      this.bill.proveedor = value;
      this.bill.cliente = null;
      console.log(this.bill.cliente, this.bill.proveedor);
    }
  }


  onChangeEntities() {
    
    const tipoFactura = this.billForm.get('tipoFactura')?.value;
    
    this.billService.getEntities(tipoFactura).subscribe(
      
      (response) => {
        this.entitie = response.entity;
        this.entities = [
          ...response.data,
          { nombre: 'Agregar cliente/proveedor', client_id: 'addEntity' },
        ];
        this.getProducts();
      },

      (error) => {
        console.error(error);
      }
    );
  }


  onEntitySelected(selectedValue: any): void {
    
    if (selectedValue.client_id === 'addEntity') {
      this.openEntityDinamicForm(this.entitie);
    } 
    
    else {
      this.selectedEntity = selectedValue;
    }
  }


  openEntityDinamicForm(tableName: string): void {
    
    this.tableService.setTableName(tableName);

    const dialogRef = this.dialog.open(DinamycFormComponent, {
      panelClass: 'custom-dialog-class',
      minHeight: '95vh',
      minWidth: '400px',
      maxWidth: '90vw',
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      
      this.onChangeEntities()
      this.tableService.setTableName("compra_venta");

    });
  }


  getProducts(): void {

    let product_table = this.entitie;
  
    if (this.entitie === 'proveedor') {
      product_table = 'materia_prima';
    } 
    
    else if (this.entitie === 'cliente') {
      product_table = 'producto_terminado';
    }
  
    this.billService.getProducts(product_table).subscribe(
      
      (response) => {
        this.products = response.data;
        console.log(response)
      },
      
      (error) => {
        console.error(error);
      }
    );
  }


  addProduct(): void {
    
    const newProductControl = this.fb.group({
      
      producto: [null, Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      precio: [{ value: 0, disabled: true }],
    });

    const selectedProduct = newProductControl.get('producto')?.value;

    if (selectedProduct) {
      
      const alreadyAdded = this.productos.controls.some((control) => {
        
        const currentProducto = control.get('producto')?.value;
        return currentProducto && currentProducto === selectedProduct;
      });

      
      if (alreadyAdded) {
        
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'Este producto ya ha sido agregado.',
        });

        return;
      }
    }

    this.productos.push(newProductControl);
  }


  getFilteredProducts(index: number): any[] {
    
    const selectedProducts = this.productos.controls
      .map((control, i) =>
        i !== index ? control.get('producto')?.value : null
      )
      .filter((product) => product !== null);

    const filteredProducts = this.products.filter(
      (product) =>
        !selectedProducts.some(
          (selectedProduct) =>
            selectedProduct?.producto_id === product.producto_id
        )
    );

    return [
      ...filteredProducts,
      {
        nombre: 'Agregar producto',
        producto_id:
          this.entitie == 'proveedor' ? 'materia_prima' : 'producto_terminado',
      },
    ];
  }


  removeProduct(index: number): void {
    this.productos.removeAt(index);
  }


  getPrecioPorUnidad(index: number): number {
    
    const productoControl = this.productos.at(index).get('producto')?.value;
    
    const productoSeleccionado = this.products.find(
      (product) => product.producto_id === productoControl?.producto_id
    );
    
    return productoSeleccionado ? productoSeleccionado.precio_unidad : 0;
  }


  getPrecioTotal(index: number): number {
    
    const cantidad = this.productos.at(index).get('cantidad')?.value || 0;
    const precioPorUnidad = this.getPrecioPorUnidad(index);
    return cantidad * precioPorUnidad;
  }


  onProductChange(selectedProduct: any, index: number): void {
    
    if (
      selectedProduct.producto_id == 'materia_prima' ||
      selectedProduct.producto_id == 'producto_terminado'
    ) {
      this.openAddProductDialog(selectedProduct.producto_id);
    }

    const currentProductControl = this.productos.at(index);

    const alreadyAdded = this.productos.controls.some((control, i) => {
      
      const currentProducto = control.get('producto')?.value;
      
      return (
        i !== index &&
        currentProducto &&
        currentProducto.producto_id === selectedProduct.producto_id
      );
    });

    if (alreadyAdded) {
      
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Este producto ya ha sido agregado.',
      });

      currentProductControl.get('producto')?.reset();
    } 
    
    else {
      const precioControl = currentProductControl.get('precio');
      precioControl?.setValue(selectedProduct.precio_unidad);
    }
  }


  openAddProductDialog(name: string): void {
    this.tableService.setTableName(name);
    this.dialog.open(DinamycFormComponent);
  }


  onQuantityChange(index: number): void {
    const precioControl = this.productos.at(index).get('precio');
    precioControl!.setValue(this.getPrecioTotal(index));
  }


  onBlurQuantity(index: number): void {
    
    const cantidadControl = this.productos.at(index).get('cantidad');
    
    if (!cantidadControl!.value || cantidadControl!.value < 1) {
      cantidadControl!.setValue(1);
    }
  }

  onSubmit(): void {
    
    if (this.billForm.valid) {
      
      this.billService.saveBillData(this.billForm.value).subscribe({
        next: async (response) => {
          
          console.log(response);
          await this.tableService.refreshTableData("compra_venta")
          this.dialogRef.close();
        },
      });
    }
  }
  
}
