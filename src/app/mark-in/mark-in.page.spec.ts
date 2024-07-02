import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkInPage } from './mark-in.page';

describe('MarkInPage', () => {
  let component: MarkInPage;
  let fixture: ComponentFixture<MarkInPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkInPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
