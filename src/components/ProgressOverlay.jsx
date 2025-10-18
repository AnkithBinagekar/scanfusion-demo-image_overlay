import React, { useContext } from "react";
import { ImageContext } from "../contexts/ImageContext";

const ProgressOverlay = () => {
  const { showOverlay, statusMessage, progress } = useContext(ImageContext);

  if (!showOverlay) return null;

  let color = "bg-blue-500";
  const msg = statusMessage?.toLowerCase() || "";
  if (msg.includes("success") || msg.includes("completed")) color = "bg-green-500";
  if (msg.includes("fail") || msg.includes("error")) color = "bg-red-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 p-8 rounded-2xl w-[90%] max-w-md text-center shadow-lg">
        <div className="text-white text-lg font-semibold mb-4">{statusMessage}</div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden mb-3">
          <div
            className={`${color} h-3 transition-all duration-300`}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
        <div className="text-sm text-gray-400 mb-4">{Math.round(progress)}%</div>

        {/* Spinner while running */}
        {!msg.includes("success") && !msg.includes("fail") && (
          <div className="flex justify-center">
            <svg
              className="animate-spin h-8 w-8 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressOverlay;
