import { apiService } from './api';

export interface Event {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  maxAttendees: number;
  currentAttendees: number;
  category: EventCategory;
  status: EventStatus;
  venueId?: number;
  imageUrl?: string;
  ticketPrice?: number;
  isFree: boolean;
  requiresApproval: boolean;
  isPublic: boolean;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const EventCategory = {
  Conference: 0,
  Workshop: 1,
  Seminar: 2,
  Meetup: 3,
  Concert: 4,
  Exhibition: 5,
  Wedding: 6,
  Birthday: 7,
  Corporate: 8,
  Sports: 9,
  Festival: 10,
  Other: 11
} as const;

export type EventCategory = typeof EventCategory[keyof typeof EventCategory];

export const EventStatus = {
  Draft: 0,
  Published: 1,
  InProgress: 2,
  Completed: 3,
  Cancelled: 4,
  Postponed: 5
} as const;

export type EventStatus = typeof EventStatus[keyof typeof EventStatus];

export interface CreateEventRequest {
  title: string;
  date: string;
  endDate?: string;
  location: string;
  description: string;
  maxAttendees: number;
  category: EventCategory;
  status: EventStatus;
  venueId?: number;
  imageUrl?: string;
  ticketPrice?: number;
  isFree: boolean;
  requiresApproval: boolean;
  isPublic: boolean;
  organizerName?: string;
  organizerEmail?: string;
  organizerPhone?: string;
}

export interface UpdateEventRequest extends CreateEventRequest {
  id: number;
}

class EventService {
  async getAllEvents(): Promise<Event[]> {
    return await apiService.get('/Event');
  }

  async getEventById(id: number): Promise<Event> {
    return await apiService.get(`/Event/${id}`);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    return await apiService.get('/Event/upcoming');
  }

  async getPublicEvents(): Promise<Event[]> {
    return await apiService.get('/Event/public');
  }

  async getEventsByCategory(category: EventCategory): Promise<Event[]> {
    return await apiService.get(`/Event/category/${category}`);
  }

  async searchEvents(query: string): Promise<Event[]> {
    return await apiService.get(`/Search?query=${encodeURIComponent(query)}`);
  }

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    return await apiService.post('/Event', eventData);
  }

  async updateEvent(eventData: UpdateEventRequest): Promise<Event> {
    return await apiService.put(`/Event/${eventData.id}`, eventData);
  }

  async deleteEvent(id: number): Promise<void> {
    return await apiService.delete(`/Event/${id}`);
  }

  getCategoryName(category: EventCategory): string {
    const names: Record<number, string> = {
      [EventCategory.Conference]: 'Conference',
      [EventCategory.Workshop]: 'Workshop',
      [EventCategory.Seminar]: 'Seminar',
      [EventCategory.Meetup]: 'Meetup',
      [EventCategory.Concert]: 'Concert',
      [EventCategory.Exhibition]: 'Exhibition',
      [EventCategory.Wedding]: 'Wedding',
      [EventCategory.Birthday]: 'Birthday',
      [EventCategory.Corporate]: 'Corporate',
      [EventCategory.Sports]: 'Sports',
      [EventCategory.Festival]: 'Festival',
      [EventCategory.Other]: 'Other'
    };
    return names[category] || 'Unknown';
  }

  getStatusName(status: EventStatus): string {
    const names: Record<number, string> = {
      [EventStatus.Draft]: 'Draft',
      [EventStatus.Published]: 'Published',
      [EventStatus.InProgress]: 'In Progress',
      [EventStatus.Completed]: 'Completed',
      [EventStatus.Cancelled]: 'Cancelled',
      [EventStatus.Postponed]: 'Postponed'
    };
    return names[status] || 'Unknown';
  }
}

export const eventService = new EventService();
