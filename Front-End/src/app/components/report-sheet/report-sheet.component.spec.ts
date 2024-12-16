import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportSheetComponent } from './report-sheet.component';

describe('ReportSheetComponent', () => {
  let component: ReportSheetComponent;
  let fixture: ComponentFixture<ReportSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReportSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
