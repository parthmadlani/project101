import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchResults = ({ query, isOpen, onClose }) => {
    const [results, setResults] = useState({ courses: [], videos: [], loading: true });
    const [activeTab, setActiveTab] = useState('all');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && query) {
            performSearch(query);
        }
    }, [query, isOpen]);

    const performSearch = async (searchQuery) => {
        setResults({ courses: [], videos: [], loading: true });
        setError(null);

        try {
            const lowerQuery = searchQuery.toLowerCase();

            // Determine sector from query
            let searchSector = 'healthcare';
            if (lowerQuery.includes('agri') || lowerQuery.includes('farm') || lowerQuery.includes('crop')) {
                searchSector = 'agriculture';
            } else if (lowerQuery.includes('urban') || lowerQuery.includes('city') || lowerQuery.includes('smart')) {
                searchSector = 'urban';
            } else if (lowerQuery.includes('health') || lowerQuery.includes('medical') || lowerQuery.includes('hospital')) {
                searchSector = 'healthcare';
            }

            // Static courses that match
            const allCourses = [
                {
                    id: 'healthcare',
                    name: 'Healthcare Informatics',
                    sector: 'Healthcare',
                    image: '🏥',
                    description: 'Master AI in Healthcare, EHR Systems, HIPAA Compliance, and Medical Data Standards'
                },
                {
                    id: 'agriculture',
                    name: 'Agricultural Technology',
                    sector: 'Agriculture',
                    image: '🌾',
                    description: 'Smart Farming Systems, Precision Agriculture, GIS, Remote Sensing, and IoT Sensors'
                },
                {
                    id: 'urban',
                    name: 'Urban & Smart Cities',
                    sector: 'Urban',
                    image: '🏙️',
                    description: 'Future City Planning, Smart Infrastructure, IoT Networks, and Urban Analytics'
                }
            ];

            const filteredCourses = allCourses.filter(course =>
                course.name.toLowerCase().includes(lowerQuery) ||
                course.description.toLowerCase().includes(lowerQuery) ||
                course.sector.toLowerCase().includes(lowerQuery)
            );

            // Fetch videos from backend
            let videos = [];
            try {
                const videoResponse = await fetch('http://localhost:8080/videos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sector: searchSector,
                        topic: searchQuery
                    })
                });

                if (videoResponse.ok) {
                    const videoData = await videoResponse.json();
                    videos = (videoData.videos || []).map(v => ({
                        id: v.id,
                        title: v.title,
                        description: v.description || 'Educational video content',
                        channel: v.channelTitle || 'Educational Channel',
                        thumbnail: v.thumbnail,
                        url: v.url,
                        type: 'video'
                    }));
                }
            } catch (err) {
                console.warn('Video fetch failed:', err);
            }

            setResults({
                courses: filteredCourses,
                videos: videos,
                loading: false
            });
        } catch (error) {
            console.error('Search error:', error);
            setError('Failed to search. Please try again.');
            setResults({ courses: [], videos: [], loading: false });
        }
    };

    const allResults = [
        ...results.courses.map(r => ({ ...r, type: 'course' })),
        ...results.videos
    ];

    const displayResults = activeTab === 'all' ? allResults :
        activeTab === 'courses' ? results.courses.map(r => ({ ...r, type: 'course' })) :
            results.videos;

    const handleResultClick = (result) => {
        if (result.type === 'course') {
            window.location.href = `/course/${result.id}`;
        } else if (result.type === 'video' && result.url) {
            window.open(result.url, '_blank');
        }
        onClose();
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
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
            />

            {/* Search Results Panel */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl bg-[#0f0518] border border-white/10 rounded-2xl shadow-2xl z-[90] max-h-[85vh] overflow-hidden mx-4"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-black text-white">
                            Search Results for "{query}"
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All', count: allResults.length },
                            { id: 'courses', label: 'Courses', count: results.courses.length },
                            { id: 'videos', label: 'Videos', count: results.videos.length }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results */}
                <div className="overflow-y-auto max-h-[60vh]">
                    {results.loading ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <div className="text-center">
                                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                                <p>Searching...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8">
                            <div className="text-6xl mb-4">⚠️</div>
                            <p className="text-xl font-bold mb-2">{error}</p>
                            <button
                                onClick={() => performSearch(query)}
                                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : displayResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8">
                            <div className="text-6xl mb-4">🔍</div>
                            <p className="text-xl font-bold mb-2">No results found</p>
                            <p className="text-sm text-gray-500">Try different keywords like "healthcare", "farming", or "urban planning"</p>
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            <AnimatePresence>
                                {displayResults.map((result, index) => (
                                    <motion.div
                                        key={`${result.type}-${result.id || index}`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ scale: 1.01, x: 5 }}
                                        onClick={() => handleResultClick(result)}
                                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-indigo-500/30 transition-all cursor-pointer"
                                    >
                                        <div className="flex gap-4">
                                            {/* Icon/Image */}
                                            <div className="flex-shrink-0 w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center overflow-hidden">
                                                {result.thumbnail ? (
                                                    <img src={result.thumbnail} alt={result.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-4xl">
                                                        {result.type === 'course' ? result.image : '🎥'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h3 className="font-bold text-white text-lg line-clamp-1">
                                                        {result.name || result.title}
                                                    </h3>
                                                    <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${result.type === 'course' ? 'bg-indigo-500/20 text-indigo-300' :
                                                        'bg-rose-500/20 text-rose-300'
                                                        }`}>
                                                        {result.type}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                                                    {result.description}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {result.channel && (
                                                        <span className="text-xs text-gray-500">
                                                            📺 {result.channel}
                                                        </span>
                                                    )}
                                                    {result.sector && (
                                                        <span className="inline-block px-2 py-1 bg-white/5 rounded text-xs text-gray-400">
                                                            {result.sector}
                                                        </span>
                                                    )}
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

export default SearchResults;
