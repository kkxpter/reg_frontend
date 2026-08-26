import { Component } from '@angular/core';
import { Router } from '@angular/router'; // นำเข้า Router สำหรับเปลี่ยนหน้า

@Component({
  imports: [],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {
  // สร้าง Constructor เพื่อเรียกใช้งาน Router
  constructor(private router: Router) {}

  // สร้างฟังก์ชันตอนกดปุ่มเข้าสู่ระบบ
  onLogin(event: Event) {
    event.preventDefault(); // ป้องกันหน้าเว็บรีเฟรช
    this.router.navigate(['/dashboard']); // สั่งให้วาร์ปไปหน้า dashboard
  }
}