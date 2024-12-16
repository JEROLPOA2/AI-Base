import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Menu } from 'primeng/menu'; // Import the Menu type
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/ReportService/report.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-report-dialog',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, TableModule],
  templateUrl: './report-dialog.component.html',
  styleUrls: ['./report-dialog.component.scss'],
})
export class ReportDialogComponent {
  @ViewChild('menu') menu!: Menu; // Reference the p-menu component
  @Output() closeMenu = new EventEmitter<void>(); // Evento para cerrar el menú

  element_list: any[] = [];

  constructor(
    private reportService: ReportService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.reportService.getTableData$().subscribe((tableData) => {
      this.updateElementList();
    });

    this.reportService.getImageData$().subscribe((imageData) => {
      this.updateElementList();
    });
  }

  private updateElementList(): void {
    const tableData = this.reportService.getCurrentTableData();
    const imageData = this.reportService.getCurrentImageData();

    this.element_list = [...tableData, ...imageData];
  }

  async select(item?: any) {
    
    if (item) {
      await this.reportService.addElement(item);
    } 
    
    else {
      console.warn('No hay elemento seleccionado para transferir.');
    }
  }

  delete(item?: any) {
    console.log('Eliminar acción ejecutada.');
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  toggleMenu(event: Event, menu: Menu) {
    menu.toggle(event); // Desplegar el menú específico
  }  

  close() {
    this.closeMenu.emit(); // Emitir el evento para notificar al componente padre
  }

  isTable(item: any): boolean {
    return Array.isArray(item) && item.length > 0 && typeof item[0] === 'object';
  }

  getImagenUrl(base64: string): SafeUrl {
    
    const blob = this.base64ToBlob(base64, 'image/png');
    const url = URL.createObjectURL(blob);
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }


  base64ToBlob(base64: string, type: string): Blob {
    
    const binary = atob(base64);
    const array = [];
    
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    return new Blob([new Uint8Array(array)], { type });
  }
}
