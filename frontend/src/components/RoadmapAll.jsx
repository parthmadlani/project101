import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuthToken } from '../utils/api';
import Footer from './Footer';

const RoadmapAll = () => {
    const [roadmaps, setRoadmaps] = useState({
        healthcare: null,
        agriculture: null,
        urban: null
    });
    const [loading, setLoading] = useState(true);
    const [activeSector, setActiveSector] = useState('healthcare');

    useEffect(() => {
        fetchAllRoadmaps();
    }, []);

    const fetchAllRoadmaps = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers.Authorization = `Bearer ${token}`;

            // Fetch roadmaps for all 3 sectors
            const [healthcareRes, agricultureRes, urbanRes] = await Promise.all([
                fetch('http://localhost:8080/roadmap', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ sector: 'healthcare', skills: {} })
                }),
                fetch('http://localhost:8080/roadmap', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ sector: 'agriculture', skills: {} })
                }),
                fetch('http://localhost:8080/roadmap', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ sector: 'urban', skills: {} })
                })
            ]);

            const [healthcare, agriculture, urban] = await Promise.all([
                healthcareRes.ok ? healthcareRes.json() : null,
                agricultureRes.ok ? agricultureRes.json() : null,
                urbanRes.ok ? urbanRes.json() : null
            ]);

            setRoadmaps({ healthcare, agriculture, urban });
        } catch (error) {
            console.error('Failed to fetch roadmaps:', error);
        } finally {
            setLoading(false);
        }
    };

    const sectorInfo = {
        healthcare: {
            title: 'Healthcare Technology',
            icon: '🏥',
            color: 'from-blue-500 to-cyan-500'
        },
        agriculture: {
            title: 'Agricultural Innovation',
            icon: '🌾',
            color: 'from-green-500 to-emerald-500'
        },
        urban: {
            title: 'Urban Development',
            icon: '🏙️',
            color: 'from-purple-500 to-pink-500'
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-white text-xl">Loading all roadmaps...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-16 text-white">
            <div className="container mx-auto px-4 md:px-8 max-w-7xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-6xl font-black mb-4">
                        Explore All Learning Paths
                    </h1>
                    <p className="text-xl text-gray-400">Choose your career direction</p>
                </motion.div>

                {/* Sector Tabs */}
                <div className="flex justify-center gap-4 mb-12 flex-wrap">
                    {Object.keys(sectorInfo).map((sector) => {
                        const info = sectorInfo[sector];
                        return (
                            <motion.button
                                key={sector}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveSector(sector)}
                                className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${activeSector === sector
                                        ? `bg-gradient-to-r ${info.color} text-white shadow-xl`
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                <span className="mr-2">{info.icon}</span>
                                {info.title}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Active Sector Roadmap */}
                {roadmaps[activeSector] && (
                    <motion.div
                        key={activeSector}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        {/* Tips */}
                        {roadmaps[activeSector].tips && roadmaps[activeSector].tips.length > 0 && (
                            <div className={`mb-8 bg-gradient-to-r ${sectorInfo[activeSector].color} bg-opacity-10 border border-white/10 rounded-2xl p-6`}>
                                <h3 className="text-xl font-bold mb-4">💡 Expert Tips</h3>
                                <div className="space-y-2">
                                    {roadmaps[activeSector].tips.map((tip, i) => (
                                        <div key={i} className="flex gap-3">
                                            <span className="text-green-400">•</span>
                                            <p className="text-gray-300">{tip}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Learning Steps */}
                        <div className="space-y-6">
                            <h3 className="text-2xl font-black mb-6">Learning Path</h3>
                            {roadmaps[activeSector].roadmap && roadmaps[activeSector].roadmap.map((step, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex gap-4"
                                >
                                    {/* Step Number */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br ${sectorInfo[activeSector].color} flex items-center justify-center text-xl font-black`}>
                                        {step.step}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
                                        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
                                            {step.icon && <span className="text-2xl">{step.icon}</span>}
                                            {step.skill}
                                        </h4>
                                        <div className="space-y-2">
                                            {step.actions && step.actions.map((action, i) => (
                                                <div key={i} className="flex gap-2 text-sm text-gray-300">
                                                    <span className="text-indigo-400">→</span>
                                                    <span>{action}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="text-center mt-12">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => window.location.href = `/course/${activeSector}`}
                                className={`px-8 py-4 bg-gradient-to-r ${sectorInfo[activeSector].color} text-white rounded-2xl font-bold shadow-xl`}
                            >
                                Start {sectorInfo[activeSector].title} Course →
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default RoadmapAll;
