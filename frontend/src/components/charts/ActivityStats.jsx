import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiCalendar, FiTrendingUp } from 'react-icons/fi';

const StatCard = ({ icon: Icon, value, label, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={`
            flex-1 min-w-[100px] p-4 rounded-xl text-center
            bg-gradient-to-br ${color}
            border border-white/10 backdrop-blur-sm
        `}
    >
        <div className="flex justify-center mb-2">
            <Icon className="w-5 h-5 text-white/70" />
        </div>
        <motion.p
            className="text-2xl font-bold text-white"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        >
            {value}
        </motion.p>
        <p className="text-xs text-white/60 mt-1">{label}</p>
    </motion.div>
);

const ActivityStats = ({
    activeDaysPercent = 82,
    totalDays = 23,
    bestStreak = 12
}) => {
    return (
        <div className="flex gap-3 flex-wrap">
            <StatCard
                icon={FiActivity}
                value={`${activeDaysPercent}%`}
                label="Active Days"
                color="from-blue-600/40 to-blue-800/40"
                delay={0}
            />
            <StatCard
                icon={FiCalendar}
                value={totalDays}
                label="Total Days"
                color="from-emerald-600/40 to-emerald-800/40"
                delay={0.1}
            />
            <StatCard
                icon={FiTrendingUp}
                value={bestStreak}
                label="Best Streak"
                color="from-purple-600/40 to-purple-800/40"
                delay={0.2}
            />
        </div>
    );
};

export default ActivityStats;
