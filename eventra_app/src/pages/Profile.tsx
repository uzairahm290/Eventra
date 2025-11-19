import React, { useState } from 'react';
import { FiUser, FiMail, FiHash, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');

  // We'll dispatch update via window event to avoid tight coupling while keeping demo responsive
  const handleSave = () => {
    const detail = { firstName, lastName, username, email };
    window.dispatchEvent(new CustomEvent('eventra:update-profile', { detail }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-slate-400">Manage your personal information</p>
      </div>

      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">First name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input className="input-field pl-10" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Last name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input className="input-field pl-10" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiHash className="h-5 w-5 text-gray-400" />
              </div>
              <input className="input-field pl-10" value={username} onChange={(e)=>setUsername(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input className="input-field pl-10" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button onClick={handleSave} className="btn-primary">
            <FiSave className="mr-2" /> Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
