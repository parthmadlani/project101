import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';

const WeeklyActivity = ({
    courseName = "Course",
    weekData = [true, true, false, true, true, true, false] // Mon-Sun
}) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-white font-semibold text-sm truncate pr-4">{courseName}</h4>
                <button className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            <p className="text-xs text-gray-400 mb-3">This Week's Activity</p>

            <div className="flex justify-between gap-1">
                {days.map((day, index) => (
                    <motion.div
                        key={day}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="flex flex-col items-center gap-1.5"
                    >
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center transition-all
                            ${weekData[index]
                                ? 'bg-green-500/20 border border-green-500/40'
                                : 'bg-gray-700/30 border border-gray-600/30'
                            }
                        `}>
                            {weekData[index] ? (
                                <FiCheck className="w-4 h-4 text-green-400" />
                            ) : (
                                <FiX className="w-4 h-4 text-gray-500" />
                            )}
                        </div>
                        <span className="text-[10px] text-gray-500">{day}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default WeeklyActivity;
