import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiPlayCircle, FiCheckCircle, FiAward, FiDownload } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getRecommendations, enrollInCourse, getEnrollments, getAuthToken } from '../utils/api';
import { STATIC_COURSE_VIDEOS, getCachedVideos, setCachedVideos } from '../data/staticVideos';
import ProgressManager from '../utils/progressManager';
import VideoPlayer from './VideoPlayer';
import QuizComponent from './QuizComponent';
import CertificateGenerator from './CertificateGenerator';
import Footer from './Footer';

// Static Data for Course Intro
const SECTOR_INFO = {
  healthcare: {
    title: "Healthcare Informatics & AI",
    description: "Master the intersection of medicine and technology. Learn how AI is revolutionizing diagnostics, patient care, and hospital management.",
    modules: 8,
    rating: 4.9,
    level: "Intermediate",
    outcome: "Build AI models for disease detection and understand HL7/FHIR standards.",
    image: "🏥",
    hours: 24
  },
  agriculture: {
    title: "Smart Agriculture & IoT",
    description: "Learn precision farming techniques using IoT sensors, drones, and data analytics to maximize crop yield and sustainability.",
    modules: 6,
    rating: 4.7,
    level: "Beginner to Pro",
    outcome: "Deploy soil sensors and analyze satellite imagery for crop health.",
    image: "🌾",
    hours: 18
  },
  urban: {
    title: "Urban Planning & Smart Cities",
    description: "Design the cities of tomorrow. Focus on sustainable infrastructure, traffic management, and energy-efficient systems.",
    modules: 10,
    rating: 4.8,
    level: "Advanced",
    outcome: "Create traffic flow simulations and energy grid optimizations.",
    image: "🏙️",
    hours: 30
  }
};

// Sample Quiz Data
const COURSE_QUIZZES = {
  healthcare: {
    questions: [
      {
        question: "What does EHR stand for?",
        answers: [
          "Electronic Health Record",
          "Emergency Hospital Room",
          "Expert Health Researcher",
          "Enhanced Healthcare Registry"
        ],
        correctAnswer: 0,
        explanation: "EHR stands for Electronic Health Record, a digital version of patients' paper charts."
      },
      {
        question: "Which AI technique is commonly used for medical image analysis?",
        answers: [
          "Linear Regression",
          "Convolutional Neural Networks (CNN)",
          "Decision Trees",
          "K-Means Clustering"
        ],
        correctAnswer: 1,
        explanation: "CNNs are particularly effective for image analysis tasks, including medical imaging."
      },
      {
        question: "What is HIPAA?",
        answers: [
          "A medical device",
          "A health insurance company",
          "Healthcare data privacy law",
          "A hospital protocol"
        ],
        correctAnswer: 2,
        explanation: "HIPAA is the Health Insurance Portability and Accountability Act, protecting patient data privacy."
      }
    ]
  },
  agriculture: {
    questions: [
      {
        question: "What is precision agriculture?",
        answers: [
          "Manual farming techniques",
          "Using data and technology to optimize farming",
          "Growing only one crop",
          "Traditional farming methods"
        ],
        correctAnswer: 1,
        explanation: "Precision agriculture uses GPS, sensors, and data analytics to optimize crop yields."
      },
      {
        question: "Which technology helps monitor soil moisture?",
        answers: [
          "GPS trackers",
          "IoT soil sensors",
          "Weather balloons",
          "Satellite phones"
        ],
        correctAnswer: 1,
        explanation: "IoT soil sensors provide real-time data on soil moisture levels."
      }
    ]
  },
  urban: {
    questions: [
      {
        question: "What is a smart city?",
        answers: [
          "A city with many universities",
          "An urban area using IoT and data to improve services",
          "A wealthy metropolitan area",
          "A city with high population"
        ],
        correctAnswer: 1,
        explanation: "Smart cities use IoT, data, and technology to improve infrastructure and services."
      },
      {
        question: "What does IoT stand for?",
        answers: [
          "Internet of Things",
          "Institute of Technology",
          "International Organisation of Trade",
          "Integrated Operational Technology"
        ],
        correctAnswer: 0,
        explanation: "IoT refers to the interconnection of computing devices embedded in everyday objects."
      }
    ]
  }
};

const CourseDetail = ({ courseId }) => {
  const sectorKey = (courseId || 'healthcare').toLowerCase();
  const info = SECTOR_INFO[sectorKey] || SECTOR_INFO['healthcare'];

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDownloadingSyllabus, setIsDownloadingSyllabus] = useState(false);
  const syllabusRef = React.useRef(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [videos, setVideos] = useState([]);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [videoProgress, setVideoProgress] = useState({});
  const [currentView, setCurrentView] = useState('videos'); // 'videos', 'quiz', 'certificate'
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizResult, setQuizResult] = useState(null); // Store quiz result
  const [userName, setUserName] = useState('');

  const activeVideo = videos[activeVideoIndex];

  // INSTANT LOAD: Show content immediately, check enrollment in background
  useEffect(() => {
    // Get enrollment status from localStorage (instant!)
    const enrollmentCache = localStorage.getItem('enrollments');
    if (enrollmentCache) {
      try {
        const enrollments = JSON.parse(enrollmentCache);
        const enrolled = enrollments.some(e => e.sector === sectorKey);
        if (enrolled) {
          setIsEnrolled(true);
          setCheckingEnrollment(false);
          loadVideos();
          loadProgress();
          loadUserName();
          loadQuizResults(); // Load quiz status
          return;
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }

    // Check enrollment in background
    checkEnrollmentBackground();
  }, [sectorKey]);

  const checkEnrollmentBackground = async () => {
    try {
      const data = await getEnrollments();
      if (data.enrollments) {
        // Cache enrollments for instant future loads
        localStorage.setItem('enrollments', JSON.stringify(data.enrollments));

        const enrolled = data.enrollments.some(e => e.sector === sectorKey);
        if (enrolled) {
          setIsEnrolled(true);
          // Load data in parallel
          Promise.all([
            loadVideos(),
            loadProgress(),
            loadUserName(),
            loadQuizResults()
          ]);
        } else {
          // User is NOT enrolled in this course - that's fine, they just need to click "Enroll Now"
          // Don't auto-enroll - wait for user to explicitly click the enroll button
          setIsEnrolled(false);
        }
      }
    } catch (e) {
      console.error("Failed to check enrollment", e);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  const loadQuizResults = async () => {
    // 1. Load from localStorage (Instant!)
    const savedResult = ProgressManager.getQuizResult(sectorKey);
    if (savedResult) {
      setQuizResult(savedResult);
      if (savedResult.passed) {
        setQuizPassed(true);
      }
    }

    // 2. Sync from backend in background
    ProgressManager.loadFromBackend(sectorKey).then(() => {
      const syncedResult = ProgressManager.getQuizResult(sectorKey);
      if (syncedResult) {
        setQuizResult(syncedResult);
        if (syncedResult.passed) {
          setQuizPassed(true);
        }
      }
    });
  };

  const loadUserName = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://localhost:8080/profiles/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUserName(data.username || 'Student');
    } catch (e) {
      console.error('Failed to load username', e);
      setUserName('Student');
    }
  };

  const loadProgress = async () => {
    // 1. Load from localStorage (Instant!)
    const progress = ProgressManager.getVideoProgress(sectorKey);
    setVideoProgress(progress);

    // 2. Sync from backend in background
    ProgressManager.loadFromBackend(sectorKey).then(() => {
      const syncedProgress = ProgressManager.getVideoProgress(sectorKey);
      setVideoProgress(prev => ({ ...prev, ...syncedProgress }));
    });
  };

  const loadVideos = async () => {
    // COURSERA APPROACH: Show static data instantly, then update in background

    // 1. Check localStorage cache first (instant!)
    const cached = getCachedVideos(sectorKey);
    if (cached) {
      setVideos(cached);
      setLoading(false);
      console.log('✅ Loaded from cache - INSTANT!');

      // Update cache in background (user won't notice)
      setTimeout(() => fetchFreshVideos(), 2000);
      return;
    }

    // 2. Use static data immediately (instant!)
    const staticVideos = STATIC_COURSE_VIDEOS[sectorKey] || STATIC_COURSE_VIDEOS.healthcare;
    setVideos(staticVideos);
    setLoading(false);
    console.log('✅ Loaded static data - INSTANT!');

    // 3. Fetch fresh videos in background and cache
    setTimeout(() => fetchFreshVideos(), 1000);
  };

  const fetchFreshVideos = async () => {
    try {
      const data = await getRecommendations(sectorKey);
      if (data && data.videos && data.videos.length > 0) {
        setVideos(data.videos);
        setCachedVideos(sectorKey, data.videos);
        console.log('✅ Background update complete');
      }
    } catch (e) {
      console.error('Background fetch failed (using static):', e);
      // Keep showing static data - no problem!
    }
  };

  const handleEnroll = async () => {
    setLoading(true);
    try {
      await enrollInCourse(sectorKey);
      setIsEnrolled(true);
      await loadVideos();
    } catch (e) {
      console.error("Enrollment failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoProgress = async (seconds) => {
    if (!activeVideo) return;

    // Save to localStorage (Instant!)
    ProgressManager.saveVideoProgress(sectorKey, activeVideo.id, seconds, false);
  };

  const handleVideoComplete = async () => {
    if (!activeVideo) return;

    // Save to localStorage (Instant!)
    ProgressManager.saveVideoProgress(sectorKey, activeVideo.id, 0, true);

    // Update UI immediately
    setVideoProgress(prev => ({
      ...prev,
      [activeVideo.id]: { seconds: 0, completed: true }
    }));

    // If last video, show quiz
    if (activeVideoIndex === videos.length - 1) {
      setCurrentView('quiz');
    } else {
      // Auto-advance to next video
      setActiveVideoIndex(prev => prev + 1);
    }
  };

  const handleQuizComplete = async (result) => {
    // Save to localStorage
    ProgressManager.saveQuizResult(sectorKey, result.score, result.total, result.passed);

    if (result.passed) {
      setQuizPassed(true);
      setCurrentView('certificate');
    }
  };

  const handleDownloadSyllabus = () => {
    console.log("Download Syllabus clicked");
    setIsDownloadingSyllabus(true);

    // Use setTimeout to allow the UI to update with "Downloading..." spinner
    setTimeout(() => {
      try {
        console.log("Generating PDF...");
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // Brand
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Root2Rise Learning Platform", margin, 20);
        doc.text("www.root2rise.com", pageWidth - margin, 20, { align: 'right' });

        doc.setDrawColor(79, 70, 229);
        doc.setLineWidth(1);
        doc.line(margin, 25, pageWidth - margin, 25);

        // Title
        doc.setFontSize(24);
        doc.setTextColor(30);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(info.title, contentWidth);
        doc.text(titleLines, margin, 40);
        let yPos = 40 + (titleLines.length * 10);

        // Info
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.setFont("helvetica", "normal");

        doc.text(`LEVEL: ${info.level}`, margin, yPos);
        doc.text(`DURATION: ${info.hours} Hours`, margin + (contentWidth / 2), yPos);
        yPos += 8;
        doc.text(`RATING: ${info.rating} / 5.0`, margin, yPos);
        doc.text(`MODULES: ${info.modules} Modules`, margin + (contentWidth / 2), yPos);
        yPos += 20;

        // Description
        doc.setFontSize(14);
        doc.setTextColor(49, 46, 129);
        doc.setFont("helvetica", "bold");
        doc.text("Course Overview", margin, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setTextColor(60);
        doc.setFont("helvetica", "normal");
        const descLines = doc.splitTextToSize(info.description, contentWidth);
        doc.text(descLines, margin, yPos);
        yPos += (descLines.length * 6) + 10;

        // Outcome
        doc.setFillColor(243, 244, 246);
        doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');

        doc.setFontSize(12);
        doc.setTextColor(30);
        doc.setFont("helvetica", "bold");
        doc.text("Learning Outcome", margin + 5, yPos + 10);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const outcomeLines = doc.splitTextToSize(info.outcome, contentWidth - 10);
        doc.text(outcomeLines, margin + 5, yPos + 18);
        yPos += 35;

        // Curriculum
        doc.setFontSize(14);
        doc.setTextColor(49, 46, 129);
        doc.setFont("helvetica", "bold");
        doc.text("Curriculum", margin, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setTextColor(60);
        doc.setFont("helvetica", "normal");

        const moduleNames = ['Introduction & Fundamentals', 'Core Concepts & Theory', 'Advanced Techniques', 'Practical Applications', 'Case Studies', 'Project Work', 'Industry Best Practices', 'Final Assessment'];

        for (let i = 0; i < info.modules; i++) {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(`• Module ${i + 1}: ${moduleNames[i % 8]}`, margin + 5, yPos);
          yPos += 8;
        }

        // Copy
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 280);
        doc.text("© 2026 Root2Rise", pageWidth - margin, 280, { align: 'right' });

        console.log("Saving PDF...");
        doc.save(`${info.title.replace(/\s+/g, '_')}_Syllabus.pdf`);
        console.log("Download initiated");
      } catch (error) {
        console.error('Syllabus download failed', error);
        alert('Failed to download syllabus. Please try again.');
      } finally {
        setIsDownloadingSyllabus(false);
      }
    }, 100);
  };

  const completedVideos = Object.values(videoProgress).filter(p => p.completed).length;
  const courseProgress = videos.length > 0 ? Math.round((completedVideos / videos.length) * 100) : 0;

  return (
    <div className="min-h-screen pt-24 bg-[#070110] text-white">
      {/* HEADER SECTION */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px]"></div>
        <div className="container mx-auto max-w-7xl relative z-10 px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-indigo-300 font-semibold text-sm"
              >
                {info.level} Course
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight"
              >
                {info.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-xl text-gray-400 leading-relaxed max-w-2xl"
              >
                {info.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="flex gap-8 pt-4"
              >
                <div>
                  <div className="text-3xl font-bold text-white">{info.modules}</div>
                  <div className="text-sm text-gray-500">Modules</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white flex items-center gap-1">
                    {info.rating} <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="text-sm text-gray-500">Rating</div>
                </div>
                {isEnrolled && (
                  <div>
                    <div className="text-3xl font-bold text-green-400">{courseProgress}%</div>
                    <div className="text-sm text-gray-500">Complete</div>
                  </div>
                )}
              </motion.div>

              {checkingEnrollment ? (
                <div className="mt-8 text-gray-500">Checking enrollment...</div>
              ) : !isEnrolled ? (
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  onClick={handleEnroll}
                  disabled={loading}
                  className="mt-8 px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all text-white"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      Enrolling...
                    </span>
                  ) : (
                    'Enroll Now — Free'
                  )}
                </motion.button>
              ) : (
                <div className="mt-8 flex gap-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500/20 border border-green-500/50 rounded-xl text-green-400 font-bold"
                  >
                    <FiCheckCircle /> Enrolled
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadSyllabus}
                    disabled={isDownloadingSyllabus}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all"
                  >
                    {isDownloadingSyllabus ? (
                      <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                      <FiDownload />
                    )}
                    {isDownloadingSyllabus ? 'Downloading...' : 'Syllabus'}
                  </motion.button>
                </div>
              )}

              {!isEnrolled && !checkingEnrollment && (
                <motion.button
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  onClick={handleDownloadSyllabus}
                  disabled={isDownloadingSyllabus}
                  className="ml-4 mt-8 px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-gray-300 transition-all inline-flex items-center gap-2"
                >
                  {isDownloadingSyllabus ? (
                    <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                  ) : (
                    <FiDownload />
                  )}
                  Syllabus
                </motion.button>
              )}
            </div>

            <div className="flex-1 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Main Badge Container */}
                <div className="w-72 h-72 relative">
                  {/* Outer Glow Ring */}
                  <div className={`absolute inset-0 rounded-full blur-xl opacity-40 ${sectorKey === 'healthcare' ? 'bg-gradient-to-br from-rose-500 to-indigo-600' :
                    sectorKey === 'agriculture' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' :
                      'bg-gradient-to-br from-amber-500 to-orange-600'
                    }`}></div>

                  {/* Badge Circle */}
                  <div className={`absolute inset-4 rounded-full border-4 ${sectorKey === 'healthcare' ? 'border-rose-500/50 bg-gradient-to-br from-rose-900/30 to-indigo-900/30' :
                    sectorKey === 'agriculture' ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-900/30 to-teal-900/30' :
                      'border-amber-500/50 bg-gradient-to-br from-amber-900/30 to-orange-900/30'
                    } backdrop-blur-sm flex flex-col items-center justify-center`}>

                    {/* Domain Icon */}
                    <div className="text-6xl mb-2">
                      {sectorKey === 'healthcare' && '🩺'}
                      {sectorKey === 'agriculture' && '🌱'}
                      {sectorKey === 'urban' && '🏗️'}
                    </div>

                    {/* Certificate Text */}
                    <div className={`text-xl font-black uppercase tracking-widest ${sectorKey === 'healthcare' ? 'text-rose-300' :
                      sectorKey === 'agriculture' ? 'text-emerald-300' :
                        'text-amber-300'
                      }`}>
                      Certified
                    </div>

                    {/* Domain Name */}
                    <div className="text-sm text-white/60 mt-1 font-semibold">
                      {sectorKey === 'healthcare' && 'Healthcare AI'}
                      {sectorKey === 'agriculture' && 'Smart Agri'}
                      {sectorKey === 'urban' && 'Urban Tech'}
                    </div>
                  </div>

                  {/* Graduation Cap - Floating */}
                  <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 5, 0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 text-5xl drop-shadow-lg"
                  >
                    🎓
                  </motion.div>

                  {/* Star Decorations */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-8 right-4 text-2xl"
                  >
                    ⭐
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-12 left-4 text-xl"
                  >
                    ✨
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-16 right-2 text-lg"
                  >
                    ⭐
                  </motion.div>

                  {/* Ribbon Banner */}
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-xl ${sectorKey === 'healthcare' ? 'bg-gradient-to-r from-rose-600 to-indigo-600' :
                    sectorKey === 'agriculture' ? 'bg-gradient-to-r from-emerald-600 to-teal-600' :
                      'bg-gradient-to-r from-amber-600 to-orange-600'
                    }`}>
                    <span className="text-white font-bold text-sm tracking-wide">ROOT2RISE</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section >

      {/* MAIN CONTENT */}
      < AnimatePresence >
        {isEnrolled && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="py-16 bg-[#0f0518]"
          >
            <div className="container mx-auto max-w-7xl px-4">
              {/* Navigation Tabs */}
              <div className="flex justify-center gap-4 mb-8">
                <button
                  onClick={() => setCurrentView('videos')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${currentView === 'videos'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                  📹 Videos ({completedVideos}/{videos.length})
                </button>
                <button
                  onClick={() => setCurrentView('quiz')}
                  disabled={completedVideos < videos.length}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${currentView === 'quiz'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : completedVideos < videos.length
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                  📝 Final Quiz {completedVideos < videos.length && '🔒'}
                </button>
                <button
                  onClick={() => setCurrentView('certificate')}
                  disabled={!quizPassed}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${currentView === 'certificate'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                    : !quizPassed
                      ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                >
                  <FiAward className="inline mr-2" />
                  Certificate {!quizPassed && '🔒'}
                </button>
              </div>

              {/* Video View */}
              {currentView === 'videos' && (
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                      <>
                        {/* Loading Skeleton */}
                        <div className="aspect-video bg-white/5 rounded-2xl animate-pulse flex items-center justify-center">
                          <div className="text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-400">Loading video...</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-8 bg-white/5 rounded animate-pulse w-3/4"></div>
                          <div className="h-4 bg-white/5 rounded animate-pulse w-1/2"></div>
                        </div>
                      </>
                    ) : activeVideo ? (
                      <>
                        <VideoPlayer
                          videoUrl={activeVideo.url}
                          initialTime={videoProgress[activeVideo.id]?.seconds || 0}
                          isCompleted={videoProgress[activeVideo.id]?.completed || false}
                          onProgress={handleVideoProgress}
                          onComplete={handleVideoComplete}
                        />
                        <div>
                          <h3 className="text-2xl font-bold">{activeVideo.title}</h3>
                          <p className="text-gray-400">{activeVideo.channel}</p>
                          {videoProgress[activeVideo.id]?.completed && (
                            <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                              <FiCheckCircle /> Completed
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="aspect-video bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                        <p className="text-gray-500">Select a video to start learning</p>
                      </div>
                    )}
                  </div>

                  {/* Video List */}
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {loading ? (
                      // Loading skeletons for video list
                      Array(5).fill(0).map((_, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-4 animate-pulse">
                          <div className="w-12 h-12 rounded-full bg-white/10"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-white/10 rounded w-3/4"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))
                    ) : (
                      videos.map((video, idx) => (
                        <motion.div
                          key={idx}
                          onClick={() => setActiveVideoIndex(idx)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex gap-4 ${idx === activeVideoIndex
                            ? 'bg-indigo-600/20 border-indigo-500'
                            : videoProgress[video.id]?.completed
                              ? 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20'
                              : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${videoProgress[video.id]?.completed ? 'bg-green-500/20' : 'bg-white/10'
                            }`}>
                            {videoProgress[video.id]?.completed ? (
                              <FiCheckCircle className="text-green-400" />
                            ) : idx === activeVideoIndex ? (
                              <FiPlayCircle className="text-indigo-400" />
                            ) : (
                              <span className="text-sm font-bold text-gray-500">{idx + 1}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold line-clamp-2">{video.title}</h4>
                            <p className="text-xs text-gray-500 mt-1">{video.channel}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Quiz View */}
              {currentView === 'quiz' && (
                <QuizComponent
                  quiz={COURSE_QUIZZES[sectorKey]}
                  onComplete={handleQuizComplete}
                  initialPassed={quizPassed && quizResult !== null}
                  initialScore={quizResult?.score || 0}
                />
              )}

              {/* Certificate View */}
              {currentView === 'certificate' && quizPassed && (
                <CertificateGenerator
                  userName={userName}
                  courseName={info.title}
                  completionDate={new Date()}
                  sector={sectorKey}
                  courseHours={info.hours}
                />
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence >

      <Footer />
    </div >
  );
};

export default CourseDetail;
