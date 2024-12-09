import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


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
  `
})
export class ResultsComponent {
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


  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    const stateData = navigation?.extras?.state || {};
    this.data = stateData['data'] || this.data;
    this.diagnosis = stateData['diagnosis'] || [];
  }


  goBack() {
    this.router.navigate(['/']);
  }
}
