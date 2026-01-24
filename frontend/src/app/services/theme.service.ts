import { Injectable } from '@angular/core';

type AgencyTheme = {
  primaryColor?: string;
  secondaryColor?: string;
};

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private defaultPrimary = '#1f6b6f';
  private defaultSecondary = '#fffaf3';

  applyAgencyTheme(agency?: AgencyTheme | null) {
    const root = document.documentElement;
    const primary = agency?.primaryColor || this.defaultPrimary;
    const secondary = agency?.secondaryColor || this.defaultSecondary;
    root.style.setProperty('--primary-color', primary);
    root.style.setProperty('--secondary-color', secondary);
  }

  resetTheme() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', this.defaultPrimary);
    root.style.setProperty('--secondary-color', this.defaultSecondary);
  }
}
