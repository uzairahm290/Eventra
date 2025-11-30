import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiCalendar, FiUsers, FiDownload } from 'react-icons/fi';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';

type EventItem = { id: number; title: string; date: string; status?: number; ticketPrice?: number; maxAttendees?: number; currentAttendees?: number; category?: number; categoryName?: string; venueName?: string };
type BookingItem = { id: number; eventId?: number; totalAmount?: number; bookingDate: string; status?: number; userId?: string };

const Reports: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [bookings, setBookings] = useState<BookingItem[]>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { eventService, bookingService } = await import('../services');
                const ev = await eventService.getAllEvents();
                const bk = await bookingService.getAllBookings();
                setEvents(ev || []);
                setBookings(bk || []);
            } catch (error) {
                console.error('Failed to load reports data:', error);
                toast.error('Failed to load reports data');
            }
        };
        loadData();
    }, []);

    const monthlyRevenue = useMemo(() => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const byMonth: Record<string, { revenue: number; bookings: number }> = {};
        bookings.forEach(b => {
            const d = new Date(b.bookingDate);
            const key = months[d.getMonth()];
            if (!byMonth[key]) byMonth[key] = { revenue: 0, bookings: 0 };
            byMonth[key].revenue += (b.totalAmount ?? 0);
            byMonth[key].bookings += 1;
        });
        return months.map(m => ({ month: m, revenue: byMonth[m]?.revenue ?? 0, bookings: byMonth[m]?.bookings ?? 0 }));
    }, [bookings]);

    const eventTypes = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const name = e.categoryName ?? 'Other';
            counts[name] = (counts[name] ?? 0) + 1;
        });
        const palette = ['#ec4899','#3b82f6','#8b5cf6','#10b981','#f97316','#22d3ee'];
        return Object.entries(counts).map(([name, value], idx) => ({ name, value, color: palette[idx % palette.length] }));
    }, [events]);

    const venueUtilization = useMemo(() => {
        // If venue names exist on events, compute simple utilization metric by occurrences
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const venue = e.venueName || 'N/A';
            counts[venue] = (counts[venue] ?? 0) + 1;
        });
        return Object.entries(counts).map(([venue, count]) => ({ venue, utilization: Math.min(100, count * 10) }));
    }, [events]);

    const stats = useMemo(() => {
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);
        const totalBookings = bookings.length;
        const activeClients = new Set(bookings.map(b => b.userId)).size;
        const avgRevenuePerEvent = events.length ? totalRevenue / events.length : 0;
        return [
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, change: 'YTD', icon: FiDollarSign, color: 'bg-green-500' },
            { label: 'Total Bookings', value: String(totalBookings), change: 'YTD', icon: FiCalendar, color: 'bg-blue-500' },
            { label: 'Active Clients', value: String(activeClients), change: 'YTD', icon: FiUsers, color: 'bg-purple-500' },
            { label: 'Avg. Revenue/Event', value: `$${avgRevenuePerEvent.toFixed(2)}`, change: 'YTD', icon: FiTrendingUp, color: 'bg-orange-500' },
        ];
    }, [bookings, events]);

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
                                <button
                                    className="btn-primary flex items-center gap-2"
                                    onClick={() => {
                                        try {
                                            // Build CSV from computed datasets
                                            const rows: Array<Array<string | number>> = [];
                                            // Section 1: KPIs
                                            rows.push(['Section','Metric','Value']);
                                            rows.push(['KPIs','Total Revenue', stats[0]?.value ?? '0']);
                                            rows.push(['KPIs','Total Bookings', stats[1]?.value ?? '0']);
                                            rows.push(['KPIs','Active Clients', stats[2]?.value ?? '0']);
                                            rows.push(['KPIs','Avg. Revenue/Event', stats[3]?.value ?? '0']);

                                            // Blank line
                                            rows.push([]);

                                            // Section 2: Monthly Revenue & Bookings
                                            rows.push(['Month','Revenue','Bookings']);
                                            monthlyRevenue.forEach(m => rows.push([m.month, m.revenue, m.bookings]));

                                            // Blank line
                                            rows.push([]);

                                            // Section 3: Event Types Distribution
                                            rows.push(['Event Type','Count']);
                                            eventTypes.forEach(t => rows.push([t.name, t.value]));

                                            // Blank line
                                            rows.push([]);

                                            // Section 4: Venue Utilization
                                            rows.push(['Venue','Utilization %']);
                                            venueUtilization.forEach(v => rows.push([v.venue, v.utilization]));

                                            const csv = rows
                                                .map(r => r.map(val => {
                                                    const s = String(val ?? '');
                                                    // Escape commas, quotes, and newlines
                                                    if (/[",\n]/.test(s)) {
                                                        return '"' + s.replace(/"/g, '""') + '"';
                                                    }
                                                    return s;
                                                }).join(','))
                                                .join('\n');

                                            // Create downloadable file (add BOM for Excel compatibility)
                                            const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
                                            a.download = `eventra-report-${ts}.csv`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        } catch (e) {
                                            console.error('Export failed:', e);
                                            toast.error('Failed to export report');
                                        }
                                    }}
                                >
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
                className="bg-linear-to-r from-primary-50 to-cyan-50 rounded-xl border border-primary-200 p-6"
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
