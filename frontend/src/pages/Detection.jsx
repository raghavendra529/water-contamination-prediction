import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useWaterContext } from '../context/WaterContext';

function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col mb-4">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input
        type="number"
        step="any"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/50 dark:bg-slate-800/50 text-gray-900 dark:text-white transition-shadow"
        required
      />
    </div>
  );
}

function SuggestionsBox({ formData }) {
  const suggestions = [];
  
  // Analyze form data to give actionable advice
  if (formData.ph < 6.5) suggestions.push("The water is acidic. Consider adding neutralizing filters (calcite) or soda ash to raise the pH level.");
  if (formData.ph > 8.5) suggestions.push("The water is highly alkaline. Using acid injection (like muriatic acid) or RO systems can reduce pH safely.");
  if (formData.turbidity > 5) suggestions.push("High turbidity observed. A coagulation and flocculation process followed by sand filtration is recommended.");
  if (formData.tds > 500) suggestions.push("Total Dissolved Solids exceed average safety margins. A Reverse Osmosis (RO) filter is highly recommended to strip these dissolved inorganic salts.");
  if (formData.dissolved_oxygen < 5) suggestions.push("Low dissolved oxygen. Introduce mechanical aeration to prevent stagnation which breeds harmful anaerobic bacteria.");

  if (suggestions.length === 0) {
    suggestions.push("Multiple interacting factors flagged the system. A comprehensive UV purification and active carbon filtration is recommended.");
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-5 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl text-left"
    >
      <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-400 font-semibold mb-3">
        <Info size={18} />
        <span>Immediate Actions & Suggestions</span>
      </div>
      <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {suggestions.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ul>
      
      <div className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-500/20 text-center">
        <Link to="/precautions" className="text-sm font-medium text-ocean-600 dark:text-ocean-400 hover:underline">
          View full prevention guidelines &rarr;
        </Link>
      </div>
    </motion.div>
  );
}

function Detection() {
  const [formData, setFormData] = useState({
    ph: '',
    turbidity: '',
    tds: '',
    temperature: '',
    conductivity: '',
    dissolved_oxygen: ''
  });
  
  const { saveDetectionResult } = useWaterContext();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        ph: parseFloat(formData.ph) || 7.0,
        turbidity: parseFloat(formData.turbidity) || 0.0,
        tds: parseFloat(formData.tds) || 0.0,
        temperature: parseFloat(formData.temperature) || 20.0,
        conductivity: parseFloat(formData.conductivity) || 0.0,
        dissolved_oxygen: parseFloat(formData.dissolved_oxygen) || 0.0
      };
      const res = await axios.post('http://localhost:8000/predict', payload);
      
      setResult(res.data);
      saveDetectionResult(payload, res.data); // Store globally
    } catch (err) {
      console.error(err);
      setResult({ status: 'Error', risk_level: 'Unknown', message: 'Failed to reach API' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Water Quality Detection</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Enter the water properties to assess immediate safety and contamination risk.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 glass dark:glass-dark rounded-2xl p-6 lg:p-8"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <InputField label="pH Level" name="ph" value={formData.ph} onChange={handleChange} placeholder="e.g. 7.2" />
              <InputField label="Turbidity (NTU)" name="turbidity" value={formData.turbidity} onChange={handleChange} placeholder="e.g. 1.5" />
              <InputField label="TDS (mg/L)" name="tds" value={formData.tds} onChange={handleChange} placeholder="e.g. 300" />
              <InputField label="Temperature (°C)" name="temperature" value={formData.temperature} onChange={handleChange} placeholder="e.g. 22.5" />
              <InputField label="Conductivity (µS/cm)" name="conductivity" value={formData.conductivity} onChange={handleChange} placeholder="e.g. 400" />
              <InputField label="Dissolved Oxygen (mg/L)" name="dissolved_oxygen" value={formData.dissolved_oxygen} onChange={handleChange} placeholder="e.g. 8.5" />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-lg shadow-ocean-500/30 disabled:opacity-70"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white mr-2" />
              ) : (
                <Send size={18} />
              )}
              <span>{loading ? 'Analyzing Neural Network...' : 'Run Analysis'}</span>
            </button>
          </form>
        </motion.div>

        {/* Result Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1"
        >
          {result ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`h-full flex flex-col items-center justify-center text-center rounded-2xl p-8 border-2 shadow-2xl ${
                result.status === 'Safe' 
                  ? 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-400 dark:border-emerald-500/50 shadow-emerald-500/20' 
                  : 'bg-red-50 dark:bg-red-900/40 border-red-400 dark:border-red-500/50 shadow-red-500/20'
              }`}
            >
              {result.status === 'Safe' ? (
                <div className="p-4 bg-emerald-100 dark:bg-emerald-800/50 rounded-full mb-6 text-emerald-600 dark:text-emerald-400 animate-pulse">
                  <CheckCircle size={64} />
                </div>
              ) : (
                <div className="p-4 bg-red-100 dark:bg-red-800/50 rounded-full mb-6 text-red-600 dark:text-red-400 flex-shrink-0 animate-pulse">
                  <AlertCircle size={64} />
                </div>
              )}
              
              <h2 className={`text-4xl font-extrabold mb-2 ${result.status === 'Safe' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.status}
              </h2>
              
              <div className="flex items-center space-x-2 mb-4">
                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                   result.risk_level === 'Critical' ? 'bg-red-600 text-white' :
                   result.risk_level === 'High Risk' ? 'bg-red-500 text-white' :
                   result.risk_level === 'Elevated' ? 'bg-orange-500 text-white' :
                   'bg-emerald-500 text-white'
                 }`}>
                   {result.risk_level} Risk
                 </span>
                 {result.confidence && (
                   <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                     {result.confidence}% Confidence
                   </span>
                 )}
              </div>

              {result.reasons && result.reasons.length > 0 && (
                <div className="mb-6 text-left w-full max-w-sm mx-auto">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Detected Anomalies:</p>
                    <div className="space-y-1">
                        {result.reasons.map((r, i) => (
                           <div key={i} className="flex items-center space-x-2 text-sm text-red-700 dark:text-red-400 font-medium">
                              <AlertCircle size={14} />
                              <span>{r}</span>
                           </div>
                        ))}
                    </div>
                </div>
              )}
              
              {/* Contextual Suggestion Box */}
              {result.status !== 'Safe' && result.status !== 'Error' && (
                <SuggestionsBox formData={formData} />
              )}
            </motion.div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex items-center justify-center p-8 text-center text-gray-400 dark:text-gray-500 bg-white/10 glass">
              Submit the water properties form to see the AI assessment here.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Detection;
