import { Component, DestroyRef, OnInit, inject, input, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged } from 'rxjs';
import { AppSelect } from '../app-select/app-select';
import {
  getCountries, getDepartamentos, getAllDistritos, findProvincia,
} from '@shared/data/location-data';
import type { SelectOption } from '../app-select/app-select';

@Component({
  selector: 'app-location-cascade',
  imports: [ReactiveFormsModule, AppSelect],
  templateUrl: './location-cascade.html',
  styleUrl: './location-cascade.scss',
  host: { '[style.grid-column]': '"1 / -1"' },
})
export class LocationCascade implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // External controls (parent form) — AbstractControl covers both FormControl and typed variants
  readonly countryCtrl  = input<AbstractControl | null>(null);
  readonly regionCtrl   = input.required<AbstractControl>();
  readonly districtCtrl = input.required<AbstractControl>();
  readonly provinceCtrl = input<AbstractControl | null>(null);
  readonly showCountry  = input<boolean>(true);

  // Internal controls for UI binding
  readonly _uiCountry  = new FormControl('');
  readonly _uiRegion   = new FormControl('');
  readonly _uiDistrict = new FormControl('');

  // Internal signals for options derivation
  private readonly _country  = signal('');
  private readonly _region   = signal('');

  readonly countryOptions = computed<SelectOption[]>(() => [
    { value: '', label: '— Seleccionar país —' },
    ...getCountries().map(n => ({ value: n, label: n })),
  ]);

  readonly regionOptions = computed<SelectOption[]>(() => {
    const list = getDepartamentos(this._country());
    return [
      { value: '', label: list.length ? '— Seleccionar departamento —' : '— Primero selecciona un país —' },
      ...list.map(n => ({ value: n, label: n })),
    ];
  });

  readonly districtOptions = computed<SelectOption[]>(() => {
    const list = getAllDistritos(this._country(), this._region());
    return [
      { value: '', label: list.length ? '— Seleccionar distrito —' : '— Primero selecciona un departamento —' },
      ...list.map(n => ({ value: n, label: n })),
    ];
  });

  readonly regionDisabled  = computed(() => !this._country());
  readonly districtDisabled = computed(() => !this._region());

  ngOnInit(): void {
    // Initialize internal state from external controls
    const initCountry  = (this.showCountry() ? this.countryCtrl()?.value : 'Perú') ?? 'Perú';
    const initRegion   = this.regionCtrl().value   ?? '';
    const initDistrict = this.districtCtrl().value ?? '';

    this._country.set(initCountry);
    this._region.set(initRegion);

    this._uiCountry.setValue(initCountry, { emitEvent: false });
    this._uiRegion.setValue(initRegion,   { emitEvent: false });
    this._uiDistrict.setValue(initDistrict, { emitEvent: false });

    // React to UI changes
    this._uiCountry.valueChanges.pipe(
      distinctUntilChanged(), takeUntilDestroyed(this.destroyRef),
    ).subscribe(val => this.onCountryChange(val ?? ''));

    this._uiRegion.valueChanges.pipe(
      distinctUntilChanged(), takeUntilDestroyed(this.destroyRef),
    ).subscribe(val => this.onRegionChange(val ?? ''));

    this._uiDistrict.valueChanges.pipe(
      distinctUntilChanged(), takeUntilDestroyed(this.destroyRef),
    ).subscribe(val => this.onDistrictChange(val ?? ''));
  }

  private onCountryChange(country: string): void {
    this._country.set(country);
    this._region.set('');
    this._uiRegion.setValue('',   { emitEvent: false });
    this._uiDistrict.setValue('', { emitEvent: false });
    this.countryCtrl()?.setValue(country);
    this.regionCtrl().setValue('');
    this.districtCtrl().setValue('');
    this.provinceCtrl()?.setValue('');
  }

  private onRegionChange(region: string): void {
    this._region.set(region);
    this._uiDistrict.setValue('', { emitEvent: false });
    this.regionCtrl().setValue(region);
    this.districtCtrl().setValue('');
    this.provinceCtrl()?.setValue('');
  }

  private onDistrictChange(district: string): void {
    this.districtCtrl().setValue(district);
    const prov = findProvincia(this._country(), this._region(), district);
    this.provinceCtrl()?.setValue(prov);
  }
}
