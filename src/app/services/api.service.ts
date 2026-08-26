import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Course, Registration, Section, StudentProfile } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  // ดึงรายวิชา พร้อมแปลงฟิลด์อัตโนมัติให้รองรับทุกหน้า
  getSections(): Observable<Section[]> {
    return this.http.get<Section[]>(`${this.baseUrl}/sections`).pipe(
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
            credits: item.course.credits ?? item.course.Credits,
            category: item.course.category ?? item.course.Category ?? '',
            prerequisiteCode: item.course.prerequisiteCode ?? item.course.PrerequisiteCode
          } : (item.Course ? {
            courseCode: item.Course.CourseCode,
            courseName: item.Course.CourseName,
            credits: item.Course.Credits,
            category: item.Course.Category ?? '',
            prerequisiteCode: item.Course.PrerequisiteCode
          } : undefined)
        }));
      })
    );
  }

  getCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/courses`);
  }

  registerCourse(data: { sectionId: number; semester: string }): Observable<unknown> {
    return this.http.post(`${this.baseUrl}/registrations`, data);
  }

  getRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.baseUrl}/registrations`);
  }

  deleteRegistration(regId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/registrations/${regId}`);
  }

  getStudentProfile(): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.baseUrl}/students/me`).pipe(
      map((res: any): StudentProfile => ({
        studentId: res.studentId ?? res.StudentId,
        nationalId: res.nationalId ?? res.NationalId,
        firstNameTh: res.firstNameTh ?? res.FirstNameTh,
        lastNameTh: res.lastNameTh ?? res.LastNameTh,
        universityEmail: res.universityEmail ?? res.UniversityEmail,
        personalEmail: res.personalEmail ?? res.PersonalEmail ?? null,
        phone: res.phone ?? res.Phone ?? null,
        province: res.province ?? res.Province ?? null,
        status: res.status ?? res.Status,
        faculty: res.faculty ?? res.Faculty ?? null,
        major: res.major ?? res.Major ?? null,
        advisor: res.advisor ?? res.Advisor ?? null,
        gpax: Number(res.gpax ?? res.Gpax ?? 0),
        totalCredits: Number(res.totalCredits ?? res.TotalCredits ?? 0)
      }))
    );
  }

  updateStudentProfile(data: Pick<StudentProfile, 'personalEmail' | 'phone' | 'province'>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/students/me`, data);
  }
}
