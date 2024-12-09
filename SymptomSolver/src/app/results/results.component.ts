// results.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>Results</h1>
     
      <p><strong>First Name:</strong> {{data.firstName}}</p>
      <p><strong>Last Name:</strong> {{data.lastName}}</p>
      <p><strong>Username:</strong> {{data.username}}</p>
      <p><strong>Age:</strong> {{data.age}}</p>
      <p><strong>Gender:</strong> {{data.gender}}</p>
      <p><strong>Described Symptoms:</strong> {{data.symptoms.join(', ')}}</p>
     
      <div *ngIf="conflictMessage" [class]="conflictMessage.includes('Warning') ? 'warning' : 'success'">
        {{ conflictMessage }}
      </div>


      <h2>Diagnosis:</h2>
      <div *ngFor="let item of diagnosis">
        <h3>{{item.disease}}</h3>
        <div *ngIf="item.medications && item.medications.length > 0">
          <h4>Recommended Medications:</h4>
          <ul>
            <li *ngFor="let med of item.medications">
              {{med.name}} - {{med.prescription}}
            </li>
          </ul>
        </div>
        <div *ngIf="!item.medications || item.medications.length === 0">
          <p>No medications listed for this condition.</p>
        </div>
      </div>


      <button (click)="goBack()">Go Back</button>
    </div>
  `,
  styles: [`
    .warning {
      background-color: #fff3cd;
      color: #856404;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }
    .success {
      background-color: #d4edda;
      color: #155724;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }
  `]
})
export class ResultsComponent implements OnInit {
  data = {
    firstName: '',
    lastName: '',
    username: '',
    age: 0,
    gender: '',
    symptoms: [] as string[],
  };


  diagnosis: {
    disease: string;
    medications: {
      name: string;
      prescription: string;
    }[];
  }[] = [];


  conflictMessage: string = '';


  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    const navigation = this.router.getCurrentNavigation();
    const stateData = navigation?.extras?.state || {};
    this.data = stateData['data'] || this.data;
    this.diagnosis = stateData['diagnosis'] || [];
  }


  ngOnInit() {
    this.checkMedicationConflicts();
  }


  checkMedicationConflicts() {
    this.http.post('http://localhost:5000/api/check-conflicts', {
      username: this.data.username,
      symptoms: this.data.symptoms
    }).subscribe({
      next: (response: any) => {
        this.conflictMessage = response.message;
      },
      error: (error) => {
        console.error('Error checking conflicts:', error);
      }
    });
  }


  goBack() {
    this.router.navigate(['/']);
  }
}
