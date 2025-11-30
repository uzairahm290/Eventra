import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiSearch, FiMapPin, FiUsers, FiDollarSign, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Modal from '../components/Modal';
import { venueService } from '../services';
import type { Venue } from '../services';

const Venues: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<null | {
    name: string;
    address: string;
    capacity: string;
    pricePerHour: string;
    amenities: string;
    image: string;
  }>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [venuesList, setVenuesList] = useState<Venue[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    pricePerHour: '',
    amenities: '',
    image: '',
  });

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      const data = await venueService.getAllVenues();
      setVenuesList(data);
    } catch (error) {
      console.error('Failed to load venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return venuesList.filter(v =>
      v.name.toLowerCase().includes(term) ||
      v.address.toLowerCase().includes(term) ||
      (v.city?.toLowerCase().includes(term) ?? false)
    );
  }, [venuesList, searchTerm]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await venueService.deleteVenue(deleteId);
      await loadVenues();
    } catch (error) {
      console.error('Failed to delete venue:', error);
    } finally {
      setDeleteId(null);
    }
  };

  const handleEdit = (venue: Venue) => {
    const mapped = {
      name: venue.name,
      address: [venue.address, venue.city, venue.state, venue.postalCode].filter(Boolean).join(', '),
      capacity: String(venue.capacity),
      pricePerHour: String(venue.pricePerHour ?? ''),
      amenities: venue.description ?? '',
      image: '',
    };
    setEditingVenue(mapped);
    setFormData(mapped);
    setEditingId(venue.id);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
          <p className="mt-2 text-gray-600">Manage your event venues and locations</p>
        </div>
        <button
          onClick={() => {
            setEditingVenue(null);
            setFormData({ name: '', address: '', capacity: '', pricePerHour: '', amenities: '', image: '' });
            setShowAddModal(true);
          }}
          className="mt-4 sm:mt-0 btn-primary flex items-center"
        >
          <FiPlus className="mr-2 h-5 w-5" />
          Add Venue
        </button>
      </div>

      {/* Search Bar */}
      <div className="card p-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300"
          />
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading venues...</div>
        ) : filteredVenues.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No venues found</div>
        ) : (
          filteredVenues.map((venue) => (
            <div key={venue.id} className="card overflow-hidden group">
              {/* Venue Header */}
              <div className="relative h-48 overflow-hidden bg-linear-to-br from-primary-100 to-cyan-100 flex items-center justify-center">
                <FiMapPin className="h-16 w-16 text-primary-300" />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${venue.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {venue.isActive ? 'Available' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Venue Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-gray-900">{venue.name}</h3>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <FiMapPin className="mr-2 h-4 w-4" />
                  {[venue.address, venue.city, venue.state].filter(Boolean).join(', ')}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <FiUsers className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Cap:</span>
                    <span className="ml-1 font-medium text-gray-900">{venue.capacity}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiDollarSign className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">${venue.pricePerHour ?? 0}/hr</span>
                  </div>
                </div>

                {venue.description && (
                  <div className="mb-4 text-sm text-gray-600 line-clamp-2">{venue.description}</div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button onClick={() => setViewId(venue.id)} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                    <FiEye className="mr-1 h-4 w-4" />
                    View
                  </button>
                  <button onClick={() => handleEdit(venue)} className="flex items-center text-sm text-green-600 hover:text-green-800">
                    <FiEdit className="mr-1 h-4 w-4" />
                    Edit
                  </button>
                  <button onClick={() => setDeleteId(venue.id)} className="flex items-center text-sm text-red-600 hover:text-red-800">
                    <FiTrash2 className="mr-1 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Venue Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingVenue ? 'Edit Venue' : 'Add New Venue'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const capacity = parseInt(formData.capacity || '0', 10);
            const price = formData.pricePerHour ? parseFloat(formData.pricePerHour) : undefined;
            if (!formData.name || !formData.address || !capacity) {
              alert('Please fill in name, address and capacity');
              return;
            }
            const payload = {
              name: formData.name,
              address: formData.address,
              capacity,
              description: formData.amenities || undefined,
              pricePerHour: isNaN(Number(price)) ? undefined : price,
              isActive: true,
            } as const;
            setSaving(true);
            (async () => {
              try {
                if (editingId) {
                  await venueService.updateVenue({ id: editingId, ...payload });
                } else {
                  await venueService.createVenue(payload);
                }
                await loadVenues();
                setShowAddModal(false);
                setEditingId(null);
                setEditingVenue(null);
                setFormData({ name: '', address: '', capacity: '', pricePerHour: '', amenities: '', image: '' });
              } catch (err) {
                const msg = err instanceof Error ? err.message : 'Failed to save venue';
                alert(msg.includes('Forbidden') || msg.includes('401') ? 'Requires Admin role to create/update venues.' : `Failed to save venue: ${msg}`);
              } finally {
                setSaving(false);
              }
            })();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Grand Ballroom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="123 Main St, Downtown"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
                className="block w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price/Hour ($)</label>
              <input
                type="number"
                value={formData.pricePerHour}
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                required
                className="block w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Any additional details"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="https://..."
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
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingVenue ? 'Update Venue' : 'Add Venue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={viewId !== null} onClose={() => setViewId(null)} title="Venue Details" maxWidthClass="max-w-2xl">
        {viewId && venuesList.find((v) => v.id === viewId) && (() => {
          const venue = venuesList.find((v) => v.id === viewId)!;
          return (
            <div className="space-y-4">
              <div className="w-full h-40 rounded-lg bg-linear-to-br from-primary-100 to-cyan-100 flex items-center justify-center">
                <FiMapPin className="h-10 w-10 text-primary-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Venue Name</label>
                  <p className="text-base font-semibold text-gray-900">{venue.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${venue.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {venue.isActive ? 'Available' : 'Inactive'}
                  </span>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="text-base text-gray-900">
                    {[venue.address, venue.city, venue.state, venue.postalCode].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Capacity</label>
                  <p className="text-base text-gray-900">{venue.capacity} guests</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price per Hour</label>
                  <p className="text-lg font-bold text-gray-900">${venue.pricePerHour ?? 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contact Phone</label>
                  <p className="text-base text-gray-900">{venue.contactPhone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Contact Email</label>
                  <p className="text-base text-gray-900">{venue.contactEmail || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-sm text-gray-700 whitespace-pre-line">{venue.description || 'No description provided.'}</p>
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
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Confirm Delete" maxWidthClass="max-w-md">
        <div className="space-y-4">
          <p className="text-gray-700">Are you sure you want to delete this venue? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-2">
            <button onClick={() => setDeleteId(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Venues;

