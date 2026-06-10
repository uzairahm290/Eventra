import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCalendar, FiMapPin, FiUsers, FiDollarSign,
  FiCheckSquare, FiClock, FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface DashBooking {
  id: number;
  bookingReference: string;
  clientName: string;
  clientPhone?: string;
  marqueName?: string;
  eventTitle: string;
  eventDate: string;
  bookingDate: string;
  status: string;
  totalAmount: number;
  amountPaid: number;
  isApprovedByAdmin: boolean;
}

interface DashEvent {
  id: number;
  title: string;
  date: string;
  venueName?: string;
}

interface Venue {
  id: number;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  CheckedIn: 'bg-blue-100 text-blue-800',
};

const fmt = (n: number) => `₨${n.toLocaleString('en-PK')}`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  const [bookings, setBookings] = useState<DashBooking[]>([]);
  const [events, setEvents] = useState<DashEvent[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filterVenueId, setFilterVenueId] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const requests: Promise<Response>[] = [
        fetch('/api/Bookings', { headers: authHeaders }),
        fetch('/api/Events', { headers: authHeaders }),
      ];
      if (isOwner) requests.push(fetch('/api/Venues', { headers: authHeaders }));

      const [bookingsRes, eventsRes, venuesRes] = await Promise.all(requests);

      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (venuesRes?.ok) setVenues(await venuesRes.json());
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => { loadData(); }, [loadData]);

  const filterByVenue = <T extends { marqueName?: string; venueName?: string }>(
    items: T[],
    nameField: 'marqueName' | 'venueName',
  ): T[] => {
    if (!isOwner || !filterVenueId) return items;
    const venueName = venues.find(v => v.id === filterVenueId)?.name;
    return items.filter(i => i[nameField] === venueName);
  };

  const filteredBookings = filterByVenue(bookings, 'marqueName');
  const filteredEvents = filterByVenue(events, 'venueName');

  const totalCollected = filteredBookings.reduce((s, b) => s + b.amountPaid, 0);
  const totalDue = filteredBookings.reduce((s, b) => s + Math.max(0, b.totalAmount - b.amountPaid), 0);
  const upcomingCount = filteredEvents.filter(e => new Date(e.date) >= new Date()).length;
  const pendingApprovals = filteredBookings.filter(b => !b.isApprovedByAdmin && b.status !== 'Cancelled').length;

  const recentBookings = [...filteredBookings]
    .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
    .slice(0, 6);

  const upcomingEventsList = [...filteredEvents]
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isOwner ? 'Dashboard' : `Dashboard — ${user?.venueName ?? 'Your Marque'}`}
          </h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {isOwner && venues.length > 0 && (
          <select
            value={filterVenueId}
            onChange={e => setFilterVenueId(Number(e.target.value))}
            className="input focus:outline-none"
          >
            <option value={0}>All Marques</option>
            {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{filteredBookings.length}</p>
                  {pendingApprovals > 0 && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3" />
                      {pendingApprovals} pending approval
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FiCalendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Revenue Collected</p>
                  <p className="text-xl font-bold text-emerald-700 mt-1">{fmt(totalCollected)}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Balance Due</p>
                  <p className="text-xl font-bold text-orange-600 mt-1">{fmt(totalDue)}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-orange-500" />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Upcoming Events</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{upcomingCount}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FiClock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* 2-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Bookings */}
            <div className="lg:col-span-2 card overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
                <button
                  onClick={() => navigate('/dashboard/bookings')}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View All →
                </button>
              </div>
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No bookings yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentBookings.map(b => (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm text-gray-900">{b.clientName}</div>
                            <div className="text-xs text-gray-500">{b.marqueName}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-900">{b.eventTitle}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(b.eventDate).toLocaleDateString('en-PK')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-900">{fmt(b.totalAmount)}</div>
                            {b.totalAmount - b.amountPaid > 0 && (
                              <div className="text-xs text-orange-600">{fmt(b.totalAmount - b.amountPaid)} due</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                              {b.status}
                            </span>
                            {!b.isApprovedByAdmin && b.status !== 'Cancelled' && (
                              <div className="text-xs text-orange-500 mt-0.5">Needs approval</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
                  <button
                    onClick={() => navigate('/dashboard/events')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                {upcomingEventsList.length === 0 ? (
                  <p className="text-sm text-gray-500">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEventsList.map(e => (
                      <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="shrink-0 w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <FiCalendar className="w-5 h-5 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{e.title}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(e.date).toLocaleDateString('en-PK')}
                            {e.venueName ? ` · ${e.venueName}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/dashboard/bookings')}
                    className="w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                  >
                    <FiCalendar className="w-4 h-4" /> New Booking
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/attendance')}
                    className="w-full btn-secondary text-sm py-2.5 flex items-center justify-center gap-2"
                  >
                    <FiCheckSquare className="w-4 h-4" /> Mark Attendance
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/clients')}
                    className="w-full btn-outline text-sm py-2.5 flex items-center justify-center gap-2"
                  >
                    <FiUsers className="w-4 h-4" /> Add Client
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => navigate('/dashboard/venues')}
                      className="w-full btn-outline text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                      <FiMapPin className="w-4 h-4" /> Manage Marques
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
