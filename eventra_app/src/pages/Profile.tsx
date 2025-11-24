import React, { useState } from 'react';
import { FiUser, FiMail, FiHash, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import AvatarUpload from '../components/AvatarUpload';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatarUrl || '');

  // We'll dispatch update via window event to avoid tight coupling while keeping demo responsive
  const handleSave = () => {
    const detail = { firstName, lastName, username, email, avatarUrl };
    window.dispatchEvent(new CustomEvent('eventra:update-profile', { detail }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Manage your personal information and avatar</p>
        </div>
        {avatarUrl && (
          <img
            src={avatarUrl}
            alt="Current avatar"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md mx-auto md:mx-0"
          />
        )}
      </div>

      <div className="card p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <AvatarUpload value={avatarUrl} onChange={(url) => setAvatarUrl(url)} />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">First name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300" value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Last name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300" value={lastName} onChange={(e)=>setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiHash className="h-5 w-5 text-gray-400" />
              </div>
              <input className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300" value={username} onChange={(e)=>setUsername(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300" value={email} onChange={(e)=>setEmail(e.target.value)} />
            </div>
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
