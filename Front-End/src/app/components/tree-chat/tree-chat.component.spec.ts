import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeChatComponent } from './tree-chat.component';

describe('TreeChatComponent', () => {
  let component: TreeChatComponent;
  let fixture: ComponentFixture<TreeChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TreeChatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TreeChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
