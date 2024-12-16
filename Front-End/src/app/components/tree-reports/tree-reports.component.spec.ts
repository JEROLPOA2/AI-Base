import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeReportsComponent } from './tree-reports.component';

describe('TreeReportsComponent', () => {
  let component: TreeReportsComponent;
  let fixture: ComponentFixture<TreeReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
