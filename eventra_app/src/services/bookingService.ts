import { apiService } from './api';

export interface Booking {
  id: number;
  eventId: number;
  userId: string;
  bookingReference: string;
  bookingDate: string;
  status: BookingStatus;
  numberOfTickets: number;
  totalAmount: number;
  amountPaid: number;
  paymentDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  qrCode?: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  specialRequests?: string;
  cancellationReason?: string;
  cancellationDate?: string;
  createdAt: string;
  updatedAt?: string;
}

export const BookingStatus = {
  Pending: 0,
  Confirmed: 1,
  Cancelled: 2,
  CheckedIn: 3,
  NoShow: 4,
  Refunded: 5
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export interface CreateBookingRequest {
  eventId: number;
  numberOfTickets: number;
  specialRequests?: string;
}

export interface UpdateBookingStatusRequest {
  status: BookingStatus;
  cancellationReason?: string;
}

class BookingService {
  async getAllBookings(): Promise<Booking[]> {
    return await apiService.get('/Bookings');
  }

  async getBookingById(id: number): Promise<Booking> {
    return await apiService.get(`/Bookings/${id}`);
  }

  async getMyBookings(): Promise<Booking[]> {
    return await apiService.get('/Bookings/my-bookings');
  }

  async getBookingsByEvent(eventId: number): Promise<Booking[]> {
    return await apiService.get(`/Bookings/event/${eventId}`);
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    return await apiService.post('/Bookings', bookingData);
  }

  async updateBookingStatus(
    id: number,
    statusData: UpdateBookingStatusRequest
  ): Promise<Booking> {
    return await apiService.put(`/Bookings/${id}/status`, statusData);
  }

  async cancelBooking(id: number, reason: string): Promise<Booking> {
    return await this.updateBookingStatus(id, {
      status: BookingStatus.Cancelled,
      cancellationReason: reason
    });
  }

  async checkInBooking(id: number): Promise<Booking> {
    return await apiService.post(`/Bookings/${id}/checkin`);
  }

  async deleteBooking(id: number): Promise<void> {
    return await apiService.delete(`/Bookings/${id}`);
  }

  getStatusName(status: BookingStatus): string {
    const names: Record<number, string> = {
      [BookingStatus.Pending]: 'Pending',
      [BookingStatus.Confirmed]: 'Confirmed',
      [BookingStatus.Cancelled]: 'Cancelled',
      [BookingStatus.CheckedIn]: 'Checked In',
      [BookingStatus.NoShow]: 'No Show',
      [BookingStatus.Refunded]: 'Refunded'
    };
    return names[status] || 'Unknown';
  }

  getStatusColor(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.Pending:
        return 'orange';
      case BookingStatus.Confirmed:
        return 'green';
      case BookingStatus.Cancelled:
        return 'red';
      case BookingStatus.CheckedIn:
        return 'blue';
      case BookingStatus.NoShow:
        return 'gray';
      case BookingStatus.Refunded:
        return 'purple';
      default:
        return 'gray';
    }
  }
}

export const bookingService = new BookingService();
