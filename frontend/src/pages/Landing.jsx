import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, BarChart, ArrowRight, Droplet } from 'lucide-react';
import { Link } from 'react-router-dom';

function FeatureCard({ title, desc, icon, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className="glass dark:glass-dark rounded-2xl p-8 border-t-8 border-aqua-500 hover:shadow-2xl hover:-translate-y-2 transition-transform duration-500 group relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-ocean-500/10 dark:bg-aqua-500/10 rounded-full blur-2xl group-hover:bg-aqua-400/20 transition-colors duration-500"></div>
      
      <div className="p-4 inline-block bg-gradient-to-br from-ocean-100 to-ocean-200 dark:from-ocean-800 dark:to-ocean-900 rounded-2xl text-ocean-600 dark:text-aqua-400 mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-ocean-600 dark:group-hover:text-aqua-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">{desc}</p>
    </motion.div>
  );
}

const Bubble = ({ size, left, delay, duration }) => (
  <div 
    className="absolute bottom-0 rounded-full bg-white/20 dark:bg-aqua-400/20 backdrop-blur-sm animate-float"
    style={{
      width: size,
      height: size,
      left: `${left}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`
    }}
  />
);

function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#040D21] overflow-hidden font-sans flex flex-col items-center">
      
      {/* Navbar */}
      <nav className="fixed w-full z-50 glass dark:bg-[#040D21]/80 backdrop-blur-xl border-b border-gray-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="p-2 bg-gradient-to-br from-aqua-400 to-ocean-600 rounded-xl shadow-lg shadow-aqua-500/30 group-hover:scale-105 transition-transform">
              <Droplet className="text-white" size={28} />
            </div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">AquaAI</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-gray-600 dark:text-gray-300 font-medium hover:text-ocean-600 dark:hover:text-aqua-400 transition-colors">
              Log in
            </Link>
            <Link to="/login" className="bg-gradient-to-r from-ocean-500 to-aqua-500 hover:from-ocean-400 hover:to-aqua-400 text-white px-7 py-2.5 rounded-full font-bold shadow-lg shadow-aqua-500/30 transition-all transform hover:scale-105 hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative w-full pt-32 pb-40 lg:pt-48 lg:pb-56 px-6 lg:px-8 flex flex-col items-center text-center overflow-hidden bg-gradient-to-b from-white to-ocean-50 dark:from-[#040D21] dark:to-[#0A1930]">
        
        {/* Animated Background Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Bubble size={20} left={10} delay={0} duration={12} />
          <Bubble size={35} left={25} delay={2} duration={18} />
          <Bubble size={15} left={45} delay={4} duration={10} />
          <Bubble size={40} left={65} delay={1} duration={15} />
          <Bubble size={25} left={85} delay={3} duration={14} />
          <Bubble size={50} left={50} delay={5} duration={20} />
          <Bubble size={18} left={95} delay={2} duration={11} />
        </div>

        {/* Ambient Light Orbs */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-aqua-400/20 dark:bg-aqua-500/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse pointer-events-none"></div>
        <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-ocean-500/30 dark:bg-ocean-600/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse delay-700 pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center space-x-2 py-2 px-5 rounded-full bg-white dark:bg-white/5 text-ocean-700 dark:text-aqua-300 text-sm font-bold tracking-widest uppercase mb-8 shadow-md border border-ocean-100 dark:border-white/10 backdrop-blur-md"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-aqua-500"></span>
            </span>
            <span>Live Water Monitoring</span>
          </motion.span>
          
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-8 drop-shadow-sm">
            Predict Contamination.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-600 via-ocean-500 to-aqua-400">
              Protect the Future.
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            AquaAI leverages advanced LSTM neural networks to assess real-time water quality. Stop anomalies before they trigger critical safety limits.
          </p>

          <Link to="/login" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-ocean-600 dark:bg-white dark:text-slate-900 rounded-full shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.7)] hover:-translate-y-1 overflow-hidden">
            <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-black dark:to-white"></span>
            <span className="flex items-center space-x-3 text-lg relative z-10">
              <span>Enter Dashboard</span>
              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </motion.div>
        
        {/* SVG UI Mockup Float */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="absolute -bottom-32 lg:-bottom-48 w-full max-w-5xl px-6 pointer-events-none z-20"
        >
           <div className="w-full h-64 lg:h-96 bg-white/40 dark:bg-[#0A1930]/60 backdrop-blur-2xl rounded-t-3xl border border-white/40 dark:border-white/10 shadow-2xl p-6 flex flex-col mask-image-gradient">
              <div className="w-full h-8 flex items-center space-x-2 border-b border-gray-200/50 dark:border-white/5 pb-4 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 rounded-xl bg-gradient-to-r from-ocean-500/10 to-aqua-400/10 border border-white/20 dark:border-white/5 animate-pulse"></div>
           </div>
        </motion.div>
        
        {/* Wavy Bottom Separator */}
        <div className="absolute bottom-0 w-full leading-none z-10 hidden dark:block">
          <svg className="block w-full h-[150px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.71,109.85,138.4,115.8,206.1,106.6Z" fill="#040D21" className="fill-[#0f172a] dark:fill-[#0f172a]"></path>
          </svg>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-white dark:bg-[#0f172a] w-full py-32 relative z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">Enterprise Grade Intelligence</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Scale your contamination detection pipeline with robust algorithmic precision.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FeatureCard 
              delay={0.1}
              icon={<ShieldCheck size={36} />} 
              title="Real-Time Detection" 
              desc="Input raw water metrics including pH, Turbidity, and TDS to instantly classify potability with validated deep learning accuracy." 
            />
            <FeatureCard 
              delay={0.2}
              icon={<Activity size={36} />} 
              title="LSTM Forecasts" 
              desc="Pass historical time-series data to predict rolling contamination trends over 7 days, warning staff of slow-burning safety breaches." 
            />
            <FeatureCard 
              delay={0.3}
              icon={<BarChart size={36} />} 
              title="Actionable Analytics" 
              desc="Receive context-aware treatment suggestions immediately when non-compliant samples are detected, ensuring swift remediation." 
            />
          </div>
        </div>
      </div>

    </div>
  );
}

export default Landing;
