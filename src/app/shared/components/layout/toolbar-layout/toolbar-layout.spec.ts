import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarLayout } from './toolbar-layout';

describe('ToolbarLayout', () => {
  let component: ToolbarLayout;
  let fixture: ComponentFixture<ToolbarLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolbarLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
