import React from 'react';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiTrendingUp, FiArrowUp } from 'react-icons/fi';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Events',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: FiCalendar,
      color: 'blue',
    },
    {
      name: 'Active Venues',
      value: '8',
      change: '+2',
      trend: 'up',
      icon: FiMapPin,
      color: 'green',
    },
    {
      name: 'Total Clients',
      value: '156',
      change: '+23%',
      trend: 'up',
      icon: FiUsers,
      color: 'orange',
    },
    {
      name: 'Revenue',
      value: '$45,231',
      change: '+18%',
      trend: 'up',
      icon: FiDollarSign,
      color: 'emerald',
    },
  ];

  const recentEvents = [
    {
      id: 1,
      name: 'Corporate Gala 2025',
      type: 'Corporate',
      date: 'Nov 25, 2025',
      venue: 'Grand Ballroom',
      status: 'Confirmed',
      guests: 200,
    },
    {
      id: 2,
      name: 'Johnson Wedding',
      type: 'Wedding',
      date: 'Dec 5, 2025',
      venue: 'Garden Pavilion',
      status: 'Pending',
      guests: 150,
    },
    {
      id: 3,
      name: 'Tech Conference',
      type: 'Conference',
      date: 'Dec 12, 2025',
      venue: 'Convention Center',
      status: 'Confirmed',
      guests: 500,
    },
    {
      id: 4,
      name: 'Birthday Celebration',
      type: 'Birthday',
      date: 'Nov 30, 2025',
      venue: 'Rooftop Terrace',
      status: 'Confirmed',
      guests: 75,
    },
  ];

  const upcomingBookings = [
    { id: 1, client: 'Sarah Anderson', venue: 'Grand Ballroom', date: 'Nov 25, 2025', amount: '$5,200' },
    { id: 2, client: 'Michael Chen', venue: 'Garden Pavilion', date: 'Dec 5, 2025', amount: '$3,800' },
    { id: 3, client: 'Emily Rodriguez', venue: 'Convention Center', date: 'Dec 12, 2025', amount: '$12,500' },
  ];

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
                      Guests
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
                          <div className="text-sm font-medium text-gray-900">{event.name}</div>
                          <div className="text-sm text-gray-500">{event.type}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.date}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{event.venue}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{event.guests}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
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
                  <div className="flex-shrink-0">
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
