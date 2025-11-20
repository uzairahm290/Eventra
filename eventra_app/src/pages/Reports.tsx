import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiCalendar, FiUsers, FiDownload } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
    // Mock data for charts
    const monthlyRevenue = [
        { month: 'Jan', revenue: 45000, bookings: 12 },
        { month: 'Feb', revenue: 52000, bookings: 15 },
        { month: 'Mar', revenue: 48000, bookings: 13 },
        { month: 'Apr', revenue: 61000, bookings: 18 },
        { month: 'May', revenue: 55000, bookings: 16 },
        { month: 'Jun', revenue: 67000, bookings: 20 },
    ];

    const eventTypes = [
        { name: 'Weddings', value: 35, color: '#ec4899' },
        { name: 'Corporate', value: 30, color: '#3b82f6' },
        { name: 'Conferences', value: 20, color: '#8b5cf6' },
        { name: 'Parties', value: 15, color: '#10b981' },
    ];

    const venueUtilization = [
        { venue: 'Grand Hall A', utilization: 85 },
        { venue: 'Garden Pavilion', utilization: 72 },
        { venue: 'Convention Center', utilization: 90 },
        { venue: 'Rooftop Terrace', utilization: 65 },
        { venue: 'Ballroom B', utilization: 78 },
    ];

    const stats = [
        { label: 'Total Revenue', value: '$328,000', change: '+12.5%', icon: FiDollarSign, color: 'bg-green-500' },
        { label: 'Total Bookings', value: '94', change: '+8.3%', icon: FiCalendar, color: 'bg-blue-500' },
        { label: 'Active Clients', value: '156', change: '+15.2%', icon: FiUsers, color: 'bg-purple-500' },
        { label: 'Avg. Revenue/Event', value: '$3,489', change: '+4.1%', icon: FiTrendingUp, color: 'bg-orange-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-600 mt-1">Track your business performance and insights</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <FiDownload className="w-4 h-4" />
                    Export Report
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6 hover-lift transition-all-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-green-600 text-sm font-semibold">{stat.change}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue & Bookings Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Bookings Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="revenue" stroke="#0284c7" strokeWidth={2} name="Revenue ($)" />
                            <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} name="Bookings" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Event Types Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Types Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={eventTypes}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {eventTypes.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 gap-6">
                {/* Venue Utilization */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Venue Utilization Rate</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={venueUtilization}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="venue" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                            <Legend />
                            <Bar dataKey="utilization" fill="#0284c7" name="Utilization (%)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-primary-50 to-cyan-50 rounded-xl border border-primary-200 p-6"
            >
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>Revenue has increased by 12.5% compared to last period, driven by higher corporate event bookings.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>Convention Center has the highest utilization rate at 90%, consider expanding capacity.</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>Wedding events constitute 35% of total bookings, maintaining position as top event category.</span>
                    </li>
                </ul>
            </motion.div>
        </motion.div>
    );
};

export default Reports;
