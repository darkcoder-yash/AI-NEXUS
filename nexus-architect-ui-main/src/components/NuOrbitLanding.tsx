import { motion } from 'framer-motion';
import { Play, Facebook, Instagram, Twitter, ArrowRight } from 'lucide-react';
import './NuOrbitLanding.css';

export default function NuOrbitLanding() {
  const stats = [
    { num: "27K+", label: "Artists" },
    { num: "876K+", label: "Artwork" },
    { num: "20K+", label: "Auction" }
  ];

  const navLinks = ["Home", "About", "Token", "Roadmap"];

  return (
    <div className="nu-landing-container">
      <div className="nu-fog" />
      
      {/* 12-Column Grid Wrapper */}
      <div className="nu-grid-wrapper">
        
        {/* Navigation Bar */}
        <header className="nu-navbar">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="nu-logo"
          >
            NUORBIT
          </motion.div>
          
          <nav className="nu-nav-links">
            {navLinks.map((link, i) => (
              <motion.a 
                key={link}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="nu-nav-link"
              >
                {link}
              </motion.a>
            ))}
          </nav>

          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="nu-btn-cta"
          >
            Join Us
          </motion.button>
        </header>

        {/* Hero Section */}
        <section className="nu-hero">
          {/* Background Scene Elements */}
          <div className="nu-portal-glow" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2 }}
            className="nu-portal-ring" 
          />
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="nu-silhouette" 
          />
          
          <div className="nu-floor" />

          {/* Typography Content */}
          <motion.h1 
            initial={{ opacity: 0, letterSpacing: "1.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.8em" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="nu-hero-title"
          >
            NUORBIT
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 1, duration: 1 }}
            className="nu-hero-subtitle"
          >
            Discover digital art and collect NFTs
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="nu-orbit-cta"
          >
            LET'S ORBIT <ArrowRight className="w-4 h-4" />
          </motion.div>
        </section>

        {/* Statistics Panel */}
        <footer className="nu-stats-panel">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * i }}
              viewport={{ once: true }}
              className="nu-stat-item"
            >
              <div className="nu-stat-num">{stat.num}</div>
              <div className="nu-stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </footer>

        {/* Interaction Layer (Video & Socials) */}
        <div className="nu-interaction-layer">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="nu-play-video"
          >
            <Play className="w-5 h-5 text-white fill-current" />
            <span className="nu-play-label">Play Video</span>
          </motion.div>

          <div className="nu-socials">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <motion.a 
                key={i}
                whileHover={{ y: -5, scale: 1.2 }}
                className="nu-social-icon"
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
