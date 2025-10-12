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
  const [selectedDemo, setSelectedDemo] = useState("UCSF-PDGM");

  const datasets = [
    {
      name: "UCSF-PDGM",
      label: "🧠 UCSF-PDGM Dataset",
      img: "https://ui-test-mev.s3.ap-south-1.amazonaws.com/sample_ucsf.jpg",
    },
    {
      name: "Yale",
      label: "🏥 Yale Dataset",
      img: "https://ui-test-mev.s3.ap-south-1.amazonaws.com/sample_yale.jpg",
    },
    {
      name: "Lumiere",
      label: "💡 Lumiere Dataset",
      img: "https://ui-test-mev.s3.ap-south-1.amazonaws.com/sample_lumiere.jpg",
    },
  ];

  // ✅ Run Sample Demo
  const handleRunDemo = async () => {
    try {
      setIsDemoLoading(true);
      console.log(`⚙️ Running sample demo: ${selectedDemo}...`);

      const response = await axios.post(`${API_URL}/process`, null, {
        params: { demo_sample: selectedDemo },
      });

      if (response.data.error) {
        alert("❌ " + response.data.error);
        setIsDemoLoading(false);
        return;
      }

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

      {/* ✅ Run Sample Demo Section */}
      <div className="w-full max-w-6xl mb-10 bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Choose a Sample Dataset
        </h2>

        {/* Dataset Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {datasets.map((ds) => (
            <div
              key={ds.name}
              onClick={() => setSelectedDemo(ds.name)}
              className={`cursor-pointer rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-4 ${
                selectedDemo === ds.name
                  ? "border-blue-500 bg-gray-700"
                  : "border-gray-600 hover:border-blue-400 bg-gray-800"
              }`}
            >
              <img
                src={ds.img}
                alt={ds.name}
                className="w-full h-36 object-cover rounded-md mb-3"
              />
              <h3 className="text-md font-medium text-center">{ds.label}</h3>
            </div>
          ))}
        </div>

        {/* Run Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleRunDemo}
            disabled={isDemoLoading}
            className={`${
              isDemoLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white py-3 px-10 rounded-lg font-semibold transition flex items-center gap-3`}
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
        </div>

        {/* Loading Bar */}
        {isDemoLoading && (
          <div className="mt-4 w-2/3 mx-auto bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-500 h-2 animate-pulse w-full"></div>
          </div>
        )}
      </div>

      {/* ✅ Two-column layout below */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        {/* Upload Section */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between h-[420px]">
          <UploadSection />
          <div className="mt-6">
            <FusionOptions />
          </div>
        </div>

        {/* Slice Viewer */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between h-[420px]">
          <SliceViewer />
        </div>
      </div>
    </div>
  );
};

export default FusionPage;
