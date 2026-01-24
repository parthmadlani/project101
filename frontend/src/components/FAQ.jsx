import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do AI recommendations work?',
      answer:
        'Our AI-powered recommendation system analyzes your learning goals, current skills, and career aspirations to suggest personalized courses and learning paths. It adapts to your progress and preferences over time, ensuring you always have the most relevant content.',
    },
    {
      question: 'What does the Roadmap feature do?',
      answer:
        'The Roadmap feature provides a visual, step-by-step learning journey tailored to your chosen domain (Healthcare, Agriculture, or Smart Cities). It breaks down complex skills into manageable milestones, tracks your progress, and adjusts recommendations based on your performance.',
    },
    {
      question: 'Is the platform free to use?',
      answer:
        'We offer both free and premium tiers. Free users get access to basic courses and limited recommendations, while premium subscribers unlock advanced AI features, personalized roadmaps, career guidance, and priority support.',
    },
    {
      question: 'Can I change my learning path?',
      answer:
        'Absolutely! You can switch domains, modify your goals, or explore different career paths at any time. The AI will automatically update your recommendations and roadmap based on your new choices, ensuring a seamless transition.',
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
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
          FAQs
        </motion.h2>

        {/* FAQ Accordion */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-3xl overflow-hidden transition-all duration-300 border ${openIndex === index
                  ? 'bg-white/10 border-[#FF7E5F]/50 shadow-[0_20px_40px_rgba(255,126,95,0.1)]'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left transition-colors"
              >
                <h3 className={`text-xl md:text-2xl font-bold pr-8 transition-colors ${openIndex === index ? 'text-[#FF7E5F]' : 'text-white'
                  }`}>
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FiChevronDown className={`w-7 h-7 flex-shrink-0 transition-colors ${openIndex === index ? 'text-[#FF7E5F]' : 'text-[#FF7E5F]/50'
                    }`} />
                </motion.div>
              </button>

              {/* Answer (Accordion Content) */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 pt-2">
                      <p className="text-indigo-100/70 leading-relaxed text-lg font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
