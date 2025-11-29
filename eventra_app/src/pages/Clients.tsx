import React, { useState } from 'react';
import { FiPlus, FiSearch, FiMail, FiPhone, FiEdit, FiTrash2, FiEye, FiMapPin } from 'react-icons/fi';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    {
      id: 1,
      name: 'Sarah Anderson',
      email: 'sarah.anderson@email.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Corp Inc.',
      address: '123 Tech Street, Silicon Valley',
      totalBookings: 5,
      totalSpent: '$45,200',
      status: 'Active',
      lastBooking: '2025-11-20',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      company: 'Innovation Labs',
      address: '456 Innovation Ave, Tech City',
      totalBookings: 8,
      totalSpent: '$78,500',
      status: 'Active',
      lastBooking: '2025-11-18',
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 345-6789',
      company: 'Creative Solutions',
      address: '789 Creative Blvd, Design Town',
      totalBookings: 3,
      totalSpent: '$28,900',
      status: 'Active',
      lastBooking: '2025-11-15',
    },
    {
      id: 4,
      name: 'David Thompson',
      email: 'david.thompson@email.com',
      phone: '+1 (555) 456-7890',
      company: 'Hope Foundation',
      address: '321 Charity Lane, Nonprofit City',
      totalBookings: 12,
      totalSpent: '$95,300',
      status: 'VIP',
      lastBooking: '2025-11-22',
    },
    {
      id: 5,
      name: 'Jennifer Lee',
      email: 'jennifer.lee@email.com',
      phone: '+1 (555) 567-8901',
      company: 'Marketing Pro',
      address: '654 Marketing St, Business Park',
      totalBookings: 2,
      totalSpent: '$18,400',
      status: 'Active',
      lastBooking: '2025-10-28',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VIP':
        return 'bg-yellow-100 text-yellow-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-2 text-gray-600">Manage your client relationships and contacts</p>
        </div>
        <button className="mt-4 sm:mt-0 btn-primary flex items-center">
          <FiPlus className="mr-2 h-5 w-5" />
          Add Client
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
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
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
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-600 to-cyan-600 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {client.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                        <div className="text-xs text-gray-500">Last booking: {client.lastBooking}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                        {client.email}
                      </div>
                      <div className="flex items-center">
                        <FiPhone className="mr-2 h-4 w-4 text-gray-400" />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.company}</div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <FiMapPin className="mr-1 h-3 w-3" />
                      {client.address.split(',')[0]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {client.totalBookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {client.totalSpent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                        <FiEye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50">
                        <FiEdit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
    </div>
  );
};

export default Clients;
