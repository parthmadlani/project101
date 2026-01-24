import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { setAuthToken } from '../utils/api';

const OnboardingQuestions = ({ onComplete, onSkip, userToken, userData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({
        education_level: '',
        field_of_study: '',
        interests: [],
        career_goals: '',
        current_work: '',
        skills_to_improve: [],
        learning_style: '',
        time_commitment: ''
    });

    const questions = [
        {
            id: 'education_level',
            question: 'What is your current education level?',
            type: 'single',
            options: ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Professional']
        },
        {
            id: 'field_of_study',
            question: 'What is your field of study or area of expertise?',
            type: 'text',
            placeholder: 'e.g., Computer Science, Medicine, Agriculture...'
        },
        {
            id: 'interests',
            question: 'What areas interest you the most? (Select all that apply)',
            type: 'multiple',
            options: [
                'Healthcare Technology',
                'Medical Research',
                'Patient Care',
                'Agricultural Innovation',
                'Sustainable Farming',
                'Food Technology',
                'Urban Planning',
                'Smart Cities',
                'Infrastructure Development',
                'Data Analytics',
                'AI & Machine Learning',
                'Social Impact'
            ]
        },
        {
            id: 'career_goals',
            question: 'What are your career goals?',
            type: 'text',
            placeholder: 'Describe your aspirations...'
        },
        {
            id: 'current_work',
            question: 'What is your current work situation?',
            type: 'single',
            options: ['Student', 'Working Professional', 'Researcher', 'Entrepreneur', 'Looking for opportunities']
        },
        {
            id: 'skills_to_improve',
            question: 'Which skills would you like to improve? (Select all that apply)',
            type: 'multiple',
            options: [
                'Technical Skills',
                'Data Analysis',
                'Project Management',
                'Communication',
                'Leadership',
                'Problem Solving',
                'Research Skills',
                'Programming'
            ]
        },
        {
            id: 'learning_style',
            question: 'What is your preferred learning style?',
            type: 'single',
            options: ['Visual (Videos, Diagrams)', 'Reading (Articles, Papers)', 'Hands-on (Projects)', 'Interactive (Discussions)', 'Mixed Approach']
        },
        {
            id: 'time_commitment',
            question: 'How much time can you commit to learning per week?',
            type: 'single',
            options: ['1-3 hours', '3-5 hours', '5-10 hours', '10+ hours', 'Flexible schedule']
        }
    ];

    const currentQuestion = questions[currentStep];

    const handleAnswer = (value) => {
        if (currentQuestion.type === 'multiple') {
            const current = answers[currentQuestion.id] || [];
            const newAnswers = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            setAnswers({ ...answers, [currentQuestion.id]: newAnswers });
        } else {
            setAnswers({ ...answers, [currentQuestion.id]: value });
        }
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            // Send answers to backend for sector recommendation
            const response = await fetch('http://localhost:8080/onboarding/recommend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ answers })
            });

            if (response.ok) {
                const recommendation = await response.json();

                // Update user profile with recommended sector
                await fetch('http://localhost:8080/profiles/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        sector: recommendation.recommended_sector,
                        skills: {}
                    })
                });

                onComplete(recommendation);
            } else {
                // Fallback to default
                onComplete({ recommended_sector: 'healthcare', confidence: 50 });
            }
        } catch (error) {
            console.error('Onboarding error:', error);
            onComplete({ recommended_sector: 'healthcare', confidence: 50 });
        }
    };

    const isAnswered = () => {
        const answer = answers[currentQuestion.id];
        if (currentQuestion.type === 'multiple') {
            return answer && answer.length > 0;
        }
        return answer && answer.trim() !== '';
    };

    const progress = ((currentStep + 1) / questions.length) * 100;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-3xl bg-[#0f0518] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
                {/* Progress Bar */}
                <div className="h-2 bg-white/5">
                    <motion.div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl md:text-3xl font-black text-white">
                                Let's Personalize Your Journey
                            </h2>
                            <button
                                onClick={onSkip}
                                className="text-gray-400 hover:text-white text-sm font-medium"
                            >
                                Skip for now
                            </button>
                        </div>
                        <p className="text-gray-400">
                            Question {currentStep + 1} of {questions.length}
                        </p>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="min-h-[300px]"
                        >
                            <h3 className="text-xl md:text-2xl font-bold text-white mb-6">
                                {currentQuestion.question}
                            </h3>

                            {currentQuestion.type === 'text' ? (
                                <textarea
                                    value={answers[currentQuestion.id] || ''}
                                    onChange={(e) => handleAnswer(e.target.value)}
                                    placeholder={currentQuestion.placeholder}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[120px] resize-none"
                                />
                            ) : currentQuestion.type === 'single' ? (
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option) => (
                                        <motion.button
                                            key={option}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleAnswer(option)}
                                            className={`w-full text-left px-6 py-4 rounded-xl border transition-all ${answers[currentQuestion.id] === option
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white'
                                                    : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                                }`}
                                        >
                                            {option}
                                        </motion.button>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {currentQuestion.options.map((option) => {
                                        const isSelected = (answers[currentQuestion.id] || []).includes(option);
                                        return (
                                            <motion.button
                                                key={option}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleAnswer(option)}
                                                className={`text-left px-4 py-3 rounded-xl border transition-all ${isSelected
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white'
                                                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-gray-400'
                                                        }`}>
                                                        {isSelected && (
                                                            <svg className="w-3 h-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className="text-sm">{option}</span>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex gap-4 mt-8">
                        {currentStep > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleBack}
                                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                            >
                                ← Back
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNext}
                            disabled={!isAnswered()}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/20 transition-all"
                        >
                            {currentStep === questions.length - 1 ? 'Complete Setup' : 'Next →'}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingQuestions;
