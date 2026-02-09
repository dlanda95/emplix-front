
import { RouterOutlet } from '@angular/router';

import { Component, OnInit, inject,signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MsalService } from '@azure/msal-angular'; // Importar MSAL

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
protected readonly title = signal('emplix');

}