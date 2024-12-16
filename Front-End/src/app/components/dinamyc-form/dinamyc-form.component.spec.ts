import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamycFormComponent } from './dinamyc-form.component';

describe('DinamycFormComponent', () => {
  let component: DinamycFormComponent;
  let fixture: ComponentFixture<DinamycFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DinamycFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DinamycFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
