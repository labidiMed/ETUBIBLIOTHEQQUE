import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student } from '../models/Student';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly baseUrl = '/api/students';

  constructor(private httpClient: HttpClient) { }

  findAll(): Observable<Student[]> {
    return this.httpClient.get<Student[]>(this.baseUrl);
  }

  findById(id: number): Observable<Student> {
    return this.httpClient.get<Student>(`${this.baseUrl}/${id}`);
  }

  create(student: Student): Observable<Student> {
    return this.httpClient.post<Student>(this.baseUrl, student);
  }

  update(id: number, student: Student): Observable<Student> {
    return this.httpClient.put<Student>(`${this.baseUrl}/${id}`, student);
  }

  delete(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
