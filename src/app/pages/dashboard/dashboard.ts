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
  currentStudentId: string = '65011212013'; 

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        try {
          const studentObj = JSON.parse(savedStudent);
          this.currentStudentId = studentObj.studentId || studentObj.StudentId || this.currentStudentId;
        } catch (e) {
          console.error('Error parsing saved student', e);
        }
      }
    }

    if (this.currentStudentId) {
      this.loadStudentProfile();
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
        
        // 📌 ดึงฟิลด์ major / Major / majorTh จาก DB มาแสดงผลจริง
        this.student = {
          studentId: data.studentId || data.StudentId || this.currentStudentId,
          firstName: data.firstName || data.FirstName || data.firstNameTh || data.FirstNameTh || '',
          lastName: data.lastName || data.LastName || data.lastNameTh || data.lastNameTh || '',
          major: data.major || data.Major || data.majorTh || data.MajorTh || 'วิทยาการคอมพิวเตอร์', // ดึงจาก DB
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