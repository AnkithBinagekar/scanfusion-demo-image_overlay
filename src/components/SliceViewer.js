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
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Slice Viewer</h2>

      {slicesToShow.length === 0 ? (
        <div className="text-gray-400">No slices to preview yet.</div>
      ) : (
        <div className="text-white">
          {/* Mode Switch */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <label className="mr-4">
                <input
                  type="radio"
                  name="view"
                  checked={showMode === "input"}
                  onChange={() => setShowMode("input")}
                  className="mr-1"
                />
                Input
              </label>
              <label className="mr-4">
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

          {/* Image Preview */}
          <img
            src={resolveUrl(slicesToShow[currentIndex])}
            alt="Slice Preview"
            className="w-full max-w-md mx-auto mb-4 rounded shadow"
          />

          {/* Slider */}
          <input
            type="range"
            min="0"
            max={slicesToShow.length - 1}
            value={currentIndex}
            onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};

export default SliceViewer;
