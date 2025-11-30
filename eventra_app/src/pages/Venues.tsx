import React, { useState } from 'react';
import { FiPlus, FiSearch, FiMapPin, FiUsers, FiDollarSign, FiEdit, FiTrash2, FiEye, FiStar } from 'react-icons/fi';
import Modal from '../components/Modal';

const Venues: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: '',
    pricePerHour: '',
    amenities: '',
    image: '',
  });

  const [venuesList, setVenuesList] = useState([
    {
      id: 1,
      name: 'Grand Ballroom',
      address: '123 Main St, Downtown',
      capacity: 300,
      pricePerHour: 500,
      rating: 4.8,
      amenities: ['WiFi', 'Catering', 'Parking', 'AV Equipment'],
      image: 'https://images.unsplash.com/photo-1519167758481-83f29da8c37f?w=400',
      status: 'Available',
      bookings: 12,
    },
    {
      id: 2,
      name: 'Garden Pavilion',
      address: '456 Park Ave, Riverside',
      capacity: 150,
      pricePerHour: 350,
      rating: 4.9,
      amenities: ['Garden', 'WiFi', 'Parking'],
      image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400',
      status: 'Available',
      bookings: 8,
    },
    {
      id: 3,
      name: 'Convention Center',
      address: '789 Business Blvd, City Center',
      capacity: 500,
      pricePerHour: 800,
      rating: 4.7,
      amenities: ['WiFi', 'Catering', 'Parking', 'AV Equipment', 'Stage'],
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400',
      status: 'Available',
      bookings: 15,
    },
    {
      id: 4,
      name: 'Rooftop Terrace',
      address: '321 Sky Tower, Heights',
      capacity: 100,
      pricePerHour: 450,
      rating: 4.6,
      amenities: ['WiFi', 'Bar', 'City View'],
      image: 'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=400',
      status: 'Booked',
      bookings: 6,
    },
  ]);

  const handleDelete = () => {
    if (deleteId) {
      setVenuesList(prev => prev.filter(v => v.id !== deleteId));
      setDeleteId(null);
    }
  };

  const handleEdit = (venue: any) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity.toString(),
      pricePerHour: venue.pricePerHour.toString(),
      amenities: venue.amenities.join(', '),
      image: venue.image,
    });
    setShowAddModal(true);
  };

  const venues = venuesList;

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
        {venues.map((venue) => (
          <div key={venue.id} className="card overflow-hidden group">
            {/* Venue Image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={venue.image}
                alt={venue.name}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  venue.status === 'Available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {venue.status}
                </span>
              </div>
            </div>

            {/* Venue Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-bold text-gray-900">{venue.name}</h3>
                <div className="flex items-center">
                  <FiStar className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm font-medium text-gray-900">{venue.rating}</span>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-4">
                <FiMapPin className="mr-2 h-4 w-4" />
                {venue.address}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm">
                  <FiUsers className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Cap:</span>
                  <span className="ml-1 font-medium text-gray-900">{venue.capacity}</span>
                </div>
                <div className="flex items-center text-sm">
                  <FiDollarSign className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">${venue.pricePerHour}/hr</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {venue.amenities.slice(0, 3).map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                  {venue.amenities.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{venue.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                {venue.bookings} bookings this month
              </div>

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
        ))}
      </div>

      {/* Add/Edit Venue Modal */}
      <Modal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title={editingVenue ? 'Edit Venue' : 'Add New Venue'}
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          console.log('Venue saved:', formData);
          setShowAddModal(false);
        }} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma-separated)</label>
            <input
              type="text"
              value={formData.amenities}
              onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="WiFi, Catering, Parking"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
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
            <button
              type="submit"
              className="btn-primary"
            >
              {editingVenue ? 'Update Venue' : 'Add Venue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewId !== null}
        onClose={() => setViewId(null)}
        title="Venue Details"
        maxWidthClass="max-w-2xl"
      >
        {viewId && venuesList.find(v => v.id === viewId) && (() => {
          const venue = venuesList.find(v => v.id === viewId)!;
          return (
            <div className="space-y-4">
              <div className="mb-4">
                <img src={venue.image} alt={venue.name} className="w-full h-48 object-cover rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Venue Name</label>
                  <p className="text-base font-semibold text-gray-900">{venue.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                  <span className={`inline-block text-sm px-3 py-1 rounded-full font-semibold ${
                    venue.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {venue.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="text-base text-gray-900">{venue.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Capacity</label>
                  <p className="text-base text-gray-900">{venue.capacity} guests</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price per Hour</label>
                  <p className="text-lg font-bold text-gray-900">${venue.pricePerHour}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Rating</label>
                  <p className="text-base text-gray-900 flex items-center">
                    <FiStar className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    {venue.rating}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Bookings This Month</label>
                  <p className="text-base text-gray-900">{venue.bookings}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Amenities</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {venue.amenities.map((amenity, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                        {amenity}
                      </span>
                    ))}
                  </div>
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
          <p className="text-gray-700">Are you sure you want to delete this venue? This action cannot be undone.</p>
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

export default Venues;
