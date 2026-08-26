import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Registration } from '../../models/student.model';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule implements OnInit {
  registrations: Registration[] = []; 
  selectingWithdrawCode: string | null = null; 
  isLoading = true;
  errorMessage = '';

  // 📌 มี Constructor แค่อันเดียวพอนะครับ
  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // 📌 มี ngOnInit แค่อันเดียวพอเช่นกัน
  ngOnInit(): void {
    this.loadMyRegistrations();
  }

  printSchedule() {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }

  // โหลดรายการที่ลงทะเบียน
  loadMyRegistrations() {
    this.apiService.getRegistrations().subscribe({
      next: (data: Registration[]) => {
        this.registrations = data;
        this.isLoading = false;
        console.log('Loaded my schedule/registrations:', this.registrations);
      },
      error: () => {
        console.error('Failed to load registrations');
        this.errorMessage = 'ไม่สามารถโหลดตารางเรียนได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoading = false;
      }
    });
  }

  // คำนวณหน่วยกิตรวมสะสมในเทอมนี้
  get totalCredits(): number {
    return this.registrations.reduce((sum, item) => sum + (item.section?.course?.credits || 0), 0);
  }

  // เปิด-ปิด ปุ่มยืนยันการถอน
  toggleWithdraw(courseCode: string) {
    if (this.selectingWithdrawCode === courseCode) {
      this.selectingWithdrawCode = null;
    } else {
      this.selectingWithdrawCode = courseCode;
    }
  }

  // กดยืนยันการถอนรายวิชา
  // กดยืนยันการถอนรายวิชา
  confirmWithdraw(regId?: number, courseCode?: string) {
    if (!regId) {
      alert('ไม่พบรหัสการลงทะเบียน');
      return;
    }

    // 1. เรียก API ลบการลงทะเบียน
    this.apiService.deleteRegistration(regId).subscribe({
      next: () => {
        // 📌 ตัดวิชานั้นออกจากอาเรย์ในหน้าจอทันที เพื่อให้ตารางอัปเดตและวิชาหายไปแบบเรียลไทม์
        this.registrations = this.registrations.filter(r => r.regId !== regId);
        this.selectingWithdrawCode = null;

        // 📌 แจ้งเตือนว่าถอนสำเร็จแล้ว
        alert(`ถอนรายวิชา ${courseCode} เรียบร้อยแล้ว (สถานะเกรด W)`);
        
        // โหลดข้อมูลใหม่ซ้ำเพื่อความชัวร์ (แต่หน้าจอจะหายไปทันทีตั้งแต่บรรทัด filter ด้านบนแล้ว)
        this.loadMyRegistrations(); 
      },
      error: (err) => {
        console.error('Failed to delete registration:', err);
        alert('เกิดข้อผิดพลาดในการถอนรายวิชา');
      }
    });
  }
  getRegistrationsByDay(dayName: string) {
    const dayMap: { [key: string]: string[] } = {
      'จันทร์': ['จันทร์', 'mon', 'monday'],
      'อังคาร': ['อังคาร', 'tue', 'tuesday'],
      'พุธ': ['พุธ', 'wed', 'wednesday'],
      'พฤหัสบดี': ['พฤหัส', 'thu', 'thursday'],
      'ศุกร์': ['ศุกร์', 'fri', 'friday']
    };

    const keywords = dayMap[dayName] || [dayName];

    return this.registrations.filter(item => {
      const timeStr = (item.section?.scheduleTime || '').toLowerCase();
      // เช็กว่ามีคำไหนใน keywords ตรงกับ scheduleTime ไหม
      return keywords.some(keyword => timeStr.includes(keyword));
    });
  }
  // ฟังก์ชันหาเวลาเริ่มต้น เช่น "Mon 09:00 - 12:00" -> เริ่ม 9
  // ฟังก์ชันหาเวลาเริ่มต้นให้แม่นยำ (รองรับทั้งระบบ 24 ชม. และคำว่า 13:00, 14:00 ขึ้นไป)
  getStartHour(scheduleTime: string): number {
    if (!scheduleTime) return 8;
    const matches = scheduleTime.match(/(\d{2}):00/g);
    if (matches && matches.length > 0) {
      return parseInt(matches[0].split(':')[0], 10);
    }
    return 8;
  }

  getDuration(scheduleTime: string): number {
    if (!scheduleTime) return 1;
    const matches = scheduleTime.match(/(\d{2}):00\s*-\s*(\d{2}):00/);
    if (matches) {
      const start = parseInt(matches[1], 10);
      const end = parseInt(matches[2], 10);
      return Math.max(1, end - start);
    }
    return 2;
  }
  // คำนวณช่องว่าง (offset) ถ้าวิชาไม่ได้เริ่มตั้งแต่ 08:00
  getEmptySlotsBefore(scheduleTime: string): number {
    const start = this.getStartHour(scheduleTime);
    return Math.max(0, start - 8); // เทียบกับเวลาเริ่มต้นตารางคือ 08:00
  }
  getEmptySlotsBeforeList(dayName: string) {
    const courses = this.getRegistrationsByDay(dayName);
    if (courses.length === 0) return [];
    
    // หาเวลาเริ่มต้นที่เร็วที่สุดของวันนั้น
    let earliestHour = 20;
    courses.forEach(item => {
      const h = this.getStartHour(item.section?.scheduleTime || '');
      if (h < earliestHour) earliestHour = h;
    });

    const count = Math.max(0, earliestHour - 8);
    return new Array(count);
  }
  // สร้าง Array สำหรับเว้นช่องว่างก่อนเริ่มเรียน (สำหรับกรณีมีหลายวิชา)
  getEmptySlotsBeforeListForCourse(item: Registration): number[] {
    const startHour = this.getStartHour(item.section?.scheduleTime || '');
    const count = Math.max(0, startHour - 8);
    return new Array(count);
  }

  // สร้าง Array สำหรับช่องว่างที่เหลือท้ายแถว
  getRemainingSlotsList(dayName: string) {
    const courses = this.getRegistrationsByDay(dayName);
    if (courses.length === 0) return new Array(12);
    
    // คำนวณช่องว่างที่เหลือหลังจบคอร์สสุดท้ายของวัน
    const lastCourse = courses[courses.length - 1];
    const matches = (lastCourse.section?.scheduleTime || '').match(/- (\d{2}):00/);
    const endHour = matches ? parseInt(matches[1], 10) : 20;
    const remainingCount = Math.max(0, 20 - endHour);
    
    return new Array(remainingCount);
  }
  // คำนวณช่องว่างก่อนถึงเวลาเรียนของแต่ละวิชา (เทียบกับ 08:00 เสมอ)
  getOffsetColumns(scheduleTime: string): number {
    const startHour = this.getStartHour(scheduleTime); // เช่น 13
    return Math.max(0, startHour - 8); // 13 - 8 = 5 ช่องว่าง (ไปเริ่มที่ช่อง 13:00 เป๊ะ)
  }
  // คำนวณตำแหน่งเริ่มต้นแบบแม่นยำ (08:00 = คอลัมน์ที่ 2, 13:00 = คอลัมน์ที่ 7)
  getGridColumnStart(scheduleTime: string): number {
    const startHour = this.getStartHour(scheduleTime); // เช่น 13
    // เริ่มที่ 08:00 = 2, 09:00 = 3, ..., 13:00 = 7 (สูตร: startHour - 8 + 2)
    return Math.min(13, Math.max(2, startHour - 8 + 2));
  }

  // คำนวณตำแหน่งสิ้นสุดแบบแม่นยำ (เริ่ม + จำนวนชั่วโมงเรียน)
  getGridColumnEnd(scheduleTime: string): number {
    const start = this.getGridColumnStart(scheduleTime);
    const duration = this.getDuration(scheduleTime); // เช่น 3 ชั่วโมง
    return Math.min(14, start + duration);
  }
  // ฟังก์ชันดึงเวลาเลิกเรียนของวิชาก่อนหน้า เช่น "Mon 09:00 - 12:00" -> ได้ค่า 12
  getPreviousEndHour(scheduleTime: string): number {
    if (!scheduleTime) return 8;
    const matches = scheduleTime.match(/- (\d{2}):00/);
    return matches ? parseInt(matches[1], 10) : 8;
  }
  
}
