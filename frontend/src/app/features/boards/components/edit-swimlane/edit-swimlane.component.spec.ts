import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { EditSwimlaneComponent } from './edit-swimlane.component';

describe('EditSwimlaneComponent', () => {
  let component: EditSwimlaneComponent;
  let fixture: ComponentFixture<EditSwimlaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSwimlaneComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy() } },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { swimlane: { id: 2, name: 'Review' } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSwimlaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
