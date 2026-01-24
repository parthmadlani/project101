import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiChevronLeft, FiChevronRight, FiAward, FiRefreshCw } from 'react-icons/fi';

const QuizComponent = ({ quiz, onComplete, initialPassed = false, initialScore = 0 }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(initialPassed);
    const [score, setScore] = useState(initialScore);

    const question = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

    const handleAnswerSelect = (answerIndex) => {
        setSelectedAnswers({
            ...selectedAnswers,
            [currentQuestion]: answerIndex
        });
    };

    const handleNext = () => {
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            calculateScore();
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const calculateScore = () => {
        let correct = 0;
        quiz.questions.forEach((q, index) => {
            if (selectedAnswers[index] === q.correctAnswer) {
                correct++;
            }
        });
        setScore(correct);
        setShowResults(true);

        if (onComplete) {
            onComplete({
                score: correct,
                total: quiz.questions.length,
                percentage: (correct / quiz.questions.length) * 100,
                passed: (correct / quiz.questions.length) >= 0.7
            });
        }
    };

    const handleRetake = () => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setShowResults(false);
        setScore(0);
    };

    // Results Screen
    if (showResults) {
        const percentage = (score / quiz.questions.length) * 100;
        const passed = percentage >= 70;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto"
            >
                {/* Results Header */}
                <div className={`relative overflow-hidden rounded-3xl p-8 mb-8 ${passed
                    ? 'bg-gradient-to-br from-emerald-600/20 via-green-600/10 to-teal-600/20 border border-emerald-500/30'
                    : 'bg-gradient-to-br from-rose-600/20 via-pink-600/10 to-red-600/20 border border-rose-500/30'
                    }`}>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 text-center">
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-500/30 border-2 border-emerald-400' : 'bg-rose-500/30 border-2 border-rose-400'
                                }`}
                        >
                            <span className="text-5xl">{passed ? '🎉' : '📚'}</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl font-black mb-3"
                        >
                            {passed ? 'Congratulations!' : 'Keep Learning!'}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-300 text-lg"
                        >
                            {passed
                                ? 'You passed the quiz! Your certificate is now available.'
                                : 'You need 70% to pass. Review the material and try again.'}
                        </motion.p>

                        {/* Score Display */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-8 inline-flex flex-col items-center bg-black/30 backdrop-blur-sm rounded-2xl px-12 py-6 border border-white/10"
                        >
                            <div className={`text-6xl font-black mb-1 ${passed
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent'
                                : 'bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent'
                                }`}>
                                {percentage.toFixed(0)}%
                            </div>
                            <div className="text-gray-400 text-lg">
                                {score} out of {quiz.questions.length} correct
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Review Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <span className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                            📋
                        </span>
                        {Object.keys(selectedAnswers).length > 0 ? "Review Your Answers" : "Quiz Answer Key"}
                    </h3>

                    <div className="space-y-4">
                        {quiz.questions.map((q, index) => {
                            const userAnswerIndex = selectedAnswers[index];
                            const hasAnswer = userAnswerIndex !== undefined;

                            // If we don't have user answers (restored), but score is 100%, assume correct.
                            const isPerfectScore = score === quiz.questions.length;
                            const assumeCorrect = !hasAnswer && isPerfectScore;

                            const isCorrect = (hasAnswer && userAnswerIndex === q.correctAnswer) || assumeCorrect;

                            // Determine Card Style
                            let cardStyle = 'bg-white/5 border-white/10'; // Default Neutral
                            if (hasAnswer || assumeCorrect) {
                                cardStyle = isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-rose-500/10 border-rose-500/30';
                            }

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 * index }}
                                    className={`p-5 rounded-xl border ${cardStyle}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${(hasAnswer || assumeCorrect)
                                                ? (isCorrect ? 'bg-emerald-500/30' : 'bg-rose-500/30')
                                                : 'bg-indigo-500/10' // Neutral icon bg
                                            }`}>
                                            {(hasAnswer || assumeCorrect) ? (
                                                isCorrect
                                                    ? <FiCheck className="text-emerald-400 text-xl" />
                                                    : <FiX className="text-rose-400 text-xl" />
                                            ) : (
                                                <span className="text-indigo-400 font-bold text-sm">Q{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white mb-3">
                                                {q.question}
                                            </p>

                                            <div className="space-y-2 text-sm">
                                                {/* Show User Answer if available OR if we assume correct (100% case) */}
                                                {(hasAnswer || assumeCorrect) && !isCorrect && (
                                                    <p className="text-rose-400 flex items-center gap-2">
                                                        <span className="bg-rose-500/20 px-2 py-0.5 rounded">Your Answer</span>
                                                        {hasAnswer ? q.answers[userAnswerIndex] : "Unknown"}
                                                    </p>
                                                )}

                                                {/* In 100% restored case, explicit showing 'Your Answer' might be overkill, 
                                                    but confirming they got it right is good. 
                                                    Actually, let's just show "Correct Answer" cleanly.
                                                */}

                                                <p className="text-emerald-400 flex items-center gap-2">
                                                    <span className="bg-emerald-500/20 px-2 py-0.5 rounded">Correct Answer</span>
                                                    {q.answers[q.correctAnswer]}
                                                </p>
                                            </div>

                                            {q.explanation && (
                                                <p className="text-gray-400 text-sm mt-3 pl-4 border-l-2 border-indigo-500/50">
                                                    💡 {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleRetake}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-bold hover:bg-white/20 transition-all"
                    >
                        <FiRefreshCw className="text-lg" />
                        Retake Quiz
                    </motion.button>
                    {passed && (
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all"
                        >
                            <FiAward className="text-lg" />
                            Get Certificate
                        </motion.button>
                    )}
                </div>
            </motion.div>
        );
    }

    // Quiz Question Screen
    return (
        <div className="max-w-4xl mx-auto">
            {/* Header with Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <span className="text-xl">📝</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Final Quiz</h2>
                            <p className="text-sm text-gray-400">Answer all questions to continue</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-400">
                            {currentQuestion + 1}/{quiz.questions.length}
                        </div>
                        <div className="text-xs text-gray-500">Questions</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    />
                    {/* Progress Dots */}
                    <div className="absolute inset-0 flex justify-between px-1">
                        {quiz.questions.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full my-auto transition-all ${idx < currentQuestion
                                    ? 'bg-white'
                                    : idx === currentQuestion
                                        ? 'bg-white scale-150'
                                        : 'bg-white/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 backdrop-blur-sm border border-white/10 rounded-3xl p-8 shadow-2xl"
                >
                    {/* Question Number Badge */}
                    <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 px-4 py-2 rounded-full text-sm font-semibold text-indigo-300 mb-6">
                        <span className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs">
                            {currentQuestion + 1}
                        </span>
                        Question {currentQuestion + 1}
                    </div>

                    {/* Question Text */}
                    <h3 className="text-2xl md:text-3xl font-bold mb-8 leading-relaxed">
                        {question.question}
                    </h3>

                    {/* Answer Options */}
                    <div className="space-y-4 mb-10">
                        {question.answers.map((answer, index) => {
                            const isSelected = selectedAnswers[currentQuestion] === index;
                            const optionLabels = ['A', 'B', 'C', 'D'];

                            return (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.01, x: 8 }}
                                    whileTap={{ scale: 0.99 }}
                                    onClick={() => handleAnswerSelect(index)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 group ${isSelected
                                        ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Option Label */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${isSelected
                                            ? 'bg-indigo-500 text-white'
                                            : 'bg-white/10 text-gray-400 group-hover:bg-white/20'
                                            }`}>
                                            {optionLabels[index]}
                                        </div>

                                        {/* Answer Text */}
                                        <span className={`flex-1 text-lg ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                                            {answer}
                                        </span>

                                        {/* Checkmark */}
                                        {isSelected && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center"
                                            >
                                                <FiCheck className="text-white text-lg" />
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-white/10">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handlePrevious}
                            disabled={currentQuestion === 0}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${currentQuestion === 0
                                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                        >
                            <FiChevronLeft className="text-lg" />
                            Previous
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: selectedAnswers[currentQuestion] !== undefined ? 1.03 : 1 }}
                            whileTap={{ scale: selectedAnswers[currentQuestion] !== undefined ? 0.97 : 1 }}
                            onClick={handleNext}
                            disabled={selectedAnswers[currentQuestion] === undefined}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${selectedAnswers[currentQuestion] === undefined
                                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50'
                                }`}
                        >
                            {currentQuestion === quiz.questions.length - 1 ? (
                                <>
                                    Submit Quiz
                                    <FiCheck className="text-lg" />
                                </>
                            ) : (
                                <>
                                    Next
                                    <FiChevronRight className="text-lg" />
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default QuizComponent;
