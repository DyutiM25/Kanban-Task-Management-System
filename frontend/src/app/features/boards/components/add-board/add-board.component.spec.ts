import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { AddBoardComponent } from './add-board.component';

describe('AddBoardComponent', () => {
  let component: AddBoardComponent;
  let fixture: ComponentFixture<AddBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddBoardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy() } },
        { provide: MAT_DIALOG_DATA, useValue: { board: null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
