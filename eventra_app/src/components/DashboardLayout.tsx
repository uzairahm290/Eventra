import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiHome, FiCalendar, FiMapPin, FiUsers, FiBookOpen,
  FiMenu, FiX, FiBell, FiUser, FiLogOut, FiSettings,
  FiSearch, FiBarChart2, FiHelpCircle, FiCoffee
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

// Helper function to render avatar
const renderAvatar = (user: { firstName?: string; lastName?: string; profileImageBase64?: string } | null, size: 'small' | 'large' = 'small') => {
  const sizeClasses = size === 'small' ? 'w-8 h-8' : 'w-10 h-10';
  const textSizeClasses = size === 'small' ? 'text-sm' : 'text-base';

  if (user?.profileImageBase64) {
    const imageSrc = user.profileImageBase64.startsWith('data:') 
      ? user.profileImageBase64 
      : `data:image/jpeg;base64,${user.profileImageBase64}`;
    
    return (
      <img
        src={imageSrc}
        alt={`${user.firstName} ${user.lastName}`}
        className={`${sizeClasses} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-linear-to-r from-primary-600 to-cyan-600 flex items-center justify-center`}>
      <span className={`text-white font-semibold ${textSizeClasses}`}>
        {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
      </span>
    </div>
  );
};

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [upcomingEvents, setUpcomingEvents] = useState<Array<{ id: number; title: string; date: string }>>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Events', href: '/dashboard/events', icon: FiCalendar },
    { name: 'Venues', href: '/dashboard/venues', icon: FiMapPin },
    { name: 'Clients', href: '/dashboard/clients', icon: FiUsers },
    { name: 'Menus', href: '/dashboard/menus', icon: FiCoffee },
    { name: 'Bookings', href: '/dashboard/bookings', icon: FiBookOpen },
    { name: 'Calendar', href: '/dashboard/calendar', icon: FiCalendar },
    { name: 'Reports', href: '/dashboard/reports', icon: FiBarChart2 },
    { name: 'Admin Approvals', href: '/dashboard/admin/approvals', icon: FiUsers },
    { name: 'Help', href: '/dashboard/help', icon: FiHelpCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Load upcoming events (within 1 week) on mount and when user changes
  React.useEffect(() => {
    if (!user) return;
    const loadUpcoming = async () => {
      try {
        const { eventService } = await import('../services');
        const events = await eventService.getAllEvents();
        const now = new Date();
        const weekAhead = new Date();
        weekAhead.setDate(now.getDate() + 7);
        const upcoming = (events || []).filter((e: any) => {
          const d = new Date(e.date);
          return d >= now && d <= weekAhead;
        }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .map((e: any) => ({ id: e.id, title: e.title, date: e.date }));
        setUpcomingEvents(upcoming);
      } catch (err) {
        console.warn('Failed to load upcoming events for notifications:', err);
      }
    };
    loadUpcoming();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-linear-to-r from-primary-600 to-cyan-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Eventra</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                      ? 'bg-primary-50 text-primary-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-primary-600' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-50">
            <div className="shrink-0">
              {renderAvatar(user, 'large')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Navbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 hover:text-gray-700 lg:hidden"
              >
                <FiMenu className="w-6 h-6" />
              </button>

              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <FiBell className="w-6 h-6" />
                  {upcomingEvents.length > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center h-5 w-5 text-xs font-semibold text-white bg-red-500 rounded-full ring-2 ring-white">
                      {upcomingEvents.length}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Upcoming Events</h3>
                    </div>
                    {upcomingEvents.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        No upcoming events in the next 7 days.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {upcomingEvents.map(evt => (
                          <div
                            key={evt.id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setShowNotifications(false);
                              navigate(`/dashboard/events`);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="shrink-0 mt-1">
                                <FiCalendar className="w-4 h-4 text-primary-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{evt.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(evt.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  {renderAvatar(user, 'small')}
                  <span className="hidden sm:inline text-sm font-medium text-gray-700">
                    {user?.firstName}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
                    <Link
                      to="/dashboard/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FiUser className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FiSettings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FiLogOut className="mr-3 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
