import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-symptom-input',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule],
  template: `
    <div>
      <h2>Symptom Input</h2>
      <form>
        <!-- Existing fields -->
        <div class="description-section">
          <label for="description">Describe your symptoms:</label>
          <textarea
            id="description"
            [(ngModel)]="symptomDescription"
            name="description"
            rows="4"
            placeholder="List your symptoms separated by commas, e.g., fever, cough, headache"
          ></textarea>
        </div>

        <label for="username">Username:</label>
        <input type="text" id="username" [(ngModel)]="username" required name="username" />

        <label for="firstName">First Name:</label>
        <input type="text" id="firstName" [(ngModel)]="firstName" required name="firstName" />

        <label for="lastName">Last Name:</label>
        <input type="text" id="lastName" [(ngModel)]="lastName" required name="lastName" />

        <label for="gender">Gender:</label>
        <input type="text" id="gender" [(ngModel)]="gender" required name="gender" />

        <label for="age">Age:</label>
        <input type="number" id="age" [(ngModel)]="age" required name="age" />

        <!-- New Transaction Fields -->
        <div class="transaction-section">
          <h3>Payment Information</h3>
          
          <label for="cardNumber">Card Number:</label>
          <input type="text" id="cardNumber" [(ngModel)]="cardNumber" required name="cardNumber" 
                 placeholder="1234 5678 9012 3456" />

          <label for="expiryDate">Expiry Date:</label>
          <input type="text" id="expiryDate" [(ngModel)]="expiryDate" required name="expiryDate" 
                 placeholder="MM/YY" />

          <label for="cvv">CVV:</label>
          <input type="password" id="cvv" [(ngModel)]="cvv" required name="cvv" 
                 maxlength="4" placeholder="123" />

          <label for="amount">Consultation Fee:</label>
          <input type="number" id="amount" [(ngModel)]="amount" required name="amount" 
                 placeholder="0.00" step="0.01" />
        </div>

        <button type="button" (click)="submitData()">Submit</button>
        <button type="button" (click)="goBack()">Go Back</button>

        <div *ngIf="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div *ngIf="error" class="error-message">
          {{ error }}
        </div>

        <div class="delete-section">
          <button type="button" class="delete-button" (click)="deleteAccount()">
            Delete Account
          </button>
        </div>
      </form>

      <div *ngIf="isLoading" class="loading-spinner">
        Loading...
      </div>
    </div>
  `,
  styles: [`
    /* Existing styles */
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 500px;
      margin: 0 auto;
    }

    label {
      font-weight: bold;
    }

    input, textarea {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      padding: 0.5rem 1rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:hover {
      background-color: #0056b3;
    }

    /* New transaction styles */
    .transaction-section {
      margin-top: 2rem;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #f8f9fa;
    }

    .transaction-section h3 {
      margin-bottom: 1rem;
      color: #333;
    }

    /* Existing styles continued */
    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }

    .success-message {
      background-color: #d4edda;
      color: #155724;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
    }

    .loading-spinner {
      text-align: center;
      margin: 1rem 0;
    }

    .delete-button {
      background-color: #dc3545;
      color: white;
      margin-top: 1rem;
    }

    .delete-button:hover {
      background-color: #c82333;
    }

    .delete-section {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;
    }
  `]
})
export class SymptomInputComponent {
  // Existing properties
  username = '';
  firstName = '';
  lastName = '';
  gender = '';
  age: number | null = null;
  symptomDescription = '';
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // New transaction properties
  cardNumber = '';
  expiryDate = '';
  cvv = '';
  amount: number | null = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  async submitData() {
    if (!this.validateInputs()) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      // Process symptoms
      const symptomsResponse: any = await this.http.post('http://127.0.0.1:5000/api/process-description', {
        description: this.symptomDescription
      }).toPromise();

      if (!symptomsResponse?.matched_symptoms?.length) {
        throw new Error('No symptoms matched');
      }

      // Process payment
      const paymentResponse: any = await this.http.post('http://127.0.0.1:5000/api/process-payment', {
        cardNumber: this.cardNumber,
        expiryDate: this.expiryDate,
        cvv: this.cvv,
        amount: this.amount
      }).toPromise();

      if (!paymentResponse?.success) {
        throw new Error('Payment failed');
      }

      // Get diagnosis
      const diagnosisResponse: any = await this.http.post('http://127.0.0.1:5000/api/diagnosis', {
        username: this.username,
        firstName: this.firstName,
        lastName: this.lastName,
        gender: this.gender,
        age: this.age,
        symptoms: symptomsResponse.matched_symptoms
      }).toPromise();

      this.router.navigate(['/results'], { state: diagnosisResponse });

    } catch (error: any) {
      this.isLoading = false;
      this.error = error.error?.message || 'An error occurred while processing your request';
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private validateInputs(): boolean {
    if (!this.username || !this.firstName || !this.lastName || !this.gender || !this.age || 
        !this.cardNumber || !this.expiryDate || !this.cvv || !this.amount) {
      this.error = 'Please fill in all required fields';
      return false;
    }
    return true;
  }

  async deleteAccount() {
    if (!this.username || !confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return;
    }

    try {
      const response: any = await this.http.post('http://127.0.0.1:5000/api/delete-account', {
        username: this.username
      }).toPromise();
     
      this.successMessage = 'Account deleted successfully';
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 2000);
     
    } catch (error: any) {
      this.error = 'Failed to delete account. Please try again.';
      console.error(error);
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }
}