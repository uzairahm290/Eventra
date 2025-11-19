import React from 'react';
import { FiBell, FiMoon, FiSun, FiMonitor } from 'react-icons/fi';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Customize your application preferences</p>
      </div>

      {/* Appearance - Light theme only */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 rounded-lg border text-left border-cyan-500 bg-primary-50">
            <div className="flex items-center">
              <FiSun className="mr-3 text-yellow-500" />
              <div>
                <div className="font-medium">Light</div>
                <div className="text-sm text-gray-500">Bright and clean interface (Active)</div>
              </div>
            </div>
          </button>
          <button disabled className="p-4 rounded-lg border text-left border-gray-200 opacity-50 cursor-not-allowed">
            <div className="flex items-center">
              <FiMoon className="mr-3 text-gray-400" />
              <div>
                <div className="font-medium text-gray-400">Dark</div>
                <div className="text-sm text-gray-400">Coming soon</div>
              </div>
            </div>
          </button>
          <button disabled className="p-4 rounded-lg border text-left border-gray-200 opacity-50 cursor-not-allowed">
            <div className="flex items-center">
              <FiMonitor className="mr-3 text-gray-400" />
              <div>
                <div className="font-medium text-gray-400">System</div>
                <div className="text-sm text-gray-400">Coming soon</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Notifications (demo only) */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Email Notifications</span>
            <input type="checkbox" className="h-5 w-5" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Booking Alerts</span>
            <input type="checkbox" className="h-5 w-5" defaultChecked />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-gray-700">Weekly Summary</span>
            <input type="checkbox" className="h-5 w-5" />
          </label>
        </div>
        <div className="mt-6">
          <button className="btn-primary"><FiBell className="mr-2" /> Save preferences</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
