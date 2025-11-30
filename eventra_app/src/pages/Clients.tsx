import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiSearch, FiMail, FiTrash2, FiEye, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import { clientService, type Client, type CreateClientDto } from '../services';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientsList, setClientsList] = useState<Client[]>([]);
  const [formData, setFormData] = useState<CreateClientDto>({
    firstName: '',
    secondName: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClientsList(data);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await clientService.deleteClient(deleteId);
      await loadClients();
      toast.success('Client deleted successfully!');
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast.error('Failed to delete client');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return clientsList.filter(c =>
      c.firstName?.toLowerCase().includes(term) ||
      c.secondName?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term)
    );
  }, [clientsList, searchTerm]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-2 text-gray-600">Manage your client contacts and information</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ firstName: '', secondName: '', email: '', phone: '', company: '', address: '' });
            setShowAddModal(true);
          }}
          className="mt-4 sm:mt-0 btn-primary flex items-center"
        >
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
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading clients...</div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No clients found</div>
        ) : (
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
                    Registered
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClients.map((client) => {
                  const fullName = [client.firstName, client.secondName].filter(Boolean).join(' ');
                  const initials = [client.firstName?.[0], client.secondName?.[0]].filter(Boolean).join('');
                  return (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-linear-to-r from-primary-600 to-cyan-600 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {initials || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{fullName}</div>
                            <div className="text-xs text-gray-500">ID: {client.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                            {client.email || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{client.company || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(client.dateRegistered).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button onClick={() => setViewId(client.id)} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50">
                            <FiEye className="h-4 w-4" />
                          </button>
                          <button onClick={() => {
                            setEditingId(client.id);
                            setFormData({
                              firstName: client.firstName,
                              secondName: client.secondName,
                              email: client.email,
                              phone: client.phone || '',
                              company: client.company || '',
                              address: client.address || ''
                            });
                            setShowAddModal(true);
                          }} className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50">
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setDeleteId(client.id)} className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Client Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingId ? 'Edit Client' : 'Add New Client'}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!formData.firstName || !formData.secondName || !formData.email) {
              alert('Please fill in all required fields');
              return;
            }
            setSaving(true);
            try {
              if (editingId) {
                await clientService.updateClient(editingId, { ...formData, isActive: true });
                toast.success('Client updated successfully!');
              } else {
                await clientService.createClient(formData);
                toast.success('Client created successfully!');
              }
              await loadClients();
              setShowAddModal(false);
              setEditingId(null);
              setFormData({ firstName: '', secondName: '', email: '', phone: '', company: '', address: '' });
            } catch (err) {
              const msg = err instanceof Error ? err.message : 'Failed to save client';
              toast.error(msg);
            } finally {
              setSaving(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="block w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
              <input
                type="text"
                required
                value={formData.secondName}
                onChange={(e) => setFormData({ ...formData, secondName: e.target.value })}
                className="block w-full px-3 py-2 rounded-md border border-gray-300"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="123 Main St, City, State 12345"
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
              {saving ? 'Saving...' : editingId ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewId !== null}
        onClose={() => setViewId(null)}
        title="Client Details"
        maxWidthClass="max-w-2xl"
      >
        {viewId && clientsList.find(c => c.id === viewId) && (() => {
          const client = clientsList.find(c => c.id === viewId)!;
          const fullName = [client.firstName, client.secondName].filter(Boolean).join(' ');
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Client Name</label>
                  <p className="text-base font-semibold text-gray-900">{fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Client ID</label>
                  <p className="text-sm text-gray-900 font-mono">{client.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-base text-gray-900">{client.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                  <p className="text-base text-gray-900">{client.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                  <p className="text-base text-gray-900">{client.company || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                  <p className="text-base text-gray-900">{client.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date Registered</label>
                  <p className="text-base text-gray-900">{new Date(client.dateRegistered).toLocaleString()}</p>
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
          <p className="text-gray-700">Are you sure you want to delete this client? This action cannot be undone.</p>
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

export default Clients;
