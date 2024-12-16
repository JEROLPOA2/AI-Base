import { Component, OnInit } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { Subscription } from 'rxjs';
import { TableService } from '../../services/TableService/table.service';

@Component({
  selector: 'app-tree-reports',
  standalone: true,
  imports: [TreeModule],
  templateUrl: './tree-reports.component.html',
  styleUrls: ['./tree-reports.component.scss'],
})

export class TreeReportsComponent implements OnInit {

  files: TreeNode[] = [
    {
      key: '1',
      label: 'Nuevo reporte',
      icon: 'pi pi-fw pi-plus',
      styleClass: 'children-node',
    },
  ];

  selectedFile?: TreeNode;
  suscription?: Subscription;
  private isFirstLoad = true;

  constructor(
    private tableService: TableService,
  ) {}

  ngOnInit(): void {
    this.selectedFile = undefined;
    // Aquí irían las llamadas a servicios si es necesario cargar reportes desde un backend
  }

  nodeSelect(event: any): void {
    const reportId = event.node.label;

    if (reportId === 'Nuevo reporte') {
      console.log('Nuevo reporte presionado');

    } 
    else {
      console.log('Seleccionado reporte:', reportId);
    }
    this.tableService.setMenu('Report');
  }
}
