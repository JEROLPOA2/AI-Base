import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class TableService {
  
  private baseURL: string = 'http://localhost:4321/api';
  
  private tableNameSubject = new BehaviorSubject<string>('');
  tableName$ = this.tableNameSubject.asObservable();

  private tableDataSubject = new BehaviorSubject<any>([]);
  tableData$ = this.tableDataSubject.asObservable();

  private menuSubject = new BehaviorSubject<any>('');
  menu$ = this.menuSubject.asObservable();


  constructor(private http: HttpClient) {}


  setTableName(name: string): void {
    this.tableNameSubject.next(name);
  }


  setTableData(data: any): void {
    this.tableDataSubject.next(data);
  }


  setMenu(menu: any): void {
    this.menuSubject.next(menu);
  }


  getTableNames(): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/table-names`);
  }


  getTableSchema(tableName: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/table-schema/${tableName}`);
  }


  getTableData(tableName: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/table-data/${tableName}`);
  }


  getTableReferences(tableName: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/table-references/${tableName}`);
  }


  refreshTableData(tableName: string){

    this.getTableData(tableName).subscribe({
      next: (response) => {
        this.setTableData(response.data);
        this.setTableName(tableName);
      },
      
      error: (error) => {
        console.error(error);
      },
    });
  }
}
