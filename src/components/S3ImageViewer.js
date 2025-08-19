// components/S3ImageViewer.js

import React from 'react';

const S3ImageViewer = () => {
  const imageUrl = 'https://ui-test-mev.s3.ap-south-1.amazonaws.com/mri_sample.jpg';
  const gifUrl = 'https://ui-test-mev.s3.ap-south-1.amazonaws.com/mri_sample.gif';

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-xl text-white w-full max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-8"> MRI Sample Demo</h2>

      {/* Input MRI */}
      <div className="mb-10 text-center">
        <h3 className="text-xl font-semibold mb-3"> Input MRI Slice (Simulated)</h3>
        <img
          src={imageUrl}
          alt="MRI Input"
          className="mx-auto rounded border border-gray-700 max-h-[400px] object-contain"
        />
      </div>

      {/* 3D Volume Output */}
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-3"> Simulated 3D Volume Output</h3>
        <img
          src={gifUrl}
          alt="MRI Volume"
          className="mx-auto rounded border border-gray-700 max-h-[400px] object-contain"
        />
      </div>
    </div>
  );
};

export default S3ImageViewer;
