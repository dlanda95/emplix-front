import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CollaboratorProfile } from '../models/collaborator.model';



// Interface para la solicitud de cambio
export interface ProfileUpdateRequest {
  type: 'PROFILE_UPDATE';
  payload: Partial<CollaboratorProfile>; // Solo los datos que cambiaron o todos
}


@Injectable({
  providedIn: 'root'
})
export class CollaboratorService {
  private http = inject(HttpClient);
  // Asegúrate de que environment.apiUrl sea 'http://localhost:3000/api' o tu URL real
  private apiUrl = environment.apiUrl; 

  getProfile(): Observable<CollaboratorProfile> {
    return this.http.get<CollaboratorProfile>(`${this.apiUrl}/employees/me`);
  }



getPendingProfileUpdate(): Observable<any> {
    // Ajusta esta ruta según tu requests.controller.ts
    // Probablemente sea algo como GET /api/requests?type=PROFILE_UPDATE&status=PENDING
    return this.http.get<any>(`${this.apiUrl}/requests/my-pending-update`); 
  }


  requestProfileUpdate(data: ProfileUpdateRequest): Observable<any> {
    // POST /api/requests
    return this.http.post<any>(`${this.apiUrl}/requests`, data);
  }

}