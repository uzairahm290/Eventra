import { apiService } from './api';

export interface Notification {
  id: number;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  eventId?: number;
  bookingId?: number;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  actionUrl?: string;
}

export const NotificationType = {
  EventReminder: 0,
  BookingConfirmation: 1,
  BookingCancellation: 2,
  PaymentReceived: 3,
  EventUpdate: 4,
  EventCancellation: 5,
  RegistrationApproved: 6,
  RegistrationRejected: 7,
  CheckInReminder: 8,
  General: 9
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

class NotificationService {
  async getAllNotifications(): Promise<Notification[]> {
    return await apiService.get('/Notifications');
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    return await apiService.get('/Notifications/unread');
  }

  async getNotificationById(id: number): Promise<Notification> {
    return await apiService.get(`/Notifications/${id}`);
  }

  async markAsRead(id: number): Promise<void> {
    return await apiService.put(`/Notifications/${id}/read`, {});
  }

  async markAllAsRead(): Promise<void> {
    return await apiService.put('/Notifications/mark-all-read', {});
  }

  async deleteNotification(id: number): Promise<void> {
    return await apiService.delete(`/Notifications/${id}`);
  }

  getTypeName(type: NotificationType): string {
    const typeNames = {
      [NotificationType.EventReminder]: 'Event Reminder',
      [NotificationType.BookingConfirmation]: 'Booking Confirmation',
      [NotificationType.BookingCancellation]: 'Booking Cancellation',
      [NotificationType.PaymentReceived]: 'Payment Received',
      [NotificationType.EventUpdate]: 'Event Update',
      [NotificationType.EventCancellation]: 'Event Cancellation',
      [NotificationType.RegistrationApproved]: 'Registration Approved',
      [NotificationType.RegistrationRejected]: 'Registration Rejected',
      [NotificationType.CheckInReminder]: 'Check-In Reminder',
      [NotificationType.General]: 'General'
    };
    return typeNames[type] || 'Unknown';
  }

  getTypeIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.EventReminder:
        return '🔔';
      case NotificationType.BookingConfirmation:
        return '✅';
      case NotificationType.BookingCancellation:
        return '❌';
      case NotificationType.PaymentReceived:
        return '💰';
      case NotificationType.EventUpdate:
        return '📝';
      case NotificationType.EventCancellation:
        return '🚫';
      case NotificationType.RegistrationApproved:
        return '👍';
      case NotificationType.RegistrationRejected:
        return '👎';
      case NotificationType.CheckInReminder:
        return '📍';
      default:
        return 'ℹ️';
    }
  }
}

export const notificationService = new NotificationService();
