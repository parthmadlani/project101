import React from 'react';
import { motion } from 'framer-motion';

const Domains = () => {
  const domains = [
    {
      name: 'Healthcare',
      description:
        'Learn cutting-edge healthcare technologies, medical informatics, and AI applications in patient care and diagnostics.',
      image: '🏥',
      gradient: 'from-blue-500 to-indigo-600',
      link: '/course/healthcare',
    },
    {
      name: 'Agriculture',
      description:
        'Master smart farming techniques, precision agriculture, and sustainable practices powered by AI and IoT technologies.',
      image: '🌾',
      gradient: 'from-green-500 to-teal-600',
      link: '/course/agriculture',
    },
    {
      name: 'Urban / Smart City',
      description:
        'Explore smart city solutions, urban planning, IoT integration, and sustainable infrastructure development.',
      image: '🏙️',
      gradient: 'from-purple-500 to-fuchsia-600',
      link: '/course/urban',
    },
  ];

  const handleDomainClick = (link) => {
    window.location.href = link;
  };

  return (
    <section className="py-16 md:py-24 bg-transparent">
      <div className="container mx-auto container-290px">
        {/* Section Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-black text-center text-white mb-16 md:mb-24 drop-shadow-xl"
        >
          Explore Key Domains
        </motion.h2>

        {/* Domains Grid */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {domains.map((domain, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -15, scale: 1.03 }}
              onClick={() => handleDomainClick(domain.link)}
              className="relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-300 cursor-pointer group border border-white/10"
            >
              {/* Image Placeholder with Gradient */}
              <div
                className={`h-72 bg-gradient-to-br ${domain.gradient} flex items-center justify-center relative overflow-hidden`}
              >
                {/* Decorative Overlay */}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
                <div className="text-9xl group-hover:scale-125 transition-transform duration-500 z-10 drop-shadow-2xl">
                  {domain.image}
                </div>
              </div>

              {/* Content Overlay */}
              <div className="p-8 md:p-10 bg-[#0d041a] backdrop-blur-sm">
                <h3 className="text-2xl md:text-4xl font-black text-white mb-5 group-hover:text-indigo-300 transition-colors">
                  {domain.name}
                </h3>
                <p className="text-indigo-100/60 leading-relaxed text-lg font-medium">
                  {domain.description}
                </p>
                <div className="mt-8 flex items-center text-indigo-400 font-bold group-hover:translate-x-2 transition-transform">
                  Explore Domain <span className="ml-2 text-2xl">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Domains;
