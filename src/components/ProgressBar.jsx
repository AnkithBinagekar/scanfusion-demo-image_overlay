import React, { useContext } from "react";
import { ImageContext } from "../contexts/ImageContext";

const ProgressBar = () => {
  const { progress, statusMessage } = useContext(ImageContext);

  if (!statusMessage) return null; // Hidden when idle

  // Choose color based on progress state
  let color = "bg-blue-500"; // default (processing)
  if (statusMessage.toLowerCase().includes("completed")) color = "bg-green-500";
  if (statusMessage.toLowerCase().includes("failed")) color = "bg-red-500";

  return (
    <div className="mt-6 w-full text-center px-4">
      <div className="text-gray-300 mb-2 text-sm">{statusMessage}</div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`${color} h-2 transition-all duration-300`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-gray-400 mt-1">{progress}%</div>
    </div>
  );
};

export default ProgressBar;
