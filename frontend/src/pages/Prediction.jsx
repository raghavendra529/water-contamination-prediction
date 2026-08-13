import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import axios from 'axios';
import { useWaterContext } from '../context/WaterContext';

function Prediction() {
  const { lastDetectionData } = useWaterContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPredictions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Build a base turbidity history sequence
      let historySequence = [2.1, 2.2, 2.3, 2.4, 2.8, 3.1, 3.5, 3.9, 4.2];

      // If a detection was run, append the actual turbidity reading as the latest point
      // so the LSTM projects forward FROM the user's real measurement
      if (lastDetectionData) {
        const lastTurb = parseFloat(lastDetectionData.turbidity) || 2.5;
        historySequence = [...historySequence.slice(-8), lastTurb, lastTurb]; // seed with real reading
      }

      const res = await axios.post('http://localhost:8000/future-prediction', {
        history: historySequence,
        steps: 7
      });

      // res.data is an array: [{ day: 1, predicted_value: X, safety_limit: Y }, ...]
      const chartData = res.data.map((item) => ({
        name: `Day ${item.day}`,
        AI: parseFloat(item.predicted_value.toFixed(2)),
        limit: item.safety_limit
      }));

      setData(chartData);
    } catch (err) {
      console.error("Prediction API Error:", err);
      setError(err.response ? "Backend responded with error. Check logs." : "Failed to connect to backend. Is it running?");
    } finally {
      setLoading(false);
    }
  }, [lastDetectionData]);

  // Fetch on mount or when new data arrives
  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Future Contamination Risk</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">LSTM neural network projecting water quality trends.</p>
        </div>
        
        <button 
          onClick={fetchPredictions}
          disabled={loading}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Live Detection Banner */}
      {lastDetectionData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center space-x-3"
        >
          <Activity className="text-blue-500 flex-shrink-0" size={20} />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-bold text-blue-600 dark:text-blue-400">Forecast seeded from your last detection:</span>{' '}
            Turbidity {lastDetectionData.turbidity} NTU · pH {lastDetectionData.ph} · TDS {lastDetectionData.tds} mg/L
          </p>
        </motion.div>
      )}

      <div className="glass dark:glass-dark rounded-2xl p-6 md:p-8 flex flex-col border border-gray-100 dark:border-gray-800/50 shadow-xl border-t-4 border-ocean-500">
        <div className="flex items-center space-x-2 mb-8">
          <Calendar className="text-ocean-500" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">7-Day Forecast trajectory</h2>
        </div>

        <div className="flex-1 min-h-[400px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-ocean-200 dark:border-ocean-900 border-t-ocean-500 animate-spin"></div>
                <div className="text-gray-500 font-medium">Running LSTM Sequence...</div>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-red-500 text-center">
              <span className="font-bold text-lg">{error}</span>
              <span className="text-sm mt-2 opacity-80">Check backend connectivity or model status.</span>
            </div>
          ) : (
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', background: '#1e293b', color: 'white' }} 
                    itemStyle={{ color: 'white' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                  <Line 
                    type="monotone" 
                    dataKey="limit" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Safety Limit"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="AI" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    activeDot={{ r: 8, fill: '#60A5FA', stroke: '#fff', strokeWidth: 2 }}
                    name="Predicted Metric (AI)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Explicit Contamination Level Breakdown */}
      {data && data.length > 0 && !loading && !error && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contamination Forecast Scale</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {data.map((day, idx) => {
              const riskFactor = day.AI / day.limit;
              let status, icon, colorClass, borderClass;
              
              if (riskFactor >= 1.0) {
                 status = "High Risk";
                 icon = <AlertTriangle size={20} />;
                 colorClass = "text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/40";
                 borderClass = "border-red-500 shadow-red-500/20";
              } else if (riskFactor >= 0.75) {
                 status = "Elevated";
                 icon = <Activity size={20} />;
                 colorClass = "text-amber-500 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40";
                 borderClass = "border-amber-500 shadow-amber-500/20";
              } else {
                 status = "Safe";
                 icon = <ShieldCheck size={20} />;
                 colorClass = "text-emerald-500 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40";
                 borderClass = "border-ocean-200 dark:border-ocean-900";
              }

              return (
                <div key={idx} className={`glass dark:glass-dark rounded-2xl p-4 border-t-4 shadow-md flex flex-col items-center justify-center text-center ${borderClass}`}>
                  <div className={`p-3 rounded-full mb-3 ${colorClass}`}>
                    {icon}
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">{day.name}</h3>
                  <span className={`text-xs font-bold uppercase tracking-wide ${status === 'High Risk' ? 'text-red-500' : status === 'Elevated' ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {day.AI.toFixed(2)} NTU
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 glass dark:glass-dark rounded-xl p-6">
        The LSTM model processes time-series historical records to capture hidden non-linear relationships. Based on the trajectory, safety anomalies might be triggered within the prediction window.
      </div>
    </div>
  );
}

export default Prediction;
