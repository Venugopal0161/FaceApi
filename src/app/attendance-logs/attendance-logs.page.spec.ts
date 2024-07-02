import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceLogsPage } from './attendance-logs.page';

describe('AttendanceLogsPage', () => {
  let component: AttendanceLogsPage;
  let fixture: ComponentFixture<AttendanceLogsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceLogsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
