import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpModalPage } from './emp-modal.page';

describe('EmpModalPage', () => {
  let component: EmpModalPage;
  let fixture: ComponentFixture<EmpModalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
