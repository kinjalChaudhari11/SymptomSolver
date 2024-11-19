import { Routes } from '@angular/router';
import { SymptomInputComponent } from './symptom-input/symptom-input.component';
import { ResultsComponent } from './results/results.component';

export const routes: Routes = [
  { path: '', component: SymptomInputComponent },
  { path: 'results', component: ResultsComponent },
];
