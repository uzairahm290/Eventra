import React, { useState } from 'react';
import { FiPlus, FiSearch, FiMapPin, FiUsers, FiDollarSign, FiEdit, FiTrash2, FiEye, FiStar } from 'react-icons/fi';

const Venues: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const venues = [
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
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
          <p className="mt-2 text-gray-600">Manage your event venues and locations</p>
        </div>
        <button className="mt-4 sm:mt-0 btn-primary flex items-center">
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
            className="input-field pl-10"
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
                <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                  <FiEye className="mr-1 h-4 w-4" />
                  View
                </button>
                <button className="flex items-center text-sm text-green-600 hover:text-green-800">
                  <FiEdit className="mr-1 h-4 w-4" />
                  Edit
                </button>
                <button className="flex items-center text-sm text-red-600 hover:text-red-800">
                  <FiTrash2 className="mr-1 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Venues;
