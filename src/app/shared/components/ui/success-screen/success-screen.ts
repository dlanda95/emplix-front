import { Component, input } from '@angular/core';

@Component({
  selector: 'app-success-screen',
  template: `
    <div class="ss">
      <div class="ss__icon">
        <span class="material-icons-round">{{ icon() }}</span>
      </div>
      <h3 class="ss__title">{{ title() }}</h3>
      @if (description()) {
        <p class="ss__desc">{{ description() }}</p>
      }
      @if (email() || tempPassword()) {
        <div class="ss__creds">
          @if (email()) {
            <div class="ss__creds-row">
              <span class="ss__creds-label">Correo</span>
              <span class="ss__creds-value">{{ email() }}</span>
            </div>
          }
          @if (tempPassword()) {
            <div class="ss__creds-row">
              <span class="ss__creds-label">Contraseña temporal</span>
              <code class="ss__creds-code">{{ tempPassword() }}</code>
            </div>
          }
        </div>
      }
      <ng-content></ng-content>
      @if (note()) {
        <p class="ss__note">
          <span class="material-icons-round">info</span>
          {{ note() }}
        </p>
      }
    </div>
  `,
  styleUrl: './success-screen.scss',
})
export class SuccessScreen {
  readonly icon         = input<string>('check_circle');
  readonly title        = input.required<string>();
  readonly description  = input<string>('');
  readonly email        = input<string>('');
  readonly tempPassword = input<string>('');
  readonly note         = input<string>('');
}
