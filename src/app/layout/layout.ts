import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { StudentProfile } from '../models/student.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive], 
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  // ตัวเก็บข้อมูลผู้ใช้ปัจจุบัน (เริ่มเป็น null เพื่อรอโหลดจาก DB)
  student: StudentProfile | null = null;

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.student = this.authService.currentStudent();
    this.loadStudentProfile();
  }

  // ฟังก์ชันยิง API ไปดึงข้อมูลนิสิตจาก .NET Backend
  loadStudentProfile() {
    this.apiService.getStudentProfile().subscribe({
      next: (data) => {
        console.log('Layout profile loaded from DB:', data);
        
        this.student = data;
        this.authService.updateStudent(data);
      },
      error: (err: any) => {
        console.error('ไม่สามารถโหลดข้อมูลผู้ใช้บน Layout ได้:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
