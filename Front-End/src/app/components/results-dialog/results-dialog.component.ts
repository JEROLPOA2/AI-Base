import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { TableModule } from 'primeng/table'; // Importar TableModule de PrimeNG
import { ExcelService } from '../../services/ExcelService/excel.service';
import { ReportService } from '../../services/ReportService/report.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-results-dialog',
  standalone: true,
  imports: [CommonModule, TableModule], // Importar módulos necesarios
  templateUrl: './results-dialog.component.html',
  styleUrls: ['./results-dialog.component.scss'],
})

export class ResultsDialogComponent implements OnInit {
  
  results: any;
  intention?: string;
  imageURL?: SafeUrl; // Para almacenar la URL de la imagen


  constructor(
    private excelService: ExcelService,
    private reportService: ReportService,
    private sanitizer: DomSanitizer,  // Para evitar ataques de inyección de código
    public dialogRef: MatDialogRef<ResultsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { results: any, intention: string }
  ) {
    
    this.results = data.results; // Asignar resultados
    this.intention = data.intention; // Asignar intención
  }


  ngOnInit(): void {
    
    if (this.intention == "MAKE_QUERY_AND_GRAPH" || this.intention == "MAKE_GRAPH"){
      this.getImageData();
    }
  }


  getImageData(): void {
    this.imageURL = this.getImagenUrl(this.results)
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


  onDownload(): void {
    this.intention == "MAKE_QUERY" ? this.excelService.exportJsonToExcel(this.results, "query_data") : this.downloadImage()
  }


  downloadImage(): void {
    
    const blob = this.base64ToBlob(this.results, 'image/png');
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'imagen.png';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


  onTransfer(): void {
    if (this.intention === 'MAKE_QUERY') {
      this.reportService.addTableData(this.results);
    } else if (this.intention === 'MAKE_GRAPH' || this.intention === 'MAKE_QUERY_AND_GRAPH') {
      this.reportService.addImageData(this.results);
    }
    this.dialogRef.close();
  }


  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : []; // Retorna las claves del objeto
  }

}
