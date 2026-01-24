import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiPlay, FiCheckCircle } from 'react-icons/fi';

const VideoPlayer = ({ videoUrl, initialTime = 0, onProgress, onComplete, isCompleted = false }) => {
    const [showVideo, setShowVideo] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [watchTime, setWatchTime] = useState(0);
    const progressInterval = useRef(null);

    // Extract YouTube ID
    const getYouTubeId = (url) => {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length === 11) ? match[7] : null;
    };

    const videoId = getYouTubeId(videoUrl);
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;

    // Track watch time and auto-save progress
    useEffect(() => {
        if (showVideo && hasStarted) {
            let seconds = initialTime;
            progressInterval.current = setInterval(() => {
                seconds += 10;
                setWatchTime(prev => prev + 10);
                if (onProgress) {
                    onProgress(seconds);
                }
            }, 10000);

            return () => {
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            };
        }
    }, [showVideo, hasStarted, onProgress, initialTime]);

    const handlePlayClick = () => {
        setShowVideo(true);
        setHasStarted(true);
    };

    const handleMarkComplete = () => {
        if (onComplete) {
            onComplete();
        }
    };

    if (!showVideo) {
        // Show thumbnail with play button
        return (
            <div className="space-y-4">
                <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
                    {/* Thumbnail */}
                    {thumbnailUrl ? (
                        <img
                            src={thumbnailUrl}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
                            }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex items-center justify-center">
                            <div className="text-6xl">🎥</div>
                        </div>
                    )}

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black/40"></div>

                    {/* Completed Badge */}
                    {isCompleted && (
                        <div className="absolute top-4 right-4 px-3 py-2 bg-green-500/90 backdrop-blur-sm rounded-lg text-white text-sm font-bold flex items-center gap-2">
                            <FiCheckCircle /> Completed
                        </div>
                    )}

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handlePlayClick}
                            className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shadow-2xl transition-all group"
                        >
                            <FiPlay className="w-10 h-10 text-white ml-1 group-hover:scale-110 transition-transform" />
                        </motion.button>
                    </div>

                    {/* Resume indicator */}
                    {initialTime > 0 && !isCompleted && (
                        <div className="absolute bottom-4 left-4 px-3 py-2 bg-black/80 backdrop-blur-sm rounded-lg text-white text-sm font-semibold">
                            Resume from {Math.floor(initialTime / 60)}:{String(Math.floor(initialTime % 60)).padStart(2, '0')}
                        </div>
                    )}
                </div>

                {/* Mark Complete Button */}
                {!isCompleted && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleMarkComplete}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                    >
                        <FiCheckCircle className="w-5 h-5" />
                        Mark as Complete
                    </motion.button>
                )}
            </div>
        );
    }

    // Show actual video
    const embedUrl = videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${Math.floor(initialTime)}`
        : videoUrl;

    return (
        <div className="space-y-4">
            <div className="relative w-full bg-black rounded-xl overflow-hidden aspect-video">
                <iframe
                    width="100%"
                    height="100%"
                    src={embedUrl}
                    title="Video Player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                />
            </div>

            {/* Progress Info & Mark Complete */}
            <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                    {watchTime > 0 && (
                        <span>Watched for {Math.floor(watchTime / 60)} min {watchTime % 60} sec</span>
                    )}
                </div>

                {!isCompleted && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleMarkComplete}
                        className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
                    >
                        <FiCheckCircle className="w-4 h-4" />
                        Mark as Complete
                    </motion.button>
                )}

                {isCompleted && (
                    <div className="px-6 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg font-semibold flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4" />
                        Completed
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;
