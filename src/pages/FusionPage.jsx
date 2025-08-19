import React from 'react';
import UploadSection from '../components/UploadSection';
import FusionOptions from '../components/FusionOptions';
import SliceViewer from '../components/SliceViewer';

const FusionPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-white">ScanFusion</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Upload */}
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <UploadSection />
        </div>

        {/* Middle Column: Options */}
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <FusionOptions />
        </div>

        {/* Right Column: Real-time Slice Viewer */}
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <SliceViewer />
        </div>
      </div>
    </div>
  );
};

export default FusionPage;