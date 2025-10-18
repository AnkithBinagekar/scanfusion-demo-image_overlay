import React, { useContext } from "react";
import { ImageContext } from "../contexts/ImageContext";

const ProgressBar = ({ showPercent = true }) => {
  const { progress, statusMessage } = useContext(ImageContext);

  if (!statusMessage) return null;

  // color logic
  let color = "bg-blue-500";
  const lower = statusMessage.toLowerCase();
  if (lower.includes("completed") || lower.includes("done") || lower.includes("success")) {
    color = "bg-green-500";
  } else if (lower.includes("fail") || lower.includes("error")) {
    color = "bg-red-500";
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-sm text-gray-300 mb-2 text-center">{statusMessage}</div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 transition-all duration-300`}
          style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
        />
      </div>
      {showPercent && (
        <div className="text-xs text-gray-400 mt-1 text-right">{Math.round(progress)}%</div>
      )}
    </div>
  );
};

export default ProgressBar;
