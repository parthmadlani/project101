import React, { useState, useEffect } from 'react';
import { FiBell, FiUser } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';
import CourseraSearch from './CourseraSearch';
import Notifications from './Notifications';

const Header = ({ isAuthenticated, onLoginClick, onLogout }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleExploreClick = () => {
    window.location.href = '/explore';
  };

  return (
    <>
      <AnimatePresence>
        {showNotifications && (
          <Notifications
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none p-4">
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
          className={`pointer-events-auto transition-all duration-300 w-full max-w-[1200px] ${isSticky ? 'mt-0' : 'mt-2'}`}
        >
          {/* Elongated Bubble Container - Dark Glassmorphism */}
          <div
            className="relative px-6 py-3 transition-all duration-300"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '50px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: isSticky
                ? '0 20px 50px -10px rgba(0, 0, 0, 0.5), 0 0 20px 0 rgba(255, 126, 95, 0.1)'
                : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left: Logo and Nav */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer flex items-center"
                  onClick={() => window.location.href = '/'}
                >
                  <img src={logo} alt="Root2Rise" className="h-8 md:h-10 w-auto object-contain" />
                </motion.div>

                <div className="hidden lg:flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '/'}
                    className="px-3 py-1.5 text-white/80 hover:text-white font-semibold text-sm transition-colors"
                  >
                    Home
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05, opacity: 0.9 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleExploreClick}
                    style={{ backgroundColor: '#FF7E5F' }}
                    className="px-4 py-1.5 text-white rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-[#FF7E5F]/30"
                  >
                    Explore
                  </motion.button>
                </div>
              </div>

              {/* Middle: Coursera-Style Search */}
              <div className="hidden md:flex flex-1 max-w-xl mx-4">
                <CourseraSearch
                  onSearchSelect={(item) => {
                    if (item.type === 'course') {
                      window.location.href = `/course/${item.sector}`;
                    } else {
                      window.location.href = `/explore?search=${encodeURIComponent(item.text)}`;
                    }
                  }}
                />
              </div>

              {/* Right: Nav Items */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.a
                  whileHover={{ scale: 1.05, opacity: 0.9 }}
                  whileTap={{ scale: 0.95 }}
                  href="/roadmap"
                  style={{ backgroundColor: '#FF7E5F' }}
                  className="px-4 py-1.5 text-white rounded-full font-bold text-sm hover:shadow-lg hover:shadow-[#FF7E5F]/30 transition-all shadow-md hidden sm:block"
                >
                  Roadmap
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative"
                >
                  <FiBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border border-[#070110]"></span>
                </motion.button>

                {isAuthenticated ? (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.history.pushState({}, '', '/profile')}
                    className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-colors relative group"
                    title="My Profile"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-[#070110]"></span>
                  </motion.button>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onLoginClick('login')}
                      className="px-4 py-1.5 text-white/80 hover:text-white font-semibold text-sm transition-colors hidden sm:block"
                    >
                      Log In
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onLoginClick('signup')}
                      style={{ backgroundColor: '#FF7E5F' }}
                      className="px-4 py-1.5 text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all"
                    >
                      Sign Up
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Search - Below Header */}
            <div className="md:hidden mt-3 pt-3 border-t border-white/10">
              <CourseraSearch
                onSearchSelect={(item) => {
                  if (item.type === 'course') {
                    window.location.href = `/course/${item.sector}`;
                  } else {
                    window.location.href = `/explore?search=${encodeURIComponent(item.text)}`;
                  }
                }}
              />
            </div>
          </div>
        </motion.header>
      </div>
    </>
  );
};

export default Header;
