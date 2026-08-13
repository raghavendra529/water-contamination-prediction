/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext } from 'react';

const WaterContext = createContext();
const SESSION_KEY = 'aquaai_session';
const API = 'http://localhost:8000';

export function WaterProvider({ children }) {
  // Restore session from localStorage on mount (persists page refresh)
  const savedSession = (() => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  })();

  const [isAuthenticated, setIsAuthenticated] = useState(!!savedSession);
  const [user, setUser] = useState(savedSession || null);

  // Global Application State based on "Detected Sample"
  const [lastDetectionResult, setLastDetectionResult] = useState(null);
  const [lastDetectionData, setLastDetectionData]   = useState(null);

  /**
   * register: creates an UNVERIFIED user in the backend DB and sends OTP.
   * Does NOT log in – user must verify email first.
   * Returns { success, error }
   */
  const register = async (name, email, password) => {
    try {
      const res  = await fetch(`${API}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      return data; // { success, message/error }
    } catch {
      return { success: false, error: 'Cannot reach server. Is the backend running?' };
    }
  };

  /**
   * verifyOTP: validates the 6-digit code.
   * On success, backend returns user info and we set the session.
   * Returns { success, error }
   */
  const verifyOTP = async (email, otp) => {
    try {
      const res  = await fetch(`${API}/verify-otp`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch {
      return { success: false, error: 'Cannot reach server. Is the backend running?' };
    }
  };

  /**
   * login: authenticates a verified user.
   * Returns { success, error }
   */
  const login = async (email, password) => {
    try {
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch {
      return { success: false, error: 'Cannot reach server. Is the backend running?' };
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setLastDetectionResult(null);
    setLastDetectionData(null);
    localStorage.removeItem(SESSION_KEY);
  };

  // Called from Detection.jsx
  const saveDetectionResult = (formData, result) => {
    setLastDetectionData(formData);
    setLastDetectionResult({ ...result, timestamp: new Date().toISOString() });
  };

  return (
    <WaterContext.Provider
      value={{
        isAuthenticated,
        user,
        register,
        verifyOTP,
        login,
        logout,
        lastDetectionData,
        lastDetectionResult,
        saveDetectionResult,
      }}
    >
      {children}
    </WaterContext.Provider>
  );
}

export function useWaterContext() {
  return useContext(WaterContext);
}
