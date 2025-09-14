// src/pages/FusionResult.jsx
import React, { useContext, useState } from "react";
import { ImageContext } from "../contexts/ImageContext";

//const API_URL = "http://localhost:8000"; // change for EC2 later

//For EC2 
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function resolveUrl(p) {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/${p}`;
}

const FusionResult = () => {
  const { inputSlices = [], outputSlices = [], overlaySlices = [], gifUrl } =
    useContext(ImageContext);

  const [sliceIndex, setSliceIndex] = useState(0);
  const [viewMode, setViewMode] = useState("single"); // "single" or "compare"
  const [singleView, setSingleView] = useState("input"); // "input" | "output" | "overlay"

  const maxSlices = Math.max(
    inputSlices.length,
    outputSlices.length,
    overlaySlices.length
  );

  const getImage = (type) => {
    if (type === "input" && inputSlices[sliceIndex])
      return resolveUrl(inputSlices[sliceIndex]);
    if (type === "output" && outputSlices[sliceIndex])
      return resolveUrl(outputSlices[sliceIndex]);
    if (type === "overlay" && overlaySlices[sliceIndex])
      return resolveUrl(overlaySlices[sliceIndex]);
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Fusion Results</h1>

      {/* Mode toggle */}
      <div className="flex justify-center mb-6 space-x-6">
        <label>
          <input
            type="radio"
            name="mode"
            value="single"
            checked={viewMode === "single"}
            onChange={() => setViewMode("single")}
            className="mr-2"
          />
          Single View
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="compare"
            checked={viewMode === "compare"}
            onChange={() => setViewMode("compare")}
            className="mr-2"
          />
          Side-by-Side Comparison
        </label>
      </div>

      {/* Single view mode */}
      {viewMode === "single" && (
        <div className="bg-gray-800 p-4 rounded shadow text-center">
          <div className="mb-4">
            <label className="mr-4">
              <input
                type="radio"
                name="singleView"
                value="input"
                checked={singleView === "input"}
                onChange={() => setSingleView("input")}
                className="mr-1"
              />
              Input
            </label>
            <label className="mr-4">
              <input
                type="radio"
                name="singleView"
                value="output"
                checked={singleView === "output"}
                onChange={() => setSingleView("output")}
                className="mr-1"
              />
              Output
            </label>
            <label>
              <input
                type="radio"
                name="singleView"
                value="overlay"
                checked={singleView === "overlay"}
                onChange={() => setSingleView("overlay")}
                className="mr-1"
              />
              Overlay
            </label>
          </div>

          <img
            src={getImage(singleView)}
            alt="Slice Preview"
            className="w-full max-w-lg mx-auto rounded shadow"
          />
          <input
            type="range"
            min="0"
            max={maxSlices - 1}
            value={sliceIndex}
            onChange={(e) => setSliceIndex(Number(e.target.value))}
            className="w-full mt-2"
          />
          <p className="text-center mt-1">
            Slice {sliceIndex + 1} / {maxSlices}
          </p>
        </div>
      )}

      {/* Comparison view mode */}git status
      {viewMode === "compare" && (
        <div className="bg-gray-800 p-4 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <h3 className="mb-2">Input</h3>
              <img
                src={getImage("input")}
                alt="Input Slice"
                className="w-full rounded shadow"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-2">Output</h3>
              <img
                src={getImage("output")}
                alt="Output Slice"
                className="w-full rounded shadow"
              />
            </div>
            <div className="text-center">
              <h3 className="mb-2">Overlay</h3>
              <img
                src={getImage("overlay")}
                alt="Overlay Slice"
                className="w-full rounded shadow"
              />
            </div>
          </div>

          <input
            type="range"
            min="0"
            max={maxSlices - 1}
            value={sliceIndex}
            onChange={(e) => setSliceIndex(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-center mt-1">
            Slice {sliceIndex + 1} / {maxSlices}
          </p>
        </div>
      )}

      {/* GIF rendering */}
      {gifUrl && (
        <div className="bg-gray-800 p-4 rounded shadow text-center mt-8">
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
