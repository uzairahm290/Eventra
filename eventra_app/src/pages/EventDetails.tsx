import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    FiCalendar, FiClock, FiMapPin, FiUsers, FiDollarSign,
    FiEdit, FiTrash2, FiArrowLeft, FiMail, FiPhone, FiCheckCircle
} from 'react-icons/fi';

const EventDetails: React.FC = () => {
    const navigate = useNavigate();

    // Mock event data
    const event = {
        id: 1,
        title: 'Annual Tech Conference 2025',
        status: 'Confirmed',
        date: 'June 15, 2025',
        time: '9:00 AM - 5:00 PM',
        venue: 'Grand Convention Center',
        venueAddress: '123 Main Street, Downtown',
        attendees: 250,
        budget: '$45,000',
        client: {
            name: 'TechCorp Inc.',
            email: 'contact@techcorp.com',
            phone: '+1 (555) 123-4567',
        },
        description: 'A full-day technology conference featuring keynote speakers, panel discussions, and networking opportunities. The event will showcase the latest innovations in AI, cloud computing, and cybersecurity.',
        services: [
            'Audio/Visual Equipment',
            'Catering (Breakfast & Lunch)',
            'Registration Desk',
            'WiFi & Networking',
            'Stage & Lighting',
        ],
        timeline: [
            { time: '8:00 AM', activity: 'Setup & Registration Opens' },
            { time: '9:00 AM', activity: 'Opening Keynote' },
            { time: '10:30 AM', activity: 'Panel Discussion: AI in Business' },
            { time: '12:00 PM', activity: 'Lunch Break' },
            { time: '1:30 PM', activity: 'Breakout Sessions' },
            { time: '3:30 PM', activity: 'Networking Session' },
            { time: '5:00 PM', activity: 'Closing Remarks' },
        ],
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
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/events')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <FiArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                <FiCheckCircle className="w-4 h-4 mr-1" />
                                {event.status}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary flex items-center gap-2">
                        <FiEdit className="w-4 h-4" />
                        Edit
                    </button>
                    <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                        <FiTrash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Event Info Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <FiCalendar className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Date</p>
                                    <p className="font-semibold text-gray-900">{event.date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <FiClock className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Time</p>
                                    <p className="font-semibold text-gray-900">{event.time}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <FiMapPin className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Venue</p>
                                    <p className="font-semibold text-gray-900">{event.venue}</p>
                                    <p className="text-sm text-gray-500">{event.venueAddress}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <FiUsers className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Expected Attendees</p>
                                    <p className="font-semibold text-gray-900">{event.attendees} people</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-primary-100 p-2 rounded-lg">
                                    <FiDollarSign className="w-5 h-5 text-primary-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Budget</p>
                                    <p className="font-semibold text-gray-900">{event.budget}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                        <p className="text-gray-700 leading-relaxed">{event.description}</p>
                    </motion.div>

                    {/* Services */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Included</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {event.services.map((service, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <FiCheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="text-gray-700">{service}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Timeline</h2>
                        <div className="space-y-4">
                            {event.timeline.map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="bg-primary-100 px-3 py-1 rounded-lg min-w-[100px] text-center">
                                        <span className="text-sm font-semibold text-primary-700">{item.time}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-medium">{item.activity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column - Client Info */}
                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                    >
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Client Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Client Name</p>
                                <p className="font-semibold text-gray-900">{event.client.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Email</p>
                                <a href={`mailto:${event.client.email}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                                    <FiMail className="w-4 h-4" />
                                    {event.client.email}
                                </a>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Phone</p>
                                <a href={`tel:${event.client.phone}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                                    <FiPhone className="w-4 h-4" />
                                    {event.client.phone}
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-primary-600 to-cyan-600 rounded-xl p-6 text-white"
                    >
                        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors text-left">
                                Send Confirmation Email
                            </button>
                            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors text-left">
                                Generate Invoice
                            </button>
                            <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg transition-colors text-left">
                                Download Contract
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default EventDetails;
