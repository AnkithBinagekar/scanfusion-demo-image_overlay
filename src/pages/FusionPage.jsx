import React, { useContext, useState } from "react";
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
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState("UCSF-PDGM"); // default option

  // ✅ Run Sample Demo
  const handleRunDemo = async () => {
    try {
      setIsDemoLoading(true);
      console.log(`⚙️ Running sample demo: ${selectedDemo}...`);

      const response = await axios.post(`${API_URL}/process`, null, {
        params: { demo_sample: selectedDemo },
      });

      console.log("Demo output:", response.data);

      if (response.data.error) {
        alert("❌ " + response.data.error);
        setIsDemoLoading(false);
        return;
      }

      // ✅ Save demo result in global context
      setProcessedImages(response.data);
      alert(`✅ ${selectedDemo} demo completed successfully!`);
      navigate("/results");
    } catch (error) {
      console.error("❌ Demo run failed:", error);
      alert("Demo failed. Check console for details.");
    } finally {
      setIsDemoLoading(false);
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

          <div className="mt-6">
            <FusionOptions />
          </div>
        </div>

        {/* Right Column: Slice Viewer */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md">
          <SliceViewer />
        </div>
      </div>

      {/* ✅ Run Sample Demo Section */}
      <div className="mt-10 w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4">Run Sample Demo</h2>

        {/* Dataset Selector */}
        <select
          value={selectedDemo}
          onChange={(e) => setSelectedDemo(e.target.value)}
          className="p-2 mb-4 w-full rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="UCSF-PDGM"> UCSF-PDGM Dataset</option>
          <option value="Yale"> Yale Dataset</option>
          <option value="Lumiere"> Lumiere Dataset</option>
        </select>

        {/* Run Demo Button */}
        <button
          onClick={handleRunDemo}
          disabled={isDemoLoading}
          className={`${
            isDemoLoading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white py-3 px-8 rounded-lg font-semibold transition flex items-center gap-3 w-full justify-center`}
        >
          {isDemoLoading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
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
              Running {selectedDemo} Demo...
            </>
          ) : (
            `Run ${selectedDemo} Demo`
          )}
        </button>

        {/* Loading Bar */}
        {isDemoLoading && (
          <div className="mt-4 w-2/3 bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-2 animate-pulse w-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FusionPage;
