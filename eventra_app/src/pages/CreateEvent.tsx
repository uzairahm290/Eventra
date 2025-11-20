import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiDollarSign, FiFileText, FiSave, FiX } from 'react-icons/fi';

const CreateEvent: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        startTime: '',
        endTime: '',
        venue: '',
        attendees: '',
        budget: '',
        client: '',
        description: '',
        services: [] as string[],
    });

    const availableServices = [
        'Audio/Visual Equipment',
        'Catering',
        'Registration Desk',
        'WiFi & Networking',
        'Stage & Lighting',
        'Photography',
        'Videography',
        'Security',
        'Parking',
        'Decorations',
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceToggle = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Here you would typically send the data to your API
        navigate('/dashboard/events');
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
                    <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
                    <p className="text-gray-600 mt-1">Fill in the details to create a new event</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/events')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <FiX className="w-4 h-4" />
                    Cancel
                </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <FiFileText className="w-5 h-5 text-primary-600" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Title *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                                placeholder="e.g., Annual Tech Conference 2025"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiCalendar className="inline w-4 h-4 mr-1" />
                                Event Date *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiClock className="inline w-4 h-4 mr-1" />
                                Start Time *
                            </label>
                            <input
                                type="time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiClock className="inline w-4 h-4 mr-1" />
                                End Time *
                            </label>
                            <input
                                type="time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiMapPin className="inline w-4 h-4 mr-1" />
                                Venue *
                            </label>
                            <select
                                name="venue"
                                value={formData.venue}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                            >
                                <option value="">Select a venue</option>
                                <option value="Grand Hall A">Grand Hall A</option>
                                <option value="Garden Pavilion">Garden Pavilion</option>
                                <option value="Convention Center">Convention Center</option>
                                <option value="Rooftop Terrace">Rooftop Terrace</option>
                                <option value="Ballroom B">Ballroom B</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Event Details */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiUsers className="inline w-4 h-4 mr-1" />
                                Expected Attendees *
                            </label>
                            <input
                                type="number"
                                name="attendees"
                                value={formData.attendees}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                                placeholder="e.g., 250"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FiDollarSign className="inline w-4 h-4 mr-1" />
                                Budget *
                            </label>
                            <input
                                type="number"
                                name="budget"
                                value={formData.budget}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                                placeholder="e.g., 45000"
                                min="0"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client Name *
                            </label>
                            <input
                                type="text"
                                name="client"
                                value={formData.client}
                                onChange={handleInputChange}
                                required
                                className="input-field"
                                placeholder="e.g., TechCorp Inc."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="input-field resize-none"
                                placeholder="Describe the event, its purpose, and any special requirements..."
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Services */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
                >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Services Required</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {availableServices.map((service) => (
                            <label
                                key={service}
                                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.services.includes(service)
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formData.services.includes(service)}
                                    onChange={() => handleServiceToggle(service)}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-900">{service}</span>
                            </label>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-end gap-4"
                >
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/events')}
                        className="btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary flex items-center gap-2"
                    >
                        <FiSave className="w-4 h-4" />
                        Create Event
                    </button>
                </motion.div>
            </form>
        </motion.div>
    );
};

export default CreateEvent;
