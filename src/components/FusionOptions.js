import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ImageContext } from "../contexts/ImageContext";

//const API_BASE = "http://localhost:8000";


//const API_URL = process.env.REACT_APP_API_URL || "https://kindlessly-interannular-jadiel.ngrok-free.app";
const API_URL = process.env.REACT_APP_API_URL || "https://r93u45uwjc.execute-api.ap-south-1.amazonaws.com/";
console.log("🌐 Using API URL:", API_URL);
// ✅ Load API base URL from environment for EC2
 // const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Use environment variable only
/*const API_URL = process.env.REACT_APP_API_URL;
if (!API_URL) {
  console.error("❌ Missing REACT_APP_API_URL! Please set it in Vercel environment variables.");
}*/

function resolveUrl(p) {
  if (!p) return "";
  //if (p.startsWith("http://") || p.startsWith("https://")) return p;
  if (p.startsWith("https://")) return p;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/${p}`;
}


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
        timeout: 300000, // 5 minutes
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percent);
        },
      });

      const data = response.data;

      // ✅ Store slices
      const inputUrls = data.input || [];
      const outputUrls = data.output || [];
      const overlayUrls = data.overlay || [];
      const gifUrl = data.gif || null;

      setInputSlices(inputUrls);
      setOutputSlices(outputUrls);
      setOverlaySlices(overlayUrls);
      setGifUrl(gifUrl);

      setProgress(100);
      setStatusMessage("✅ Segmentation completed successfully!");
      setTimeout(() => setStatusMessage(""), 4000); // clear message after 4s

      navigate("/results");
    } catch (error) {
      console.error("Fusion error:", error);
      setStatusMessage("❌ Fusion failed. Check console or backend logs.");
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    /*<div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Segmentation Options</h2>

      <div className="mb-4 text-gray-200">
        <label className="block mb-2">Segmentation Type</label>
        <label className="block">
          <input type="radio" name="fusion" defaultChecked /> MRI + CT
        </label>
        <label className="block">
          <input type="radio" name="fusion" /> CT + PET
        </label>
        <label className="block">
          <input type="radio" name="fusion" /> MRI + PET
        </label>
      </div>

      <div className="mb-4 text-gray-200">
        <label className="block mb-2">Noise Reduction</label>
        <input type="range" min="0" max="100" className="w-full" />
        <div className="text-sm">50%</div>
      </div>

      <div className="mb-4 text-gray-200">
        <label>
          <input type="checkbox" className="mr-2" /> Enhance Contrast
        </label>
      </div>

      <button
        onClick={handleFusion}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full"
        disabled={isLoading}
      >
        {isLoading ? "Segmenting..." : "Segment Images"}
      </button>*/
    //</div>

  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
      <button
        onClick={handleFusion}
        className={`${
          isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white px-8 py-3 rounded-lg font-semibold transition w-3/4`}
        disabled={isLoading}
      >
        {isLoading ? "Segmenting..." : "Segment Images"}
      </button>
    </div>

  );
};

export default FusionOptions;
