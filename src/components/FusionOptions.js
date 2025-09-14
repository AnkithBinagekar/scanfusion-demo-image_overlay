import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ImageContext } from "../contexts/ImageContext";

//const API_BASE = "http://localhost:8000";

// ✅ Load API base URL from environment for EC2
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const FusionOptions = () => {
  const {
    uploadedFile,
    setInputSlices,
    setOutputSlices,
    setOverlaySlices,
    setGifUrl,
  } = useContext(ImageContext);

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleFusion = async () => {
    if (!uploadedFile) {
      alert("Please upload a .nii.gz or .zip file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadedFile);

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/process`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;

      // Map to fully qualified URLs
      const inputUrls = (data.input || []).map((p) => `${API_URL}/${p}`);
      const outputUrls = (data.output || []).map((p) => `${API_URL}/${p}`);
      const overlayUrls = (data.overlay || []).map((p) => `${API_URL}/${p}`);
      const gifUrl = data.gif ? `${API_URL}/${data.gif}` : null;

      // Save into context
      setInputSlices(inputUrls);
      setOutputSlices(outputUrls);
      setOverlaySlices(overlayUrls);
      setGifUrl(gifUrl);

      navigate("/results");
    } catch (error) {
      console.error("Fusion error:", error);
      alert("Fusion failed. Check console or backend logs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-white">Fusion Options</h2>

      <div className="mb-4 text-gray-200">
        <label className="block mb-2">Fusion Type</label>
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
      </button>
    </div>
  );
};

export default FusionOptions;
