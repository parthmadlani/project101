// Root2Rise Progress Manager - Coursera-Style
// Stores everything in localStorage with backend sync

import { API_URL, getAuthToken } from './api';

const STORAGE_PREFIX = 'r2r_';

export const ProgressManager = {
    // Get user ID from token
    getUserId() {
        const token = getAuthToken();
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id;
        } catch {
            return null;
        }
    },

    // Video Progress
    saveVideoProgress(courseId, videoId, seconds, completed = false) {
        const userId = this.getUserId();
        if (!userId) return;

        const key = `${STORAGE_PREFIX}${userId}_${courseId}_videos`;
        const progress = this.getVideoProgress(courseId) || {};

        progress[videoId] = {
            seconds: Math.floor(seconds),
            completed,
            lastWatched: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(progress));
        console.log(`✅ Saved video ${videoId}:`, progress[videoId]);

        // Sync to backend in background
        this.syncToBackend('video', courseId, videoId, progress[videoId]);
    },

    getVideoProgress(courseId) {
        const userId = this.getUserId();
        if (!userId) return {};

        const key = `${STORAGE_PREFIX}${userId}_${courseId}_videos`;
        try {
            return JSON.parse(localStorage.getItem(key)) || {};
        } catch {
            return {};
        }
    },

    // Quiz Results
    saveQuizResult(courseId, score, total, passed) {
        const userId = this.getUserId();
        if (!userId) return;

        const key = `${STORAGE_PREFIX}${userId}_${courseId}_quiz`;
        const result = {
            score,
            total,
            passed,
            percentage: Math.round((score / total) * 100),
            completedAt: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(result));
        console.log(`✅ Saved quiz result:`, result);

        // Sync to backend
        this.syncToBackend('quiz', courseId, null, result);
    },

    getQuizResult(courseId) {
        const userId = this.getUserId();
        if (!userId) return null;

        const key = `${STORAGE_PREFIX}${userId}_${courseId}_quiz`;
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },

    // Certificate
    saveCertificate(courseId, verificationId) {
        const userId = this.getUserId();
        if (!userId) return;

        const key = `${STORAGE_PREFIX}${userId}_${courseId}_cert`;
        const cert = {
            verificationId,
            issuedAt: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(cert));
        console.log(`✅ Saved certificate:`, cert);

        // Sync to backend
        this.syncToBackend('certificate', courseId, null, cert);
    },

    getCertificate(courseId) {
        const userId = this.getUserId();
        if (!userId) return null;

        const key = `${STORAGE_PREFIX}${userId}_${courseId}_cert`;
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch {
            return null;
        }
    },

    // Backend Sync (background, non-blocking)
    async syncToBackend(type, courseId, videoId, data) {
        try {
            const token = getAuthToken();
            if (!token) return;

            const endpoints = {
                video: '/progress/video',
                quiz: '/quiz/result', // Ensure this endpoint exists in backend or remove if not implemented
                certificate: '/certificates/generate' // Ensure this endpoint exists
            };

            // Construct body
            let body = {};
            if (type === 'video') {
                body = {
                    videoId,
                    progressSeconds: data.seconds,
                    completed: data.completed,
                    sector: courseId
                };
            } else if (type === 'quiz') {
                body = {
                    quizId: `${courseId}_final`,
                    score: data.score,
                    totalQuestions: data.total,
                    passed: data.passed
                };
            } else if (type === 'certificate') {
                body = {
                    courseId,
                    sector: courseId, // Assuming sector is same as courseId for now
                    verificationId: data.verificationId // Pass the explicit ID
                };
            }

            await fetch(`${API_URL}${endpoints[type]}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            console.log(`🔄 Synced ${type} to backend`);
        } catch (e) {
            console.log(`⚠️ Backend sync failed (data still saved locally):`, e.message);
        }
    },

    // Clear user data (on logout)
    clearUserData() {
        const userId = this.getUserId();
        if (!userId) return;

        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(`${STORAGE_PREFIX}${userId}_`)) {
                localStorage.removeItem(key);
            }
        });

        console.log('🗑️ Cleared user progress data');
    },

    // Force sync all local data to backend (Migration/Restore)
    async syncAllToBackend() {
        const userId = this.getUserId();
        if (!userId) return;

        console.log("🔄 Starting full local-to-remote sync...");

        // 1. Sync Video Progress
        const videoKeyPattern = new RegExp(`${STORAGE_PREFIX}${userId}_(.*)_videos`);

        Object.keys(localStorage).forEach(async (key) => {
            const match = key.match(videoKeyPattern);
            if (match) {
                const courseId = match[1];
                const progressData = JSON.parse(localStorage.getItem(key) || '{}');

                for (const [videoId, data] of Object.entries(progressData)) {
                    await this.syncToBackend('video', courseId, videoId, data);
                }
            }
        });

        // 2. Sync Enrollments (if we have local record)
        if (localStorage.getItem('enrollments')) {
            try {
                const localEnrollments = JSON.parse(localStorage.getItem('enrollments'));
                localEnrollments.forEach(async (enroll) => {
                    await fetch(`${API_URL}/enrollments`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getAuthToken()}`
                        },
                        body: JSON.stringify({ sector: enroll.sector })
                    });
                });
            } catch (e) { console.error("Enrollment sync error", e); }
        }

        console.log("✅ Full sync background process initiated");
    },

    // Load from backend on login
    async loadFromBackend(courseId) {
        try {
            const token = getAuthToken();
            if (!token) return;

            // Load video progress
            const progressRes = await fetch(`${API_URL}/progress/videos/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const progressData = await progressRes.json();

            if (progressData.progress && progressData.progress.length > 0) {
                const key = `${STORAGE_PREFIX}${this.getUserId()}_${courseId}_videos`;
                const progress = {};
                progressData.progress.forEach(p => {
                    progress[p.video_id] = {
                        seconds: p.progress_seconds,
                        completed: p.completed === 1,
                        lastWatched: p.last_watched
                    };
                });
                localStorage.setItem(key, JSON.stringify(progress));
                console.log('📥 Loaded progress from backend:', progress);
            }

            // Load quiz results
            const quizRes = await fetch(`${API_URL}/quiz/results/${courseId}_final`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const quizData = await quizRes.json();

            if (quizData.results && quizData.results.length > 0) {
                const latest = quizData.results[0];
                this.saveQuizResult(courseId, latest.score, latest.total_questions, latest.passed === 1);
            }

        } catch (e) {
            console.log('📭 No backend data to load:', e.message);
        }
    }
};

export default ProgressManager;
