import React, { useContext } from "react";
import UploadSection from "../components/UploadSection";
import FusionOptions from "../components/FusionOptions";
import SliceViewer from "../components/SliceViewer";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ImageContext } from "../context/ImageContext"; // ✅ make sure this path matches your project

const API_URL = process.env.REACT_APP_API_URL;

const FusionPage = () => {
  const navigate = useNavigate();
  const { setProcessedImages } = useContext(ImageContext);

  // Function to trigger demo mode
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
      navigate("/results"); // ✅ Go to results page automatically

    } catch (error) {
      console.error("❌ Demo run failed:", error);
      alert("Demo failed. Check the console for more details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-6 text-white">
        Segmentation-Demo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Upload */}
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <UploadSection />
          {/* Added Demo Button */}
          <button
            onClick={handleRunDemo}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
          >
            Run Sample Demo
          </button>
        </div>

        {/* Middle Column: Options */}
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <FusionOptions />
        </div>

        {/* Right Column: Real-time Slice Viewer */}
        <div className="bg-gray-800 p-4 rounded shadow-md">
          <SliceViewer />
        </div>
      </div>
    </div>
  );
};

export default FusionPage;
