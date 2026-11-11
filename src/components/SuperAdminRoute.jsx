import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { secureStorage } from '../utils/secureStorage.js';

const SuperAdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = secureStorage.getToken();
        if (!token) {
          setIsAuthenticated(false);
          setIsSuperAdmin(false);
          setIsLoading(false);
          return;
        }

        const userData = await secureStorage.getUserData();
        if (userData) {
          setIsAuthenticated(true);
          setIsSuperAdmin(userData.isSuperAdmin === true);
        } else {
          setIsAuthenticated(false);
          setIsSuperAdmin(false);
        }
      } catch (error) {
        console.error('Error checking superadmin access:', error);
        setIsAuthenticated(false);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full"
          />
          <p className="text-white text-lg">Verifying superadmin access...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-950 flex items-center justify-center">
        <motion.div
          className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            You don't have super administrator privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default SuperAdminRoute;
