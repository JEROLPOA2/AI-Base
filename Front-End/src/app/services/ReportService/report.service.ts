import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class ReportService {
  
  private tableDataSubject = new BehaviorSubject<any[]>([]);
  private imageDataSubject = new BehaviorSubject<string[]>([]);

  private tableDataToDisplaySubject = new BehaviorSubject<any | null>(null);
  private imageToDisplaySubject = new BehaviorSubject<string | null>(null);


  constructor() {}


  getTableData$() {
    return this.tableDataSubject.asObservable();
  }


  getImageData$() {
    return this.imageDataSubject.asObservable();
  }


  addTableData(data: any): void {
    
    const currentData = this.tableDataSubject.value;

    if (!this.isTableDataDuplicate(data, currentData)) {
      this.tableDataSubject.next([...currentData, data]);
      console.log('Tabla transferida:', data);
    } 
    
    else {
      console.warn('Tabla ya existe, no se añade.');
    }
  }


  addImageData(data: string): void {
    const currentData = this.imageDataSubject.value;

    if (!this.isImageDataDuplicate(data, currentData)) {
      this.imageDataSubject.next([...currentData, data]);
      console.log('Imagen transferida:', data);
    } 
    
    else {
      console.warn('Imagen ya existe, no se añade.');
    }
  }


  getCurrentTableData(): any[] {
    return this.tableDataSubject.value;
  }


  getCurrentImageData(): string[] {
    return this.imageDataSubject.value;
  }


  private isTableDataDuplicate(newData: any, currentData: any[]): boolean {
    return currentData.some((data) => JSON.stringify(data) === JSON.stringify(newData));
  }

  private isImageDataDuplicate(newData: string, currentData: string[]): boolean {
    return currentData.includes(newData);
  }


  getTableDataToDisplay$() {
    return this.tableDataToDisplaySubject.asObservable();
  }


  private setTableDataToDisplay(data: any): void {
    this.tableDataToDisplaySubject.next(data);
    console.log('Tabla para mostrar actualizada:', data);
  }


  getImageToDisplay$() {
    return this.imageToDisplaySubject.asObservable();
  }


  private setImageToDisplay(data: string): void {
    this.imageToDisplaySubject.next(data);
    console.log('Imagen para mostrar actualizada:', data);
  }


  addElement(data: any): void {
    if (this.isJson(data)) {
      this.setTableDataToDisplay(data);
    } else {
      this.setImageToDisplay(data);
    }
  }


  private isJson(data: any): boolean {
    return typeof data === 'object' && data !== null;
  }
}
