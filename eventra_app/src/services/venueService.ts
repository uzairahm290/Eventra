import { apiService } from './api';

export interface Venue {
  id: number;
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  capacity: number;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  pricePerHour?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  capacity: number;
  description?: string;
  contactPhone?: string;
  contactEmail?: string;
  pricePerHour?: number;
  isActive: boolean;
}

export interface UpdateVenueRequest extends CreateVenueRequest {
  id: number;
}

class VenueService {
  async getAllVenues(): Promise<Venue[]> {
    return await apiService.get('/Venues');
  }

  async getVenueById(id: number): Promise<Venue> {
    return await apiService.get(`/Venues/${id}`);
  }

  async getActiveVenues(): Promise<Venue[]> {
    const venues = await this.getAllVenues();
    return venues.filter(v => v.isActive);
  }

  async createVenue(venueData: CreateVenueRequest): Promise<Venue> {
    return await apiService.post('/Venues', venueData);
  }

  async updateVenue(venueData: UpdateVenueRequest): Promise<Venue> {
    return await apiService.put(`/Venues/${venueData.id}`, venueData);
  }

  async deleteVenue(id: number): Promise<void> {
    return await apiService.delete(`/Venues/${id}`);
  }
}

export const venueService = new VenueService();
