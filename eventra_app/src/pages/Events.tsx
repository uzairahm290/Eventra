import React, { useMemo, useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiFilter, FiCalendar, FiUsers, FiMapPin, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Modal from '../components/Modal';
import { eventService, EventCategory, EventStatus } from '../services';
import type { Event } from '../services';

const Events: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [openEditId, setOpenEditId] = useState<number | 'new' | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get category name from enum value
  const getCategoryName = (category: EventCategory): string => {
    return Object.keys(EventCategory).find(key => EventCategory[key as keyof typeof EventCategory] === category) || 'Other';
  };

  // Helper to get status name from enum value
  const getStatusName = (status: EventStatus): string => {
    return Object.keys(EventStatus).find(key => EventStatus[key as keyof typeof EventStatus] === status) || 'Draft';
  };

  // Fetch events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const events = await eventService.getAllEvents();
      setItems(events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  /* Old static data - keeping for reference
  const [itemsOld] = useState(() => ([
    {
      id: 1,
      name: 'Corporate Gala 2025',
      type: 'Corporate',
      date: '2025-11-25',
      time: '18:00 - 23:00',
      venue: 'Grand Ballroom',
      client: 'Tech Corp Inc.',
      guests: 200,
      status: 'Confirmed',
      budget: '$15,000',
    },
    {
      id: 2,
      name: 'Johnson Wedding',
      type: 'Wedding',
      date: '2025-12-05',
      time: '14:00 - 22:00',
      venue: 'Garden Pavilion',
      client: 'Sarah Johnson',
      guests: 150,
      status: 'Pending',
      budget: '$12,000',
    },
    {
      id: 3,
      name: 'Tech Conference 2025',
      type: 'Conference',
      date: '2025-12-12',
      time: '09:00 - 18:00',
      venue: 'Convention Center',
      client: 'Innovation Labs',
      guests: 500,
      status: 'Confirmed',
      budget: '$35,000',
    },
    {
      id: 4,
      name: 'Birthday Bash',
      type: 'Birthday',
      date: '2025-11-30',
      time: '19:00 - 23:00',
      venue: 'Rooftop Terrace',
      client: 'Michael Chen',
      guests: 75,
      status: 'Confirmed',
      budget: '$5,500',
    },
    {
      id: 5,
      name: 'Charity Fundraiser',
      type: 'Fundraiser',
      date: '2025-12-20',
      time: '17:00 - 21:00',
      venue: 'Grand Ballroom',
      client: 'Hope Foundation',
      guests: 300,
      status: 'Planned',
      budget: '$20,000',
    },
  ]));
  */

  const currentEditing = useMemo(() =>
    openEditId && openEditId !== 'new' ? items.find(e => e.id === openEditId) : null,
  [openEditId, items]);

  const filtered = useMemo(() => {
    return items.filter((e) => {
      const matchText = `${e.title} ${getCategoryName(e.category)} ${e.location} ${e.organizerName || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' ? true : getStatusName(e.status).toLowerCase() === filterStatus;
      return matchText && matchStatus;
    });
  }, [items, searchTerm, filterStatus]);

  const handleSave = async (data: Partial<Event>) => {
    try {
      // Validate required fields
      if (!data.title || !data.date || !data.location || !data.description || data.maxAttendees === undefined || data.category === undefined || data.status === undefined) {
        console.error('Missing required fields');
        return;
      }

      if (openEditId === 'new') {
        await eventService.createEvent({
          title: data.title,
          date: data.date,
          location: data.location,
          description: data.description,
          maxAttendees: data.maxAttendees,
          category: data.category,
          status: data.status,
          isFree: data.isFree ?? true,
          requiresApproval: data.requiresApproval ?? false,
          isPublic: data.isPublic ?? true,
          endDate: data.endDate,
          venueId: data.venueId,
          imageUrl: data.imageUrl,
          ticketPrice: data.ticketPrice,
          organizerName: data.organizerName,
          organizerEmail: data.organizerEmail,
          organizerPhone: data.organizerPhone,
        });
      } else if (typeof openEditId === 'number') {
        await eventService.updateEvent({
          id: openEditId,
          title: data.title,
          date: data.date,
          location: data.location,
          description: data.description,
          maxAttendees: data.maxAttendees,
          category: data.category,
          status: data.status,
          isFree: data.isFree ?? true,
          requiresApproval: data.requiresApproval ?? false,
          isPublic: data.isPublic ?? true,
          endDate: data.endDate,
          venueId: data.venueId,
          imageUrl: data.imageUrl,
          ticketPrice: data.ticketPrice,
          organizerName: data.organizerName,
          organizerEmail: data.organizerEmail,
          organizerPhone: data.organizerPhone,
        });
      }
      await loadEvents();
      setOpenEditId(null);
    } catch (error) {
      console.error('Failed to save event:', error);
      alert('Failed to save event');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await eventService.deleteEvent(deleteId);
        await loadEvents();
        setDeleteId(null);
      } catch (error) {
        console.error('Failed to delete event:', error);
        alert('Failed to delete event');
      }
    }
  };

  const getStatusColor = (status: EventStatus) => {
    switch (status) {
      case EventStatus.Published:
        return 'bg-green-100 text-green-800';
      case EventStatus.Draft:
        return 'bg-yellow-100 text-yellow-800';
      case EventStatus.InProgress:
        return 'bg-blue-100 text-blue-800';
      case EventStatus.Cancelled:
        return 'bg-red-100 text-red-800';
      case EventStatus.Completed:
        return 'bg-gray-100 text-gray-800';
      case EventStatus.Postponed:
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (category: EventCategory) => {
    switch (category) {
      case EventCategory.Corporate:
        return 'bg-blue-50 text-blue-700';
      case EventCategory.Wedding:
        return 'bg-pink-50 text-pink-700';
      case EventCategory.Conference:
        return 'bg-indigo-50 text-indigo-700';
      case EventCategory.Birthday:
        return 'bg-orange-50 text-orange-700';
      case EventCategory.Festival:
        return 'bg-green-50 text-green-700';
      case EventCategory.Workshop:
        return 'bg-purple-50 text-purple-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Events</h1>
          <p className="mt-2 text-gray-600">Manage and organize all your events</p>
        </div>
        <button onClick={() => setOpenEditId('new')} className="mt-4 sm:mt-0 btn-primary flex items-center">
          <FiPlus className="mr-2 h-5 w-5" />
          Create Event
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
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <FiFilter className="h-5 w-5 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="planned">Planned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Loading events...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No events found
                  </td>
                </tr>
              ) : (
                filtered.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getTypeColor(event.category)}`}>
                            {getCategoryName(event.category)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiCalendar className="mr-2 h-4 w-4 text-gray-400" />
                        <div>
                          <div>{new Date(event.date).toLocaleDateString()}</div>
                          {event.endDate && (
                            <div className="text-xs text-gray-500">
                              to {new Date(event.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiMapPin className="mr-2 h-4 w-4 text-gray-400" />
                        {event.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {event.organizerName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiUsers className="mr-2 h-4 w-4 text-gray-400" />
                        {event.currentAttendees}/{event.maxAttendees}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusName(event.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {event.isFree ? 'Free' : `$${event.ticketPrice?.toFixed(2) || '0.00'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => setViewId(event.id)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                          <FiEye className="h-4 w-4" />
                        </button>
                        <button onClick={() => setOpenEditId(event.id)} className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50">
                          <FiEdit className="h-4 w-4" />
                        </button>
                        <button onClick={() => setDeleteId(event.id)} className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="btn-secondary px-4 py-2 text-sm">Previous</button>
            <button className="btn-secondary px-4 py-2 text-sm">Next</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
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
      </div>
      {/* Create/Edit Modal */}
      <Modal
        open={openEditId !== null}
        onClose={() => setOpenEditId(null)}
        title={openEditId === 'new' ? 'Create Event' : 'Edit Event'}
        maxWidthClass="max-w-2xl"
      >
        <EventForm
          key={openEditId ?? 'none'}
          initial={openEditId === 'new' ? undefined : currentEditing || undefined}
          onCancel={() => setOpenEditId(null)}
          onSave={handleSave}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewId !== null}
        onClose={() => setViewId(null)}
        title="Event Details"
        maxWidthClass="max-w-2xl"
      >
        {viewId && items.find(e => e.id === viewId) && (() => {
          const event = items.find(e => e.id === viewId)!;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Title</label>
                  <p className="text-base font-semibold text-gray-900">{event.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium bg-purple-100 text-purple-800`}>
                    {getCategoryName(event.category)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <p className="text-base text-gray-900">{event.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">End Date</label>
                  <p className="text-base text-gray-900">{event.endDate || 'Same day'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                  <p className="text-base text-gray-900">{event.location}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Organizer</label>
                  <p className="text-base text-gray-900">{event.organizerName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Max Attendees</label>
                  <p className="text-base text-gray-900">{event.maxAttendees}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${getStatusColor(event.status)}`}>
                    {event.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-sm text-gray-900">{event.description}</p>
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
          <p className="text-gray-700">Are you sure you want to delete this event? This action cannot be undone.</p>
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

export default Events;

  type EventItem = {
    id?: number;
    name: string;
    type: string;
    date: string;
    time: string;
    venue: string;
    client: string;
    guests: number;
    status: string;
    budget: string;
  };

  const EventForm: React.FC<{ initial?: Partial<Event>; onSave: (e: Partial<Event>) => void; onCancel: () => void }>
    = ({ initial, onSave, onCancel }) => {
    const [form, setForm] = useState<EventItem>({
      name: initial?.title ?? '',
      type: 'Corporate', // Will be category in real API
      date: initial?.date ?? new Date().toISOString().slice(0,10),
      time: '09:00 - 18:00', // Not in Event model
      venue: initial?.venueId?.toString() ?? '',
      client: '', // Not in Event model
      guests: initial?.maxAttendees ?? 50,
      status: 'Draft',
      budget: initial?.ticketPrice?.toString() ?? '$0',
    });

    const update = (key: keyof EventItem, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Convert form to Event format - this is a simplified form, real implementation would map properly
      const eventData: Partial<Event> = {
        title: form.name,
        date: form.date,
        location: form.venue,
        description: `${form.type} event`,
        maxAttendees: form.guests,
        category: EventCategory.Conference,
        status: EventStatus.Draft,
        isFree: true,
        requiresApproval: false,
        isPublic: true,
      };
      onSave(eventData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
            <input className="input-field" value={form.name} onChange={e=>update('name', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Type</label>
            <select className="input-field" value={form.type} onChange={e=>update('type', e.target.value)}>
              {['Corporate','Wedding','Conference','Birthday','Fundraiser'].map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Date</label>
            <input type="date" className="input-field" value={form.date} onChange={e=>update('date', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Time</label>
            <input className="input-field" value={form.time} onChange={e=>update('time', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Venue</label>
            <input className="input-field" value={form.venue} onChange={e=>update('venue', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Client</label>
            <input className="input-field" value={form.client} onChange={e=>update('client', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Guests</label>
            <input type="number" className="input-field" value={form.guests} onChange={e=>update('guests', Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Status</label>
            <select className="input-field" value={form.status} onChange={e=>update('status', e.target.value)}>
              {['Planned','Pending','Confirmed','Cancelled','Completed'].map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Budget</label>
            <input className="input-field" value={form.budget} onChange={e=>update('budget', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
          <button type="submit" className="btn-primary">Save</button>
        </div>
      </form>
    );
  };
