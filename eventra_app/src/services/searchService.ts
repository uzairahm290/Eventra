import { apiService } from './api';
import type { Event } from './eventService';
import type { Venue } from './venueService';
import type { Menu } from './menuService';

export interface ClientLite {
  id: number;
  firstName: string;
  secondName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  dateRegistered: string;
  isActive: boolean;
}

export interface SearchResult {
  events: Event[];
  venues: Venue[];
  clients: ClientLite[];
  menus: Menu[];
}

export const searchService = {
  async searchAll(q: string): Promise<SearchResult> {
    const res = await apiService.get(`/Search?query=${encodeURIComponent(q)}`);
    return {
      events: Array.isArray(res?.events) ? res.events : [],
      venues: Array.isArray(res?.venues) ? res.venues : [],
      clients: Array.isArray(res?.clients) ? res.clients : [],
      menus: Array.isArray(res?.menus) ? res.menus : [],
    };
  },
};

export default searchService;
