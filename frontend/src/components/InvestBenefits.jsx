import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiTarget } from 'react-icons/fi';

const InvestBenefits = () => {
  const benefits = [
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: 'Exponential Growth',
      description:
        'Watch your skills grow exponentially with personalized learning paths that adapt to your progress and career goals.',
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: 'Industry-Recognized Skills',
      description:
        'Gain expertise in high-demand domains like Healthcare, Agriculture, and Smart Cities that employers value.',
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: 'Career Acceleration',
      description:
        'Fast-track your career with AI-powered recommendations and skill-based learning that aligns with industry needs.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-transparent mt-[-100px] relative z-20">
      <div className="container mx-auto container-290px">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-black text-center text-white mb-12 md:mb-20 drop-shadow-lg"
        >
          Why Invest Your Time With Us?
        </motion.h2>

        {/* Benefits Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -12, scale: 1.05 }}
              className="bg-white/5 backdrop-blur-md p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-indigo-500/10 transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                {benefit.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-black text-white mb-5">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-indigo-100/70 leading-relaxed text-lg font-medium">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InvestBenefits;
