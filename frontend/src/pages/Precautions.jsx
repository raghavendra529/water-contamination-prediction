import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Droplet, Thermometer, FlaskConical, Activity } from 'lucide-react';

function PrecautionCard({ title, icon, cause, solution, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="glass dark:glass-dark rounded-2xl p-6 flex flex-col h-full border-t-4 border-ocean-500"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-ocean-100 dark:bg-ocean-900 rounded-lg text-ocean-600 dark:text-ocean-400">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <span className="text-sm font-semibold text-red-500 uppercase tracking-wider">Potential Cause</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{cause}</p>
        </div>
        <div>
          <span className="text-sm font-semibold text-aqua-600 dark:text-aqua-400 uppercase tracking-wider">Mitigation Action</span>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{solution}</p>
        </div>
      </div>
    </motion.div>
  );
}

function Precautions() {
  const guidelines = [
    {
      title: "Abnormal pH Levels",
      icon: <FlaskConical size={24} />,
      cause: "High pH indicates alkaline conditions (industrial runoff), while low pH is acidic (acid rain, mining).",
      solution: "For high pH, use neutralizing acids like muriatic acid. For low pH, add neutralizing filters containing calcite or soda ash.",
      delay: 0.1
    },
    {
      title: "Elevated Turbidity",
      icon: <Droplet size={24} />,
      cause: "Suspended soils, algae blooms, or clay particles making water cloudy.",
      solution: "Implement flocculation/coagulation. Administer Alum to settle particles, followed by mechanical sand filtration.",
      delay: 0.2
    },
    {
      title: "High TDS & Conductivity",
      icon: <Activity size={24} />,
      cause: "Dissolved inorganic salts (calcium, magnesium, chlorides) usually naturally seeping from minerals or sewage.",
      solution: "Reverse Osmosis (RO) systems are the primary effective method to filter out high Total Dissolved Solids. Distillation is a secondary alternative.",
      delay: 0.3
    },
    {
      title: "Low Dissolved Oxygen",
      icon: <ShieldAlert size={24} />,
      cause: "Excessive algae growth decomposing (eutrophication) or stagnant water reducing aeration.",
      solution: "Increase aeration through fountains, diffusers, or mechanical mixing. Avoid dumping organic waste restricting aerobic processes.",
      delay: 0.4
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10 text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 text-sm font-semibold mb-4 tracking-wide">
          SAFETY GUIDELINES
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Treatment & Mitigation <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-500 to-aqua-500">Strategies</span>
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Explore immediate remedies and long-term actions to ensure your future water reserves remain untainted and safe for consumption.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guidelines.map((guide, idx) => (
          <PrecautionCard
            key={idx}
            title={guide.title}
            icon={guide.icon}
            cause={guide.cause}
            solution={guide.solution}
            delay={guide.delay}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 glass dark:glass-dark rounded-2xl p-8 border-l-8 border-aqua-500 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="p-4 bg-aqua-100 dark:bg-aqua-900/50 rounded-full text-aqua-600 dark:text-aqua-400">
            <Thermometer size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Automated Alert Systems</h3>
            <p className="text-gray-600 dark:text-gray-300">
              To guarantee that "future water should become safe" as requested, tie the AquaAI threshold predictions directly into IoT valves or chlorination pumps in your facility. Utilizing the `/future-prediction` module guarantees proactive mitigation before safety limits are breached.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Precautions;
