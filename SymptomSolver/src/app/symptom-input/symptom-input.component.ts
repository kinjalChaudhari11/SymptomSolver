import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosisService } from '../services/diagnosis.services';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-symptom-input',
  standalone: true,
  imports: [
    FormsModule, 
    CommonModule,
    HttpClientModule  // Add this import
  ],
  templateUrl: './symptom-input.component.html',
  styleUrls: ['./symptom-input.component.css'],
})
export class SymptomInputComponent {
  username = '';
  firstName = '';
  lastName = '';
  gender = '';
  age: number | null = null;
  symptoms: string[] = [];
  allSymptoms = ['acidity', 'phlegm', 'headache', 'nausea'];
  error: string | null = null;
  isLoading = false;

  constructor(
    private router: Router,
    private diagnosisService: DiagnosisService,
    private http: HttpClient  // Add this
  ) {}

  onSymptomChange(symptom: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.symptoms.push(symptom);
    } else {
      const index = this.symptoms.indexOf(symptom);
      if (index > -1) {
        this.symptoms.splice(index, 1);
      }
    }
  }

  async submitData() {
    if (!this.username || !this.firstName || !this.lastName || !this.gender || !this.age) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const payload = {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      age: this.age,
      symptoms: this.symptoms,
    };

    console.log('Submitting payload:', payload);
    this.isLoading = true;
    this.error = null;

    try {
      this.diagnosisService.getDiagnosis(payload).subscribe({
        next: (response) => {
          console.log('Received diagnosis:', response);
          this.isLoading = false;
          this.router.navigate(['/results'], {
            state: { data: response.data, diagnosis: response.diagnosis }
          });
        },
        error: (error) => {
          console.error('Error getting diagnosis:', error);
          this.isLoading = false;
          this.error = 'Failed to get diagnosis. Please try again.';
        }
      });
    } catch (error) {
      console.error('Error:', error);
      this.isLoading = false;
      this.error = 'An unexpected error occurred';
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
