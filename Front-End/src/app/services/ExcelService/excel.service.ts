import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  
  exportJsonToExcel(jsonData: any[], fileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(jsonData);
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, fileName);
  }


  private saveAsExcelFile(buffer: any, fileName: string): void {

    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = `${fileName}.xlsx`;

    link.click();
    window.URL.revokeObjectURL(link.href);
  }
}
