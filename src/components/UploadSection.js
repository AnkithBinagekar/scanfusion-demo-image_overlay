// src/components/UploadSection.js
import React, { useContext } from 'react';
import { ImageContext } from '../contexts/ImageContext';

const UploadSection = () => {
  const { setUploadedFile } = useContext(ImageContext);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">
        Upload MRI Scan
      </h2>
      <input
        type="file"
        accept=".nii,.nii.gz,.zip"
        onChange={handleFileChange}
        className="mb-2 block w-full text-white bg-gray-700 p-2 rounded"
      />
      <p className="text-sm text-gray-400">
        Select a single FLAIR file (<code>.nii.gz</code>) or a ZIP containing multi-modality scans (T1, T1CE, T2, FLAIR).
      </p>
    </div>
  );
};

export default UploadSection;