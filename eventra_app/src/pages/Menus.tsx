import React, { useEffect, useState, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiEye, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface Menu {
  id: number;
  venueId: number;
  venueName: string;
  name: string;
  category?: string;
  description?: string;
  pricePerPerson: number;
  minimumGuests: number;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergenInfo?: string;
  isAvailable: boolean;
}

interface Venue {
  id: number;
  name: string;
}

interface MenuFormData {
  venueId: number;
  name: string;
  category: string;
  description: string;
  pricePerPerson: string;
  minimumGuests: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  allergenInfo: string;
}

const CATEGORIES = ['Wedding', 'Corporate', 'Birthday', 'Engagement', 'Party', 'Other'];

const DIET_BADGES: { key: keyof Pick<Menu, 'isVegetarian' | 'isVegan' | 'isGlutenFree'>; label: string; color: string }[] = [
  { key: 'isVegetarian', label: 'Veg', color: 'bg-green-100 text-green-700' },
  { key: 'isVegan', label: 'Vegan', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'isGlutenFree', label: 'GF', color: 'bg-yellow-100 text-yellow-700' },
];

const fmt = (n: number) => `₨${n.toLocaleString('en-PK')}`;

const emptyForm = (venueId: number): MenuFormData => ({
  venueId,
  name: '',
  category: 'Wedding',
  description: '',
  pricePerPerson: '',
  minimumGuests: '1',
  isVegetarian: false,
  isVegan: false,
  isGlutenFree: false,
  allergenInfo: '',
});

const Menus: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';
  const managerVenueId = user?.venueId ?? 0;

  const [menus, setMenus] = useState<Menu[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [viewMenu, setViewMenu] = useState<Menu | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Menu | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVenueId, setFilterVenueId] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState<MenuFormData>(emptyForm(managerVenueId));

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const requests = [fetch('/api/Menus', { headers: authHeaders })];
      if (isOwner) requests.push(fetch('/api/Venues', { headers: authHeaders }));
      const [menusRes, venuesRes] = await Promise.all(requests);
      if (menusRes.ok) setMenus(await menusRes.json());
      if (venuesRes?.ok) setVenues(await venuesRes.json());
    } catch {
      toast.error('Failed to load menus');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAdd = () => {
    setEditingMenu(null);
    setFormData(emptyForm(isOwner ? 0 : managerVenueId));
    setShowModal(true);
  };

  const openEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      venueId: menu.venueId,
      name: menu.name,
      category: menu.category ?? 'Wedding',
      description: menu.description ?? '',
      pricePerPerson: String(menu.pricePerPerson),
      minimumGuests: String(menu.minimumGuests),
      isVegetarian: menu.isVegetarian,
      isVegan: menu.isVegan,
      isGlutenFree: menu.isGlutenFree,
      allergenInfo: menu.allergenInfo ?? '',
    });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingMenu(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveVenueId = isOwner ? formData.venueId : managerVenueId;
    if (!effectiveVenueId) { toast.error('Please select a Marque'); return; }
    if (!formData.name.trim()) { toast.error('Menu name is required'); return; }
    if (!formData.pricePerPerson || Number(formData.pricePerPerson) < 0) {
      toast.error('Enter a valid price per person');
      return;
    }

    const payload = {
      venueId: effectiveVenueId,
      name: formData.name.trim(),
      category: formData.category || undefined,
      description: formData.description.trim() || undefined,
      pricePerPerson: Number(formData.pricePerPerson),
      minimumGuests: Math.max(1, Number(formData.minimumGuests) || 1),
      isVegetarian: formData.isVegetarian,
      isVegan: formData.isVegan,
      isGlutenFree: formData.isGlutenFree,
      allergenInfo: formData.allergenInfo.trim() || undefined,
    };

    try {
      const url = editingMenu ? `/api/Menus/${editingMenu.id}` : '/api/Menus';
      const method = editingMenu ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: authHeaders, body: JSON.stringify(payload) });
      if (res.ok) {
        toast.success(editingMenu ? 'Menu updated' : 'Menu added');
        closeModal();
        loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Failed to save menu');
      }
    } catch {
      toast.error('Failed to save menu');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/Menus/${deleteTarget.id}`, { method: 'DELETE', headers: authHeaders });
      if (res.ok) {
        toast.success('Menu deleted');
        setMenus(prev => prev.filter(m => m.id !== deleteTarget.id));
      } else {
        toast.error('Failed to delete menu');
      }
    } catch {
      toast.error('Failed to delete menu');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredMenus = useMemo(() => {
    return menus.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVenue = !isOwner || !filterVenueId || m.venueId === filterVenueId;
      const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
      return matchesSearch && matchesVenue && matchesCategory;
    });
  }, [menus, searchTerm, filterVenueId, filterCategory, isOwner]);

  const avgPrice = useMemo(() => {
    if (!filteredMenus.length) return 0;
    return Math.round(filteredMenus.reduce((s, m) => s + m.pricePerPerson, 0) / filteredMenus.length);
  }, [filteredMenus]);

  const update = (patch: Partial<MenuFormData>) => setFormData(f => ({ ...f, ...patch }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Catalog</h1>
          <p className="text-gray-600 mt-1">Manage catering menus for your marques</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" /> Add Menu
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{filteredMenus.length}</p>
          <p className="text-sm text-gray-500">Total Menus</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{new Set(filteredMenus.map(m => m.category)).size}</p>
          <p className="text-sm text-gray-500">Categories</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-primary-600">{fmt(avgPrice)}</p>
          <p className="text-sm text-gray-500">Avg / Person</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menus..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input pl-10 w-full focus:outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="input focus:outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {isOwner && (
            <select
              value={filterVenueId}
              onChange={e => setFilterVenueId(Number(e.target.value))}
              className="input focus:outline-none"
            >
              <option value={0}>All Marques</option>
              {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Menus Grid */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading menus...</p>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div className="card p-8 text-center">
          <FiDollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No menus found</p>
          <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2">
            <FiPlus className="w-4 h-4" /> Add First Menu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMenus.map(menu => (
            <div key={menu.id} className="card p-5 hover:shadow-lg transition-shadow flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">{menu.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{menu.venueName}</p>
                </div>
                <div className="flex gap-1 ml-2 shrink-0">
                  <button onClick={() => setViewMenu(menu)} className="p-1.5 hover:bg-gray-100 rounded" title="View">
                    <FiEye className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => openEdit(menu)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
                    <FiEdit2 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button onClick={() => setDeleteTarget(menu)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete">
                    <FiTrash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {menu.category && (
                  <span className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full font-medium">
                    {menu.category}
                  </span>
                )}
                {DIET_BADGES.filter(d => menu[d.key]).map(d => (
                  <span key={d.key} className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.color}`}>{d.label}</span>
                ))}
                {!menu.isAvailable && (
                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">Unavailable</span>
                )}
              </div>

              {menu.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">{menu.description}</p>
              )}

              <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm text-gray-500">Per person</span>
                <span className="text-lg font-bold text-primary-600">{fmt(menu.pricePerPerson)}</span>
              </div>
              {menu.minimumGuests > 1 && (
                <p className="text-xs text-gray-400 text-right mt-1">Min {menu.minimumGuests} guests</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingMenu ? 'Edit Menu' : 'Add New Menu'}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isOwner && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marque *</label>
                  <select
                    value={formData.venueId}
                    onChange={e => update({ venueId: Number(e.target.value) })}
                    className="input w-full"
                    required
                  >
                    <option value={0}>Select a marque</option>
                    {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Menu Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => update({ name: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Classic Wedding Package"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => update({ category: e.target.value })}
                    className="input w-full"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price / Person (₨) *</label>
                  <input
                    type="number"
                    value={formData.pricePerPerson}
                    onChange={e => update({ pricePerPerson: e.target.value })}
                    className="input w-full"
                    placeholder="e.g. 1500"
                    min={0}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Guests</label>
                <input
                  type="number"
                  value={formData.minimumGuests}
                  onChange={e => update({ minimumGuests: e.target.value })}
                  className="input w-full"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => update({ description: e.target.value })}
                  className="input w-full"
                  placeholder="Menu description and inclusions"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergen Info</label>
                <input
                  type="text"
                  value={formData.allergenInfo}
                  onChange={e => update({ allergenInfo: e.target.value })}
                  className="input w-full"
                  placeholder="e.g. Contains nuts, dairy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Options</label>
                <div className="flex gap-6">
                  {DIET_BADGES.map(d => (
                    <label key={d.key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[d.key as keyof MenuFormData] as boolean}
                        onChange={e => update({ [d.key]: e.target.checked })}
                        className="rounded"
                      />
                      {d.label === 'GF' ? 'Gluten Free' : d.key === 'isVegan' ? 'Vegan' : 'Vegetarian'}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="flex-1 btn-outline">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingMenu ? 'Update' : 'Add'} Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewMenu && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setViewMenu(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{viewMenu.name}</h2>
              <button onClick={() => setViewMenu(null)} className="p-1 hover:bg-gray-100 rounded">
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Marque</dt>
                <dd className="font-medium text-gray-900">{viewMenu.venueName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Category</dt>
                <dd className="font-medium text-gray-900">{viewMenu.category ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Price / Person</dt>
                <dd className="font-bold text-primary-600 text-base">{fmt(viewMenu.pricePerPerson)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Min Guests</dt>
                <dd className="font-medium text-gray-900">{viewMenu.minimumGuests}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Available</dt>
                <dd className={viewMenu.isAvailable ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
                  {viewMenu.isAvailable ? 'Yes' : 'No'}
                </dd>
              </div>
              {viewMenu.description && (
                <div>
                  <dt className="text-gray-500 mb-1">Description</dt>
                  <dd className="text-gray-900">{viewMenu.description}</dd>
                </div>
              )}
              {viewMenu.allergenInfo && (
                <div>
                  <dt className="text-gray-500 mb-1">Allergens</dt>
                  <dd className="text-gray-900">{viewMenu.allergenInfo}</dd>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                {DIET_BADGES.filter(d => viewMenu[d.key]).map(d => (
                  <span key={d.key} className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.color}`}>{d.label}</span>
                ))}
              </div>
            </dl>
            <div className="mt-5 flex gap-3">
              <button onClick={() => { setViewMenu(null); openEdit(viewMenu); }} className="flex-1 btn-outline text-sm">
                Edit
              </button>
              <button onClick={() => setViewMenu(null)} className="flex-1 btn-primary text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-lg max-w-sm w-full p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Menu</h2>
            <p className="text-gray-600 mb-5">
              Delete <strong>{deleteTarget.name}</strong>? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menus;
