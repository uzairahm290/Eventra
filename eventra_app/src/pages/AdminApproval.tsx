import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  dateRegistered: string;
  isApproved: boolean;
}

const AdminApproval: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/Auth/Users');
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await apiService.post(`/Auth/ApproveUser/${userId}`);
      toast.success('User approved successfully!');
      await loadUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      await apiService.post(`/Auth/RejectUser/${userId}`);
      toast.success('User approval revoked');
      await loadUsers();
    } catch (error) {
      console.error('Failed to reject user:', error);
      toast.error('Failed to update user');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !user.isApproved;
    if (filter === 'approved') return user.isApproved;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Approval</h1>
          <p className="mt-2 text-gray-600">Review and approve user registrations</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-gray-200">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            filter === 'pending'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Pending ({users.filter((u) => !u.isApproved).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            filter === 'approved'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Approved ({users.filter((u) => u.isApproved).length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            filter === 'all'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          All Users ({users.length})
        </button>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registered
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-linear-to-r from-primary-600 to-cyan-600 flex items-center justify-center">
                            <FiUser className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiMail className="mr-2 h-4 w-4 text-gray-400" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      @{user.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiCalendar className="mr-2 h-4 w-4" />
                        {new Date(user.dateRegistered).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!user.isApproved ? (
                          <button
                            onClick={() => handleApprove(user.id)}
                            className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                            title="Approve user"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReject(user.id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                            title="Revoke approval"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="bg-linear-to-r from-primary-50 to-cyan-50 px-6 py-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Total Users</div>
              <div className="text-2xl font-bold text-gray-900">{users.length}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Pending Approval</div>
              <div className="text-2xl font-bold text-yellow-600">
                {users.filter((u) => !u.isApproved).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Approved Users</div>
              <div className="text-2xl font-bold text-green-600">
                {users.filter((u) => u.isApproved).length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminApproval;
