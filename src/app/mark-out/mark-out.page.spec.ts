import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkOutPage } from './mark-out.page';

describe('MarkOutPage', () => {
  let component: MarkOutPage;
  let fixture: ComponentFixture<MarkOutPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkOutPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
