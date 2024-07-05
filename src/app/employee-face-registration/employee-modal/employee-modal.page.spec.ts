import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeModalPage } from './employee-modal.page';

describe('EmployeeModalPage', () => {
  let component: EmployeeModalPage;
  let fixture: ComponentFixture<EmployeeModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
