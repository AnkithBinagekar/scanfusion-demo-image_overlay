import React, { useState, useEffect } from 'react';

const ImageSlider = ({ images }) => {
  const [index, setIndex] = useState(0);
  const [imageURLs, setImageURLs] = useState([]);

  useEffect(() => {
    const urls = images.map((img) => URL.createObjectURL(img));
    setImageURLs(urls);
    setIndex(0); // Reset on new upload
  }, [images]);

  if (!imageURLs.length) return null;

  return (
    <div className="mt-6 bg-gray-900 p-6 rounded-lg text-center">
      <h2 className="text-xl font-bold mb-4">🖼️ Image Slice Viewer</h2>

      <img
        src={imageURLs[index]}
        alt={`slice-${index}`}
        className="max-h-96 mx-auto border rounded-lg shadow"
      />

      <input
        type="range"
        min="0"
        max={imageURLs.length - 1}
        value={index}
        onChange={(e) => setIndex(Number(e.target.value))}
        className="mt-4 w-full"
      />

      <p className="text-sm text-gray-400 mt-2">Slice {index + 1} of {imageURLs.length}</p>
    </div>
  );
};

export default ImageSlider;
