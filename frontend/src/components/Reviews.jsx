import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

const Reviews = () => {
  const reviews = [
    {
      name: 'Sarah Johnson',
      rating: 5,
      review:
        'The AI-powered roadmap feature completely transformed my learning journey. I now have a clear path to master healthcare informatics!',
    },
    {
      name: 'Michael Chen',
      rating: 5,
      review:
        'Best platform for agriculture tech learning. The personalized recommendations helped me focus on exactly what I needed to advance my career.',
    },
    {
      name: 'Priya Sharma',
      rating: 4,
      review:
        'Excellent courses on smart city development. The structured approach and real-world examples made complex concepts easy to understand.',
    },
  ];

  const ratingDistribution = {
    5: 85,
    4: 12,
    3: 2,
    2: 1,
    1: 0,
  };

  const totalReviews = 1247;
  const averageRating = 4.8;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <FiStar
        key={index}
        className={`w-5 h-5 ${index < rating
          ? 'text-yellow-400 fill-yellow-400'
          : 'text-gray-700'
          }`}
      />
    ));
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
          Student Reviews
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Side: Rating Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Average Rating */}
            <div className="text-center md:text-left">
              <div className="text-6xl font-black text-white mb-4">
                {averageRating}
              </div>
              <div className="flex justify-center md:justify-start mb-4 gap-1">
                {renderStars(5)}
              </div>
              <p className="text-indigo-200/60 text-lg font-medium">
                Based on {totalReviews.toLocaleString()} verified reviews
              </p>
            </div>

            {/* Rating Distribution Bars */}
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-4">
                  <span className="text-sm font-bold text-indigo-200 w-4">
                    {star}
                  </span>
                  <FiStar className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${ratingDistribution[star]}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: star * 0.1 }}
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-indigo-300 w-12 text-right">
                    {ratingDistribution[star]}%
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Review Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 shadow-2xl hover:shadow-indigo-500/10 transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {review.name}
                  </h4>
                  <div className="flex gap-1">{renderStars(review.rating)}</div>
                </div>
                <p className="text-indigo-100/70 leading-relaxed text-lg font-medium italic">
                  "{review.review}"
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col items-center justify-center gap-8 mt-20">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(255, 126, 95, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            style={{ backgroundColor: '#FF7E5F' }}
            className="px-10 py-5 text-white font-black rounded-2xl shadow-xl transition-all flex items-center gap-3 text-lg"
          >
            <span>Write a Review</span>
            <span className="text-2xl">✍️</span>
          </motion.button>

          <div className="flex gap-3">
            {reviews.map((_, index) => (
              <div
                key={index}
                className={`h-3 rounded-full transition-all duration-300 ${index === 0 ? 'w-12 bg-indigo-500' : 'w-3 bg-white/10'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;
