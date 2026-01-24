import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      headline: 'Personalized AI-Driven Learning Just For You',
      description:
        'Discover your perfect learning path with AI-powered recommendations that adapt to your goals, skills, and pace. Transform your future today.',
      cta: 'Start Learning Path',
      color: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      icon: '🎓',
    },
    {
      headline: 'Master Skills That Matter in Healthcare, Agriculture & Smart Cities',
      description:
        'Join thousands of learners advancing their careers through industry-focused courses designed by experts and enhanced by cutting-edge AI technology.',
      cta: 'Apply Now',
      color: 'linear-gradient(135deg, #db2777 0%, #7c3aed 100%)',
      icon: '🚀',
    },
    {
      headline: 'Build Your Future, One Skill at a Time',
      description:
        'Experience skill-based growth with personalized learning journeys that match your aspirations. Learn smarter, grow faster, achieve more.',
      cta: 'Explore Courses',
      color: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)',
      icon: '💡',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-12 bg-transparent overflow-hidden">
      <div className="container mx-auto container-290px relative z-10 px-4">
        {/* Header Text Section */}
        <div className="text-center mb-10">
          <AnimatePresence mode="wait">
            <motion.h1
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6"
            >
              {heroSlides[currentSlide].headline}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Unified Slide Carousel - Side-by-Side and Uniform */}
        <div className="relative w-full max-w-[1000px] mx-auto overflow-hidden rounded-[2.5rem] shadow-2xl border border-white/10">
          <motion.div
            className="flex"
            animate={{ x: `-${currentSlide * 100}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20, mass: 0.8 }}
          >
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 min-h-[400px] md:min-h-[500px]"
                style={{ background: slide.color }}
              >
                <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-16 text-center text-white relative">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] invert pointer-events-none"></div>

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-7xl md:text-8xl mb-6">
                      {slide.icon}
                    </div>
                    <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed font-medium text-indigo-50">
                      {slide.description}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ backgroundColor: '#FF7E5F' }}
                      className="px-10 py-4 text-lg text-white font-black rounded-2xl shadow-xl transition-all"
                    >
                      {slide.cta}
                    </motion.button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition-all z-20 border border-white/10"
          >
            <FiChevronLeft size={24} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full text-white transition-all z-20 border border-white/10"
          >
            <FiChevronRight size={24} />
          </button>

          {/* Progress Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-10 bg-white' : 'w-2.5 bg-white/40'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
