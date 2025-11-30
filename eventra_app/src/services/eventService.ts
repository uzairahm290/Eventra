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
    const data = await apiService.get('/Events');
    return Array.isArray(data) ? data.map(this.mapFromDto) : [];
  }

  async getEventById(id: number): Promise<Event> {
    const dto = await apiService.get(`/Events/${id}`);
    return this.mapFromDto(dto);
  }

  async getUpcomingEvents(): Promise<Event[]> {
    const data = await apiService.get('/Events?upcoming=true');
    return Array.isArray(data) ? data.map(this.mapFromDto) : [];
  }

  async getPublicEvents(): Promise<Event[]> {
    const data = await apiService.get(`/Events?status=${EventStatus.Published}`);
    return Array.isArray(data) ? data.map(this.mapFromDto) : [];
  }

  async getEventsByCategory(category: EventCategory): Promise<Event[]> {
    const data = await apiService.get(`/Events?category=${category}`);
    return Array.isArray(data) ? data.map(this.mapFromDto) : [];
  }

  async searchEvents(query: string): Promise<Event[]> {
    return await apiService.get(`/Search?query=${encodeURIComponent(query)}`);
  }

  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const dto = await apiService.post('/Events', eventData);
    return this.mapFromDto(dto);
  }

  async updateEvent(eventData: UpdateEventRequest): Promise<Event> {
    const { id, ...updateData } = eventData;
    const dto = await apiService.put(`/Events/${id}`, updateData);
    return this.mapFromDto(dto);
  }

  async deleteEvent(id: number): Promise<void> {
    return await apiService.delete(`/Events/${id}`);
  }

  private mapFromDto = (dto: unknown): Event => {
    const d = dto as Record<string, unknown>;
    // Map category/status strings to numeric enum values if needed
    const mapEnumValue = (enumObj: Record<string, number | string>, value: unknown, fallback: number): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        // Check if string matches a key in the enum (e.g., "Conference" → 0)
        const key = Object.keys(enumObj).find(k => k === value);
        if (key && typeof enumObj[key] === 'number') {
          return enumObj[key] as number;
        }
      }
      return fallback;
    };

    // Helper to format date for HTML date input (yyyy-MM-dd)
    const formatDate = (value: unknown): string => {
      if (!value) return new Date().toISOString().split('T')[0];
      const dateStr = typeof value === 'string' ? value : new Date(value as string | number | Date).toISOString();
      return dateStr.split('T')[0];
    };

    return {
      id: d.id as number,
      title: d.title as string,
      date: formatDate(d.date),
      endDate: d.endDate ? formatDate(d.endDate) : undefined,
      location: d.location as string,
      description: (d.description as string) ?? '',
      maxAttendees: d.maxAttendees as number,
      currentAttendees: (d.currentAttendees as number) ?? 0,
      category: mapEnumValue(EventCategory, d.category, EventCategory.Other) as EventCategory,
      status: mapEnumValue(EventStatus, d.status, EventStatus.Draft) as EventStatus,
      venueId: (d.venueId as number) ?? undefined,
      imageUrl: (d.imageUrl as string) ?? undefined,
      ticketPrice: (d.ticketPrice as number) ?? undefined,
      isFree: !!d.isFree,
      requiresApproval: !!d.requiresApproval,
      isPublic: !!d.isPublic,
      organizerName: (d.organizerName as string) ?? undefined,
      organizerEmail: (d.organizerEmail as string) ?? undefined,
      organizerPhone: (d.organizerPhone as string) ?? undefined,
      createdBy: (d.createdBy as string) ?? '',
      createdAt: typeof d.createdAt === 'string' ? (d.createdAt as string) : (d.createdAt ? new Date(d.createdAt as string | number | Date).toISOString() : new Date().toISOString()),
      updatedAt: d.updatedAt ? (typeof d.updatedAt === 'string' ? (d.updatedAt as string) : new Date(d.updatedAt as string | number | Date).toISOString()) : undefined,
      updatedBy: (d.updatedBy as string) ?? undefined,
    };
  };

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
