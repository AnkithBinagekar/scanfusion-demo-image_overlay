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

  // ✅ Function to trigger demo mode
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
      navigate("/results"); // ✅ Navigate automatically to results page
    } catch (error) {
      console.error("❌ Demo run failed:", error);
      alert("Demo failed. Check the console for more details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-white tracking-wide">
        Segmentation Demo
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
          <h2 className="text-2xl font-semibold mb-4 text-center text-blue-400">
            Upload MRI Scan
          </h2>
          <UploadSection />
          <button
            onClick={handleRunDemo}
            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-300 ease-in-out transform hover:scale-[1.02]"
          >
            Run Sample Demo
          </button>
        </div>

        {/* Segmentation Button Section */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-semibold mb-6 text-blue-400">
            Segmentation Control
          </h2>
          <FusionOptions />
        </div>

        {/* Slice Viewer */}
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
          <h2 className="text-2xl font-semibold mb-4 text-center text-blue-400">
            Slice Viewer
          </h2>
          <SliceViewer />
        </div>
      </div>
    </div>
  );
};

export default FusionPage;
