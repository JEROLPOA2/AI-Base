import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
//import { Observable } from 'rxjs';
import { lastValueFrom, Observable, Subject, switchMap, tap } from 'rxjs';
import { MessageService } from '../Message/message.service';
import { AuthService } from '../AuthService/auth.service';

@Injectable({
  providedIn: 'root',
})

export class DatabaseService {
  private apiUrl = 'http://localhost:4321/api';


  constructor(private http: HttpClient, private messageService: MessageService, private authService: AuthService) {}


  deleteRow(tableName: string, row: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete-row/${tableName}/${row}`)
  }


  updateRow(tableName: string, rowData: any): Observable<any> {
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
  
    const url = `${this.apiUrl}/update-row/${tableName}`;
    return this.http.post(url, rowData, { headers });
  }


  saveDataEntry(tableName: string, productData: any, tableSchemma: any): Observable<any> {
    const payload = {
        row_data: productData,
        table_schemma: tableSchemma
    };

    return this.http.post<any>(`${this.apiUrl}/save-data-entry/${tableName}`, payload)
  }
}
