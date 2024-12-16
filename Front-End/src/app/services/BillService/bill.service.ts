import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  private baseURL: string = 'http://localhost:4321/api';

  constructor(private http: HttpClient) {}


  getEntities(entity: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/get-entity/${entity}`);
  }

  
  getProducts(tableName: string): Observable<any> {
    return this.http.get<any>(`${this.baseURL}/get-products/${tableName}`);
  }

  
  saveBillData(billData: any): Observable<any>{
    return this.http.post(`${this.baseURL}/save-bill-data`, billData)
  }
}
