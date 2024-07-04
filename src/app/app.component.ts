import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  hasAdminLogin = false;
  public appPages = [
    // { title: 'Face Registration', url: '/registeremp', icon: 'person-add' },
    // { title: 'Mark Attendance', url: '/recognition', icon: 'person' },
    // { title: 'All Employees', url: '/home', icon: 'people' },
    { title: 'Manual Attendance', url: '/recognition', icon: 'id-card' },
    { title: 'Mark In', url: '/mark-in', icon: 'man' },
    { title: 'Mark Out', url: '/mark-out', icon: 'walk' },
    // { title: 'Attendance Logs', url: '/attendance-logs', icon: 'folder' },
    
    // { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    // { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    // { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  public labels = [
    { title: 'All Employees', url: '/home', icon: 'people' },
    { title: 'Face Registration', url: '/registeremp', icon: 'person-add' },
    // { title: 'Mark Attendance', url: '/recognition', icon: 'person' },
    // { title: 'Mark In', url: '/mark-in', icon: 'people' },
    // { title: 'Mark Out', url: '/mark-out', icon: 'people' },
    // { title: 'Attendance Logs', url: '/attendance-logs', icon: 'folder', show: localStorage.getItem('admin-data') },
  ]

  constructor(
    private router: Router
  ) {
    this.verifyAdminAlredyLoginOrNot();
  }
  verifyAdminAlredyLoginOrNot() {
    this.hasAdminLogin = localStorage.getItem('admin-data') ? true : false;
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user-data');
    this.router.navigateByUrl('/login')
  }
  logoutAsAdmin() {
    localStorage.removeItem('admintoken');
    localStorage.removeItem('admin-data');
    this.verifyAdminAlredyLoginOrNot();
    this.router.navigateByUrl('/recognition');
  }
  logInAsAdmin() {
    this.router.navigateByUrl('/adminlogin');
  }

}
