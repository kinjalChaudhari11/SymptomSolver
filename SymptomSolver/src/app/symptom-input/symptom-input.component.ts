import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DiagnosisService } from '../services/diagnosis.services';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';  // Add HttpHeaders here




@Component({
  selector: 'app-symptom-input',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule
  ],
  templateUrl: './symptom-input.component.html',
  styleUrls: ['./symptom-input.component.css']
})
export class SymptomInputComponent {
  username = '';
  firstName = '';
  lastName = '';
  gender = '';
  age: number | null = null;
  symptomDescription = '';
  isLoading = false;
  error: string | null = null;


  // List of all symptoms (we'll keep this for reference but won't display checkboxes)
  allSymptoms = [
    'fluid overload', 'redness of eyes', 'dark urine', 'irritability',
    'continuous sneezing', 'history of alcohol consumption', 'dizziness',
    'lethargy', 'foul smell of urine', 'phlegm', 'mood swings', 'acidity',
    'dehydration', 'prominent veins on calf', 'dischromic patches',
    'small dents in nails', 'unsteadiness', 'swollen blood vessels',
    'runny nose', 'red sore around nose', 'throat irritation',
    'internal itching', 'obesity', 'swollen extremeties', 'stomach pain',
    'breathlessness', 'joint pain', 'weight loss', 'red spots over body',
    'mucoid sputum', 'extra marital contacts', 'continuous feel of urine',
    'anxiety', 'malaise', 'back pain', 'stomach bleeding', 'vomiting',
    'blackheads', 'polyuria', 'pus filled pimples', 'weakness of one body side',
    'skin peeling', 'sweating', 'knee pain', 'distention of abdomen',
    'burning micturition', 'mild fever', 'fast heart rate', 'painful walking',
    'belly pain', 'cramps', 'abnormal menstruation', 'patches in throat',
    'slurred speech', 'palpitations', 'loss of appetite', 'bladder discomfort',
    'spinning movements', 'enlarged thyroid', 'neck pain', 'swelling joints',
    'skin rash', 'toxic look (typhos)', 'pain in anal region',
    'spotting urination', 'yellowish skin', 'blurred and distorted vision',
    'yellow crust ooze', 'scurring', 'receiving unsterile injections',
    'coma', 'brittle nails', 'depression', 'receiving blood transfusion',
    'hip joint pain', 'blood in sputum', 'shivering', 'yellow urine',
    'passage of gases', 'diarrhoea', 'fatigue', 'rusty sputum',
    'silver like dusting', 'headache', 'blister', 'sunken eyes',
    'abdominal pain', 'irregular sugar level', 'chills', 'muscle wasting',
    'lack of concentration', 'constipation', 'acute liver failure',
    'congestion', 'bloody stool', 'swelling of stomach', 'irritation in anus',
    'weakness in limbs', 'visual disturbances', 'excessive hunger',
    'swollen legs', 'nodal skin eruptions', 'itching', 'yellowing of eyes',
    'swelled lymph nodes', 'muscle pain', 'muscle weakness',
    'drying and tingling lips', 'restlessness', 'weight gain',
    'ulcers on tongue', 'high fever', 'cold hands and feets', 'indigestion',
    'cough', 'family history', 'nausea', 'loss of balance',
    'watering from eyes', 'loss of smell', 'puffy face and eyes',
    'sinus pressure', 'increased appetite', 'pain during bowel movements',
    'movement stiffness', 'pain behind the eyes', 'chest pain',
    'inflammatory nails', 'altered sensorium', 'stiff neck', 'bruising'
  ];


  constructor(
    private router: Router,
    private diagnosisService: DiagnosisService,
    private http: HttpClient
  ) {}


  submitData() {
    console.log("Submit button clicked");
    if (!this.username || !this.firstName || !this.lastName || !this.gender || !this.age) {
      this.error = 'Please fill in all required fields';
      return;
    }
 
    this.isLoading = true;
    this.error = null;
    console.log("Starting symptom processing");
 
    this.http.post<{matched_symptoms: string[]}>(
      'http://127.0.0.1:5000/api/process-description',
      { description: this.symptomDescription }
    ).subscribe({
      next: (response) => {
        console.log("Got matched symptoms:", response.matched_symptoms);
       
        // Create diagnosis payload
        const diagnosisPayload = {
          username: this.username,
          firstName: this.firstName,
          lastName: this.lastName,
          gender: this.gender,
          age: this.age,
          symptoms: response.matched_symptoms
        };
       
        console.log("Sending diagnosis request with payload:", diagnosisPayload);
 
        // Make the diagnosis request
        this.http.post('http://127.0.0.1:5000/api/diagnosis', diagnosisPayload).subscribe({
          next: (diagnosisResponse: any) => {
            console.log("Got diagnosis response:", diagnosisResponse);
            this.isLoading = false;
            this.router.navigate(['/results'], {
              state: diagnosisResponse
            });
          },
          error: (error) => {
            console.error('Diagnosis error:', error);
            this.isLoading = false;
            this.error = 'Error getting diagnosis';
          }
        });
      },
      error: (error) => {
        console.error('Symptom processing error:', error);
        this.isLoading = false;
        this.error = 'Error processing symptoms';
      }
    });
  }


  goBack() {
    this.router.navigate(['/']);
  }
}
