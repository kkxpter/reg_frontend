import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Course, StudentProfile } from '../../models/student.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  student: StudentProfile | null = null;
  courses: Course[] = [];
  isProfileLoading = true;
  profileError = '';
  isCoursesLoading = true;
  coursesError = '';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.student = this.authService.currentStudent();
    this.loadStudentProfile();

    this.apiService.getCourses().subscribe({
      next: (data: any) => {
        this.courses = data;
        this.isCoursesLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load courses', err);
        this.coursesError = 'ไม่สามารถโหลดรายวิชาได้ กรุณาลองใหม่อีกครั้ง';
        this.isCoursesLoading = false;
      }
    });
  }

  loadStudentProfile() {
    this.apiService.getStudentProfile().subscribe({
      next: (data) => {
        console.log('Dashboard profile loaded from Database:', data);
        this.student = data;
        this.authService.updateStudent(data);
        this.isProfileLoading = false;
      },
      error: (err: any) => {
        console.error('ไม่สามารถดึงข้อมูลโปรไฟล์จาก Database ได้:', err);
        this.profileError = 'ไม่สามารถโหลดข้อมูลนักศึกษาได้ กรุณาลองใหม่อีกครั้ง';
        this.isProfileLoading = false;
      }
    });
  }
}
