import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ImageContext } from "../contexts/ImageContext";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://r93u45uwjc.execute-api.ap-south-1.amazonaws.com/";

console.log("🌐 Using API URL:", API_URL);

const FusionOptions = () => {
  const {
    uploadedFile,
    setInputSlices,
    setOutputSlices,
    setOverlaySlices,
    setGifUrl,
    setProgress,
    setStatusMessage,
  } = useContext(ImageContext);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // 🧠 Handle Upload Fusion
  const handleFusion = async () => {
    if (!uploadedFile) {
      setStatusMessage("⚠️ Please upload a .nii.gz or .zip file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    setIsLoading(true);
    setProgress(0);
    setStatusMessage("⏳ Uploading and processing...");

    try {
      const response = await axios.post(`${API_URL}/process`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 300000,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percent);
        },
      });

      const data = response.data;
      setInputSlices(data.input || []);
      setOutputSlices(data.output || []);
      setOverlaySlices(data.overlay || []);
      setGifUrl(data.gif || null);

      setProgress(100);
      setStatusMessage("✅ Segmentation completed successfully!");
      setTimeout(() => setStatusMessage(""), 4000);

      navigate("/results");
    } catch (error) {
      console.error("Fusion error:", error);
      setStatusMessage("❌ Fusion failed. Check console or backend logs.");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 🧩 Simulated progress for "Run Sample Demo"
  const runSampleDemo = async () => {
    setIsLoading(true);
    setProgress(0);
    setStatusMessage("⚙️ Running sample demo...");

    // Fake incremental updates for realism
    let percent = 0;
    const interval = setInterval(() => {
      percent += Math.random() * 10;
      if (percent >= 95) percent = 95;
      setProgress(Math.floor(percent));
    }, 400);

    try {
      const response = await axios.get(`${API_URL}/run-sample`, {
        timeout: 300000,
      });
      clearInterval(interval);

      const data = response.data;
      setInputSlices(data.input || []);
      setOutputSlices(data.output || []);
      setOverlaySlices(data.overlay || []);
      setGifUrl(data.gif || null);

      setProgress(100);
      setStatusMessage("✅ Sample demo completed successfully!");
      setTimeout(() => setStatusMessage(""), 4000);
    } catch (error) {
      clearInterval(interval);
      console.error("Sample demo error:", error);
      setStatusMessage("❌ Sample demo failed. Try again.");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      {/* 🔘 Upload Button */}
      <button
        onClick={handleFusion}
        className={`${
          isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white px-8 py-3 rounded-lg font-semibold transition w-3/4`}
        disabled={isLoading}
      >
        {isLoading ? "Segmenting..." : "Segment Images"}
      </button>

      {/* 🧩 Run Sample Demo */}
      <button
        onClick={runSampleDemo}
        className={`${
          isLoading ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
        } text-white px-8 py-3 rounded-lg font-semibold transition w-3/4`}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : "Run Sample Demo"}
      </button>
    </div>
  );
};

export default FusionOptions;
