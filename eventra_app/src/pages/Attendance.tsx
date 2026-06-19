import React, { useEffect, useState, useCallback } from 'react';
import { FiCheckSquare, FiSave, FiUsers, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

type AttendanceStatus = 'Present' | 'Absent' | 'HalfDay' | 'Leave' | 'NotMarked';

interface AttendanceRecord {
  id: number;
  workerId: number;
  workerName: string;
  workerType: string;
  venueId: number;
  venueName?: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

interface Venue {
  id: number;
  name: string;
}

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  Present: 'bg-green-100 text-green-800',
  Absent: 'bg-red-100 text-red-800',
  HalfDay: 'bg-yellow-100 text-yellow-800',
  Leave: 'bg-blue-100 text-blue-800',
  NotMarked: 'bg-gray-100 text-gray-500',
};

const toDateStr = (d: Date) => d.toISOString().split('T')[0];

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'Owner';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [selectedVenueId, setSelectedVenueId] = useState<number>(user?.venueId ?? 0);
  const [localStatus, setLocalStatus] = useState<Record<number, AttendanceStatus>>({});
  const [localNotes, setLocalNotes] = useState<Record<number, string>>({});

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
  };

  const loadVenues = async () => {
    if (!isOwner) return;
    try {
      const res = await fetch('/api/Venues', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setVenues(data);
        if (data.length > 0 && !selectedVenueId) {
          setSelectedVenueId(data[0].id);
        }
      }
    } catch {
      // silently fail
    }
  };

  const loadAttendance = useCallback(async () => {
    const venueId = isOwner ? selectedVenueId : user?.venueId;
    if (!venueId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/Attendance/venue/${venueId}/date/${selectedDate}`, {
        headers: authHeaders,
      });
      if (res.ok) {
        const data: AttendanceRecord[] = await res.json();
        setRecords(data);
        // Initialise local edits
        const statusMap: Record<number, AttendanceStatus> = {};
        const notesMap: Record<number, string> = {};
        data.forEach(r => {
          statusMap[r.workerId] = r.status as AttendanceStatus;
          notesMap[r.workerId] = r.notes ?? '';
        });
        setLocalStatus(statusMap);
        setLocalNotes(notesMap);
      }
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedVenueId, isOwner, user?.venueId]);

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const markAllPresent = () => {
    const updated: Record<number, AttendanceStatus> = {};
    records.forEach(r => { updated[r.workerId] = 'Present'; });
    setLocalStatus(prev => ({ ...prev, ...updated }));
    toast.info('All marked as Present — click Save to confirm');
  };

  const handleSave = async () => {
    const venueId = isOwner ? selectedVenueId : user?.venueId;
    if (!venueId) return;

    const entries = records.map(r => ({
      workerId: r.workerId,
      date: selectedDate,
      status: localStatus[r.workerId] ?? 'Absent',
      notes: localNotes[r.workerId] || undefined,
    }));

    try {
      setSaving(true);
      const res = await fetch('/api/Attendance/bulk', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ entries }),
      });
      if (res.ok) {
        toast.success('Attendance saved');
        loadAttendance();
      } else {
        toast.error('Failed to save attendance');
      }
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(localStatus).filter(s => s === 'Present').length;
  const absentCount = Object.values(localStatus).filter(s => s === 'Absent').length;
  const halfDayCount = Object.values(localStatus).filter(s => s === 'HalfDay').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Mark daily attendance for your staff</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllPresent}
            className="btn-outline flex items-center gap-2"
          >
            <FiUsers className="w-4 h-4" />
            All Present
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input pl-10 w-full focus:outline-none"
                max={toDateStr(new Date())}
              />
            </div>
          </div>
          {isOwner && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marque</label>
              <select
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(Number(e.target.value))}
                className="input w-full focus:outline-none"
              >
                <option value={0}>Select a marque</option>
                {venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            <p className="text-sm text-gray-500">Present</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            <p className="text-sm text-gray-500">Absent</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{halfDayCount}</p>
            <p className="text-sm text-gray-500">Half Day</p>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      {loading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading attendance...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="card p-8 text-center">
          <FiCheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {!selectedVenueId && isOwner
              ? 'Select a marque to view attendance'
              : 'No staff found for this marque'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Staff Member</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Role</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(record => {
                  const status = localStatus[record.workerId] ?? 'NotMarked';
                  return (
                    <tr key={record.workerId} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{record.workerName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{record.workerType}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={status}
                          onChange={(e) =>
                            setLocalStatus(prev => ({
                              ...prev,
                              [record.workerId]: e.target.value as AttendanceStatus,
                            }))
                          }
                          className={`text-sm rounded-md px-2 py-1 font-medium border-0 focus:ring-2 focus:ring-primary-500 ${STATUS_COLORS[status]}`}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="HalfDay">Half Day</option>
                          <option value="Leave">Leave</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={localNotes[record.workerId] ?? ''}
                          onChange={(e) =>
                            setLocalNotes(prev => ({
                              ...prev,
                              [record.workerId]: e.target.value,
                            }))
                          }
                          placeholder="Optional note..."
                          className="input text-sm w-full max-w-xs focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
