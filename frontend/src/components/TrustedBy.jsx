import React from 'react';
import { motion } from 'framer-motion';

const TrustedBy = ({ dark = false }) => {
  const trustedPartners = [
    {
      name: 'MedLearn University',
      testimonial: 'Excellence in healthcare education with AI-driven insights.',
      logo: '🏥',
    },
    {
      name: 'AgriTech Institute',
      testimonial: 'Transforming agriculture through innovative learning methods.',
      logo: '🌾',
    },
    {
      name: 'SmartCity Academy',
      testimonial: 'Leading urban development education platform.',
      logo: '🏙️',
    },
    {
      name: 'TechForward College',
      testimonial: 'Empowering students with cutting-edge AI learning tools.',
      logo: '💻',
    },
    {
      name: 'Global Learning Hub',
      testimonial: 'Connecting learners worldwide through personalized paths.',
      logo: '🌍',
    },
    {
      name: 'Future Skills Academy',
      testimonial: 'Building tomorrow\'s workforce with today\'s technology.',
      logo: '🚀',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-transparent">
      <div className="container mx-auto container-290px">
        {/* Divider */}
        <div className={`w-full h-px mb-12 md:mb-16 ${dark
            ? 'bg-gradient-to-r from-transparent via-white/10 to-transparent'
            : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
          }`}></div>

        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={`text-3xl md:text-4xl font-black text-center mb-12 md:mb-16 ${dark ? 'text-white' : 'text-gray-900'
            }`}
        >
          Trusted By Learners & Institutions
        </motion.h2>

        {/* Grid of Trusted Partners */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
          {trustedPartners.map((partner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              {/* Circular Logo Placeholder */}
              <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-4xl md:text-5xl transition-all ${dark
                  ? 'bg-white/5 border border-white/10 shadow-lg shadow-black/20 hover:bg-white/10'
                  : 'bg-gradient-to-br from-primary-100 to-accent-100 shadow-soft hover:shadow-card'
                }`}>
                {partner.logo}
              </div>

              {/* Organization Name */}
              <h3 className={`text-sm md:text-base font-bold ${dark ? 'text-indigo-200' : 'text-gray-900'
                }`}>
                {partner.name}
              </h3>

              {/* Testimonial */}
              <p className={`text-xs md:text-sm leading-relaxed ${dark ? 'text-indigo-100/60' : 'text-gray-600'
                }`}>
                {partner.testimonial}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
