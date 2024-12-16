import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
} from '@angular/forms';
import { TableService } from '../../services/TableService/table.service';
import { SnakeToTitlePipe } from '../../shared/pipes/snake-to-title.pipe';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { Subscription } from 'rxjs';
import { DatabaseService } from '../../services/Database/database.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dinamyc-form',
  standalone: true,
  imports: [
    SnakeToTitlePipe,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
  ],
  templateUrl: './dinamyc-form.component.html',
  styleUrls: ['./dinamyc-form.component.scss'],
})

export class DinamycFormComponent implements OnInit {
  
  form?: FormGroup;
  schema: any[] = [];
  schema_filter : any[] = [];
  tableName: string = '';
  tableData: any[] = [];
  table: string = '';
  suscription!: Subscription;


  constructor(
    private readonly fb: FormBuilder,
    private tableService: TableService,
    private databaseService: DatabaseService,
    public dialogRef: MatDialogRef<DinamycFormComponent>
  ) {}


  ngOnInit(): void {
    
    this.tableService.tableName$.subscribe((name) => {
      this.tableName = name;
      this.getTableSchema();
    });

  }


  getTableSchema(): void {
    
    this.tableService.getTableSchema(this.tableName).subscribe((response) => {
      
      if (response?.fields) {
        
        this.table = response.table_name;
        this.schema = response.fields

        this.schema_filter = response.fields.filter(
          (field: { column_default: null }) => field.column_default == null
        );

        this.buildForm(); // Ahora el formulario solo se construirá con las columnas filtradas
        this.loadTableData(); // Cargar los datos después de filtrar
      }

    });
  }


  loadTableData(): void {
    
    this.tableService.getTableData(this.tableName).subscribe((response) => {
      
      this.tableData = [
        ...new Map(
          response.data.map((item: any) => [item.id_empleado, item])
        ).values(),
      ];

    });
  }


  buildForm(): void {
    
    const formControls: { [key: string]: FormControl } = {};

    this.schema_filter.forEach((field) => {
      formControls[field.column_name] = new FormControl(
        '',
        this.mapValidators(field)
      );
    });

    this.form = this.fb.group(formControls);
  }


  mapValidators(field: any): ValidatorFn[] {
    
    const validators: ValidatorFn[] = [];

    if (field.is_nullable === 'NO') {
      validators.push(Validators.required);
    }

    if (field.character_maximum_length) {
      validators.push(Validators.maxLength(field.character_maximum_length));
    }

    return validators;
  }


  getFieldType(field: any): string {
    
    switch (field.data_type) {
      
      case 'integer':
      case 'bigint':
      case 'smallint':
        return 'number';

      case 'character varying':
      case 'text':
        return 'text';

      case 'date':
      case 'timestamp':
      case 'timestamp without time zone':
        return 'calendar';

      case 'boolean':
        return 'checkbox';

      default:
        return 'text';
    }
  }


  async submitForm(): Promise<void> {
    
    if (this.form?.valid) {
      
      await this.saveProductData()
      this.dialogRef.close({ success: true });
    }
  }


  async saveProductData(): Promise<void> {
    
    console.log(this.schema)
   
    this.databaseService.saveDataEntry(this.table, this.form?.value, this.schema).subscribe({
      next: (response) => {
        console.log(response);
      },
    });
  }

}
