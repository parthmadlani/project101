import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustedBy from './components/TrustedBy';
import InvestBenefits from './components/InvestBenefits';
import Domains from './components/Domains';
import Reviews from './components/Reviews';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Explore from './components/Explore';
import CourseDetail from './components/CourseDetail';
import Auth from './components/Auth';
import Profile from './components/Profile';
import RoadmapAll from './components/RoadmapAll';
import ErrorBoundary from './components/ErrorBoundary';
import { getAuthToken, removeAuthToken } from './utils/api';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [courseId, setCourseId] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  const updateRoute = () => {
    const path = window.location.pathname;

    if (path.startsWith('/course/')) {
      const id = path.split('/course/')[1];
      setCourseId(id);
      setCurrentPage('course-detail');
    } else if (path === '/explore') {
      setCurrentPage('explore');
    } else if (path === '/profile') {
      setCurrentPage('profile');
    } else if (path === '/roadmap') {
      setCurrentPage('roadmap');
    } else {
      setCurrentPage('home');
    }
  };

  useEffect(() => {
    // Check if page was refreshed (not initial load or navigation)
    const isPageRefresh = window.performance &&
      performance.navigation &&
      performance.navigation.type === 1;

    // If it's a refresh and not on homepage, redirect to home
    if (isPageRefresh && window.location.pathname !== '/') {
      window.history.replaceState({}, '', '/');
      setCurrentPage('home');
      return;
    }

    updateRoute();
    const handlePopState = () => updateRoute();
    window.addEventListener('popstate', handlePopState);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      setTimeout(updateRoute, 0);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('mousemove', handleMouseMove);
      window.history.pushState = originalPushState;
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'explore': return <Explore />;
      case 'course-detail': return <CourseDetail courseId={courseId} />;
      case 'profile': return <Profile onLogout={() => { removeAuthToken(); setIsAuthenticated(false); window.location.href = '/'; }} />;
      case 'roadmap': return <RoadmapAll />;
      default:
        return (
          <>
            <Hero />
            <TrustedBy dark={true} />
            <InvestBenefits />
            <Domains />
            <Reviews />
            <FAQ />
            <Footer />
          </>
        );
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
  }, [showAuthModal]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#070110] text-white relative overflow-x-hidden">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
              left: `${mousePosition.x - 250}px`,
              top: `${mousePosition.y - 250}px`,
              transition: 'left 0.3s ease-out, top 0.3s ease-out',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Header
            isAuthenticated={isAuthenticated}
            onLoginClick={(mode) => {
              setAuthMode(mode || 'login');
              setShowAuthModal(true);
            }}
            onLogout={() => {
              removeAuthToken();
              setIsAuthenticated(false);
              window.location.href = '/';
            }}
          />

          <main className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* Auth Modal */}
          <AnimatePresence>
            {showAuthModal && (
              <Auth
                initialMode={authMode}
                onClose={() => setShowAuthModal(false)}
                onLoginSuccess={() => {
                  setIsAuthenticated(true);
                  setShowAuthModal(false);
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
