import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SymptomInputComponent } from './symptom-input.component';

describe('SymptomInputComponent', () => {
  let component: SymptomInputComponent;
  let fixture: ComponentFixture<SymptomInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SymptomInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SymptomInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
