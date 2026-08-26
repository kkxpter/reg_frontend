import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { Registration } from '../../models/student.model';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grades.html',
  styleUrl: './grades.scss',
})
export class Grades implements OnInit {
  selectedSemester: string = 'current';
  currentStudentId: string = '65011212013';

  // ค่าภาพรวมที่จะคำนวณจาก Database จริง
  gpax: string = '0.00';
  totalCredits: number = 0;
  academicStatus: string = 'ปกติ (Normal)';

  // โครงสร้างเทอมทั้งหมด (จะถูกเติมข้อมูลและคำนวณ GPA ประจำภาคให้อัตโนมัติ)
  semestersData = [
    {
      key: 'current',
      badge: 'เทอมปัจจุบัน',
      badgeClass: 'bg-blue-100 text-blue-700',
      title: 'ภาคการศึกษาที่ 1/2569',
      gpa: 'รอผลการศึกษา',
      gpax: '-',
      borderClass: 'border-slate-100',
      headerBg: 'bg-slate-50/50',
      items: [] as any[]
    },
    {
      key: 'summer_68',
      badge: 'ภาคฤดูร้อน (Summer)',
      badgeClass: 'bg-purple-100 text-purple-700',
      title: 'ภาคการศึกษาที่ 3/2568',
      gpa: '-',
      gpax: '-',
      borderClass: 'border-purple-100',
      headerBg: 'bg-purple-50/30',
      items: [] as any[]
    },
    {
      key: 'term2_68',
      badge: 'ผ่านมาแล้ว',
      badgeClass: 'bg-slate-200 text-slate-700',
      title: 'ภาคการศึกษาที่ 2/2568',
      gpa: '-',
      gpax: '-',
      borderClass: 'border-slate-100',
      headerBg: 'bg-slate-50/50',
      items: [] as any[]
    },
    {
      key: 'term1_68',
      badge: 'ผ่านมาแล้ว',
      badgeClass: 'bg-slate-200 text-slate-700',
      title: 'ภาคการศึกษาที่ 1/2568',
      gpa: '-',
      gpax: '-',
      borderClass: 'border-slate-100',
      headerBg: 'bg-slate-50/50',
      items: [] as any[]
    }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedStudent = localStorage.getItem('student');
      if (savedStudent) {
        const studentObj = JSON.parse(savedStudent);
        this.currentStudentId = studentObj.studentId;
      }
    }

    this.loadAllGradesFromDatabase();
  }

  loadAllGradesFromDatabase() {
    this.apiService.getRegistrations().subscribe({
      next: (data: Registration[]) => {
        const myData = data.filter(r => r.studentId === this.currentStudentId);

        let sumCredits = 0;
        let sumGradePoints = 0; // สำหรับคำนวณเกรดเฉลี่ย (เกรด * หน่วยกิต)
        let gradedCredits = 0;   // หน่วยกิตที่ได้เกรดแล้ว (ไม่นับกำลังศึกษาหรือ W)

        // เคลียร์ข้อมูลเก่าใน items ก่อนโหลดใหม่
        this.semestersData.forEach(sem => sem.items = []);

        myData.forEach(reg => {
          const semesterText = reg.semester || '1/2569';
          const credits = reg.section?.course?.credits || 3;
          const status = reg.regStatus || 'REGISTERED';

          // กำหนดเกรดและการแสดงผลตามสถานะ
          let gradeStr = 'กำลังศึกษา';
          let gradeClass = 'bg-slate-100 text-slate-500 font-medium text-xs';
          let gradePoint = 0;
          let isCompleted = false;

          if (status === 'WITHDRAW' || status === 'W') {
            gradeStr = 'W';
            gradeClass = 'bg-rose-100 text-rose-700 font-bold text-xs';
          } else if (status !== 'REGISTERED' && status !== 'PENDING') {
            // สมมติถ้าใน DB มีเกรดเก็บไว้ เช่น A, B+, C ฯลฯ
            gradeStr = status; 
            gradeClass = 'bg-emerald-100 text-emerald-700 font-bold';
            isCompleted = true;
            
            // แปลงเกรดเป็นตัวเลขเพื่อคำนวณ GPA (A=4, B+=3.5, B=3, C+=2.5, C=2, D+=1.5, D=1, F=0)
            gradePoint = this.convertGradeToPoint(gradeStr);
            sumGradePoints += gradePoint * credits;
            gradedCredits += credits;
          }

          // สะสมหน่วยกิตรวมทั้งหมดที่ลงทะเบียน (ที่ไม่ใช่ W)
          if (gradeStr !== 'W') {
            sumCredits += credits;
          }

          const gradeItem = {
            courseCode: reg.section?.courseCode || '-',
            courseName: reg.section?.course?.courseName || '-',
            instructor: reg.section?.instructor || '-',
            secNo: reg.section?.secNo || '01',
            credits: credits,
            grade: gradeStr,
            gradeClass: gradeClass
          };

          // แยกตามเทอม
          let targetKey = 'current';
          if (semesterText.includes('3/2568') || semesterText.includes('summer')) targetKey = 'summer_68';
          else if (semesterText.includes('2/2568')) targetKey = 'term2_68';
          else if (semesterText.includes('1/2568')) targetKey = 'term1_68';
          else if (semesterText.includes('1/2569')) targetKey = 'current';

          const semObj = this.semestersData.find(s => s.key === targetKey);
          if (semObj) {
            semObj.items.push(gradeItem);
          }
        });

        // อัปเดตหน่วยกิตรวม
        this.totalCredits = sumCredits;

        // คำนวณ GPAX (เกรดเฉลี่ยสะสมรวม) ถ้ามีวิชาที่ได้เกรดแล้ว
        if (gradedCredits > 0) {
          this.gpax = (sumGradePoints / gradedCredits).toFixed(2);
        } else {
          this.gpax = '0.00'; // ถ้ายังไม่มีเทอมไหนตัดเกรดเลย จะแสดง 0.00 (หรือ 'รอผล')
        }

        // คำนวณ GPA ประจำภาคให้แต่ละเทอมด้วย
        this.semestersData.forEach(sem => {
          if (sem.items.length > 0) {
            let semPoints = 0;
            let semCredits = 0;
            let hasGrade = false;

            sem.items.forEach(item => {
              if (item.grade !== 'กำลังศึกษา' && item.grade !== 'W') {
                hasGrade = true;
                semPoints += this.convertGradeToPoint(item.grade) * item.credits;
                semCredits += item.credits;
              }
            });

            if (hasGrade && semCredits > 0) {
              sem.gpa = (semPoints / semCredits).toFixed(2);
            } else {
              sem.gpa = 'รอผลการศึกษา';
            }
          } else {
            sem.gpa = '-';
          }
        });

      },
      error: (err) => {
        console.error('Failed to load grades', err);
      }
    });
  }

  // ฟังก์ชันแปลงเกรดตัวอักษรเป็นคะแนนสะสม (GPA)
  convertGradeToPoint(grade: string): number {
    switch (grade.toUpperCase()) {
      case 'A': return 4.0;
      case 'B+': return 3.5;
      case 'B': return 3.0;
      case 'C+': return 2.5;
      case 'C': return 2.0;
      case 'D+': return 1.5;
      case 'D': return 1.0;
      default: return 0.0;
    }
  }

  selectSemester(semester: string) {
    this.selectedSemester = semester;
  }
}