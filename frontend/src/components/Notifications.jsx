import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken, getProfile, getEnrollments } from '../utils/api';

const Notifications = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                setNotifications([]);
                setLoading(false);
                return;
            }

            // Get user data to personalize notifications
            const [profile, enrollmentsData] = await Promise.all([
                getProfile(),
                getEnrollments()
            ]);

            const enrollments = enrollmentsData?.enrollments || [];
            const dynamicNotifications = await generateDynamicNotifications(profile, enrollments);

            // Load from localStorage (for persistence)
            const readNotifications = localStorage.getItem('readNotifications');
            const deletedNotifications = localStorage.getItem('deletedNotifications');
            const readIds = readNotifications ? JSON.parse(readNotifications) : [];
            const deletedIds = deletedNotifications ? JSON.parse(deletedNotifications) : [];

            // Filter out deleted notifications
            let allNotifications = dynamicNotifications.filter(notif => !deletedIds.includes(notif.id));

            // Mark notifications as read based on saved state
            allNotifications = allNotifications.map(notif => ({
                ...notif,
                read: readIds.includes(notif.id)
            }));

            // Sort by time (newest first)
            allNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            setNotifications(allNotifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const generateDynamicNotifications = async (profile, enrollments) => {
        const notifs = [];
        const now = new Date();

        // Welcome notification (only if user is new - less than 24 hours)
        if (profile?.created_at) {
            const createdDate = new Date(profile.created_at);
            const hoursSinceJoin = (now - createdDate) / (1000 * 60 * 60);

            if (hoursSinceJoin < 24) {
                notifs.push({
                    id: `welcome_${profile.id}`,
                    type: 'success',
                    icon: '🎉',
                    title: 'Welcome to Root2Rise!',
                    message: `Hi${profile.username ? ' ' + profile.username : ''}! Your learning journey begins now. Check out your personalized roadmap.`,
                    time: 'Just now',
                    timestamp: createdDate,
                    read: false,
                    action: { label: 'View Roadmap', link: '/roadmap' }
                });
            }
        }

        // Course recommendations based on sector
        if (profile?.sector) {
            const sectorNames = {
                healthcare: 'Healthcare Informatics',
                agriculture: 'Agricultural Technology',
                urban: 'Urban & Smart Cities'
            };

            const isEnrolled = enrollments.some(e => e.sector === profile.sector);

            if (!isEnrolled) {
                notifs.push({
                    id: `recommend_${profile.sector}`,
                    type: 'info',
                    icon: '📚',
                    title: 'Course Recommendation',
                    message: `Based on your profile, we recommend ${sectorNames[profile.sector]}. Start learning today!`,
                    time: '1 hour ago',
                    timestamp: new Date(now - 60 * 60 * 1000),
                    read: false,
                    action: { label: 'Enroll Now', link: `/course/${profile.sector}` }
                });
            }
        }

        // Continue learning notifications for enrolled courses
        if (enrollments.length > 0) {
            enrollments.forEach((enrollment, index) => {
                const enrolledDate = new Date(enrollment.enrolled_at);
                const daysSinceEnroll = (now - enrolledDate) / (1000 * 60 * 60 * 24);

                if (daysSinceEnroll < 7) {
                    const sectorNames = {
                        healthcare: 'Healthcare Informatics',
                        agriculture: 'Agricultural Technology',
                        urban: 'Urban & Smart Cities'
                    };

                    notifs.push({
                        id: `continue_${enrollment.sector}_${enrollment.enrolled_at}`,
                        type: 'reminder',
                        icon: '⏰',
                        title: 'Continue Your Learning',
                        message: `You're enrolled in ${sectorNames[enrollment.sector]}. Keep your momentum going!`,
                        time: `${Math.floor(daysSinceEnroll)} day${Math.floor(daysSinceEnroll) !== 1 ? 's' : ''} ago`,
                        timestamp: new Date(now - daysSinceEnroll * 24 * 60 * 60 * 1000),
                        read: false,
                        action: { label: 'Continue', link: `/course/${enrollment.sector}` }
                    });
                }
            });
        }

        // Achievement notifications based on video progress
        if (enrollments.length > 0) {
            const totalVideos = enrollments.reduce((sum, e) => sum + (e.videosWatched || 0), 0);

            if (totalVideos >= 5 && totalVideos < 6) {
                notifs.push({
                    id: `achievement_5_videos`,
                    type: 'achievement',
                    icon: '🏆',
                    title: 'Milestone Reached!',
                    message: `Congratulations! You've completed ${totalVideos} video lessons. Keep up the great work!`,
                    time: '2 days ago',
                    timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000),
                    read: false
                });
            } else if (totalVideos >= 10 && totalVideos < 11) {
                notifs.push({
                    id: `achievement_10_videos`,
                    type: 'achievement',
                    icon: '🌟',
                    title: 'Excellent Progress!',
                    message: `Amazing! You've watched ${totalVideos} videos. You're on fire! 🔥`,
                    time: '1 day ago',
                    timestamp: new Date(now - 24 * 60 * 60 * 1000),
                    read: false
                });
            }
        }

        // Platform updates
        notifs.push({
            id: 'update_2026_01',
            type: 'update',
            icon: '🔔',
            title: 'New Features Available',
            message: 'We\'ve added personalized roadmaps, progress tracking, and skill assessments!',
            time: '3 days ago',
            timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000),
            read: false
        });

        return notifs;
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif
        ));

        // Save to localStorage
        const readNotifications = localStorage.getItem('readNotifications');
        const readIds = readNotifications ? JSON.parse(readNotifications) : [];
        if (!readIds.includes(id)) {
            readIds.push(id);
            localStorage.setItem('readNotifications', JSON.stringify(readIds));
        }
    };

    const markAllAsRead = () => {
        const updatedNotifs = notifications.map(notif => ({ ...notif, read: true }));
        setNotifications(updatedNotifs);

        // Save all as read
        const allIds = notifications.map(n => n.id);
        localStorage.setItem('readNotifications', JSON.stringify(allIds));
    };

    const deleteNotification = (id) => {
        const updatedNotifs = notifications.filter(notif => notif.id !== id);
        setNotifications(updatedNotifs);

        // Add to deleted list to prevent re-generation
        const deletedNotifications = localStorage.getItem('deletedNotifications');
        const deletedIds = deletedNotifications ? JSON.parse(deletedNotifications) : [];
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem('deletedNotifications', JSON.stringify(deletedIds));
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getTypeColor = (type) => {
        switch (type) {
            case 'success': return 'from-green-500 to-emerald-500';
            case 'info': return 'from-blue-500 to-cyan-500';
            case 'achievement': return 'from-yellow-500 to-orange-500';
            case 'reminder': return 'from-purple-500 to-pink-500';
            case 'update': return 'from-indigo-500 to-purple-500';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getTimeAgo = (timestamp) => {
        if (!timestamp) return 'Recently';

        const now = new Date();
        const then = new Date(timestamp);
        const seconds = Math.floor((now - then) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) !== 1 ? 's' : ''} ago`;
        const days = Math.floor(seconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            />

            {/* Notification Panel */}
            <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-[#0f0518] border-l border-white/10 shadow-2xl z-[100] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            🔔 Notifications
                            {unreadCount > 0 && (
                                <span className="px-2 py-1 bg-rose-500 text-white text-xs rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Stay updated with your progress</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Actions */}
                {unreadCount > 0 && (
                    <div className="px-6 py-3 border-b border-white/10">
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                                <p>Loading notifications...</p>
                            </div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-center">No notifications yet</p>
                            <p className="text-sm text-gray-500 mt-2">We'll notify you when something new happens</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            <AnimatePresence>
                                {notifications.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        layout
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: 100 }}
                                        onClick={() => !notif.read && markAsRead(notif.id)}
                                        className={`p-6 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-white/3' : ''
                                            }`}
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${getTypeColor(notif.type)} flex items-center justify-center text-2xl`}>
                                                {notif.icon}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-white text-sm">
                                                        {notif.title}
                                                    </h3>
                                                    {!notif.read && (
                                                        <span className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-sm mb-2">
                                                    {notif.message}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">
                                                        {getTimeAgo(notif.timestamp)}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        {notif.action && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    window.location.href = notif.action.link;
                                                                }}
                                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                                                            >
                                                                {notif.action.label} →
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteNotification(notif.id);
                                                            }}
                                                            className="text-xs text-gray-500 hover:text-rose-400"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Notifications;
