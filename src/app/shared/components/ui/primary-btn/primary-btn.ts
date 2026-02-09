import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-primary-btn',
  imports: [CommonModule],
  templateUrl: './primary-btn.html',
  styleUrl: './primary-btn.scss',
})
export class PrimaryBtn {

@Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Output() onClick = new EventEmitter<Event>();

}
