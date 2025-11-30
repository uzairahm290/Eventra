import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiDollarSign, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../components/Modal';
import menuService from '../services/menuService';
import type { Menu, CreateMenuDto } from '../services/menuService';

const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateMenuDto>({
    eventId: null,
    name: '',
    category: 'Wedding',
    description: '',
    pricePerPerson: 0,
    minimumGuests: 1,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    allergenInfo: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await menuService.getAll();
        setMenus(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Failed to load menus';
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      eventId: menu.eventId,
      name: menu.name,
      category: menu.category,
      description: menu.description,
      pricePerPerson: menu.pricePerPerson,
      minimumGuests: menu.minimumGuests,
      isVegetarian: menu.isVegetarian,
      isVegan: menu.isVegan,
      isGlutenFree: menu.isGlutenFree,
      allergenInfo: menu.allergenInfo,
    });
    setShowAddModal(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      // Attempt API delete; if unauthorized, reflect error
      menuService.delete(deleteId)
        .then(() => {
          setMenus(menus.filter(m => m.id !== deleteId));
          toast.success('Menu deleted successfully!');
        })
        .catch(() => {
          const msg = 'Delete failed. You may need to login as Admin.';
          setError(msg);
          toast.error(msg);
        })
        .finally(() => setDeleteId(null));
    }
  };

  const categoriesCount = useMemo(() => new Set(menus.map(m => m.category)).size, [menus]);
  const avgPrice = useMemo(() => {
    if (!menus.length) return 0;
    return Math.round(menus.reduce((sum, m) => sum + (m.pricePerPerson || 0), 0) / menus.length);
  }, [menus]);

  return (
    <div className="space-y-6">
      {loading && (
        <div className="card p-3 text-sm text-gray-700 bg-gray-50">Loading menus…</div>
      )}
      {error && (
        <div className="card p-3 text-sm text-red-700 bg-red-50">{error}</div>
      )}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Catalog</h1>
          <p className="mt-2 text-gray-600">Manage catering menu options that can be assigned to events</p>
        </div>
        <button
          onClick={() => {
            setEditingMenu(null);
            setFormData({
              eventId: null,
              name: '',
              category: 'Wedding',
              description: '',
              pricePerPerson: 0,
              minimumGuests: 1,
              isVegetarian: false,
              isVegan: false,
              isGlutenFree: false,
              allergenInfo: '',
            });
            setShowAddModal(true);
          }}
          className="btn-primary inline-flex items-center"
        >
          <FiPlus className="mr-2" />
          Add New Menu
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Menus</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{menus.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{categoriesCount}</p>
            </div>
            <div className="p-3 bg-cyan-50 rounded-lg">
              <FiEdit2 className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Price/Person</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${avgPrice}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Menus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <div key={menu.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full">
                  {menu.category}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewId(menu.id)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(menu)}
                  className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(menu.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{menu.description}</p>

            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium text-gray-700">Includes:</p>
              <ul className="space-y-1">
                {(menu.allergenInfo ? menu.allergenInfo.split(',') : []).map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mr-2"></span>
                    {item.trim()}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Price per person</span>
                <span className="text-lg font-bold text-primary-600">${menu.pricePerPerson}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {menus.length === 0 && (
        <div className="text-center py-12 card">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiDollarSign className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No menus yet</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first menu</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center"
          >
            <FiPlus className="mr-2" />
            Add Your First Menu
          </button>
        </div>
      )}

      {/* Add/Edit Menu Modal */}
      <Modal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title={editingMenu ? 'Edit Menu' : 'Add New Menu'}
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          try {
            if (editingMenu) {
              await menuService.update(editingMenu.id, formData);
              toast.success('Menu updated successfully!');
            } else {
              await menuService.create(formData);
              toast.success('Menu created successfully!');
            }
            const refreshed = await menuService.getAll();
            setMenus(refreshed);
            setShowAddModal(false);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Save failed. You may need to login as Admin.';
            setError(msg);
            toast.error(msg);
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Menu Name</label>
            <input
              type="text"
              required
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Classic Wedding Package"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option>Wedding</option>
              <option>Corporate</option>
              <option>Party</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price per Person ($)</label>
            <input
              type="number"
              required
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="45"
              value={formData.pricePerPerson}
              onChange={(e) => setFormData({ ...formData, pricePerPerson: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={3}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Perfect for traditional wedding celebrations"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergen Info (comma separated)</label>
            <textarea
              rows={3}
              className="block w-full px-3 py-2 rounded-md border border-gray-300"
              placeholder="Peanuts, Dairy, Gluten"
              value={formData.allergenInfo}
              onChange={(e) => setFormData({ ...formData, allergenInfo: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Guests</label>
              <input
                type="number"
                className="block w-full px-3 py-2 rounded-md border border-gray-300"
                value={formData.minimumGuests}
                onChange={(e) => setFormData({ ...formData, minimumGuests: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={formData.isVegetarian} onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })} />
                Vegetarian
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={formData.isVegan} onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })} />
                Vegan
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={formData.isGlutenFree} onChange={(e) => setFormData({ ...formData, isGlutenFree: e.target.checked })} />
                Gluten Free
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingMenu ? 'Update Menu' : 'Add Menu'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewId !== null}
        onClose={() => setViewId(null)}
        title="Menu Details"
        maxWidthClass="max-w-2xl"
      >
        {viewId && menus.find(m => m.id === viewId) && (() => {
          const menu = menus.find(m => m.id === viewId)!;
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Menu Name</label>
                  <p className="text-base font-semibold text-gray-900">{menu.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                  <span className="inline-block text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                    {menu.category}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Price per Person</label>
                  <p className="text-lg font-bold text-gray-900">${menu.pricePerPerson}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                  <p className="text-base text-gray-900">{menu.description}</p>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Allergen Info</label>
                  <ul className="space-y-2">
                    {(menu.allergenInfo ? menu.allergenInfo.split(',') : []).map((item, index) => (
                      <li key={index} className="text-base text-gray-900 flex items-center">
                        <span className="w-2 h-2 bg-primary-600 rounded-full mr-3"></span>
                        {item.trim()}
                      </li>
                    ))}
                  </ul>
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
          <p className="text-gray-700">Are you sure you want to delete this menu? This action cannot be undone.</p>
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

export default Menus;
