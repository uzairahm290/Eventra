import React, { useEffect, useState } from 'react';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiTrendingUp, FiArrowUp } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { toast } from 'react-toastify';

type EventItem = { id: number; title: string; date: string; venueName?: string; status?: number; maxAttendees?: number; currentAttendees?: number; };
type BookingItem = { id: number; userId: string; bookingDate: string; totalAmount?: number; amountPaid?: number; };

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Array<{name: string; value: string; change: string; trend: 'up' | 'down'; icon: IconType; color: string;}>>([]);
  const [recentEvents, setRecentEvents] = useState<EventItem[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<Array<{ id: number; client: string; venue: string; date: string; amount: string }>>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { eventService, bookingService } = await import('../services');
        // Events
        const events = await eventService.getAllEvents();
        const totalEvents = Array.isArray(events) ? events.length : 0;
        type EventDTO = { id: number; title: string; date: string; createdAt?: string; venueName?: string; status?: number; maxAttendees?: number; currentAttendees?: number };
        const upcomingEvents = (events || []).filter((e: EventDTO) => new Date(e.date) >= new Date()).length;
        const latestEvents: EventItem[] = (events || [])
          .sort((a: EventDTO, b: EventDTO) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime())
          .slice(0, 5);

        setRecentEvents(latestEvents);

        // Bookings
        const bookings = await bookingService.getAllBookings();
        type BookingDTO = { id: number; userId: string; bookingDate: string; totalAmount?: number };
        const upcoming = (bookings || [])
          .filter((b: BookingItem) => new Date(b.bookingDate) >= new Date())
          .sort((a: BookingItem, b: BookingItem) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
          .slice(0, 5)
          .map((b: BookingDTO) => ({
            id: b.id,
            client: `User #${b.userId}`,
            venue: 'N/A',
            date: new Date(b.bookingDate).toLocaleDateString(),
            amount: `$${(b.totalAmount ?? 0).toFixed(2)}`
          }));
        setUpcomingBookings(upcoming);

        // Stats (basic, derived from loaded data)
        const totalRevenue = (bookings || []).reduce((sum: number, b: BookingDTO) => sum + (b.totalAmount ?? 0), 0);
        const totalClientsEst = new Set((bookings || []).map((b: BookingDTO) => b.userId)).size;

        setStats([
          { name: 'Total Events', value: String(totalEvents), change: `${upcomingEvents} upcoming`, trend: 'up', icon: FiCalendar, color: 'blue' },
          { name: 'Active Venues', value: '—', change: '+0', trend: 'up', icon: FiMapPin, color: 'green' },
          { name: 'Total Clients', value: String(totalClientsEst), change: '+', trend: 'up', icon: FiUsers, color: 'orange' },
          { name: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, change: 'MTD', trend: 'up', icon: FiDollarSign, color: 'emerald' },
        ]);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };
    loadDashboard();
  }, []);

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your events today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="dashboard-stat">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                <div className="mt-2 flex items-center text-sm">
                  <FiArrowUp className={`mr-1 h-4 w-4 text-${stat.color}-600`} />
                  <span className={`font-medium text-${stat.color}-600`}>{stat.change}</span>
                  <span className="ml-2 text-gray-500">from last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Events */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Events</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendees
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">Event #{event.id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{event.venueName ?? 'N/A'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.currentAttendees ?? 0}/{event.maxAttendees ?? '—'}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(typeof event.status === 'string' ? event.status : (event.status === 1 ? 'Confirmed' : event.status === 0 ? 'Pending' : event.status === 2 ? 'Cancelled' : 'Draft'))}`}>
                          {typeof event.status === 'string' ? event.status : (event.status === 1 ? 'Confirmed' : event.status === 0 ? 'Pending' : event.status === 2 ? 'Cancelled' : 'Draft')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
              <FiTrendingUp className="h-5 w-5 text-primary-600" />
            </div>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiCalendar className="h-5 w-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{booking.client}</p>
                    <p className="text-xs text-gray-500 mt-1">{booking.venue}</p>
                    <p className="text-xs text-gray-500">{booking.date}</p>
                    <p className="text-sm font-semibold text-primary-600 mt-2">{booking.amount}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full btn-outline text-sm py-2">
              View All Bookings
            </button>
          </div>

          {/* Quick Actions */}
          <div className="card p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full btn-primary text-sm py-3">
                <FiCalendar className="inline mr-2 h-4 w-4" />
                Create New Event
              </button>
              <button className="w-full btn-secondary text-sm py-3">
                <FiUsers className="inline mr-2 h-4 w-4" />
                Add Client
              </button>
              <button className="w-full btn-outline text-sm py-3">
                <FiMapPin className="inline mr-2 h-4 w-4" />
                Manage Venues
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
