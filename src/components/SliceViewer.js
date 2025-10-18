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

  // 🔁 Dynamically adjust square size based on container width
  useEffect(() => {
    const updateSize = () => {
      if (viewerRef.current) {
        const width = viewerRef.current.offsetWidth;
        // maintain a square shape that fits well on laptops
        setSize(Math.min(width * 0.9, 450));
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
    <div ref={viewerRef} className="flex flex-col h-full w-full text-white overflow-hidden">
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

          {/* 🧠 Square Image Preview */}
          <div
            className="flex items-center justify-center mx-auto my-2"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: "#1a1f2e",
              borderRadius: "25px",
              overflow: "hidden",
              boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            }}
          >
            <img
              src={resolveUrl(slicesToShow[currentIndex])}
              alt="Slice Preview"
              className="object-contain w-full h-full"
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
