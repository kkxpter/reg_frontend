export interface StudentProfile {
  studentId: string;
  nationalId: string;
  firstNameTh: string;
  lastNameTh: string;
  universityEmail: string;
  personalEmail: string | null;
  phone: string | null;
  province: string | null;
  faculty: string | null;
  major: string | null;
  advisor: string | null;
  gpax: number;
  totalCredits: number;
  status: string;
}

export type Student = StudentProfile;

export interface LoginResponse {
  message: string;
  accessToken: string;
  student: StudentProfile;
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
  student?: StudentProfile;
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
