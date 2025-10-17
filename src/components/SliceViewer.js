import React, { useContext, useEffect, useRef, useState } from "react";
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

  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(0);

  // 🔁 Update size on window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  let slicesToShow = [];
  if (showMode === "input") slicesToShow = inputSlices;
  if (showMode === "mask") slicesToShow = outputSlices;
  if (showMode === "overlay") slicesToShow = overlaySlices;

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full w-full text-white overflow-hidden"
    >
      {slicesToShow.length === 0 ? (
        <div className="text-gray-400 text-center mt-8">
          No slices to preview yet.
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          {/* 🔘 Mode Switch */}
          <div className="mb-2 flex items-center justify-between text-sm px-3">
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

          {/* 🧠 Image Preview (Larger and responsive) */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden px-3"
            style={{
              maxHeight: `${containerHeight * 0.8}px`, // image gets 80% of container
            }}
          >
            <img
              src={resolveUrl(slicesToShow[currentIndex])}
              alt="Slice Preview"
              className="object-contain w-full h-auto max-h-full rounded-lg shadow-lg transition-all duration-300"
              style={{
                maxWidth: "95%",
                maxHeight: "95%",
              }}
            />
          </div>

          {/* 🎚️ Slider Section */}
          <div className="mt-3 w-full px-6 pb-3">
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
