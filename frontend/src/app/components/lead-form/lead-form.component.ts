import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AddressService, AddressSuggestion } from '../../services/address.service';
import { AgencyService } from '../../services/agency.service';
import { AuthService } from '../../services/auth.service';
import { LeadService } from '../../services/lead.service';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.scss']
})
export class LeadFormComponent implements OnInit, OnDestroy {
  leadForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitError = '';
  suggestedAgencies: any[] = [];
  isLookingUpAgencies = false;
  addressSuggestions: AddressSuggestion[] = [];
  isSearchingAddress = false;
  addressSelected = false;

  @Output() submitLeadEvent = new EventEmitter<any>();

  private addressSearch$ = new Subject<string>();
  private addressSearchSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private agencyService: AgencyService,
    private authService: AuthService,
    private addressService: AddressService
  ) {
    this.leadForm = this.fb.group({
      homeownerName: ['', Validators.required],
      homeownerEmail: ['', [Validators.required, Validators.email]],
      homeownerPhone: ['', Validators.required],
      propertyAddress: ['', Validators.required],
      propertyType: ['', Validators.required],
      preferredAgency: [''],
      preferredContactTime: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      streetAddress: [''],
      suburb: [''],
      state: [''],
      postcode: [''],
      latitude: [''],
      longitude: [''],
      addressPlaceId: [''],
    });
  }

  ngOnInit() {
    this.addressSearchSub = this.addressSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          const trimmed = query.trim();
          if (trimmed.length < 3) {
            this.addressSuggestions = [];
            this.isSearchingAddress = false;
            return of([]);
          }
          this.isSearchingAddress = true;
          return this.addressService.search(trimmed);
        })
      )
      .subscribe({
        next: (results) => {
          this.addressSuggestions = results || [];
          this.isSearchingAddress = false;
        },
        error: (err) => {
          console.error('Address lookup failed:', err);
          this.addressSuggestions = [];
          this.isSearchingAddress = false;
        },
      });
  }

  ngOnDestroy() {
    this.addressSearchSub?.unsubscribe();
  }

  /**
   * Lookup agencies by postcode
   */
  lookupAgencies(postcode: string) {
    this.isLookingUpAgencies = true;
    this.agencyService.lookupByPostcode(postcode).subscribe({
      next: (res) => {
        this.suggestedAgencies = res.agencies || [];
        this.isLookingUpAgencies = false;
      },
      error: (err) => {
        console.error('Error looking up agencies:', err);
        this.suggestedAgencies = [];
        this.isLookingUpAgencies = false;
      }
    });
  }

  /**
   * Auto-fill preferred agency when user selects one
   */
  selectAgency(agency: any) {
    this.leadForm.patchValue({
      preferredAgency: agency.name
    });
    this.suggestedAgencies = [];
  }

  onAddressInput(value: string) {
    this.addressSelected = false;
    this.leadForm.patchValue({
      streetAddress: '',
      suburb: '',
      state: '',
      postcode: '',
      latitude: '',
      longitude: '',
      addressPlaceId: '',
    });
    this.addressSearch$.next(value);
  }

  selectAddress(address: AddressSuggestion) {
    this.addressSelected = true;
    this.leadForm.patchValue({
      propertyAddress: address.formatted,
      streetAddress: address.streetAddress,
      suburb: address.suburb,
      state: address.state,
      postcode: address.postcode,
      latitude: address.latitude,
      longitude: address.longitude,
      addressPlaceId: address.placeId,
    });
    this.addressSuggestions = [];
    if (address.postcode) {
      this.lookupAgencies(address.postcode);
    }
  }

  clearAddressSelection() {
    this.addressSelected = false;
    this.addressSuggestions = [];
    this.leadForm.patchValue({
      propertyAddress: '',
      streetAddress: '',
      suburb: '',
      state: '',
      postcode: '',
      latitude: '',
      longitude: '',
      addressPlaceId: '',
    });
  }

  onSubmit() {
    if (this.leadForm.invalid) {
      this.submitError = 'Please fill all required fields correctly.';
      return;
    }

    if (!this.addressSelected) {
      this.submitError = 'Please select a valid address from the suggestions.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitMessage = '';

    const password = this.leadForm.get('password')?.value;
    const confirmPassword = this.leadForm.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      this.submitError = 'Passwords do not match.';
      this.isSubmitting = false;
      return;
    }

    const email = this.leadForm.get('homeownerEmail')?.value;
    const name = this.leadForm.get('homeownerName')?.value;

    this.authService.register(email, password, name, 'seller').subscribe({
      next: () => {
        this.authService.logout();
        this.createLeadAfterRegister();
      },
      error: (err) => {
        if (err.status === 400) {
          this.createLeadAfterRegister(true);
          return;
        }
        console.error('Registration error:', err);
        this.submitError = err.error?.message || 'Failed to create your account. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  private createLeadAfterRegister(existingUser = false) {
    const payload = { ...this.leadForm.value };
    delete payload.password;
    delete payload.confirmPassword;

    this.leadService.createLead(payload).subscribe({
      next: (res) => {
        this.submitMessage = existingUser
          ? 'Thank you! Your request is submitted. Please sign in to view agent offers.'
          : 'Thank you! Your account is created and your request is submitted. Sign in to view agent offers.';
        this.submitLeadEvent.emit(res);
        this.leadForm.reset();
        this.suggestedAgencies = [];
        this.addressSuggestions = [];
        this.addressSelected = false;
        this.isSubmitting = false;

        setTimeout(() => {
          this.submitMessage = '';
        }, 3000);
      },
      error: (err) => {
        console.error('Error submitting lead:', err);
        this.submitError = err.error?.message || 'Failed to submit lead. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
