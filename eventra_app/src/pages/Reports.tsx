import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiDollarSign, FiCalendar, FiDownload, FiAlertCircle } from 'react-icons/fi';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

interface ReportBooking {
  id: number;
  bookingDate: string;
  eventDate: string;
  eventTitle: string;
  status: string;
  clientName: string;
  marqueName?: string;
  hallName?: string;
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  isApprovedByAdmin: boolean;
}

interface ReportWorker {
  id: number;
  type: string;
  venueId: number;
  isActive: boolean;
}

interface Venue { id: number; name: string; }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PALETTE = ['#0284c7', '#8b5cf6', '#10b981', '#f97316', '#ec4899', '#22d3ee', '#f59e0b', '#6366f1'];

const fmt = (n: number) => `₨${Math.round(n).toLocaleString('en-PK')}`;

const toDateStr = (d: Date) => d.toISOString().split('T')[0];
const firstOfMonth = () => { const d = new Date(); d.setDate(1); return toDateStr(d); };

const getPaymentStatus = (b: ReportBooking) =>
  b.totalAmount > 0 && b.amountPaid >= b.totalAmount ? 'Paid'
    : b.amountPaid > 0 ? 'Partial'
      : 'Unpaid';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  const [bookings, setBookings] = useState<ReportBooking[]>([]);
  const [workers, setWorkers] = useState<ReportWorker[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFrom, setDateFrom] = useState(firstOfMonth());
  const [dateTo, setDateTo] = useState(toDateStr(new Date()));
  const [filterVenueId, setFilterVenueId] = useState<number>(0);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const requests: Promise<Response>[] = [
        fetch('/api/Bookings', { headers: authHeaders }),
        fetch('/api/Workers', { headers: authHeaders }),
      ];
      if (isOwner) requests.push(fetch('/api/Venues', { headers: authHeaders }));
      const [bRes, wRes, vRes] = await Promise.all(requests);
      if (bRes.ok) setBookings(await bRes.json());
      if (wRes.ok) setWorkers(await wRes.json());
      if (vRes?.ok) setVenues(await vRes.json());
    } catch {
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Apply date range + marque filter
  const filtered = useMemo(() => {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    const venueName = isOwner && filterVenueId ? venues.find(v => v.id === filterVenueId)?.name : null;

    return bookings.filter(b => {
      const d = new Date(b.bookingDate);
      const inRange = d >= from && d <= to;
      const inVenue = !venueName || b.marqueName === venueName;
      return inRange && inVenue;
    });
  }, [bookings, dateFrom, dateTo, filterVenueId, venues, isOwner]);

  const filteredWorkers = useMemo(() => {
    if (!isOwner || !filterVenueId) return workers;
    return workers.filter(w => w.venueId === filterVenueId);
  }, [workers, filterVenueId, isOwner]);

  // KPI stats
  const totalRevenue = filtered.reduce((s, b) => s + b.totalAmount, 0);
  const totalCollected = filtered.reduce((s, b) => s + b.amountPaid, 0);
  const totalDue = filtered.reduce((s, b) => s + Math.max(0, b.totalAmount - b.amountPaid), 0);
  const pendingApprovals = filtered.filter(b => !b.isApprovedByAdmin && b.status !== 'Cancelled').length;

  // Monthly revenue bar data (current year, all months)
  const monthlyData = useMemo(() => {
    const byMonth: Record<string, { collected: number; due: number; count: number }> = {};
    filtered.forEach(b => {
      const key = MONTHS[new Date(b.bookingDate).getMonth()];
      if (!byMonth[key]) byMonth[key] = { collected: 0, due: 0, count: 0 };
      byMonth[key].collected += b.amountPaid;
      byMonth[key].due += Math.max(0, b.totalAmount - b.amountPaid);
      byMonth[key].count += 1;
    });
    return MONTHS.map(m => ({
      month: m,
      collected: Math.round(byMonth[m]?.collected ?? 0),
      due: Math.round(byMonth[m]?.due ?? 0),
      bookings: byMonth[m]?.count ?? 0,
    }));
  }, [filtered]);

  // Payment status pie
  const paymentStatusData = useMemo(() => {
    const counts: Record<string, number> = { Paid: 0, Partial: 0, Unpaid: 0 };
    filtered.forEach(b => { counts[getPaymentStatus(b)]++; });
    return [
      { name: 'Paid', value: counts.Paid, color: '#10b981' },
      { name: 'Partial', value: counts.Partial, color: '#f97316' },
      { name: 'Unpaid', value: counts.Unpaid, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [filtered]);

  // Hall utilization (bookings per hall)
  const hallData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(b => {
      const hall = b.hallName ?? 'Unassigned';
      counts[hall] = (counts[hall] ?? 0) + 1;
    });
    return Object.entries(counts)
      .map(([hall, bookings]) => ({ hall, bookings }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 8);
  }, [filtered]);

  // Worker type distribution
  const workerTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredWorkers.filter(w => w.isActive).forEach(w => {
      counts[w.type] = (counts[w.type] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));
  }, [filteredWorkers]);

  // Booking status breakdown
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(b => { counts[b.status] = (counts[b.status] ?? 0) + 1; });
    return Object.entries(counts).map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }));
  }, [filtered]);

  const exportCSV = () => {
    try {
      const rows: Array<Array<string | number>> = [];
      rows.push(['Eventra Report', `${dateFrom} to ${dateTo}`]);
      rows.push([]);
      rows.push(['KPI', 'Value']);
      rows.push(['Total Bookings', filtered.length]);
      rows.push(['Total Revenue', totalRevenue]);
      rows.push(['Collected', totalCollected]);
      rows.push(['Balance Due', totalDue]);
      rows.push([]);
      rows.push(['Month', 'Collected (₨)', 'Due (₨)', 'Bookings']);
      monthlyData.forEach(m => rows.push([m.month, m.collected, m.due, m.bookings]));
      rows.push([]);
      rows.push(['Hall', 'Bookings']);
      hallData.forEach(h => rows.push([h.hall, h.bookings]));

      const csv = rows
        .map(r => r.map(v => {
          const s = String(v ?? '');
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(','))
        .join('\n');

      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eventra-report-${dateFrom}-${dateTo}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Report exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Revenue, bookings, halls, and staff insights</p>
        </div>
        <button onClick={exportCSV} className="btn-primary flex items-center gap-2">
          <FiDownload className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={e => setDateFrom(e.target.value)}
              className="input w-full focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={toDateStr(new Date())}
              onChange={e => setDateTo(e.target.value)}
              className="input w-full focus:outline-none"
            />
          </div>
          {isOwner && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Marque</label>
              <select
                value={filterVenueId}
                onChange={e => setFilterVenueId(Number(e.target.value))}
                className="input w-full focus:outline-none"
              >
                <option value={0}>All Marques</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Bookings', value: String(filtered.length), icon: FiCalendar, color: 'bg-blue-500', sub: pendingApprovals > 0 ? `${pendingApprovals} pending approval` : undefined },
              { label: 'Total Revenue', value: fmt(totalRevenue), icon: FiDollarSign, color: 'bg-purple-500' },
              { label: 'Collected', value: fmt(totalCollected), icon: FiTrendingUp, color: 'bg-emerald-500' },
              { label: 'Balance Due', value: fmt(totalDue), icon: FiAlertCircle, color: 'bg-orange-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} p-2.5 rounded-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                {stat.sub && <p className="text-xs text-orange-500 mt-1">{stat.sub}</p>}
              </motion.div>
            ))}
          </div>

          {/* Revenue trend + Payment Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 card p-6"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4">Monthly Revenue (₨)</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                  <Tooltip
                    formatter={(v: number) => fmt(v)}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="collected" fill="#10b981" name="Collected" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="due" fill="#f97316" name="Due" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="card p-6"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4">Payment Status</h3>
              {paymentStatusData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={paymentStatusData}
                        cx="50%" cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {paymentStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1 mt-2">
                    {paymentStatusData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ background: d.color }} />
                          {d.name}
                        </span>
                        <span className="font-medium">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Hall Utilization + Worker Types */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4">Hall Utilization (Bookings)</h3>
              {hallData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={hallData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" stroke="#6b7280" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="hall" stroke="#6b7280" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="bookings" fill="#0284c7" name="Bookings" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="card p-6"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4">
                Staff Distribution
                <span className="text-sm font-normal text-gray-500 ml-2">Active workers</span>
              </h3>
              {workerTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">No data</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={workerTypeData}
                        cx="50%" cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {workerTypeData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1 mt-2">
                    {workerTypeData.map(d => (
                      <div key={d.name} className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                        <span className="truncate text-gray-700">{d.name}</span>
                        <span className="font-medium ml-auto">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          {/* Booking Status Breakdown */}
          {statusData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <h3 className="text-base font-semibold text-gray-900 mb-4">Booking Status Breakdown</h3>
              <div className="flex flex-wrap gap-4">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: d.color }} />
                    <div>
                      <p className="font-semibold text-gray-900">{d.value}</p>
                      <p className="text-xs text-gray-500">{d.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default Reports;
