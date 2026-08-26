import { Routes } from '@angular/router';
// หน้าที่ไม่มี Sidebar
import { Login } from './pages/login/login'; 
// Layout หลักที่มี Sidebar
import { Layout } from './layout/layout'; 

// หน้าต่างๆ ที่จะอยู่ข้างใน Layout
import { Dashboard } from './pages/dashboard/dashboard';
import { CourseSearch } from './pages/course-search/course-search';
import { Cart } from './pages/cart/cart';
import { Schedule } from './pages/schedule/schedule';
import { Grades } from './pages/grades/grades';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: Login },
  
  // ส่วนนี้คือการกำหนดให้หน้าต่างๆ ไปอยู่ใน <router-outlet> ของ Layout
  { 
    path: '', 
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'search', component: CourseSearch },
      { path: 'cart', component: Cart },
      { path: 'schedule', component: Schedule },
      { path: 'grades', component: Grades },
      { path: 'profile', component: Profile }
    ]
  }
];
