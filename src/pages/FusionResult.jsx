// src/pages/FusionResult.jsx
import React, { useContext } from "react";
import { ImageContext } from "../contexts/ImageContext";

const API_BASE = "http://localhost:8000"; // backend base

function resolveUrl(p) {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) {
    if (p.startsWith("/http://") || p.startsWith("/https://")) {
      return p.slice(1);
    }
    return p;
  }
  if (p.startsWith("/")) return `${API_BASE}${p}`;
  return `${API_BASE}/${p}`;
}

const FusionResult = () => {
  const {
    inputSlices,
    outputSlices,
    overlaySlices,
    gifUrl,
    showMode,
    setShowMode,
    currentIndex,
    setCurrentIndex,
  } = useContext(ImageContext);

  // Pick which slices to show depending on mode
  let slices = [];
  if (showMode === "input") slices = inputSlices;
  else if (showMode === "mask") slices = outputSlices;
  else if (showMode === "overlay") slices = overlaySlices;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Fusion Results</h1>

      {/* Mode selection */}
      <div className="bg-gray-800 p-4 rounded shadow mb-6 flex gap-6 justify-center">
        <label>
          <input
            type="radio"
            name="view"
            checked={showMode === "input"}
            onChange={() => setShowMode("input")}
          />{" "}
          Input (FLAIR)
        </label>
        <label>
          <input
            type="radio"
            name="view"
            checked={showMode === "mask"}
            onChange={() => setShowMode("mask")}
          />{" "}
          Segmentation (Color)
        </label>
        <label>
          <input
            type="radio"
            name="view"
            checked={showMode === "overlay"}
            onChange={() => setShowMode("overlay")}
          />{" "}
          Overlay (Input + Mask)
        </label>
      </div>

      {/* Slice Viewer */}
      {slices && slices.length > 0 && (
        <div className="mb-8 bg-gray-800 p-4 rounded shadow text-center">
          <h2 className="text-xl mb-2 capitalize">{showMode}</h2>
          <img
            src={resolveUrl(slices[currentIndex])}
            alt={`${showMode} slice`}
            className="w-full max-w-lg mx-auto rounded shadow"
          />
          <input
            type="range"
            min="0"
            max={slices.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(Number(e.target.value))}
            className="w-full mt-2"
          />
          <p className="text-center mt-1">
            Slice {currentIndex + 1} / {slices.length}
          </p>
        </div>
      )}

      {/* GIF Preview */}
      {gifUrl && (
        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <h2 className="text-xl mb-2">Volume Rendering (GIF)</h2>
          <img
            src={resolveUrl(gifUrl)}
            alt="3D Volume Rendering"
            className="mx-auto rounded shadow"
          />
        </div>
      )}
    </div>
  );
};

export default FusionResult;
