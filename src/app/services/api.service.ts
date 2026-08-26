import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://reg-backend-iv70.onrender.com'; 

  constructor(private http: HttpClient) { }

  // ฟังก์ชัน login
  login(credentials: { studentId: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  getSections() {
    return this.http.get(`${this.baseUrl}/sections`);
  }

  getCourses() {
    return this.http.get(`${this.baseUrl}/courses`);
  }

  registerCourse(data: { studentId: string; sectionId: number; semester: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/registrations`, data);
  }

  getRegistrations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/registrations`);
  }

  deleteRegistration(regId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/registrations/${regId}`);
  }

  getStudentProfile(studentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/students/${studentId}`);
  }

  updateStudentProfile(studentId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/${studentId}`, data);
  }
}