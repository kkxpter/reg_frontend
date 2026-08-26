import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  currentStudentId: string = '6601234567';

  // 📌 กำหนดให้รองรับทั้งพิมพ์เล็กและพิมพ์ใหญ่
  student: any = {
    studentId: '',
    nationalId: '',
    firstNameTh: '',
    lastNameTh: '',
    universityEmail: '',
    personalEmail: '',
    PersonalEmail: '',
    phone: '',
    Phone: '',
    province: '',
    Province: '',
    faculty: '',
    major: '',
    advisor: '',
    year: 'ปี 4 (Senior)',
    status: 'ปกติ (Active)'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        const studentObj = JSON.parse(savedStudent);
        this.currentStudentId = studentObj.studentId || '6601234567';
      }
    }

    this.loadProfile();
  }

  loadProfile() {
    this.apiService.getStudentProfile(this.currentStudentId).subscribe({
      next: (data: any) => {
        console.log('Profile data loaded from DB:', data);
        
        // 📌 ดึงค่าจาก DB มาแปะให้ครบทุกรูปแบบ (ไม่ว่า .NET จะส่งตัวเล็กหรือใหญ่มา)
        this.student = {
          ...data,
          personalEmail: data.personalEmail || data.PersonalEmail || '',
          PersonalEmail: data.PersonalEmail || data.personalEmail || '',
          phone: data.phone || data.Phone || '',
          Phone: data.Phone || data.phone || '',
          province: data.province || data.Province || '',
          Province: data.Province || data.province || '',
          studentId: data.studentId || data.StudentId || '',
          nationalId: data.nationalId || data.NationalId || '',
          firstNameTh: data.firstNameTh || data.FirstNameTh || '',
          lastNameTh: data.lastNameTh || data.LastNameTh || '',
          universityEmail: data.universityEmail || data.UniversityEmail || '',
          faculty: data.faculty || data.Faculty || '',
          major: data.major || data.Major || '',
          advisor: data.advisor || data.Advisor || '',
        };
      },
      error: (err) => {
        console.error('ไม่สามารถโหลดข้อมูลโปรไฟล์ได้', err);
      }
    });
  }

  saveProfile() {
    console.log('ปุ่มบันทึกถูกกดแล้ว ข้อมูลที่จะส่ง:', this.student);

    this.apiService.updateStudentProfile(this.currentStudentId, this.student).subscribe({
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