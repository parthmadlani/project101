import React, { useState, useEffect } from 'react';
import { getRecommendations } from '../utils/api';
import { motion } from 'framer-motion';
import FAQ from './FAQ';
import Footer from './Footer';

// Import domain thumbnail images
import healthcareThumb from '../assets/healthcare_thumb.png';
import agricultureThumb from '../assets/agriculture_thumb.png';
import urbanThumb from '../assets/urban_thumb.png';

// Import research paper thumbnails
import research1 from '../assets/research_1.png';
import research2 from '../assets/research_2.png';
import research3 from '../assets/research_3.png';
import research4 from '../assets/research_4.png';

const researchThumbnails = [research1, research2, research3, research4];

const Explore = () => {
  const [courseFilter, setCourseFilter] = useState('All Courses');
  const [sectorFilter, setSectorFilter] = useState('All Sectors');

  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'papers'
  const [data, setData] = useState({ courses: [], papers: [] });

  useEffect(() => {
    // Map frontend sector filters to backend sector keys
    let backendSector = 'healthcare';
    if (sectorFilter.includes('Agri') || sectorFilter.includes('Farm')) backendSector = 'agriculture';
    if (sectorFilter.includes('Urban') || sectorFilter.includes('City')) backendSector = 'urban';

    // Only fetch papers for the papers tab
    if (activeTab === 'papers') {
      getRecommendations(backendSector).then(res => {
        if (res) {
          const papersList = (res.papers || []).map(p => ({
            id: p.id,
            name: p.title,
            image: '📄',
            url: p.link,
            meta: p.hostVenue || p.year
          }));
          setData(prev => ({ ...prev, papers: papersList }));
        }
      });
    }
  }, [sectorFilter, activeTab]);

  // Static Sector Data for Courses Tab
  const sectorCourses = [
    { id: 'healthcare', name: 'Healthcare Informatics', image: '🏥', meta: 'Master AI in Healthcare' },
    { id: 'agriculture', name: 'Agricultural Technology', image: '🌾', meta: 'Smart Farming Systems' },
    { id: 'urban', name: 'Urban & Smart Cities', image: '🏙️', meta: 'Future City Planning' },
  ];

  // Sector data with subcategories - links to main courses
  const sectors = [
    { id: 'healthcare', name: 'Healthcare Technology', description: 'AI-powered diagnostics & patient care', thumb: healthcareThumb, color: 'rose' },
    { id: 'agriculture', name: 'Agricultural Innovation', description: 'Smart farming & precision agriculture', thumb: agricultureThumb, color: 'emerald' },
    { id: 'urban', name: 'Smart City Development', description: 'Urban planning & IoT infrastructure', thumb: urbanThumb, color: 'amber' },
    { id: 'healthcare', name: 'Digital Health Solutions', description: 'Telemedicine & health informatics', thumb: healthcareThumb, color: 'rose' },
    { id: 'agriculture', name: 'AgTech & Sustainability', description: 'Climate-smart agricultural systems', thumb: agricultureThumb, color: 'emerald' },
    { id: 'urban', name: 'Urban Mobility & Transport', description: 'Smart transportation networks', thumb: urbanThumb, color: 'amber' },
  ];

  const sectorFilters = ['All Sectors', 'Healthcare', 'Agriculture', 'Urban'];

  const handleItemClick = (item) => {
    if (activeTab === 'courses') {
      // Navigate to internal course page
      window.history.pushState({}, '', `/course/${item.id}`);
      // Dispatch popstate to trigger App.jsx router (since we are doing manual pushState)
      window.dispatchEvent(new Event('popstate'));
    } else if (item.url) {
      window.open(item.url, '_blank');
    }
  };

  const handleMoreCourses = () => {
    window.location.href = '/courses/all';
  };

  const handleMoreSectors = () => {
    window.location.href = '/sectors/all';
  };

  return (
    <div className="min-h-screen pt-24 bg-transparent text-white">
      {/* Section 1: Get Started */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto container-290px">
          {/* Section Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-black text-white mb-10 md:mb-16 drop-shadow-xl"
          >
            Get Started
          </motion.h2>

          {/* Tab Toggles */}
          <div className="flex justify-center mb-10 gap-4">
            <button
              onClick={() => setActiveTab('courses')}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${activeTab === 'courses'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
            >
              Video Courses
            </button>
            <button
              onClick={() => setActiveTab('papers')}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all ${activeTab === 'papers'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg scale-105'
                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                }`}
            >
              Research Papers
            </button>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          >
            {activeTab === 'courses' ? (
              // Render Premium Sector Cards
              sectorCourses.map((item, index) => {
                const gradients = {
                  healthcare: 'from-rose-600/30 via-pink-600/20 to-indigo-600/30',
                  agriculture: 'from-emerald-600/30 via-green-600/20 to-teal-600/30',
                  urban: 'from-amber-600/30 via-orange-600/20 to-red-600/30'
                };
                const thumbnails = {
                  healthcare: healthcareThumb,
                  agriculture: agricultureThumb,
                  urban: urbanThumb
                };
                const borderColors = {
                  healthcare: 'hover:border-rose-500/50',
                  agriculture: 'hover:border-emerald-500/50',
                  urban: 'hover:border-amber-500/50'
                };
                const textColors = {
                  healthcare: 'group-hover:text-rose-400',
                  agriculture: 'group-hover:text-emerald-400',
                  urban: 'group-hover:text-amber-400'
                };
                const linkColors = {
                  healthcare: 'text-rose-400',
                  agriculture: 'text-emerald-400',
                  urban: 'text-amber-400'
                };

                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => handleItemClick(item)}
                    className={`bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 cursor-pointer group ${borderColors[item.id]}`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {/* Thumbnail Image */}
                      <img
                        src={thumbnails[item.id]}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {/* Overlay Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent`} />
                    </div>
                    <div className="p-6">
                      <h3 className={`text-2xl font-bold text-white ${textColors[item.id]} transition-colors leading-tight mb-2`}>
                        {item.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{item.meta}</p>
                      <div className={`mt-4 ${linkColors[item.id]} font-semibold text-sm flex items-center gap-2`}>
                        Explore Course →
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              // Render Research Papers being fetched
              data.papers.length > 0 ? (
                data.papers.map((item, index) => {
                  const thumbIndex = index % researchThumbnails.length;
                  const colors = ['indigo', 'teal', 'amber', 'violet'];
                  const colorIndex = index % colors.length;
                  const borderColors = {
                    indigo: 'hover:border-indigo-500/50',
                    teal: 'hover:border-teal-500/50',
                    amber: 'hover:border-amber-500/50',
                    violet: 'hover:border-violet-500/50'
                  };
                  const textColors = {
                    indigo: 'group-hover:text-indigo-400',
                    teal: 'group-hover:text-teal-400',
                    amber: 'group-hover:text-amber-400',
                    violet: 'group-hover:text-violet-400'
                  };

                  return (
                    <motion.div
                      key={index}
                      whileHover={{ y: -10, scale: 1.02 }}
                      onClick={() => handleItemClick(item)}
                      className={`bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 cursor-pointer group ${borderColors[colors[colorIndex]]}`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={researchThumbnails[thumbIndex]}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        {/* Paper Icon Badge */}
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-white">
                          📄 Paper
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className={`text-lg font-bold text-white ${textColors[colors[colorIndex]]} transition-colors leading-tight mb-2 line-clamp-2`}>
                          {item.name}
                        </h3>
                        <p className="text-gray-400 text-sm">{item.meta}</p>
                        <div className="mt-3 text-indigo-400 font-semibold text-sm">
                          Read Paper →
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center text-gray-400 py-10">
                  Loading research papers...
                </div>
              )
            )}
          </motion.div>

          {/* More Button */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMoreCourses}
              style={{ backgroundColor: '#FF7E5F' }}
              className="px-10 py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:shadow-[#FF7E5F]/30"
            >
              More →→
            </motion.button>
          </div>
        </div>
      </section>

      {/* Section 2: Explore Other Sectors */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto container-290px">
          {/* Section Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-black text-white mb-10 md:mb-16 drop-shadow-xl"
          >
            Explore Other Sectors
          </motion.h2>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4 mb-8 md:mb-12">
            {sectorFilters.map((filter) => (
              <motion.button
                key={filter}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSectorFilter(filter)}
                style={{
                  backgroundColor: sectorFilter === filter ? '#FF7E5F' : 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                }}
                className={`px-6 py-3 rounded-xl font-bold transition-all border border-white/10 ${sectorFilter === filter ? 'shadow-lg shadow-[#FF7E5F]/30 border-[#FF7E5F]/50' : ''
                  }`}
              >
                {filter}
              </motion.button>
            ))}
          </div>

          {/* Sectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {sectors
              .filter(sector => sectorFilter === 'All Sectors' || sector.id === sectorFilter.toLowerCase())
              .map((sector, index) => {
                const borderColors = {
                  rose: 'hover:border-rose-500/50',
                  emerald: 'hover:border-emerald-500/50',
                  amber: 'hover:border-amber-500/50'
                };
                const textColors = {
                  rose: 'group-hover:text-rose-400',
                  emerald: 'group-hover:text-emerald-400',
                  amber: 'group-hover:text-amber-400'
                };

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    onClick={() => {
                      window.history.pushState({}, '', `/course/${sector.id}`);
                      window.dispatchEvent(new Event('popstate'));
                    }}
                    className={`bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 cursor-pointer group ${borderColors[sector.color]}`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={sector.thumb}
                        alt={sector.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>

                    <div className="p-6">
                      <h3 className={`text-xl font-black text-white ${textColors[sector.color]} transition-colors leading-tight mb-2`}>
                        {sector.name}
                      </h3>
                      <p className="text-gray-400 text-sm">{sector.description}</p>
                      <div className={`mt-4 text-${sector.color}-400 font-semibold text-sm flex items-center gap-2`}>
                        Learn More →
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>

          {/* More Button */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMoreSectors}
              style={{ backgroundColor: '#FF7E5F' }}
              className="px-10 py-4 text-white font-black rounded-2xl shadow-xl transition-all hover:shadow-[#FF7E5F]/30"
            >
              More →→
            </motion.button>
          </div>
        </div>
      </section>

      {/* Section 3: FAQ */}
      <FAQ />

      {/* Section 4: Footer */}
      <Footer />
    </div>
  );
};

export default Explore;
