import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiPhone, FiMapPin, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

interface Worker {
  id: number;
  name: string;
  phone: string;
  address: string;
  venueId: number;
  venueName?: string;
  createdAt?: string;
}

interface Venue {
  id: number;
  name: string;
}

interface WorkerFormData {
  name: string;
  phone: string;
  address: string;
  venueId: number;
}

const Workers: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<number | 'all'>('all');
  
  const [formData, setFormData] = useState<WorkerFormData>({
    name: '',
    phone: '',
    address: '',
    venueId: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [workersRes, venuesRes] = await Promise.all([
        fetch('/api/Workers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/Venues', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (workersRes.ok) {
        const workersData = await workersRes.json();
        setWorkers(workersData);
      } else if (workersRes.status === 403) {
        toast.error('Access denied. Admin privileges required to view workers.');
      }

      if (venuesRes.ok) {
        const venuesData = await venuesRes.json();
        setVenues(venuesData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.address || !formData.venueId) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const url = editingWorker
        ? `/api/Workers/${editingWorker.id}`
        : '/api/Workers';
      const method = editingWorker ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingWorker ? 'Worker updated successfully' : 'Worker added successfully');
        setShowModal(false);
        resetForm();
        loadData();
      } else if (response.status === 403) {
        toast.error('Access denied. Admin privileges required.');
      } else {
        try {
          const error = await response.json();
          toast.error(error.message || 'Failed to save worker');
        } catch {
          toast.error('Failed to save worker');
        }
      }
    } catch (error) {
      console.error('Failed to save worker:', error);
      toast.error('Failed to save worker');
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone,
      address: worker.address,
      venueId: worker.venueId,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this worker?')) return;

    try {
      const response = await fetch(`/api/Workers/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast.success('Worker deleted successfully');
        loadData();
      } else {
        toast.error('Failed to delete worker');
      }
    } catch (error) {
      console.error('Failed to delete worker:', error);
      toast.error('Failed to delete worker');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      address: '',
      venueId: 0,
    });
    setEditingWorker(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         worker.phone.includes(searchTerm);
    const matchesVenue = selectedVenue === 'all' || worker.venueId === selectedVenue;
    return matchesSearch && matchesVenue;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venue Workers</h1>
          <p className="text-gray-600 mt-1">Manage workers assigned to venues</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Worker
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full focus:outline-none"
            />
          </div>

          {/* Venue Filter */}
          <select
            value={selectedVenue}
            onChange={(e) => setSelectedVenue(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="input focus:outline-none"
          >
            <option value="all">All Venues</option>
            {venues.map(venue => (
              <option key={venue.id} value={venue.id}>{venue.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers List */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workers...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="card p-8 text-center">
          <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No workers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map(worker => (
            <div key={worker.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Worker Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-primary-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(worker)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit worker"
                  >
                    <FiEdit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(worker.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Delete worker"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Worker Details */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                  <p className="text-sm text-primary-600">{worker.venueName || 'Unknown Venue'}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span>{worker.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="flex-1">{worker.address}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingWorker ? 'Edit Worker' : 'Add New Worker'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Enter worker name"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input w-full"
                  placeholder="Enter phone number"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input w-full"
                  placeholder="Enter address"
                  rows={3}
                  required
                />
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Venue *
                </label>
                <select
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: Number(e.target.value) })}
                  className="input w-full"
                  required
                >
                  <option value={0}>Select a venue</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn-primary"
                >
                  {editingWorker ? 'Update' : 'Add'} Worker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
