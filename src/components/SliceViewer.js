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

  const viewerRef = useRef(null);
  const [size, setSize] = useState(0);

  // 🧩 Dynamically adjust based on container width (more horizontal focus)
  useEffect(() => {
    const updateSize = () => {
      if (viewerRef.current) {
        const width = viewerRef.current.offsetWidth;
        const height = window.innerHeight;
        // Use 80% of width but cap it if height is too small
        const newSize = Math.min(width * 0.8, height * 0.6, 550);
        setSize(newSize);
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
      ref={viewerRef}
      className="flex flex-col h-full w-full text-white overflow-hidden"
    >
      {slicesToShow.length === 0 ? (
        <div className="text-gray-400 text-center mt-8">
          No slices to preview yet.
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full">
          {/* 🔘 Mode Switch */}
          <div className="mb-3 flex items-center justify-between text-sm px-3 flex-wrap">
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

            <div className="ml-6 text-gray-300 whitespace-nowrap">
              Slice {currentIndex + 1} of {slicesToShow.length}
            </div>
          </div>

          {/* 🧠 Larger, centered image preview */}
          <div
            className="flex items-center justify-center flex-1"
            style={{
              backgroundColor: "#1a1f2e",
              borderRadius: "20px",
              boxShadow: "0 0 20px rgba(0,0,0,0.4)",
              overflow: "hidden",
              width: `${size}px`,
              height: `${size}px`,
              margin: "0 auto",
              transition: "all 0.3s ease-in-out",
            }}
          >
            <img
              src={resolveUrl(slicesToShow[currentIndex])}
              alt="Slice Preview"
              className="object-contain w-full h-full rounded-md"
            />
          </div>

          {/* 🎚️ Slider */}
          <div className="mt-4 w-full px-6 pb-3">
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
