import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, StudentProfile } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'reg_system_access_token';
  private readonly studentKey = 'reg_system_student';
  private readonly studentState = signal<StudentProfile | null>(this.restoreStudent());

  readonly currentStudent = this.studentState.asReadonly();

  constructor(private readonly http: HttpClient) {}

  login(credentials: { studentId: string; password: string }): Observable<LoginResponse> {
    // 📌 ใส่ลิงก์ Render ตรงนี้แบบชัดเจนไปเลย
    const apiUrl = 'https://reg-backend-iv70.onrender.com/api/auth/login';
    
    return this.http.post<LoginResponse>(apiUrl, credentials).pipe(
      tap(response => this.setSession(response.accessToken, response.student))
    );
  }

  get accessToken(): string | null {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(this.tokenKey);
  }

  get studentId(): string | null {
    return this.studentState()?.studentId ?? null;
  }

  updateStudent(student: StudentProfile): void {
    this.studentState.set(student);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.studentKey, JSON.stringify(student));
    }
  }

  logout(): void {
    this.studentState.set(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.studentKey);
    }
  }

  private setSession(accessToken: string, student: StudentProfile): void {
    if (!accessToken) throw new Error('Login response did not include an access token.');
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.tokenKey, accessToken);
    this.updateStudent(student);
  }

  private restoreStudent(): StudentProfile | null {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem(this.studentKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored) as StudentProfile;
    } catch {
      localStorage.removeItem(this.studentKey);
      return null;
    }
  }
}
