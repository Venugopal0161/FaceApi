import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeFaceRecognitionPage } from './employee-face-recognition.page';

describe('EmployeeFaceRecognitionPage', () => {
  let component: EmployeeFaceRecognitionPage;
  let fixture: ComponentFixture<EmployeeFaceRecognitionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFaceRecognitionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
