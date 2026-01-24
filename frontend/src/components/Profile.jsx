import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiCalendar, FiActivity } from 'react-icons/fi';
import { getProfile, getProgressStats, getCertificates } from '../utils/api';
import ProgressManager from '../utils/progressManager';
import DonutChart from './charts/DonutChart';
import WeeklyActivity from './charts/WeeklyActivity';
import ActivityStats from './charts/ActivityStats';
import MonthlyChart from './charts/MonthlyChart';

// Sector display names
const SECTOR_NAMES = {
    healthcare: "Healthcare Informatics",
    agriculture: "Smart Agriculture",
    urban: "Urban Planning"
};

const Profile = ({ onLogout }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progressData, setProgressData] = useState(null);

    useEffect(() => {
        // Force scroll to top on mount
        window.scrollTo(0, 0);

        // SYNC: Ensure all local progress is pushed to backend so charts are accurate
        ProgressManager.syncAllToBackend();

        const fetchData = async () => {
            try {
                const [profileData, statsData, certsData] = await Promise.all([
                    getProfile(),
                    getProgressStats(),
                    getCertificates()
                ]);
                setUser(profileData);
                setProgressData({ ...statsData, certificates: certsData?.certificates || [] });
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
    if (!user) return <div className="min-h-screen flex items-center justify-center text-white">Please log in to view profile.</div>;

    // Extract data from API or use defaults
    const enrollments = progressData?.enrollments || [];
    const stats = progressData?.stats || { activeDaysPercent: 0, totalDays: 0, bestStreak: 0 };
    const weeklyActivity = progressData?.weeklyActivity || {};
    const monthlyChartData = progressData?.monthlyChartData || [0, 0, 0, 0];
    const donutData = progressData?.donut || { activeLearning: 30, practiceSessions: 20, idleTime: 50 };

    // Check if user has any enrollments
    const hasEnrollments = enrollments.length > 0;

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 max-w-6xl mx-auto">
            {/* Account Overview Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl mb-8"
            >
                <h2 className="text-xl font-bold text-white mb-6">Account Overview</h2>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: User Info */}
                    <div className="flex-1">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg border-4 border-white/10 uppercase">
                                    {user.username ? user.username.charAt(0) : (user.email ? user.email.charAt(0) : 'U')}
                                </div>
                            </div>

                            {/* User Details */}
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-white mb-1">{user.username || "User"}</h1>

                                <div className="space-y-2 mt-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <FiMail className="w-4 h-4 text-indigo-400" />
                                        <span className="text-gray-400">Email</span>
                                        <span className="text-gray-200">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <FiCalendar className="w-4 h-4 text-pink-400" />
                                        <span className="text-gray-400">Last Active</span>
                                        <span className="text-gray-200">{new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={onLogout}
                                    className="mt-4 py-2 px-5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all text-sm font-semibold"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right: Donut Chart */}
                    <div className="lg:w-72">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <FiActivity className="w-4 h-4 text-indigo-400" />
                            User Activity Overview
                        </h3>
                        <DonutChart
                            activeLearning={donutData.activeLearning}
                            practiceSessions={donutData.practiceSessions}
                            idleTime={donutData.idleTime}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Current Courses Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl mb-8"
            >
                <h2 className="text-xl font-bold text-white mb-6">Current Courses</h2>

                {hasEnrollments ? (
                    <>
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            {enrollments.map((enrollment, index) => (
                                <WeeklyActivity
                                    key={index}
                                    courseName={SECTOR_NAMES[enrollment.sector] || enrollment.sector}
                                    weekData={weeklyActivity[enrollment.sector] || [false, false, false, false, false, false, false]}
                                />
                            ))}
                        </div>

                        {/* Stats Cards */}
                        <ActivityStats
                            activeDaysPercent={stats.activeDaysPercent}
                            totalDays={stats.totalDays}
                            bestStreak={stats.bestStreak}
                        />

                        {/* Monthly Activity Chart */}
                        <div className="mt-6">
                            <MonthlyChart weeklyData={monthlyChartData} />
                        </div>
                    </>
                ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <p className="text-gray-400">No courses enrolled yet. Start learning to track your progress!</p>
                        <button
                            onClick={() => window.location.href = '/explore'}
                            className="mt-4 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-medium hover:scale-105 transition-transform"
                        >
                            Browse Courses →
                        </button>
                    </div>
                )}
            </motion.div>

            {/* My Certificates Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl mb-8"
            >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <FiActivity className="text-emerald-400" />
                    My Certificates
                </h3>

                {(progressData?.certificates && progressData.certificates.length > 0) ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {progressData.certificates.map((cert, index) => (
                            <div key={index} className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-900/10 to-teal-900/10 border border-emerald-500/20 hover:border-emerald-500/50 transition-all group">
                                <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10 group-hover:scale-110 transition-transform">
                                    🎓
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-lg mb-1">{SECTOR_NAMES[cert.sector] || "Course Completion"}</h4>
                                    <p className="text-xs text-emerald-400 font-mono bg-emerald-500/10 inline-block px-2 py-1 rounded mb-1">
                                        ID: {cert.verification_id}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Issued: {new Date(cert.issued_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl grayscale opacity-50">
                            🏆
                        </div>
                        <p className="text-gray-400 font-medium">No certificates earned yet.</p>
                        <p className="text-sm text-gray-500 mt-2">Complete a course and pass the final quiz to earn your first certificate!</p>
                    </div>
                )}
            </motion.div>

            {/* Learning Journey Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
                <h3 className="text-xl font-bold text-white mb-4">My Learning Journey</h3>
                {hasEnrollments ? (
                    <div className="grid md:grid-cols-3 gap-4">
                        {enrollments.map((enrollment, index) => (
                            <div
                                key={index}
                                className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-all cursor-pointer"
                                onClick={() => window.location.href = `/course/${enrollment.sector}`}
                            >
                                <div className="text-3xl mb-2">
                                    {enrollment.sector === 'healthcare' ? '🏥' :
                                        enrollment.sector === 'agriculture' ? '🌾' : '🏙️'}
                                </div>
                                <h4 className="text-white font-semibold">{SECTOR_NAMES[enrollment.sector]}</h4>
                                <p className="text-sm text-gray-400 mt-1">{enrollment.videosWatched || 0} videos watched</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                        <p className="text-gray-400">Track your progress across all enrolled courses here.</p>
                        <button onClick={() => window.location.href = '/explore'} className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium text-sm">
                            Explore Courses &rarr;
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Profile;
