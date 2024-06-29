import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Face Registration', url: '/registeremp', icon: 'person-add' },
    { title: 'Mark Attendance', url: '/recognition', icon: 'person' },
    { title: 'sample', url: '/sample', icon: 'heart' },
    // { title: 'Archived', url: '/folder/archived', icon: 'archive' },
    // { title: 'Trash', url: '/folder/trash', icon: 'trash' },
    // { title: 'Spam', url: '/folder/spam', icon: 'warning' },
  ];
  // public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(
    private router: Router
  ) { }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user-data');
    this.router.navigateByUrl('/login')
  }
}
