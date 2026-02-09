import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutBtn } from './logout-btn';

describe('LogoutBtn', () => {
  let component: LogoutBtn;
  let fixture: ComponentFixture<LogoutBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutBtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutBtn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
