import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';  // Import HttpClient to make API calls
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule, HighchartsChartModule],
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

      <h2>Top 3 Symptoms:</h2>
      <ul>
        <li *ngFor="let symptom of topSymptoms">{{symptom.SymptomName}}</li>
      </ul>

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

      <h2>Patient Disease Comparison by Gender (Heatmap)</h2>
      <div *ngIf="heatmapData.length > 0">
        <highcharts-chart
          [Highcharts]="Highcharts"
          [options]="chartOptions"
          style="width: 100%; height: 500px; display: block;">
        </highcharts-chart>
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

  topSymptoms: { SymptomName: string }[] = [];  // Array to hold top symptoms

  heatmapData: any[] = [];  // heatmap data for the chart
  chartOptions: any = {};   // Highcharts configuration

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

  ngOnInit(): void {
    this.getTopSymptoms();
    this.getDiseaseByGenderHeatmapData();
    this.checkMedicationConflicts();
  }

  getTopSymptoms() {
    const username = this.data.username; // Assuming data has username
    
    this.http.get(`/api/top-symptoms?username=${username}`).subscribe(
      (response: any) => {
        if (response.top_symptoms) {
          this.topSymptoms = response.top_symptoms;  // Store top symptoms in component state
        }
      },
      (error) => {
        console.error('Error fetching top symptoms:', error);
      }
    );
  }

  getDiseaseByGenderHeatmapData() {
    const username = this.data.username; // Use the username of the patient

    this.http.get(`/api/compare-disease-by-gender?username=${username}`).subscribe(
      (response: any) => {
        this.prepareHeatmapData(response);
      },
      (error) => {
        console.error('Error fetching disease data for heatmap:', error);
      }
    );
  }

  prepareHeatmapData(data: any) {
    const categoriesX = Array.from(new Set(data.map((row: any) => row.DiseaseName)));  // unique array of disease name
    const categoriesY = ['Male', 'Female', 'Non-Binary'];  // gender categories

    // map data into a format Highcharts expects for heatmap visualization
    const heatmapData = data.map(row => [
      categoriesX.indexOf(row.DiseaseName),  // X axis index (disease)
      categoriesY.indexOf(row.Gender),      // Y axis index (gender)
      row.PatientCount                       // Value (number of patients)
    ]);

    this.chartOptions = {
      chart: { type: 'heatmap' },
      title: { text: 'Number of Patients by Disease and Gender' },
      xAxis: { categories: categoriesX },
      yAxis: { categories: categoriesY },
      colorAxis: { min: 0, minColor: '#FFFFFF', maxColor: '#FF0000' },  // Color gradient
      series: [{
        data: heatmapData,
        borderWidth: 1
      }]
    };
    this.heatmapData = heatmapData;
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
