import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns';

const Calendar: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week'>('month');

    // Mock events data
    const events = [
        { id: 1, title: 'Corporate Conference', date: new Date(2025, 10, 25), time: '10:00 AM', venue: 'Grand Hall A', color: 'bg-blue-500' },
        { id: 2, title: 'Wedding Reception', date: new Date(2025, 10, 28), time: '6:00 PM', venue: 'Garden Pavilion', color: 'bg-pink-500' },
        { id: 3, title: 'Product Launch', date: new Date(2025, 10, 30), time: '2:00 PM', venue: 'Convention Center', color: 'bg-purple-500' },
    ];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const getEventsForDay = (day: Date) => {
        return events.filter(event =>
            event.date.getDate() === day.getDate() &&
            event.date.getMonth() === day.getMonth() &&
            event.date.getFullYear() === day.getFullYear()
        );
    };

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
                    <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                    <p className="text-gray-600 mt-1">View and manage your event schedule</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={() => setView('month')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'week' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Week
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Card */}
            <div className="bg-white rounded-xl shadow-soft-xl border border-gray-200 overflow-hidden">
                {/* Calendar Header */}
                <div className="bg-gradient-to-r from-primary-600 to-cyan-600 p-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <FiChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <h2 className="text-2xl font-bold text-white">
                            {format(currentDate, 'MMMM yyyy')}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <FiChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-2">
                        {daysInMonth.map((day, index) => {
                            const dayEvents = getEventsForDay(day);
                            const isCurrentDay = isToday(day);
                            const isCurrentMonth = isSameMonth(day, currentDate);

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.01 }}
                                    className={`min-h-[100px] p-2 rounded-lg border transition-all hover:shadow-md cursor-pointer ${isCurrentDay
                                            ? 'bg-primary-50 border-primary-500 ring-2 ring-primary-500'
                                            : isCurrentMonth
                                                ? 'bg-white border-gray-200 hover:border-primary-300'
                                                : 'bg-gray-50 border-gray-100'
                                        }`}
                                >
                                    <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? 'text-primary-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {format(day, 'd')}
                                    </div>
                                    <div className="space-y-1">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                className={`${event.color} text-white text-xs px-2 py-1 rounded truncate`}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FiCalendar className="w-5 h-5 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                </div>
                <div className="space-y-3">
                    {events.map((event, index) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className={`w-2 h-16 ${event.color} rounded-full`}></div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <FiCalendar className="w-4 h-4" />
                                        {format(event.date, 'MMM dd, yyyy')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiClock className="w-4 h-4" />
                                        {event.time}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <FiMapPin className="w-4 h-4" />
                                        {event.venue}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Calendar;
