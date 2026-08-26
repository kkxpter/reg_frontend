import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../services/api.service'; // นำเข้า ApiService ที่เราใช้เชื่อมต่อ .NET API

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  // ตัวเก็บข้อมูลผู้ใช้ปัจจุบัน (เริ่มเป็น null เพื่อรอโหลดจาก DB)
  student: any = null;
  currentStudentId: string = '6601234567'; // ค่าสำรองกรณีหาใน LocalStorage ไม่พบ

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // 1. ดึงรหัสนิสิตที่ Login ค้างไว้จาก localStorage
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

    // 2. ดึงข้อมูลโปรไฟล์จริงจาก Database ผ่าน API
    if (this.currentStudentId) {
      this.loadStudentProfile();
    }
  }

  // ฟังก์ชันยิง API ไปดึงข้อมูลนิสิตจาก .NET Backend
  loadStudentProfile() {
    this.apiService.getStudentProfile(this.currentStudentId).subscribe({
      next: (data: any) => {
        console.log('Layout profile loaded from DB:', data);
        
        // แมปข้อมูลให้รองรับทั้งพิมพ์เล็ก/ใหญ่ และฟิลด์ภาษาไทย
        this.student = {
          studentId: data.studentId || data.StudentId || this.currentStudentId,
          firstName: data.firstName || data.FirstName || data.firstNameTh || data.FirstNameTh || 'นิสิต',
          lastName: data.lastName || data.LastName || data.lastNameTh || data.LastNameTh || '',
        };
      },
      error: (err: any) => {
        console.error('ไม่สามารถโหลดข้อมูลผู้ใช้บน Layout ได้:', err);
        // Fallback ดึงจาก LocalStorage ถ้า API มีปัญหา
        const savedStudent = localStorage.getItem('student');
        if (savedStudent) {
          this.student = JSON.parse(savedStudent);
        }
      }
    });
  }
}