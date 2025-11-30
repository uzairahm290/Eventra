import React, { useState } from 'react';
import { FiPlus, FiSearch, FiCalendar, FiMapPin, FiUser, FiEdit, FiTrash2, FiEye, FiCheckCircle } from 'react-icons/fi';
import Modal from '../components/Modal';

const Bookings: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    client: '',
    venue: '',
    event: '',
    date: '',
    startTime: '',
    endTime: '',
    totalAmount: '',
  });

  const [bookingsList, setBookingsList] = useState([
    {
      id: 1,
      bookingId: 'BK-2025-001',
      client: 'Sarah Anderson',
      venue: 'Grand Ballroom',
      event: 'Corporate Gala 2025',
      date: '2025-11-25',
      time: '18:00 - 23:00',
      totalAmount: '$15,000',
      depositPaid: '$5,000',
      remaining: '$10,000',
      status: 'Confirmed',
      paymentStatus: 'Partial',
    },
    {
      id: 2,
      bookingId: 'BK-2025-002',
      client: 'Michael Chen',
      venue: 'Garden Pavilion',
      event: 'Johnson Wedding',
      date: '2025-12-05',
      time: '14:00 - 22:00',
      totalAmount: '$12,000',
      depositPaid: '$12,000',
      remaining: '$0',
      status: 'Confirmed',
      paymentStatus: 'Paid',
    },
    {
      id: 3,
      bookingId: 'BK-2025-003',
      client: 'Emily Rodriguez',
      venue: 'Convention Center',
      event: 'Tech Conference 2025',
      date: '2025-12-12',
      time: '09:00 - 18:00',
      totalAmount: '$35,000',
      depositPaid: '$0',
      remaining: '$35,000',
      status: 'Pending',
      paymentStatus: 'Unpaid',
    },
    {
      id: 4,
      bookingId: 'BK-2025-004',
      client: 'David Thompson',
      venue: 'Rooftop Terrace',
      event: 'Birthday Bash',
      date: '2025-11-30',
      time: '19:00 - 23:00',
      totalAmount: '$5,500',
      depositPaid: '$2,000',
      remaining: '$3,500',
      status: 'Confirmed',
      paymentStatus: 'Partial',
    },
    {
      id: 5,
      bookingId: 'BK-2025-005',
      client: 'Jennifer Lee',
      venue: 'Grand Ballroom',
      event: 'Charity Fundraiser',
      date: '2025-12-20',
      time: '17:00 - 21:00',
      totalAmount: '$20,000',
      depositPaid: '$20,000',
      remaining: '$0',
      status: 'Confirmed',
      paymentStatus: 'Paid',
    },
  ]);

  const handleDelete = () => {
    if (deleteId) {
      setBookingsList(prev => prev.filter(b => b.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleEdit = (booking: any) => {
    setEditingBooking(booking);
    setFormData({
      client: booking.client,
      venue: booking.venue,
      event: booking.event,
      date: booking.date,
      startTime: booking.time.split(' - ')[0],
      endTime: booking.time.split(' - ')[1],
      totalAmount: booking.totalAmount.replace('$', '').replace(',', ''),
    });
    setShowAddModal(true);
  };

  const bookings = bookingsList;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'Partial':
        return 'bg-orange-100 text-orange-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
          <p className="mt-2 text-gray-600">Manage venue bookings and reservations</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ client: '', venue: '', event: '', date: '', startTime: '', endTime: '', totalAmount: '' });
            setShowAddModal(true);
          }}
          className="mt-4 sm:mt-0 btn-primary flex items-center"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          New Booking
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event & Venue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary-600">{booking.bookingId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-600 to-cyan-600 flex items-center justify-center">
                          <FiUser className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{booking.client}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.event}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <FiMapPin className="mr-1 h-3 w-3" />
                      {booking.venue}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                      <div>
                        <div>{booking.date}</div>
                        <div className="text-xs text-gray-500">{booking.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">{booking.totalAmount}</div>
                      <div className="text-xs text-gray-500">
                        Paid: {booking.depositPaid}
                      </div>
                      {booking.remaining !== '$0' && (
                        <div className="text-xs text-red-600 font-medium">
                          Due: {booking.remaining}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(booking.paymentStatus)}`}>
                      {booking.paymentStatus === 'Paid' && <FiCheckCircle className="mr-1 h-3 w-3" />}
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button onClick={() => setViewId(booking.id)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleEdit(booking)} className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50">
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(booking.id)} className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Bar */}
        <div className="bg-gradient-to-r from-primary-50 to-cyan-50 px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Bookings</div>
              <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Revenue</div>
              <div className="text-2xl font-bold text-emerald-600">$87,500</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Pending Payments</div>
              <div className="text-2xl font-bold text-orange-600">$48,500</div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to <span className="font-medium">5</span> of{' '}
              <span className="font-medium">5</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
              <button className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary-600 text-sm font-medium text-white">
                1
              </button>
              <button className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Add/Edit Booking Modal */}
      <Modal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title={editingBooking ? 'Edit Booking' : 'New Booking'}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          console.log('Booking saved:', formData);
          setShowAddModal(false);
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Name *</label>
            <input
              type="text"
              required
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Select or enter client name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue *</label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({...formData, venue: e.target.value})}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Select or enter venue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
            <input
              type="text"
              required
              value={formData.event}
              onChange={(e) => setFormData({...formData, event: e.target.value})}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Wedding, Corporate Event, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                className="block w-full px-3 py-2 rounded-md border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                className="block w-full px-3 py-2 rounded-md border border-gray-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount ($) *</label>
            <input
              type="number"
              required
              value={formData.totalAmount}
              onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="5000"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingBooking ? 'Update Booking' : 'Create Booking'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewId !== null}
        onClose={() => setViewId(null)}
        title="Booking Details"
        maxWidthClass="max-w-2xl"
      >
        {viewId && bookingsList.find(b => b.id === viewId) && (() => {
          const booking = bookingsList.find(b => b.id === viewId)!;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Booking ID</label>
                  <p className="text-base font-semibold text-gray-900">{booking.bookingId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Client</label>
                  <p className="text-base text-gray-900">{booking.client}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Venue</label>
                  <p className="text-base text-gray-900">{booking.venue}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Event</label>
                  <p className="text-base text-gray-900">{booking.event}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <p className="text-base text-gray-900">{booking.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Time</label>
                  <p className="text-base text-gray-900">{booking.time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Total Amount</label>
                  <p className="text-lg font-bold text-gray-900">{booking.totalAmount}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Deposit Paid</label>
                  <p className="text-base text-green-600 font-semibold">{booking.depositPaid}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Remaining</label>
                  <p className="text-base text-red-600 font-semibold">{booking.remaining}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Payment Status</label>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${getPaymentStatusColor(booking.paymentStatus)}`}>
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button onClick={() => setViewId(null)} className="btn-primary">
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Confirm Delete"
        maxWidthClass="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete this booking? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Bookings;
