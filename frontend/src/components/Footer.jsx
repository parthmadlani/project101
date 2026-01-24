import React from 'react';
import { motion } from 'framer-motion';
import { FiGithub } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 md:py-16">
      <div className="container mx-auto container-290px">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">About</h3>
            <p className="text-sm leading-relaxed">
              Root2Rise is an AI-powered learning platform designed to help
              learners master skills in Healthcare, Agriculture, and Smart City
              domains through personalized, adaptive learning experiences.
            </p>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:contact@root2rise.com"
                  className="hover:text-primary-400 transition-colors"
                >
                  contact@root2rise.com
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-primary-400 transition-colors"
                >
                  Support Center
                </a>
              </li>
            </ul>
          </motion.div>

          {/* GitHub / Project Link Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Project</h3>
            <a
              href="https://github.com/root2rise"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-primary-400 transition-colors text-sm"
            >
              <FiGithub className="w-5 h-5" />
              View on GitHub
            </a>
          </motion.div>

          {/* Hackathon Credit Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Built For</h3>
            <p className="text-sm leading-relaxed">
              Created as part of a hackathon project to showcase AI-powered
              learning solutions for modern domains.
            </p>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Root2Rise. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
