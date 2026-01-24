import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAuthToken, getProfile } from '../utils/api';
import Footer from './Footer';

const Roadmap = () => {
    const [roadmapData, setRoadmapData] = useState(null);
    const [gapData, setGapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sector, setSector] = useState('healthcare');
    const [selectedStep, setSelectedStep] = useState(null);

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const profile = await getProfile();
                const userSector = profile?.sector || 'healthcare';
                const userSkills = profile?.skills || {};
                setSector(userSector);

                const token = getAuthToken();
                const headers = { 'Content-Type': 'application/json' };
                if (token) headers.Authorization = `Bearer ${token}`;

                // Fetch gap analysis
                const gapResponse = await fetch('http://localhost:8080/analysis/gap', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        sector: userSector,
                        skills: userSkills
                    })
                });

                if (gapResponse.ok) {
                    const gap = await gapResponse.json();
                    setGapData(gap);

                    // Fetch roadmap
                    const roadmapResponse = await fetch('http://localhost:8080/roadmap', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            sector: userSector,
                            skills: userSkills
                        })
                    });

                    if (roadmapResponse.ok) {
                        const data = await roadmapResponse.json();
                        setRoadmapData(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch roadmap:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoadmap();
    }, []);

    const sectorInfo = {
        healthcare: {
            title: 'Healthcare Technology',
            icon: '🏥',
            description: 'Master the future of healthcare innovation',
            color: 'from-blue-500 to-cyan-500'
        },
        agriculture: {
            title: 'Agricultural Innovation',
            icon: '🌾',
            description: 'Transform farming with cutting-edge technology',
            color: 'from-green-500 to-emerald-500'
        },
        urban: {
            title: 'Urban Development',
            icon: '🏙️',
            description: 'Build the smart cities of tomorrow',
            color: 'from-purple-500 to-pink-500'
        }
    };

    const info = sectorInfo[sector] || sectorInfo.healthcare;

    if (loading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-white text-xl">Loading your personalized roadmap...</div>
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
                    className="text-center mb-16"
                >
                    <div className={`inline-block text-8xl mb-4`}>{info.icon}</div>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        Your Learning Roadmap
                    </h1>
                    <p className="text-xl text-gray-400 mb-2">{info.title}</p>
                    <p className="text-gray-500">{info.description}</p>
                </motion.div>

                {/* Progress Overview */}
                {gapData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-12 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-2xl p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span>📊</span> Your Progress
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="text-4xl font-black text-indigo-400">{gapData.progressPct}%</div>
                                <div className="text-gray-400 text-sm mt-1">Sector Proficiency</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="text-4xl font-black text-purple-400">{roadmapData?.roadmap?.length || 5}</div>
                                <div className="text-gray-400 text-sm mt-1">Skills to Master</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                                <div className="text-4xl font-black text-rose-400">{roadmapData?.tips?.length || 0}</div>
                                <div className="text-gray-400 text-sm mt-1">Personalized Tips</div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Tips Section */}
                {roadmapData?.tips && roadmapData.tips.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-white/10 rounded-2xl p-6"
                    >
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <span>💡</span> Personalized Tips
                        </h2>
                        <div className="space-y-3">
                            {roadmapData.tips.map((tip, index) => (
                                <div key={index} className="flex items-start gap-3 bg-white/5 rounded-lg p-4">
                                    <span className="text-green-400 mt-1 text-xl">•</span>
                                    <p className="text-gray-200">{tip}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Roadmap Steps */}
                <div className="mb-12">
                    <h2 className="text-3xl font-black mb-8">Step-by-Step Learning Path</h2>
                    <div className="space-y-6">
                        {roadmapData?.roadmap?.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                className="relative"
                            >
                                <div className="flex gap-6">
                                    {/* Step Number */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${info.color} flex items-center justify-center text-2xl font-black text-white shadow-lg`}>
                                            {step.step}
                                        </div>
                                    </div>

                                    {/* Content Card */}
                                    <div className="flex-1">
                                        <motion.div
                                            whileHover={{ scale: 1.01, y: -2 }}
                                            onClick={() => setSelectedStep(selectedStep === index ? null : index)}
                                            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 hover:border-indigo-500/30 transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                                        {step.icon && <span className="text-3xl">{step.icon}</span>}
                                                        {step.skill}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm">Click to expand action items</p>
                                                </div>
                                                <div className="text-3xl">
                                                    {selectedStep === index ? '📖' : '📚'}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {selectedStep === index && step.actions && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    className="border-t border-white/10 pt-4 mt-4"
                                                >
                                                    <h4 className="font-bold mb-3 text-indigo-400">Action Items:</h4>
                                                    <ul className="space-y-2">
                                                        {step.actions.map((action, i) => (
                                                            <li key={i} className="flex items-start gap-3">
                                                                <span className="text-green-400 mt-1">✓</span>
                                                                <span className="text-gray-300">{action}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            )}

                                            <div className="mt-4 text-sm text-indigo-400 font-semibold">
                                                {selectedStep === index ? '↑ Click to collapse' : '↓ Click to expand'}
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Connecting Line */}
                                {index < (roadmapData?.roadmap?.length || 0) - 1 && (
                                    <div className="ml-8 h-8 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 my-2"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-16"
                >
                    <h2 className="text-3xl font-black mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-gray-400 mb-6">Explore curated courses and resources tailored for you</p>
                    <div className="flex gap-4 justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = '/explore'}
                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-indigo-500/20 transition-all"
                        >
                            Explore Courses →
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => window.location.href = `/course/${sector}`}
                            className="px-8 py-4 bg-white/10 border border-white/20 text-white rounded-2xl font-bold hover:bg-white/20 transition-all"
                        >
                            View {info.title} Course
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default Roadmap;
