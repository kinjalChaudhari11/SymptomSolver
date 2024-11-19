import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results.component.html',
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
  diagnosis: string[] = [];

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
