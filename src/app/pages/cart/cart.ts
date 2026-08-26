import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Section } from '../../models/student.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart implements OnInit {
  sections: Section[] = []; // รายการ Section ทั้งหมดที่ดึงมาจาก Backend
  cart: Section[] = [];     // รายการวิชาที่เลือกไว้ในตะกร้า
  registeredSections: Section[] = []; // รายการวิชาที่เคยลงทะเบียนไปแล้วจริงๆ ใน DB
  searchText: string = '';  // สำหรับช่องค้นหา
  isLoadingSections = true;
  isLoadingRegistrations = true;
  errorMessage = '';
  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSections();
    this.loadMyRegistrations(); // โหลดวิชาที่เคยลงทะเบียนแล้วมาเช็กชนด้วย
  }

  loadSections() {
    this.apiService.getSections().subscribe({
      next: (data: any) => {
        // แปลงฟิลด์จากหลังบ้านให้รองรับทั้งตัวพิมพ์เล็กและพิมพ์ใหญ่แบบอัตโนมัติ
        this.sections = data.map((item: any) => ({
          sectionId: item.sectionId || item.SectionId,
          courseCode: item.courseCode || item.CourseCode,
          secNo: item.secNo || item.SecNo,
          scheduleTime: item.scheduleTime || item.ScheduleTime,
          instructor: item.instructor || item.Instructor,
          capacity: item.capacity || item.Capacity,
          enrolled: item.enrolled || item.Enrolled,
          course: item.course ? {
            courseCode: item.course.courseCode || item.course.CourseCode,
            courseName: item.course.courseName || item.course.CourseName,
            credits: item.course.credits || item.course.Credits
          } : (item.Course ? {
            courseCode: item.Course.CourseCode,
            courseName: item.Course.CourseName,
            credits: item.Course.Credits
          } : null)
        }));

        console.log('Fixed & Formatted Sections:', this.sections);
        this.isLoadingSections = false;
      },
      error: (err: any) => {
        console.error('Failed to load sections', err);
        this.errorMessage = 'ไม่สามารถโหลดรายวิชาที่เปิดสอนได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoadingSections = false;
      }
    });
  }

  // โหลดประวัติการลงทะเบียนเดิม เพื่อเอามาเช็กเวลาชนล่วงหน้า
  // โหลดประวัติการลงทะเบียนเดิม (เฉพาะของนิสิตที่ Login อยู่เท่านั้น)
  loadMyRegistrations() {
    this.apiService.getRegistrations().subscribe({
      next: (data: any) => {
        console.log('All registrations from DB:', data);
        this.registeredSections = data
          .map((item: any) => item.section)
          .filter((sec: any) => sec != null);

        console.log('Loaded my actual registered sections:', this.registeredSections);
        this.isLoadingRegistrations = false;
      },
      error: (err: any) => {
        console.error('Failed to load registrations', err);
        this.errorMessage = 'ไม่สามารถโหลดรายการลงทะเบียนของคุณได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoadingRegistrations = false;
      }
    });
  }

  // กรองข้อมูลตามคำค้นหา
  get filteredSections() {
    return this.sections.filter(sec => {
      const code = sec.courseCode?.toLowerCase() || '';
      const name = sec.course?.courseName?.toLowerCase() || '';
      const instructor = sec.instructor?.toLowerCase() || '';
      const search = this.searchText.toLowerCase();

      return code.includes(search) || name.includes(search) || instructor.includes(search);
    });
  }

  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.trim().split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  // ปรับปรุงฟังก์ชัน parseSchedule ให้ฉลาดขึ้น ค้นหาชื่อวันและเวลาแบบยืดหยุ่น
  private parseSchedule(schedule: string) {
    if (!schedule) return null;
    
    const cleaned = schedule.replace(/–/g, '-').replace(/\s+/g, ' ').trim();
    
    // ค้นหาชื่อวันจากข้อความ (รองรับทั้ง "จันทร์", "วันจันทร์", etc.)
    const days = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'];
    let foundDay = '';
    for (const d of days) {
      if (cleaned.includes(d)) {
        foundDay = d;
        break;
      }
    }

    // ใช้ Regular Expression ดึงรูปแบบเวลา เช่น 10:00 - 12:00 หรือ 10.00 - 12.00 ออกมาตรงๆ
    const timeRegex = /(\d{1,2}[:.]\d{2})\s*-\s*(\d{1,2}[:.]\d{2})/;
    const match = cleaned.match(timeRegex);

    if (foundDay && match) {
      const startTimeStr = match[1].replace('.', ':');
      const endTimeStr = match[2].replace('.', ':');

      const start = this.timeToMinutes(startTimeStr);
      const end = this.timeToMinutes(endTimeStr);
      
      return { day: foundDay, start, end };
    }

    console.warn('Failed to parse schedule format securely:', schedule);
    return null;
  }

  // ตรวจสอบเวลาเรียนชนกัน (เช็กทั้งกับวิชาในตะกร้า และวิชาที่เคยลงทะเบียนไปแล้ว)
  checkTimeConflict(newSection: Section): boolean {
    const newSched = this.parseSchedule(newSection.scheduleTime);
    if (!newSched) return false;

    // 1. เช็กกับวิชาที่อยู่ในตะกร้าปัจจุบัน
    const allItemsToCheck = [...this.cart, ...this.registeredSections];

    for (const item of allItemsToCheck) {
      const itemSched = this.parseSchedule(item.scheduleTime);
      if (!itemSched) continue;

      if (newSched.day === itemSched.day) {
        // สูตรเช็ก Overlap: (เริ่มใหม่ < สิ้นสุดเก่า) และ (เริ่มเก่า < สิ้นสุดใหม่)
        const isConflict = (newSched.start < itemSched.end) && (itemSched.start < newSched.end);
        
        if (isConflict) {
          console.log(`Conflict! New (${newSched.start}-${newSched.end}) overlaps with existing (${itemSched.start}-${itemSched.end}) on ${newSched.day}`);
          return true; 
        }
      }
    }
    return false;
  }

  // กดปุ่ม "+ เพิ่ม" เข้าตะกร้า
  addToCart(section: Section) {
    const exists = this.cart.some(item => item.sectionId === section.sectionId);
    if (exists) {
      alert('คุณได้เพิ่มกลุ่มเรียนนี้ไว้ในตะกร้าแล้ว');
      return;
    }

    const sameCourse = this.cart.some(item => item.courseCode === section.courseCode);
    if (sameCourse) {
      alert('คุณได้เลือกรายวิชานี้ไปแล้ว (เลือกได้ 1 กลุ่มเรียนต่อ 1 รายวิชา)');
      return;
    }

    // เช็กเวลาเรียนชนกัน
    if (this.checkTimeConflict(section)) {
      alert(`ไม่สามารถเพิ่มวิชา ${section.courseCode} ได้ เนื่องจากวันและเวลาเรียน (${section.scheduleTime}) ทับซ้อนกับวิชาอื่นในระบบ/ตะกร้าของคุณ`);
      return;
    }

    this.cart.push(section);
  }

  removeFromCart(sectionId: number) {
    this.cart = this.cart.filter(item => item.sectionId !== sectionId);
  }

  get totalCredits(): number {
    return this.cart.reduce((sum, item) => sum + (item.course?.credits || 0), 0);
  }

  confirmRegistration() {
    if (this.cart.length === 0) {
      alert('กรุณาเลือกรายวิชาใส่ตะกร้าอย่างน้อย 1 รายวิชา');
      return;
    }

    if (this.totalCredits > 22) {
      alert('หน่วยกิตรวมเกินลิมิตสูงสุด (22 หน่วยกิต)');
      return;
    }

    let successCount = 0;
    this.cart.forEach(sec => {
      const payload = {
        sectionId: sec.sectionId,
        semester: "1/2569"
      };

      this.apiService.registerCourse(payload).subscribe({
        next: (res) => {
          successCount++;
          if (successCount === this.cart.length) {
            alert('ยืนยันการลงทะเบียนเรียนสำเร็จทั้งหมด!');
            this.cart = []; 
            this.loadMyRegistrations(); // โหลดข้อมูลใหม่หลังลงทะเบียนสำเร็จ
          }
        },
        error: (err: any) => {
          alert(`วิชา ${sec.courseCode}: ${err.error?.message || 'เกิดข้อผิดพลาด'}`);
        }
      });
    });
  }
}
