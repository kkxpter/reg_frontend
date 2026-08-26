import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:5023/api'; // URL .NET API ของเรา

  constructor(private http: HttpClient) { }

  // ฟังก์ชัน login
  login(credentials: { studentId: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  // ดึงรายวิชาเปิดสอนทั้งหมด (แก้ไขจาก apiUrl เป็น baseUrl)
  getSections() {
    return this.http.get(`${this.baseUrl}/sections`);
  }

  // ดึงรายวิชาหลักทั้งหมด (แก้ไขจาก apiUrl เป็น baseUrl)
  getCourses() {
    return this.http.get(`${this.baseUrl}/courses`);
  }

  // ลงทะเบียนเรียน
  registerCourse(data: { studentId: string; sectionId: number; semester: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/registrations`, data);
  }

  // ดึงประวัติและข้อมูลการลงทะเบียนทั้งหมด
  getRegistrations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/registrations`);
  }

  // ลบการลงทะเบียนเรียน (ถอนรายวิชา)
  deleteRegistration(regId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/registrations/${regId}`);
  }

  // ดึงข้อมูลโปรไฟล์นักศึกษาตามรหัสนิสิต
  getStudentProfile(studentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/students/${studentId}`);
  }

  // อัปเดตข้อมูลโปรไฟล์นักศึกษา
  updateStudentProfile(studentId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/${studentId}`, data);
  }
}