import React, { useContext } from "react";
import UploadSection from "../components/UploadSection";
import FusionOptions from "../components/FusionOptions";
import SliceViewer from "../components/SliceViewer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ImageContext } from "../contexts/ImageContext";

const API_URL = process.env.REACT_APP_API_URL;

const FusionPage = () => {
  const navigate = useNavigate();
  const { setProcessedImages } = useContext(ImageContext);

  // ✅ Run Sample Demo
  const handleRunDemo = async () => {
    try {
      alert("⚙️ Running sample demo... This may take a few seconds.");
      const response = await axios.post(`${API_URL}/process?demo=true`);
      console.log("Demo output:", response.data);

      if (response.data.error) {
        alert("❌ " + response.data.error);
        return;
      }

      // ✅ Save demo result in global context
      setProcessedImages(response.data);

      alert("✅ Demo completed successfully!");
      navigate("/results");
    } catch (error) {
      console.error("❌ Demo run failed:", error);
      alert("Demo failed. Check the console for more details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      {/* Title */}
      <h1 className="text-4xl font-bold text-center mb-8 text-white">
        Segmentation-Demo
      </h1>

      {/* ✅ Two-column main layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* Left Column: Upload + Segment */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-start">
          <UploadSection />

          {/* Slight spacing fix for the Segment Images button */}
          <div className="mt-6">
            <FusionOptions />
          </div>
        </div>

        {/* Right Column: Slice Viewer */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <SliceViewer />
        </div>
      </div>

      {/* ✅ Run Sample Demo button centered below both boxes */}
      <div className="mt-8 w-full flex justify-center">
        <button
          onClick={handleRunDemo}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-10 rounded-lg font-semibold transition"
        >
          Run Sample Demo
        </button>
      </div>
    </div>
  );
};

export default FusionPage;
