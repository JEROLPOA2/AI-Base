import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeDatamodelComponent } from './tree-datamodel.component';

describe('TreeDatamodelComponent', () => {
  let component: TreeDatamodelComponent;
  let fixture: ComponentFixture<TreeDatamodelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeDatamodelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeDatamodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
