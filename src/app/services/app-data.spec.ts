import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface StudentProfile {
  studentId: string;
  fullName: string;
  faculty: string;
  major: string;
  year: number;
  gpax: number;
  totalCredits: number;
}

export interface Course {
  code: string;
  name: string;
  credits: number;
  type: 'Core' | 'Elective' | 'GenEd';
  instructor: string;
  schedule: { day: string; startTime: string; endTime: string; room: string }[];
  capacity: number;
  enrolled: number;
  prerequisite?: string[];
}

@Injectable({ providedIn: 'root' })
export class AppDataService {
  // 1. ข้อมูลนักศึกษา
  private profileSubject = new BehaviorSubject<StudentProfile>({
    studentId: '6601234567',
    fullName: 'ธีรภัทร์ นพรัตน์',
    faculty: 'วิทยาการสารสนเทศ',
    major: 'วิทยาการคอมพิวเตอร์และเทคโนโลยีสารสนเทศ',
    year: 4,
    gpax: 3.75,
    totalCredits: 105
  });
  profile$ = this.profileSubject.asObservable();

  // 2. ฐานข้อมูลวิชาเรียน (สมจริงขึ้น)
  private mockCourses: Course[] = [
    {
      code: 'CS401', name: 'Advanced Web Development', credits: 3, type: 'Core', instructor: 'ดร. สมชาย ใจดี',
      schedule: [{ day: 'Mon', startTime: '09:00', endTime: '12:00', room: 'IT-401' }],
      capacity: 40, enrolled: 38, prerequisite: ['CS101']
    },
    {
      code: 'CS405', name: 'Software Architecture', credits: 3, type: 'Core', instructor: 'ผศ.ดร. มานะ อุตสาหะ',
      schedule: [{ day: 'Tue', startTime: '13:00', endTime: '16:00', room: 'IT-402' }],
      capacity: 35, enrolled: 35, prerequisite: ['CS202']
    },
    {
      code: 'GE104', name: 'Design Thinking', credits: 2, type: 'GenEd', instructor: 'อ. สมศรี รักเรียน',
      schedule: [{ day: 'Wed', startTime: '09:00', endTime: '11:00', room: 'CB-101' }],
      capacity: 100, enrolled: 45
    }
  ];

  // 3. ตะกร้าและวิชาที่ลงทะเบียนแล้ว
  private registeredCoursesSubject = new BehaviorSubject<Course[]>([]);
  registeredCourses$ = this.registeredCoursesSubject.asObservable();

  getAvailableCourses() {
    return this.mockCourses;
  }
}