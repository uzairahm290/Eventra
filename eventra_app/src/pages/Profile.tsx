import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiHash, FiSave, FiLoader } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import AvatarUpload from '../components/AvatarUpload';

const Profile: React.FC = () => {
  const { user, token, refreshProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [profileImageBase64, setProfileImageBase64] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/Profile');
        setFirstName(response.firstName || '');
        setLastName(response.secondName || '');
        setUsername(response.userName || '');
        setEmail(response.userMail || '');
        setProfileImageBase64(response.profileImageBase64 || '');
      } catch (error) {
        console.error('Failed to load profile:', error);
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Failed to load profile' 
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      
      const profileData = {
        firstName,
        secondName: lastName,
        userName: username,
        userMail: email,
        profileImageBase64
      };

      const response = await apiService.put('/Profile', profileData);
      setMessage({ type: 'success', text: response.message || 'Profile updated successfully!' });
      
      // Refresh the auth context with updated profile data
      await refreshProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-slate-400">Manage your personal information and avatar</p>
        </div>
        {profileImageBase64 && (
          <img
            src={profileImageBase64.startsWith('data:') ? profileImageBase64 : `data:image/jpeg;base64,${profileImageBase64}`}
            alt="Current avatar"
            className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md mx-auto md:mx-0"
          />
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
          <span className="ml-2">Loading profile...</span>
        </div>
      ) : (
        <div className="card p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <AvatarUpload value={profileImageBase64} onChange={(url) => setProfileImageBase64(url)} />
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
                <input className="block w-full pl-10 pr-10 py-2 rounded-md border border-gray-300" value={email} onChange={(e)=>setEmail(e.target.value)} disabled />
              </div>
            </div>
            </div>
          </div>

          <div className="mt-6">
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
              {saving ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
