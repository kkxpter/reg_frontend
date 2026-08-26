import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-course-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './course-search.html',
  styleUrl: './course-search.scss',
})
export class CourseSearch implements OnInit {
  sections: any[] = []; 
  searchText: string = '';  
  
  // ตัวแปรสำหรับระบบ Pagination
  currentPage: number = 1;
  pageSize: number = 10; // แสดงหน้าละ 10 รายการ
  isShowingAll: boolean = false; // สถานะปุ่มแสดงทั้งหมด

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections() {
    this.apiService.getRegistrations().subscribe({
      next: (data: any) => {
        this.sections = data;
        console.log('Loaded sections:', data);
      },
      error: (err: any) => {
        console.error('Failed to load sections', err);
      }
    });
  }

  // กรองข้อมูลตามคำค้นหา
  get filteredSections() {
    return this.sections.filter(item => {
      const code = item.section?.courseCode?.toLowerCase() || '';
      const name = item.section?.course?.courseName?.toLowerCase() || '';
      const search = this.searchText.toLowerCase();
      return code.includes(search) || name.includes(search);
    });
  }

  // ตัดแบ่งข้อมูลตามหน้า (Pagination) หรือแสดงทั้งหมด
  get paginatedSections() {
    if (this.isShowingAll) {
      return this.filteredSections;
    }
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredSections.slice(start, start + this.pageSize);
  }

  // คำนวณจำนวนหน้าทั้งหมด
  get totalPages(): number {
    return Math.ceil(this.filteredSections.length / this.pageSize) || 1;
  }

  // สร้าง Array ของเลขหน้าเพื่อเอาไปวนลูปปุ่ม เช่น [1, 2, 3]
  get pagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // เปลี่ยนหน้า
  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ปุ่มสลับ "แสดงทั้งหมด / แบ่งหน้า"
  toggleShowAll() {
    this.isShowingAll = !this.isShowingAll;
    this.currentPage = 1; // รีเซ็ตกลับมาหน้า 1
  }

  // ข้อมูลแสดงสถานะ "แสดง X ถึง Y จาก Z"
  get startIndex(): number {
    if (this.filteredSections.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    if (this.isShowingAll) return this.filteredSections.length;
    return Math.min(this.currentPage * this.pageSize, this.filteredSections.length);
  }
}