import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap } from 'rxjs';

export interface DiagnosisPayload {
  username: string;
  firstName: string;
  lastName: string;
  gender: string;
  age: number | null;
  symptoms: string[];
}

export interface DiagnosisResponse {
  diagnosis: string[];
  data: DiagnosisPayload;
}

@Injectable({
  providedIn: 'root'
})
export class DiagnosisService {
  private apiUrl = 'http://127.0.0.1:5000/api/diagnosis';

  constructor(private http: HttpClient) {
    console.log('DiagnosisService initialized with URL:', this.apiUrl);
  }

  getDiagnosis(payload: DiagnosisPayload): Observable<DiagnosisResponse> {
    console.log('Making POST request to:', this.apiUrl);
    console.log('With payload:', payload);

    return this.http.post<DiagnosisResponse>(this.apiUrl, payload)
      .pipe(
        tap({
          next: (response) => console.log('Received successful response:', response),
          error: (error: HttpErrorResponse) => {
            console.error('Request failed:', error);
            console.error('Status:', error.status);
            console.error('Status text:', error.statusText);
            console.error('Full error:', error.error);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          throw `HTTP Error: ${error.status} ${error.statusText}. Details: ${JSON.stringify(error.error)}`;
        })
      );
  }
}