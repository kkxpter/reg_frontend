import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Course } from '../../models/student.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  student: any = null; 
  courses: Course[] = [];
  currentStudentId: string = ''; // 📌 ไม่ต้องฟิกค่าตายตัวแล้ว

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        try {
          const studentObj = JSON.parse(savedStudent);
          // ดึงรหัสนิสิตจริงของคนที่เพิ่ง Login เข้ามา
          this.currentStudentId = studentObj.studentId || studentObj.StudentId || '';
        } catch (e) {
          console.error('Error parsing saved student', e);
        }
      }
    }

    // ถ้ามีรหัสนิสิต ให้ยิงไปดึงข้อมูลล่าสุดจาก Database ทันที
    if (this.currentStudentId) {
      this.loadStudentProfile();
    } else {
      console.warn('ไม่พบรหัสนิสิตในระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
    }

    this.apiService.getCourses().subscribe({
      next: (data: any) => {
        this.courses = data;
      },
      error: (err: any) => {
        console.error('Failed to load courses', err);
      }
    });
  }

  loadStudentProfile() {
    this.apiService.getStudentProfile(this.currentStudentId).subscribe({
      next: (data: any) => {
        console.log('Dashboard profile loaded from Database:', data);
        
        // 📌 ดึงข้อมูลจริงจาก Database มาแสดงผลแบบไดนามิก
        this.student = {
          studentId: data.studentId || data.StudentId || this.currentStudentId,
          firstName: data.firstName || data.FirstName || data.firstNameTh || data.FirstNameTh || '',
          lastName: data.lastName || data.LastName || data.lastNameTh || data.LastNameTh || '',
          major: data.major || data.Major || data.majorTh || data.MajorTh || 'วิทยาการคอมพิวเตอร์',
          status: data.status || data.Status || 'ปกติ (Active)',
          advisor: data.advisor || data.Advisor || 'ดร. สมชาย ใจดี'
        };
      },
      error: (err: any) => {
        console.error('ไม่สามารถดึงข้อมูลโปรไฟล์จาก Database ได้:', err);
      }
    });
  }
}