import { Component, OnInit } from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TreeModule } from 'primeng/tree';
import { TableService } from '../../services/TableService/table.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tree-datamodel',
  standalone: true,
  imports: [TreeModule, ToastModule],
  templateUrl: './tree-datamodel.component.html',
  styleUrls: ['./tree-datamodel.component.scss'],
})

export class TreeDataModelComponent implements OnInit {
  
  files: TreeNode[] = [
    {
      key: '0',
      label: 'Tablas',
      icon: 'pi pi-fw pi-objects-column',
      styleClass: 'default-node',
      expanded: true,
      children: [],
    },
  ];

  tableNames: any;
  selectedFile?: TreeNode;
  currentTable: any;
  suscription?: Subscription;


  constructor(
    private tableService: TableService, 
  ) {}


  ngOnInit(): void {

    this.getTableNames();
  }


  getTableNames(): void {
    
    this.tableService.getTableNames().subscribe(
      
      (response) => {
        
        this.tableNames = response;
        this.getFiles().then((treeData) => {
          this.files = treeData;
        });
      },
      
      (error) => {
        console.error(error);
      }

    );
  }


  getFiles(): Promise<TreeNode[]> {
    
    const treeData: TreeNode[] = Object.keys(this.tableNames).map(
      
      (tableKey, index) => {
        
        const columns = this.tableNames[tableKey];
        
        return {
          key: `1-${index}`, // Ajusta el prefijo de key para que no colisione con los estáticos
          label: tableKey,
          data: `${tableKey} Table`,
          icon: 'pi pi-fw pi-table',
          styleClass: 'children-node',
          children: columns.map((column: any, colIndex: any) => ({
            key: `1-${index}-${colIndex}`,
            label: column.column,
            data: `${column.column} (${column.data_type})`,
            icon: 'pi pi-fw pi-box',
          })),
        };
      
      }
    );

    this.files[0].children = this.files[0].children || [];
    this.files[0].children = [...this.files[0].children, ...treeData];

    return Promise.resolve(this.files);
  }


  nodeSelect(event: any) {

    this.currentTable = event.node.label
    this.tableService.setMenu(this.currentTable);
    this.tableService.refreshTableData(this.currentTable)
    console.log(this.tableService.menu$)
  }

}
