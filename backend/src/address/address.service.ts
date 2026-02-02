import { Injectable } from '@nestjs/common';

export interface AddressResult {
  formatted: string;
  streetAddress: string;
  suburb: string;
  state: string;
  postcode: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

@Injectable()
export class AddressService {
  async search(query: string): Promise<AddressResult[]> {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      return [];
    }

    const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
    url.searchParams.set('text', query);
    url.searchParams.set('filter', 'countrycode:au');
    url.searchParams.set('limit', '6');
    url.searchParams.set('format', 'json');
    url.searchParams.set('apiKey', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    return results.map((item: any) => {
      const streetAddress =
        item.address_line1 ||
        [item.housenumber, item.street].filter(Boolean).join(' ').trim();

      const suburb =
        item.city ||
        item.suburb ||
        item.locality ||
        item.town ||
        item.village ||
        item.county ||
        '';

      return {
        formatted: item.formatted || '',
        streetAddress: streetAddress || item.formatted || '',
        suburb,
        state: item.state_code || item.state || '',
        postcode: item.postcode || '',
        latitude: item.lat,
        longitude: item.lon,
        placeId: item.place_id || '',
      };
    });
  }
}
