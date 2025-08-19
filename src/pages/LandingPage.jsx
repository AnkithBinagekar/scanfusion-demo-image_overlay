// src/pages/LandingPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] text-white flex items-center justify-center px-6 py-10">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold mb-4">Welcome to ScanFusion Demo</h1>
        <p className="text-lg mb-8 text-gray-200">
          Explore MRI, CT, and PET image fusion with simulated 3D volume rendering and segmentation preview.
        </p>
        <button
          onClick={() => navigate('/fusion')}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold"
        >
          Start Fusion →
        </button>
      </div>
    </div>
  );
};

export default LandingPage;