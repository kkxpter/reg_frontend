import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://reg-backend-xxx.onrender.com/api'; // (ใช้ลิงก์ Render ของพี่)

  constructor(private http: HttpClient) { }

  login(credentials: { studentId: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  // ดึงรายวิชา พร้อมแปลงฟิลด์อัตโนมัติให้รองรับทุกหน้า
  getSections(): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/sections`).pipe(
      map(data => {
        if (!Array.isArray(data)) return [];
        return data.map((item: any) => ({
          sectionId: item.sectionId ?? item.SectionId ?? item.id ?? item.Id,
          courseCode: item.courseCode ?? item.CourseCode,
          secNo: item.secNo ?? item.SecNo,
          scheduleTime: item.scheduleTime ?? item.ScheduleTime,
          instructor: item.instructor ?? item.Instructor,
          capacity: item.capacity ?? item.Capacity,
          enrolled: item.enrolled ?? item.Enrolled,
          course: item.course ? {
            courseCode: item.course.courseCode ?? item.course.CourseCode,
            courseName: item.course.courseName ?? item.course.CourseName,
            credits: item.course.credits ?? item.course.Credits
          } : (item.Course ? {
            courseCode: item.Course.CourseCode,
            courseName: item.Course.CourseName,
            credits: item.Course.Credits
          } : null)
        }));
      })
    );
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
    return this.http.get(`${this.baseUrl}/students/${studentId}`).pipe(
      map((res: any) => ({
        studentId: res.studentId ?? res.StudentId,
        nationalId: res.nationalId ?? res.NationalId,
        firstNameTh: res.firstNameTh ?? res.FirstNameTh,
        lastNameTh: res.lastNameTh ?? res.LastNameTh,
        universityEmail: res.universityEmail ?? res.UniversityEmail,
        status: res.status ?? res.Status,
        faculty: res.faculty ?? res.Faculty
      }))
    );
  }

  updateStudentProfile(studentId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/students/${studentId}`, data);
  }
}