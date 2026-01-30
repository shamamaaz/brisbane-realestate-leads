import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AgencyService } from '../../services/agency.service';
import { LeadService } from '../../services/lead.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-lead-form',
  templateUrl: './lead-form.component.html',
  styleUrls: ['./lead-form.component.scss']
})
export class LeadFormComponent implements AfterViewInit, OnDestroy {
  leadForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitError = '';
  suggestedAgencies: any[] = [];
  isLookingUpAgencies = false;

  @Output() submitLeadEvent = new EventEmitter<any>();
  @ViewChild('propertyAddressInput') propertyAddressInput?: ElementRef<HTMLInputElement>;

  private autocompleteListener?: { remove: () => void };

  constructor(
    private fb: FormBuilder,
    private leadService: LeadService,
    private agencyService: AgencyService
  ) {
    this.leadForm = this.fb.group({
      homeownerName: ['', Validators.required],
      homeownerEmail: ['', [Validators.required, Validators.email]],
      homeownerPhone: ['', Validators.required],
      propertyAddress: ['', Validators.required],
      propertyType: ['', Validators.required],
      preferredAgency: [''],
      preferredContactTime: ['']
    });
  }

  ngAfterViewInit() {
    void this.initializeAddressAutocomplete();
  }

  ngOnDestroy() {
    if (this.autocompleteListener) {
      this.autocompleteListener.remove();
    }
  }

  private async initializeAddressAutocomplete() {
    if (!environment.googleMapsApiKey || !this.propertyAddressInput) {
      return;
    }

    try {
      await this.loadGooglePlacesApi();
    } catch (error) {
      console.warn('Google Places API failed to load:', error);
      return;
    }

    const googleMaps = (window as any).google;
    if (!googleMaps?.maps?.places) {
      return;
    }

    const autocomplete = new googleMaps.maps.places.Autocomplete(
      this.propertyAddressInput.nativeElement,
      {
        types: ['address'],
        componentRestrictions: { country: 'au' },
        fields: ['formatted_address', 'address_components'],
      }
    );

    this.autocompleteListener = autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      const formattedAddress = place?.formatted_address;
      if (formattedAddress) {
        this.leadForm.patchValue({ propertyAddress: formattedAddress });
      }
      this.onPropertyAddressChange();
    });
  }

  private loadGooglePlacesApi(): Promise<void> {
    if ((window as any).google?.maps?.places) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const existing = document.getElementById('google-maps-places-script') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('Google Places script failed to load.')));
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-maps-places-script';
      script.async = true;
      script.defer = true;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google Places script failed to load.'));
      document.head.appendChild(script);
    });
  }

  /**
   * Extract postcode from property address and lookup agencies
   */
  onPropertyAddressChange() {
    const address = this.leadForm.get('propertyAddress')?.value;
    if (!address) {
      this.suggestedAgencies = [];
      return;
    }

    // Extract 4-digit postcode from address
    const postcodeMatch = address.match(/\b\d{4}\b/);
    if (postcodeMatch) {
      this.lookupAgencies(postcodeMatch[0]);
    }
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

  onSubmit() {
    if (this.leadForm.invalid) {
      this.submitError = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitMessage = '';

    this.leadService.createLead(this.leadForm.value).subscribe({
      next: (res) => {
        this.submitMessage =
          'Thank you! Your request is submitted. Create a seller account or sign in to view agent offers.';
        this.submitLeadEvent.emit(res);
        this.leadForm.reset();
        this.suggestedAgencies = [];
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
