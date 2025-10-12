import React, { useContext } from "react";
import { ImageContext } from "../contexts/ImageContext";

const API_BASE = "http://localhost:8000";

function resolveUrl(p) {
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${API_BASE}${p}`;
  return `${API_BASE}/${p}`;
}

const SliceViewer = () => {
  const {
    inputSlices,
    outputSlices,
    overlaySlices,
    showMode,
    setShowMode,
    currentIndex,
    setCurrentIndex,
  } = useContext(ImageContext);

  let slicesToShow = [];
  if (showMode === "input") slicesToShow = inputSlices;
  if (showMode === "mask") slicesToShow = outputSlices;
  if (showMode === "overlay") slicesToShow = overlaySlices;

  return (
    <div className="flex flex-col h-full w-full text-white overflow-hidden">
     
      {slicesToShow.length === 0 ? (
        <div className="text-gray-400 text-center mt-8">
          No slices to preview yet.
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          {/* 🔘 Mode Switch */}
          <div className="mb-3 flex items-center justify-between text-sm">
            <div className="flex flex-wrap gap-3">
              <label>
                <input
                  type="radio"
                  name="view"
                  checked={showMode === "input"}
                  onChange={() => setShowMode("input")}
                  className="mr-1"
                />
                Input
              </label>
              <label>
                <input
                  type="radio"
                  name="view"
                  checked={showMode === "mask"}
                  onChange={() => setShowMode("mask")}
                  className="mr-1"
                />
                Segmentation Mask
              </label>
              <label>
                <input
                  type="radio"
                  name="view"
                  checked={showMode === "overlay"}
                  onChange={() => setShowMode("overlay")}
                  className="mr-1"
                />
                Overlay
              </label>
            </div>
            <div>
              Slice {currentIndex + 1} of {slicesToShow.length}
            </div>
          </div>

          {/* 🧠 Image Preview (Auto-scaling) */}
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={resolveUrl(slicesToShow[currentIndex])}
              alt="Slice Preview"
              //className="max-w-full max-h-[75vh] object-contain rounded shadow"
              className="w-full max-w-md mx-auto mb-4 rounded shadow"
            />
          </div>

          {/* 🎚️ Slider Section (Always visible) */}
          <div className="mt-4 w-full px-4 overflow-visible">
            <input
              type="range"
              min="0"
              max={slicesToShow.length - 1}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SliceViewer;