import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle, Droplets, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWaterContext } from '../context/WaterContext';

const dummyData = [
  { time: '00:00', value: 2 },
  { time: '04:00', value: 5 },
  { time: '08:00', value: 3 },
  { time: '12:00', value: 8 },
  { time: '16:00', value: 4 },
  { time: '20:00', value: 2 },
];

function StatCard({ title, value, status, icon, animDelay }) {
  const isDanger = status === 'danger';
  const colorClass = isDanger ? 'text-red-500 bg-red-50 dark:bg-red-500/10' : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.5 }}
      className="glass dark:glass-dark rounded-2xl p-6 flex items-center space-x-4"
    >
      <div className={`p-4 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </motion.div>
  );
}

function Dashboard() {
  const { lastDetectionResult } = useWaterContext();
  const hasAlert = lastDetectionResult && lastDetectionResult.status !== 'Safe';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">System Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Real-time water quality monitoring metrics synced across facilities.</p>
      </div>

      {hasAlert && (
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start space-x-4"
        >
          <ShieldAlert className="text-red-500 flex-shrink-0 mt-1" size={32} />
          <div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Critical Anomaly Detected</h2>
            <p className="text-gray-800 dark:text-gray-200 mt-1">
              Test sampled at {new Date(lastDetectionResult.timestamp).toLocaleTimeString()} resulted in an assessment of "{lastDetectionResult.status}". Immediate isolation of sector is recommended.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Current Status" 
          value={hasAlert ? "Compromised" : "Safe"} 
          status={hasAlert ? "danger" : "success"} 
          icon={hasAlert ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />} 
          animDelay={0} 
        />
        <StatCard title="Contamination Level" value={hasAlert ? lastDetectionResult.risk_level : "Low"} status={hasAlert ? "danger" :"success"} icon={<Activity size={24} />} animDelay={0.1} />
        <StatCard title="Alerts (24h)" value={hasAlert ? "1" : "0"} status={hasAlert ? "danger" : "success"} icon={<AlertTriangle size={24} />} animDelay={0.2} />
        <StatCard title="Samples Processed" value="1,249" status="success" icon={<Droplets size={24} />} animDelay={0.3} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="glass dark:glass-dark rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Turbidity Trends</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dummyData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1}/>
              <XAxis dataKey="time" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
