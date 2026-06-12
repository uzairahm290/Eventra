import React, { useEffect, useState } from 'react';
import {
  FiPlus, FiSearch, FiUser, FiCalendar, FiCheck, FiX,
  FiEye, FiDollarSign, FiPhone, FiMapPin, FiUsers,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Booking {
  id: number;
  bookingReference: string;
  bookingDate: string;
  status: string;
  clientId: number;
  clientName: string;
  clientPhone?: string;
  clientCNIC?: string;
  hallId?: number;
  hallName?: string;
  marqueName?: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  numberOfGuests: number;
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  paymentMethod?: string;
  isCheckedIn: boolean;
  isApprovedByAdmin: boolean;
  specialRequests?: string;
  cancellationReason?: string;
  createdAt: string;
}

interface Client {
  id: number;
  firstName: string;
  secondName: string;
  phone?: string;
  email?: string;
  cNIC?: string;
}

interface Hall {
  id: number;
  venueId: number;
  venueName: string;
  name: string;
  capacity: number;
}

interface Venue {
  id: number;
  name: string;
}

interface EventItem {
  id: number;
  title: string;
  date: string;
  venueId?: number;
}

interface BookingFormData {
  clientId: number;
  clientSearch: string;
  newClientMode: boolean;
  newClientFirstName: string;
  newClientLastName: string;
  newClientPhone: string;
  newClientEmail: string;
  newClientCNIC: string;
  venueId: number;
  hallId: number;
  eventId: number;
  numberOfGuests: string;
  totalAmount: string;
  depositAmount: string;
  paymentMethod: string;
  specialRequests: string;
}

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'JazzCash', 'EasyPaisa', 'Online Transfer', 'Other'];

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  CheckedIn: 'bg-blue-100 text-blue-800',
};

const PAYMENT_BADGE: Record<string, string> = {
  Paid: 'bg-emerald-100 text-emerald-800',
  Partial: 'bg-orange-100 text-orange-800',
  Unpaid: 'bg-red-100 text-red-800',
};

const getPaymentStatus = (b: Booking) => {
  if (b.totalAmount > 0 && b.amountPaid >= b.totalAmount) return 'Paid';
  if (b.amountPaid > 0) return 'Partial';
  return 'Unpaid';
};

const fmt = (n: number) => `₨${n.toLocaleString('en-PK')}`;

const makeDefaultForm = (venueId?: number): BookingFormData => ({
  clientId: 0,
  clientSearch: '',
  newClientMode: false,
  newClientFirstName: '',
  newClientLastName: '',
  newClientPhone: '',
  newClientEmail: '',
  newClientCNIC: '',
  venueId: venueId ?? 0,
  hallId: 0,
  eventId: 0,
  numberOfGuests: '1',
  totalAmount: '',
  depositAmount: '',
  paymentMethod: 'Cash',
  specialRequests: '',
});

const Bookings: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVenue, setFilterVenue] = useState<number | 'all'>('all');

  const [showModal, setShowModal] = useState(false);
  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentTxId, setPaymentTxId] = useState('');

  const [formData, setFormData] = useState<BookingFormData>(makeDefaultForm(isOwner ? undefined : user?.venueId));

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  };

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const requests: Promise<Response>[] = [
        fetch('/api/Bookings', { headers: authHeaders }),
        fetch('/api/Clients', { headers: authHeaders }),
        fetch('/api/Halls', { headers: authHeaders }),
        fetch('/api/Event', { headers: authHeaders }),
      ];
      if (isOwner) requests.push(fetch('/api/Venues', { headers: authHeaders }));

      const [bookingsRes, clientsRes, hallsRes, eventsRes, venuesRes] = await Promise.all(requests);

      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (clientsRes.ok) setClients(await clientsRes.json());
      if (hallsRes.ok) setHalls(await hallsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (venuesRes?.ok) setVenues(await venuesRes.json());
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formVenueId = isOwner ? formData.venueId : (user?.venueId ?? 0);
  const formHalls = formVenueId ? halls.filter(h => h.venueId === formVenueId) : halls;
  const formEvents = formVenueId ? events.filter(e => e.venueId === formVenueId) : events;
  const searchedClients = formData.clientSearch.trim()
    ? clients.filter(c =>
        `${c.firstName} ${c.secondName}`.toLowerCase().includes(formData.clientSearch.toLowerCase()) ||
        (c.phone ?? '').includes(formData.clientSearch) ||
        (c.cNIC ?? '').includes(formData.clientSearch)
      )
    : clients;

  const update = (patch: Partial<BookingFormData>) => setFormData(f => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let clientId = formData.clientId;

      if (formData.newClientMode) {
        if (!formData.newClientFirstName || !formData.newClientPhone) {
          toast.error('Client name and phone are required');
          setSaving(false);
          return;
        }
        const clientRes = await fetch('/api/Clients', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            firstName: formData.newClientFirstName,
            secondName: formData.newClientLastName,
            phone: formData.newClientPhone,
            email: formData.newClientEmail || undefined,
            cnic: formData.newClientCNIC || undefined,
          }),
        });
        if (!clientRes.ok) {
          const err = await clientRes.json().catch(() => ({}));
          toast.error((err as { message?: string }).message || 'Failed to create client');
          setSaving(false);
          return;
        }
        const newClient: Client = await clientRes.json();
        clientId = newClient.id;
        setClients(prev => [...prev, newClient]);
      }

      if (!clientId) { toast.error('Please select or add a client'); setSaving(false); return; }
      if (!formData.eventId) { toast.error('Please select an event'); setSaving(false); return; }

      const res = await fetch('/api/Bookings', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          clientId,
          eventId: formData.eventId,
          hallId: formData.hallId || undefined,
          numberOfGuests: parseInt(formData.numberOfGuests) || 1,
          totalAmount: parseFloat(formData.totalAmount) || 0,
          depositAmount: parseFloat(formData.depositAmount) || 0,
          paymentMethod: formData.paymentMethod || undefined,
          specialRequests: formData.specialRequests || undefined,
        }),
      });

      if (res.ok) {
        toast.success('Booking created');
        setShowModal(false);
        setFormData(makeDefaultForm(isOwner ? undefined : user?.venueId));
        loadAll();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { message?: string }).message || 'Failed to create booking');
      }
    } catch {
      toast.error('Failed to create booking');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (id: number) => {
    const res = await fetch(`/api/Bookings/${id}/approve`, { method: 'POST', headers: authHeaders });
    if (res.ok) { toast.success('Booking approved'); loadAll(); }
    else toast.error('Failed to approve');
  };

  const handleReject = async (id: number) => {
    if (!confirm('Reject this booking?')) return;
    const res = await fetch(`/api/Bookings/${id}/reject`, { method: 'POST', headers: authHeaders });
    if (res.ok) { toast.success('Booking rejected'); loadAll(); }
    else toast.error('Failed to reject');
  };

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return;
    const res = await fetch(`/api/Bookings/${id}`, { method: 'DELETE', headers: authHeaders });
    if (res.ok) { toast.success('Booking cancelled'); loadAll(); }
    else toast.error('Failed to cancel');
  };

  const handlePayment = async () => {
    if (!paymentBooking || !paymentAmount) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/Bookings/${paymentBooking.id}/payment`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          bookingId: paymentBooking.id,
          amount: parseFloat(paymentAmount),
          paymentMethod,
          transactionId: paymentTxId || undefined,
        }),
      });
      if (res.ok) {
        toast.success('Payment recorded');
        setPaymentBooking(null);
        loadAll();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { message?: string }).message || 'Failed to record payment');
      }
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSaving(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      b.bookingReference.toLowerCase().includes(q) ||
      b.clientName.toLowerCase().includes(q) ||
      (b.clientPhone ?? '').includes(searchTerm) ||
      (b.clientCNIC ?? '').includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchesVenue = filterVenue === 'all' ||
      b.marqueName === venues.find(v => v.id === filterVenue)?.name;
    return matchesSearch && matchesStatus && matchesVenue;
  });

  const totalPaid = bookings.reduce((s, b) => s + b.amountPaid, 0);
  const totalBalance = bookings.reduce((s, b) => s + (b.totalAmount - b.amountPaid), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-600 mt-1">Manage hall bookings and client reservations</p>
        </div>
        <button
          onClick={() => { setFormData(makeDefaultForm(isOwner ? undefined : user?.venueId)); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-emerald-600">{fmt(totalPaid)}</p>
          <p className="text-sm text-gray-500">Collected</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xl font-bold text-orange-600">{fmt(totalBalance)}</p>
          <p className="text-sm text-gray-500">Balance Due</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search client, ref, CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full focus:outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="CheckedIn">Checked In</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          {isOwner && (
            <select
              value={filterVenue}
              onChange={(e) => setFilterVenue(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="input focus:outline-none"
            >
              <option value="all">All Marques</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card p-8 text-center">
          <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No bookings found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ref</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Hall / Marque</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Guests</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBookings.map(b => {
                  const payStatus = getPaymentStatus(b);
                  const balance = b.totalAmount - b.amountPaid;
                  return (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-primary-600">{b.bookingReference}</div>
                        <div className="text-xs text-gray-400">{new Date(b.bookingDate).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                            <FiUser className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{b.clientName}</div>
                            {b.clientPhone && (
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <FiPhone className="w-3 h-3" />{b.clientPhone}
                              </div>
                            )}
                            {b.clientCNIC && <div className="text-xs text-gray-400">{b.clientCNIC}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{b.hallName ?? '—'}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FiMapPin className="w-3 h-3" />{b.marqueName ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">{b.eventTitle}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <FiCalendar className="w-3 h-3" />
                          {new Date(b.eventDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <FiUsers className="w-3 h-3 text-gray-400" />
                          {b.numberOfGuests.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-gray-900">{fmt(b.totalAmount)}</div>
                        {b.depositAmount > 0 && (
                          <div className="text-xs text-gray-400">Deposit: {fmt(b.depositAmount)}</div>
                        )}
                        {balance > 0 && (
                          <div className="text-xs text-red-600 font-medium">Due: {fmt(balance)}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${PAYMENT_BADGE[payStatus] ?? 'bg-gray-100 text-gray-700'}`}>
                          {payStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[b.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {b.status}
                        </span>
                        {!b.isApprovedByAdmin && b.status !== 'Cancelled' && (
                          <div className="text-xs text-yellow-600 mt-0.5">Needs approval</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewBooking(b)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title="View details"
                          >
                            <FiEye className="w-4 h-4 text-blue-600" />
                          </button>
                          {!b.isApprovedByAdmin && b.status !== 'Cancelled' && (
                            <>
                              <button
                                onClick={() => handleApprove(b.id)}
                                className="p-1.5 hover:bg-green-50 rounded"
                                title="Approve"
                              >
                                <FiCheck className="w-4 h-4 text-green-600" />
                              </button>
                              <button
                                onClick={() => handleReject(b.id)}
                                className="p-1.5 hover:bg-red-50 rounded"
                                title="Reject"
                              >
                                <FiX className="w-4 h-4 text-red-500" />
                              </button>
                            </>
                          )}
                          {balance > 0 && b.status !== 'Cancelled' && (
                            <button
                              onClick={() => { setPaymentBooking(b); setPaymentAmount(''); setPaymentMethod('Cash'); setPaymentTxId(''); }}
                              className="p-1.5 hover:bg-emerald-50 rounded"
                              title="Record payment"
                            >
                              <FiDollarSign className="w-4 h-4 text-emerald-600" />
                            </button>
                          )}
                          {b.status !== 'Cancelled' && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              className="p-1.5 hover:bg-red-50 rounded"
                              title="Cancel booking"
                            >
                              <FiX className="w-4 h-4 text-gray-400 hover:text-red-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">New Booking</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Client Section */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-1 flex items-center gap-1">
                  <FiUser className="w-3.5 h-3.5" /> Client
                </legend>

                {!formData.newClientMode ? (
                  <>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by name, phone, or CNIC..."
                        value={formData.clientSearch}
                        onChange={(e) => update({ clientSearch: e.target.value, clientId: 0 })}
                        className="input pl-9 w-full"
                        autoComplete="off"
                      />
                    </div>

                    {formData.clientSearch && formData.clientId === 0 && searchedClients.length > 0 && (
                      <div className="border border-gray-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-gray-100">
                        {searchedClients.slice(0, 8).map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => update({ clientId: c.id, clientSearch: `${c.firstName} ${c.secondName}` })}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {c.firstName} {c.secondName}
                              </span>
                              {c.phone && <span className="text-xs text-gray-500 ml-2">{c.phone}</span>}
                            </div>
                            {c.cNIC && <span className="text-xs text-gray-400">{c.cNIC}</span>}
                          </button>
                        ))}
                      </div>
                    )}

                    {formData.clientId > 0 ? (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <FiCheck className="w-4 h-4" /> Client selected
                        <button
                          type="button"
                          onClick={() => update({ clientId: 0, clientSearch: '' })}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => update({ newClientMode: true, clientId: 0, clientSearch: '' })}
                        className="text-sm text-primary-600 hover:underline flex items-center gap-1"
                      >
                        <FiPlus className="w-3 h-3" /> Add new client
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">First Name *</label>
                        <input
                          type="text"
                          value={formData.newClientFirstName}
                          onChange={(e) => update({ newClientFirstName: e.target.value })}
                          className="input w-full"
                          placeholder="Ahmad"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={formData.newClientLastName}
                          onChange={(e) => update({ newClientLastName: e.target.value })}
                          className="input w-full"
                          placeholder="Khan"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={formData.newClientPhone}
                          onChange={(e) => update({ newClientPhone: e.target.value })}
                          className="input w-full"
                          placeholder="0300-1234567"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">CNIC</label>
                        <input
                          type="text"
                          value={formData.newClientCNIC}
                          onChange={(e) => update({ newClientCNIC: e.target.value })}
                          className="input w-full"
                          placeholder="42101-1234567-1"
                          maxLength={20}
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.newClientEmail}
                          onChange={(e) => update({ newClientEmail: e.target.value })}
                          className="input w-full"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => update({ newClientMode: false })}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      ← Back to search
                    </button>
                  </>
                )}
              </fieldset>

              {/* Location & Event Section */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-1 flex items-center gap-1">
                  <FiMapPin className="w-3.5 h-3.5" /> Location & Event
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isOwner && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Marque *</label>
                      <select
                        value={formData.venueId}
                        onChange={(e) => update({ venueId: Number(e.target.value), hallId: 0, eventId: 0 })}
                        className="input w-full"
                        required
                      >
                        <option value={0}>Select marque</option>
                        {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Hall</label>
                    <select
                      value={formData.hallId}
                      onChange={(e) => update({ hallId: Number(e.target.value) })}
                      className="input w-full"
                    >
                      <option value={0}>No specific hall</option>
                      {formHalls.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.name} ({h.capacity.toLocaleString()} guests)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={isOwner ? 'md:col-span-2' : ''}>
                    <label className="block text-xs text-gray-600 mb-1">Event *</label>
                    <select
                      value={formData.eventId}
                      onChange={(e) => update({ eventId: Number(e.target.value) })}
                      className="input w-full"
                      required
                    >
                      <option value={0}>Select event</option>
                      {formEvents.map(ev => (
                        <option key={ev.id} value={ev.id}>
                          {ev.title} — {new Date(ev.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </fieldset>

              {/* Booking Details Section */}
              <fieldset className="border border-gray-200 rounded-lg p-4 space-y-3">
                <legend className="text-sm font-semibold text-gray-700 px-1 flex items-center gap-1">
                  <FiDollarSign className="w-3.5 h-3.5" /> Booking Details
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Guests *</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.numberOfGuests}
                      onChange={(e) => update({ numberOfGuests: e.target.value })}
                      className="input w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => update({ paymentMethod: e.target.value })}
                      className="input w-full"
                    >
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Total Amount (₨) *</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.totalAmount}
                      onChange={(e) => update({ totalAmount: e.target.value })}
                      className="input w-full"
                      placeholder="0"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Deposit Received (₨)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.depositAmount}
                      onChange={(e) => update({ depositAmount: e.target.value })}
                      className="input w-full"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 mb-1">Special Requests</label>
                    <textarea
                      value={formData.specialRequests}
                      onChange={(e) => update({ specialRequests: e.target.value })}
                      className="input w-full"
                      rows={2}
                      placeholder="Any special requirements or notes..."
                    />
                  </div>
                </div>
              </fieldset>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">
                  {saving ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewBooking(null)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button onClick={() => setViewBooking(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-0 text-sm divide-y divide-gray-100">
              {[
                { label: 'Reference', value: <span className="font-semibold text-primary-600">{viewBooking.bookingReference}</span> },
                { label: 'Date', value: new Date(viewBooking.bookingDate).toLocaleString() },
                {
                  label: 'Client',
                  value: (
                    <div className="text-right">
                      <div className="font-medium">{viewBooking.clientName}</div>
                      {viewBooking.clientPhone && <div className="text-xs text-gray-400">{viewBooking.clientPhone}</div>}
                      {viewBooking.clientCNIC && <div className="text-xs text-gray-400">{viewBooking.clientCNIC}</div>}
                    </div>
                  ),
                },
                {
                  label: 'Hall / Marque',
                  value: (
                    <div className="text-right">
                      <div>{viewBooking.hallName ?? '—'}</div>
                      <div className="text-xs text-gray-400">{viewBooking.marqueName ?? '—'}</div>
                    </div>
                  ),
                },
                {
                  label: 'Event',
                  value: (
                    <div className="text-right">
                      <div>{viewBooking.eventTitle}</div>
                      <div className="text-xs text-gray-400">{new Date(viewBooking.eventDate).toLocaleDateString()}</div>
                    </div>
                  ),
                },
                { label: 'Guests', value: viewBooking.numberOfGuests.toLocaleString() },
                { label: 'Total Amount', value: <span className="font-semibold">{fmt(viewBooking.totalAmount)}</span> },
                { label: 'Deposit', value: fmt(viewBooking.depositAmount) },
                { label: 'Paid', value: <span className="text-emerald-600 font-semibold">{fmt(viewBooking.amountPaid)}</span> },
                { label: 'Balance Due', value: <span className="text-red-600 font-semibold">{fmt(viewBooking.totalAmount - viewBooking.amountPaid)}</span> },
                {
                  label: 'Status',
                  value: (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[viewBooking.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {viewBooking.status}
                    </span>
                  ),
                },
                ...(viewBooking.specialRequests
                  ? [{ label: 'Special Requests', value: viewBooking.specialRequests }]
                  : []),
                ...(viewBooking.cancellationReason
                  ? [{ label: 'Cancellation Reason', value: viewBooking.cancellationReason }]
                  : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2.5">
                  <span className="text-gray-500 shrink-0 mr-4">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setViewBooking(null)} className="mt-5 w-full btn-primary">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentBooking && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setPaymentBooking(null)}
        >
          <div
            className="bg-white rounded-lg max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
              <button onClick={() => setPaymentBooking(null)} className="text-gray-400 hover:text-gray-600">
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {paymentBooking.clientName} — Balance:{' '}
              <span className="font-semibold text-red-600">
                {fmt(paymentBooking.totalAmount - paymentBooking.amountPaid)}
              </span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received (₨) *</label>
                <input
                  type="number"
                  min={1}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input w-full"
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input w-full"
                >
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <input
                  type="text"
                  value={paymentTxId}
                  onChange={(e) => setPaymentTxId(e.target.value)}
                  className="input w-full"
                  placeholder="Optional"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentBooking(null)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={saving || !paymentAmount}
                  className="flex-1 btn-primary"
                >
                  {saving ? 'Saving...' : 'Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;
