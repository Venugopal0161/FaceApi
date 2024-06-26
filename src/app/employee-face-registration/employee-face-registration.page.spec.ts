import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeFaceRegistrationPage } from './employee-face-registration.page';

describe('EmployeeFaceRegistrationPage', () => {
  let component: EmployeeFaceRegistrationPage;
  let fixture: ComponentFixture<EmployeeFaceRegistrationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeFaceRegistrationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
