import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { StudentProfile } from '../../models/student.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  student: StudentProfile | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.student = this.authService.currentStudent();
    this.loadProfile();
  }

  loadProfile() {
    this.apiService.getStudentProfile().subscribe({
      next: (data) => {
        console.log('Profile data loaded from DB:', data);
        this.student = data;
        this.authService.updateStudent(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้', err);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลส่วนตัวได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoading = false;
      }
    });
  }

  saveProfile() {
    if (!this.student) return;
    console.log('ปุ่มบันทึกถูกกดแล้ว ข้อมูลที่จะส่ง:', this.student);

    this.apiService.updateStudentProfile({
      personalEmail: this.student.personalEmail,
      phone: this.student.phone,
      province: this.student.province
    }).subscribe({
      next: () => {
        alert('บันทึกการเปลี่ยนแปลงเรียบร้อยแล้ว');
        this.loadProfile();
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการบันทึก', err);
        alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
      }
    });
  }
}
