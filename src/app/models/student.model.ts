export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  universityEmail: string;
  gpax: number;
  totalCredits: number;
  status: string;
}

export interface Course {
  courseCode: string;
  courseName: string;
  credits: number;
  category: string;
  prerequisiteCode?: string;
}
export interface Section {
  sectionId: number;
  courseCode: string;
  secNo: string;
  scheduleTime: string;
  instructor: string;
  capacity: number;
  enrolled: number;
  course?: Course;
}

export interface Registration {
  regId?: number;
  studentId: string;
  sectionId: number;
  semester: string;
  regStatus?: string;
  registeredAt?: string;
  student?: Student;
  section?: Section;
}

export interface GradeItem {
  courseCode: string;
  courseName: string;
  instructor: string;
  secNo: string;
  credits: number;
  grade: string; // เช่น 'A', 'B+', 'กำลังศึกษา'
}

export interface SemesterRecord {
  semesterKey: string; // เช่น 'current', 'term1_68', 'term2_68', 'summer_68'
  semesterName: string; // เช่น 'ภาคการศึกษาที่ 1/2569'
  statusType: 'current' | 'passed' | 'summer';
  gpa: string | number; // GPA ประจำภาค
  gpax: string | number; // GPA สะสม
  items: GradeItem[];
}