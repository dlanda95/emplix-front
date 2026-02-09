import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private snackBar = inject(MatSnackBar);

  private defaultConfig: MatSnackBarConfig = {
    duration: 3000,
    horizontalPosition: 'right',
    verticalPosition: 'top',
  };

  success(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      panelClass: ['toast-success'] // Necesitarás estilos globales para esto
    });
  }

  error(message: string) {
    this.snackBar.open(message, 'Cerrar', {
      ...this.defaultConfig,
      panelClass: ['toast-error'],
      duration: 5000
    });
  }

  info(message: string) {
    this.snackBar.open(message, 'Ok', {
      ...this.defaultConfig,
      panelClass: ['toast-info']
    });
  }
}