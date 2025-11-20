import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiHelpCircle, FiMail, FiPhone, FiMessageCircle, FiBook, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface FAQ {
    question: string;
    answer: string;
}

const Help: React.FC = () => {
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const faqs: FAQ[] = [
        {
            question: 'How do I create a new event?',
            answer: 'To create a new event, navigate to the Events page and click the "Create Event" button. Fill in all required details including event title, date, venue, and services needed. Once completed, click "Save" to create the event.',
        },
        {
            question: 'How can I manage venue bookings?',
            answer: 'Go to the Venues page to view all available venues. You can check availability, view venue details, and make bookings directly from there. Each venue shows its capacity, amenities, and pricing information.',
        },
        {
            question: 'How do I add a new client?',
            answer: 'Navigate to the Clients page and click "Add Client". Enter the client\'s information including name, email, phone number, and company details. You can also add notes and preferences for future reference.',
        },
        {
            question: 'Can I export reports?',
            answer: 'Yes! Go to the Reports page and click the "Export Report" button. You can choose to export data in various formats including PDF and Excel. Reports include revenue analytics, booking statistics, and venue utilization.',
        },
        {
            question: 'How do I update my profile information?',
            answer: 'Click on your profile icon in the top right corner and select "Profile". From there, you can update your personal information, change your password, and manage notification preferences.',
        },
        {
            question: 'What payment methods are supported?',
            answer: 'We support various payment methods including credit cards, debit cards, bank transfers, and digital wallets. Payment processing is secure and PCI-compliant.',
        },
        {
            question: 'How can I track event budgets?',
            answer: 'Each event has a budget tracker that shows expenses versus allocated budget. You can view detailed breakdowns in the Event Details page and monitor spending in real-time.',
        },
        {
            question: 'Is there a mobile app available?',
            answer: 'Currently, Eventra is a web-based platform optimized for all devices. We are working on dedicated mobile apps for iOS and Android, which will be available soon.',
        },
    ];

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-cyan-600 rounded-full mb-4"
                >
                    <FiHelpCircle className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
                <p className="text-gray-600 mt-2">Find answers to common questions or get in touch with our team</p>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6 hover-lift transition-all-300 cursor-pointer"
                >
                    <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <FiMail className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                    <p className="text-gray-600 text-sm mb-3">Get help via email within 24 hours</p>
                    <a href="mailto:support@eventra.com" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        support@eventra.com
                    </a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6 hover-lift transition-all-300 cursor-pointer"
                >
                    <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <FiPhone className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
                    <p className="text-gray-600 text-sm mb-3">Talk to our team directly</p>
                    <a href="tel:+15551234567" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        +1 (555) 123-4567
                    </a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6 hover-lift transition-all-300 cursor-pointer"
                >
                    <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                        <FiMessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                    <p className="text-gray-600 text-sm mb-3">Chat with us in real-time</p>
                    <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                        Start Chat
                    </button>
                </motion.div>
            </div>

            {/* FAQs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-soft-xl border border-gray-200 p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <FiBook className="w-5 h-5 text-primary-600" />
                    <h2 className="text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-3">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                            >
                                <span className="font-medium text-gray-900">{faq.question}</span>
                                {openFAQ === index ? (
                                    <FiChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                ) : (
                                    <FiChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                )}
                            </button>
                            {openFAQ === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-4 pb-4 text-gray-600"
                                >
                                    {faq.answer}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Documentation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-primary-600 to-cyan-600 rounded-xl p-8 text-white text-center"
            >
                <h3 className="text-2xl font-bold mb-3">Need More Help?</h3>
                <p className="mb-6 opacity-90">
                    Check out our comprehensive documentation for detailed guides and tutorials
                </p>
                <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    View Documentation
                </button>
            </motion.div>
        </motion.div>
    );
};

export default Help;
