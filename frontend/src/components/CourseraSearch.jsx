import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

const CourseraSearch = ({ onSearchSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const searchRef = useRef(null);

    // Sample suggestions based on your sectors
    const allSuggestions = [
        { type: 'course', text: 'Healthcare Informatics', icon: '🏥', sector: 'healthcare' },
        { type: 'course', text: 'Agricultural Technology', icon: '🌾', sector: 'agriculture' },
        { type: 'course', text: 'Urban & Smart Cities', icon: '🏙️', sector: 'urban' },
        { type: 'topic', text: 'Machine Learning', icon: '🤖', sector: 'healthcare' },
        { type: 'topic', text: 'EHR Systems', icon: '📋', sector: 'healthcare' },
        { type: 'topic', text: 'HIPAA Compliance', icon: '🔒', sector: 'healthcare' },
        { type: 'topic', text: 'Precision Agriculture', icon: '🎯', sector: 'agriculture' },
        { type: 'topic', text: 'IoT Sensors', icon: '📡', sector: 'agriculture' },
        { type: 'topic', text: 'GIS & Remote Sensing', icon: '🛰️', sector: 'agriculture' },
        { type: 'topic', text: 'Smart City IoT', icon: '💡', sector: 'urban' },
        { type: 'topic', text: 'Urban Planning', icon: '🏗️', sector: 'urban' },
        { type: 'topic', text: 'Mobility Systems', icon: '🚇', sector: 'urban' },
    ];

    const popularSearches = [
        'Healthcare AI',
        'Smart Farming',
        'Urban Analytics',
        'Medical Data'
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (searchTerm.length > 0) {
            const filtered = allSuggestions.filter(item =>
                item.text.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 8));
            setShowDropdown(true);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    }, [searchTerm]);

    const handleSelect = (item) => {
        setSearchTerm(item.text);
        setShowDropdown(false);
        if (onSearchSelect) {
            onSearchSelect(item);
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            window.location.href = `/explore?search=${encodeURIComponent(searchTerm)}`;
        }
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-2xl">
            {/* Search Input Container */}
            <div className="relative">
                <motion.div
                    whileFocus={{ scale: 1.01 }}
                    className="relative flex items-center"
                >
                    <FiSearch className="absolute left-4 w-5 h-5 text-gray-400 z-10" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                        placeholder="What do you want to learn?"
                        className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-all text-sm"
                        style={{
                            boxShadow: showDropdown ? '0 0 20px rgba(99, 102, 241, 0.3)' : 'none'
                        }}
                    />
                </motion.div>
            </div>

            {/* Dropdown Results */}
            <AnimatePresence>
                {showDropdown && (searchTerm.length > 0 || true) && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 w-full bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl"
                        style={{
                            background: 'rgba(26, 26, 46, 0.95)',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.2)'
                        }}
                    >
                        {/* Search Results */}
                        {suggestions.length > 0 && (
                            <div className="p-2">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Suggestions
                                </div>
                                {suggestions.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                                        onClick={() => handleSelect(item)}
                                        className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-xl">
                                            {item.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-white font-medium text-sm">
                                                {item.text}
                                            </div>
                                            <div className="text-xs text-gray-400 capitalize">
                                                {item.type} • {item.sector}
                                            </div>
                                        </div>
                                        <FiSearch className="w-4 h-4 text-gray-500" />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Popular Searches */}
                        {searchTerm.length === 0 && (
                            <div className="p-2 border-t border-white/10">
                                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Popular Searches
                                </div>
                                {popularSearches.map((search, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
                                        onClick={() => setSearchTerm(search)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors"
                                    >
                                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-lg flex items-center justify-center">
                                            <span className="text-sm">🔥</span>
                                        </div>
                                        <div className="flex-1 text-white text-sm">
                                            {search}
                                        </div>
                                        <FiSearch className="w-4 h-4 text-gray-500" />
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Browse All Categories */}
                        <div className="border-t border-white/10 p-3">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => window.location.href = '/explore'}
                                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                            >
                                Browse All Courses →
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CourseraSearch;
