import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeActionSheetComponent } from './theme-action-sheet.component';

describe('ThemeActionSheetComponent', () => {
  let component: ThemeActionSheetComponent;
  let fixture: ComponentFixture<ThemeActionSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThemeActionSheetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThemeActionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
