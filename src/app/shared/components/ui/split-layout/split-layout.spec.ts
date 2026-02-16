import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitLayout } from './split-layout';

describe('SplitLayout', () => {
  let component: SplitLayout;
  let fixture: ComponentFixture<SplitLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SplitLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SplitLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
