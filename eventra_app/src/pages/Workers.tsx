import React, { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiPhone, FiMapPin, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const WORKER_TYPES = ['Waiter', 'Sweeper', 'Accountant', 'Cook', 'Security', 'Driver', 'Cleaner', 'Other'] as const;
type WorkerType = typeof WORKER_TYPES[number];

interface Worker {
  id: number;
  name: string;
  type: string;
  phone: string;
  cnic?: string;
  address: string;
  dailySalary?: number;
  isActive: boolean;
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
  type: WorkerType;
  phone: string;
  cnic: string;
  address: string;
  dailySalary: string;
  venueId: number;
}

const TYPE_COLORS: Record<string, string> = {
  Waiter: 'bg-blue-100 text-blue-700',
  Cook: 'bg-orange-100 text-orange-700',
  Security: 'bg-red-100 text-red-700',
  Sweeper: 'bg-yellow-100 text-yellow-700',
  Accountant: 'bg-purple-100 text-purple-700',
  Driver: 'bg-green-100 text-green-700',
  Cleaner: 'bg-teal-100 text-teal-700',
  Other: 'bg-gray-100 text-gray-700',
};

const Workers: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const [formData, setFormData] = useState<WorkerFormData>({
    name: '',
    type: 'Waiter',
    phone: '',
    cnic: '',
    address: '',
    dailySalary: '',
    venueId: user?.venueId ?? 0,
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
      const [workersRes, venuesRes] = await Promise.all([
        fetch('/api/Workers', { headers: authHeaders }),
        fetch('/api/Venues', { headers: authHeaders }),
      ]);

      if (workersRes.ok) setWorkers(await workersRes.json());
      if (venuesRes.ok) setVenues(await venuesRes.json());
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.venueId) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      type: formData.type,
      phone: formData.phone,
      cnic: formData.cnic || undefined,
      address: formData.address,
      dailySalary: formData.dailySalary ? parseFloat(formData.dailySalary) : undefined,
      venueId: formData.venueId,
    };

    try {
      const url = editingWorker ? `/api/Workers/${editingWorker.id}` : '/api/Workers';
      const method = editingWorker ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingWorker ? 'Worker updated' : 'Worker added');
        setShowModal(false);
        resetForm();
        loadData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Failed to save worker');
      }
    } catch {
      toast.error('Failed to save worker');
    }
  };

  const handleEdit = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      type: (worker.type as WorkerType) || 'Other',
      phone: worker.phone,
      cnic: worker.cnic ?? '',
      address: worker.address,
      dailySalary: worker.dailySalary?.toString() ?? '',
      venueId: worker.venueId,
    });
    setShowModal(true);
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm('Deactivate this worker? Their attendance history will be preserved.')) return;
    try {
      const response = await fetch(`/api/Workers/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (response.ok) {
        toast.success('Worker deactivated');
        loadData();
      } else {
        toast.error('Failed to deactivate worker');
      }
    } catch {
      toast.error('Failed to deactivate worker');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'Waiter',
      phone: '',
      cnic: '',
      address: '',
      dailySalary: '',
      venueId: user?.venueId ?? 0,
    });
    setEditingWorker(null);
  };

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.phone.includes(searchTerm) ||
      (worker.cnic ?? '').includes(searchTerm);
    const matchesVenue = selectedVenue === 'all' || worker.venueId === selectedVenue;
    const matchesType = selectedType === 'all' || worker.type === selectedType;
    return matchesSearch && matchesVenue && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600 mt-1">Manage workers assigned to your marques</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Add Worker
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, CNIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full focus:outline-none"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input focus:outline-none"
          >
            <option value="all">All Types</option>
            {WORKER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {isOwner && (
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="input focus:outline-none"
            >
              <option value="all">All Marques</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Workers List */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading staff...</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="card p-8 text-center">
          <FiUser className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No workers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map(worker => (
            <div
              key={worker.id}
              className={`card p-6 hover:shadow-lg transition-shadow ${!worker.isActive ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(worker)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Edit"
                  >
                    <FiEdit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button
                    onClick={() => handleDeactivate(worker.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Deactivate"
                  >
                    <FiTrash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{worker.name}</h3>
                  <p className="text-sm text-gray-500">{worker.venueName}</p>
                </div>

                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[worker.type] ?? TYPE_COLORS.Other}`}>
                  {worker.type}
                </span>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 text-gray-400" />
                    <span>{worker.phone}</span>
                  </div>
                  {worker.cnic && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-gray-400 text-xs">CNIC</span>
                      <span>{worker.cnic}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="flex-1">{worker.address}</span>
                  </div>
                  {worker.dailySalary !== undefined && (
                    <div className="text-sm text-gray-600">
                      <span className="text-gray-400">Daily:</span> ₨{worker.dailySalary.toLocaleString()}
                    </div>
                  )}
                </div>

                {!worker.isActive && (
                  <span className="text-xs text-red-500 font-medium">Inactive</span>
                )}
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
          <div
            className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingWorker ? 'Edit Worker' : 'Add New Worker'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="Full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkerType })}
                  className="input w-full"
                  required
                >
                  {WORKER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input w-full"
                  placeholder="0300-1234567"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
                <input
                  type="text"
                  value={formData.cnic}
                  onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                  className="input w-full"
                  placeholder="42101-1234567-1"
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input w-full"
                  placeholder="Home address"
                  rows={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Salary (₨)</label>
                <input
                  type="number"
                  value={formData.dailySalary}
                  onChange={(e) => setFormData({ ...formData, dailySalary: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. 800"
                  min={0}
                />
              </div>

              {isOwner && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
                  <select
                    value={formData.venueId}
                    onChange={(e) => setFormData({ ...formData, venueId: Number(e.target.value) })}
                    className="input w-full"
                    required
                  >
                    <option value={0}>Select a marque</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
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
