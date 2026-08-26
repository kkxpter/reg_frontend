import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  studentId: string = '';
  password: string = '';
  showForgotModal: boolean = false;

  // 2. Inject ApiService เข้ามาใน constructor
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // 3. แก้ไขฟังก์ชัน onLogin ให้เชื่อมต่อกับ .NET API จริง
  onLogin(event: Event) {
    event.preventDefault();
    
    if (!this.studentId || !this.password) {
      alert('กรุณากรอกรหัสนักศึกษาและรหัสผ่านให้ครบถ้วน');
      return;
    }

    // เรียกใช้ API Login ที่เราทำไว้
    this.authService.login({ studentId: this.studentId, password: this.password }).subscribe({
      next: (response: any) => {
        console.log('Login Success:', response);
        
        alert('เข้าสู่ระบบสำเร็จ!');
        // พาเด้งไปหน้า Dashboard หรือหน้าลงทะเบียน
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {  
        console.error('Login Failed:', err);
        alert(err.error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    });
  }

  // เปิด Modal ลืมรหัสผ่าน
  openForgotPassword() {
    this.showForgotModal = true;
  }

  // ปิด Modal ลืมรหัสผ่าน
  closeForgotPassword() {
    this.showForgotModal = false;
  }

  // ส่งคำขอรีเซ็ต
  submitForgot() {
    alert('ระบบได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว');
    this.showForgotModal = false;
  }
}
