import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiSearch, FiUsers, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Hall {
  id: number;
  venueId: number;
  venueName: string;
  name: string;
  capacity: number;
  description?: string;
  pricePerHour?: number;
  isActive: boolean;
  eventCount: number;
}

interface Venue {
  id: number;
  name: string;
}

interface HallFormData {
  venueId: number;
  name: string;
  capacity: number;
  description: string;
  pricePerHour: string;
}

const Halls: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  const [halls, setHalls] = useState<Hall[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHall, setEditingHall] = useState<Hall | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<number | 'all'>('all');

  const [formData, setFormData] = useState<HallFormData>({
    venueId: user?.venueId ?? 0,
    name: '',
    capacity: 100,
    description: '',
    pricePerHour: '',
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hallsRes, venuesRes] = await Promise.all([
        fetch('/api/Halls', { headers: authHeaders }),
        fetch('/api/Venues', { headers: authHeaders }),
      ]);

      if (hallsRes.ok) {
        setHalls(await hallsRes.json());
      }
      if (venuesRes.ok) {
        setVenues(await venuesRes.json());
      }
    } catch {
      toast.error('Failed to load halls');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.venueId || formData.capacity < 1) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      venueId: formData.venueId,
      name: formData.name,
      capacity: formData.capacity,
      description: formData.description || undefined,
      pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined,
    };

    try {
      const url = editingHall ? `/api/Halls/${editingHall.id}` : '/api/Halls';
      const method = editingHall ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(editingHall ? { ...payload, isActive: true } : payload),
      });

      if (response.ok) {
        toast.success(editingHall ? 'Hall updated' : 'Hall created');
        setShowModal(false);
        resetForm();
        loadData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Failed to save hall');
      }
    } catch {
      toast.error('Failed to save hall');
    }
  };

  const handleEdit = (hall: Hall) => {
    setEditingHall(hall);
    setFormData({
      venueId: hall.venueId,
      name: hall.name,
      capacity: hall.capacity,
      description: hall.description ?? '',
      pricePerHour: hall.pricePerHour?.toString() ?? '',
    });
    setShowModal(true);
  };

  const handleToggleActive = async (hall: Hall) => {
    try {
      const response = await fetch(`/api/Halls/${hall.id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ isActive: !hall.isActive }),
      });
      if (response.ok) {
        toast.success(hall.isActive ? 'Hall deactivated' : 'Hall activated');
        loadData();
      }
    } catch {
      toast.error('Failed to update hall');
    }
  };

  const handleDelete = async (hall: Hall) => {
    if (hall.eventCount > 0) {
      toast.error('Cannot delete hall with existing events');
      return;
    }
    if (!confirm(`Delete "${hall.name}"? This cannot be undone.`)) return;

    try {
      const response = await fetch(`/api/Halls/${hall.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.ok) {
        toast.success('Hall deleted');
        loadData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Failed to delete hall');
      }
    } catch {
      toast.error('Failed to delete hall');
    }
  };

  const resetForm = () => {
    setEditingHall(null);
    setFormData({
      venueId: user?.venueId ?? 0,
      name: '',
      capacity: 100,
      description: '',
      pricePerHour: '',
    });
  };

  const filteredHalls = halls.filter(hall => {
    const matchesSearch = hall.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hall.venueName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVenue = selectedVenue === 'all' || hall.venueId === selectedVenue;
    return matchesSearch && matchesVenue;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Halls</h1>
          <p className="text-gray-600 mt-1">Manage halls within your marques</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Hall
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search halls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full focus:outline-none"
            />
          </div>
          {isOwner && (
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="input focus:outline-none"
            >
              <option value="all">All Marques</option>
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Halls List */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading halls...</p>
        </div>
      ) : filteredHalls.length === 0 ? (
        <div className="card p-8 text-center">
          <FiGrid className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No halls found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHalls.map(hall => (
            <div
              key={hall.id}
              className={`card p-6 hover:shadow-lg transition-shadow ${!hall.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                  <FiGrid className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(hall)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => handleDelete(hall)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      title="Delete"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-600" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{hall.name}</h3>
                  <p className="text-sm text-primary-600">{hall.venueName}</p>
                </div>

                {hall.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{hall.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600 pt-1">
                  <span className="flex items-center gap-1">
                    <FiUsers className="w-4 h-4" />
                    {hall.capacity.toLocaleString()} guests
                  </span>
                  {hall.pricePerHour && (
                    <span className="flex items-center gap-1">
                      <FiDollarSign className="w-4 h-4" />
                      ₨{hall.pricePerHour.toLocaleString()}/hr
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    hall.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {hall.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {hall.eventCount > 0 && (
                    <span className="text-xs text-gray-500">{hall.eventCount} events</span>
                  )}
                  <button
                    onClick={() => handleToggleActive(hall)}
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {hall.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => { setShowModal(false); resetForm(); }}
        >
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingHall ? 'Edit Hall' : 'Add New Hall'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isOwner && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => setFormData({ ...formData, venueId: Number(e.target.value) })}
                    className="input w-full"
                    required
                    disabled={!!editingHall}
                  >
                    <option value={0}>Select a marque</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hall Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Main Banquet Hall"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (guests) *</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                  className="input w-full"
                  min={1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour (₨)</label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  className="input w-full"
                  placeholder="Optional"
                  min={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input w-full"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingHall ? 'Update' : 'Create'} Hall
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Halls;
