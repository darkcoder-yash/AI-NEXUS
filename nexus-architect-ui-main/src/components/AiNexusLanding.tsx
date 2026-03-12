import { motion } from 'framer-motion';
import { Facebook, Instagram, Twitter, ArrowRight, Hexagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AiNexusLanding.css';

export default function AiNexusLanding() {
  const navigate = useNavigate();
  
  const stats = [
    { num: "99.9%", label: "Neural Uptime" },
    { num: "1.2s", label: "Avg Latency" },
    { num: "24/7", label: "Core Sync" },
    { num: "10K+", label: "Agents Active" }
  ];

  const navLinks = [
    { label: "Architecture", path: "/nexus" },
    { label: "Neural Link", path: "/nexus" },
    { label: "Protocol", path: "/nexus" }
  ];

  const handleEnter = () => {
    navigate('/nexus');
  };

  return (
    <div className="nexus-landing-container">
      <div className="nexus-blueprint" />
      <div className="nexus-scanlines" />
      <div className="nexus-ambient-glow" />
      
      {/* Dynamic Background Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="nexus-particle"
          initial={{ 
            x: Math.random() * 100 + "%", 
            y: Math.random() * 100 + "%",
            opacity: Math.random()
          }}
          animate={{ 
            y: [null, Math.random() * 100 + "%"],
            opacity: [0, 0.8, 0]
          }}
          transition={{ 
            duration: Math.random() * 10 + 10, 
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      <div className="nexus-grid-wrapper">
        
        {/* Navigation HUD */}
        <header className="nexus-navbar">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="nexus-logo-container"
          >
            <div className="nexus-logo-icon" />
            <span className="nexus-logo-text">AI NEXUS</span>
          </motion.div>
          
          <nav className="nexus-nav-links">
            {navLinks.map((link, i) => (
              <motion.a 
                key={link.label}
                onClick={() => navigate(link.path)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="nexus-nav-link"
              >
                {link.label}
              </motion.a>
            ))}
          </nav>

          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={handleEnter}
            className="nexus-btn-cta"
          >
            Connect
          </motion.button>
        </header>

        {/* Hero Section */}
        <section className="nexus-hero">
          <div className="nexus-living-core" />
          
          {/* Enhanced Portal Rings */}
          <div className="nexus-portal-container">
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="nexus-portal-ring ring-outer" 
            />
            <motion.div 
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 0.2, rotate: 0 }}
              transition={{ duration: 3 }}
              className="nexus-portal-ring ring-mid" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.6, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="nexus-portal-ring ring-inner" 
            />
          </div>
          
          <div className="nexus-silhouette-container">
            <motion.h1 
              initial={{ opacity: 0, filter: "blur(20px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.5 }}
              className="nexus-hero-title"
            >
              AI NEXUS
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, letterSpacing: "1em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ delay: 0.5, duration: 1 }}
              className="nexus-hero-subtitle"
            >
              UNIVERSAL COGNITIVE OPERATING LAYER FOR AUTONOMOUS SYNCHRONIZATION
            </motion.p>

            <motion.button 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleEnter}
              className="nexus-orbit-cta"
            >
              INITIALIZE CORE <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </section>

        {/* Stats HUD */}
        <footer className="nexus-stats-panel">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
              viewport={{ once: true }}
              className="nexus-stat-item"
            >
              <div className="nexus-stat-num">{stat.num}</div>
              <div className="nexus-stat-label">{stat.label}</div>
            </motion.div>
          ))}
          
          <div className="flex gap-8 items-center border-l border-white/5 pl-12">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <motion.a 
                key={i}
                whileHover={{ y: -3, color: "#00E6FF" }}
                className="text-white/20 transition-colors"
              >
                <Icon size={14} />
              </motion.a>
            ))}
          </div>
        </footer>

        {/* Scroll Hint */}
        <div className="nexus-scroll-hint">
          <div className="nexus-mouse">
            <div className="nexus-mouse-wheel" />
          </div>
          <span className="text-[7px] font-black uppercase tracking-[0.4em] text-white/40">Protocol Scan</span>
        </div>

      </div>
    </div>
  );
}
