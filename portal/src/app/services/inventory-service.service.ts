import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Book } from '../model/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryServiceService {

  baseUrl = "http://localhost:3001"

  constructor(private http:HttpClient) { }

  //----------------- demo ------------
  //book
  getAllBook():Observable<Book[]>{
    return this.http.get<Book[]>(`${this.baseUrl}/book`);
  }
  getBookById(id:number):Observable<Book>{
    return this.http.get<Book>(`${this.baseUrl}/book/${id}`);
  }
  createBook(book:Book):Observable<Book>{
    return this.http.post<Book>(`${this.baseUrl}/book`,book);
  }

  updateBook(id:number,book:Book):Observable<Book>{
    return this.http.patch<Book>(`${this.baseUrl}/book/update/${id}`,book);
  }
  deleteBook(id:number):Observable<void>{
    return this.http.delete<void>(`${this.baseUrl}/book/${id}`);
  }
  //----------------- demo ------------
}
