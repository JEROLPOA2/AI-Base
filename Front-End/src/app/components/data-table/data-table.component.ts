import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { Table, TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { CommonModule } from '@angular/common';
import { TableService } from '../../services/TableService/table.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SnakeToTitlePipe } from '../../shared/pipes/snake-to-title.pipe';
import { MatDialog } from '@angular/material/dialog';
import { BillComponent } from '../bill/bill.component';
import { DinamycFormComponent } from '../dinamyc-form/dinamyc-form.component';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { DatabaseService } from '../../services/Database/database.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Subscription } from 'rxjs';

const componentMapping: { [key: string]: any } = {
  compra_venta: BillComponent,
};

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    TableModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    SnakeToTitlePipe,
    TooltipModule,
    ToolbarModule,
    ConfirmDialogModule,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})

export class DataTableComponent implements OnInit{
  
  @ViewChild('dt1') dt1!: Table;
  tableData: any;
  tableName: any;
  columns: any;
  references: any[] = [];
  isComponentVisible = true;

  first = 0;
  rows = 5;

  searchValue: string | undefined;
  suscription!: Subscription;

  editingRow: any = null; // Almacena el ID de la fila que está en modo de edición
  backupRow: any = null; // Copia temporal de los datos originales

  constructor(
    private tableService: TableService,
    private dialog: MatDialog,
    private databaseService: DatabaseService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}


  ngOnInit(): void {
    
    //this.getTableData();

    this.tableService.tableData$.subscribe((data) => {
      
      this.tableData = data;
      
      if (this.tableData.length > 0) {
        this.columns = Object.keys(this.tableData[0]);
      }
      
    });

    this.tableService.tableName$.subscribe((tableName) => {
      this.tableName = tableName;
    });
  }

  
  getTableData(): void {
    
    this.tableService.tableData$.subscribe((data) => {
      this.tableData = data;
    });

    console.log(this.tableData)
  }


  getTableReferences(): void {
    
    this.tableService
      .getTableReferences(this.tableName)
      .subscribe((response) => {
        
        if (response?.references) {
          this.references = response.references;
        }

      });
  }

  next() {
    this.first = this.first + this.rows;
  }


  prev() {
    this.first = this.first - this.rows;
  }


  reset() {
    this.first = 0;
  }


  pageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
  }


  isLastPage(): boolean {
    return this.tableData
      ? this.first === this.tableData.length - this.rows
      : true;
  }


  isFirstPage(): boolean {
    return this.tableData ? this.first === 0 : true;
  }


  clear(table: any) {
    table.clear();
    this.searchValue = '';
  }


  handleInput(event: Event): void {
    
    const input = event.target as HTMLInputElement;
    const value = input.value || '';
    this.dt1.filterGlobal(value, 'contains');
  }


  openDialog(tableName: string): void {
    
    const component = componentMapping[tableName] || DinamycFormComponent;
    
    const dialogRef = this.dialog.open(component, {
      panelClass: 'custom-dialog-class',
      minHeight: '95vh',
      minWidth: '400px',
      maxWidth: '90vw',
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      
      if (result?.success) {
        
        console.log('Datos añadidos:', result.data);
        await this.tableService.refreshTableData(this.tableName)
      }
    });
  }


  deleteRow(row: any): void {
    
    this.databaseService
      .deleteRow(this.tableName, row)
      .subscribe(async (response) => {
        
        console.log(response);
        await this.tableService.refreshTableData(this.tableName)

      });   
  }


  confirm(event: Event, row: any) {
    
    const foreignTables = this.references.map((ref) => ref.table_name);
    
    const affectedTablesMessage = foreignTables.length
      ? `Las siguientes tablas podrían verse afectadas:<br><br>- ${foreignTables.join(
          '<br>- '
        )}`
      : '';

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Desea eliminar este registro?<br><br>${affectedTablesMessage}`,
      header: 'Confirmación de Eliminación',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmado',
          detail: 'Registro eliminado',
        });

        this.deleteRow(row);
      },
      
      reject: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Rechazado',
          detail: 'Operación cancelada',
        });
      },
    });
  }


  editRow(row: any): void {
    this.editingRow = row; // Establece la fila en modo de edición
    this.backupRow = { ...row }; // Realiza una copia de los datos originales
  }


  saveRow(row: any): void {
    
    this.databaseService.updateRow(this.tableName, row).subscribe({
      
      next: async (response) => {
        
        console.log('Datos guardados en el backend:', response);
        this.editingRow = null; // Salir del modo de edición
        this.backupRow = null; // Limpia la copia de seguridad
        await this.tableService.refreshTableData(this.tableName)
      },

      error: (error) => {
        console.error('Error al guardar los datos:', error);
      },
    });
  }
  

  cancelEdit(): void {
    
    if (this.backupRow) {
      Object.assign(this.editingRow, this.backupRow);
    }
    
    console.log('Edición cancelada. Datos restaurados:', this.editingRow);
    this.editingRow = null; // Salir del modo de edición
    this.backupRow = null; // Limpia la copia de seguridad
  }

}
