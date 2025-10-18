import React, { createContext, useState, useEffect } from "react";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputSlices, setInputSlicesState] = useState([]);
  const [outputSlices, setOutputSlicesState] = useState([]);
  const [overlaySlices, setOverlaySlicesState] = useState([]);
  // const [gifUrl, setGifUrl] = useState(null);

  const [showMode, setShowMode] = useState("input"); // input | mask | overlay
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showResultButton, setShowResultButton] = useState(false);

  //For progress bar and result popup
  const [progress, setProgress] = useState(0);
const [statusMessage, setStatusMessage] = useState("");


  // ✅ New effect: automatically toggle "Detailed View" button
  useEffect(() => {
    const hasAnySlices =
      (inputSlices && inputSlices.length > 0) ||
      (outputSlices && outputSlices.length > 0) ||
      (overlaySlices && overlaySlices.length > 0);

    setShowResultButton(hasAnySlices);
  }, [inputSlices, outputSlices, overlaySlices]);

  // ✅ Reset slider to 0 whenever new slices are set
  const setInputSlices = (slices) => {
    setInputSlicesState(slices);
    setCurrentIndex(0);
  };

  const setOutputSlices = (slices) => {
    setOutputSlicesState(slices);
    setCurrentIndex(0);
  };

  const setOverlaySlices = (slices) => {
    setOverlaySlicesState(slices);
    setCurrentIndex(0);
  };

  const setProcessedImages = (data) => {
    if (!data) return;
    setInputSlices(data.input || []);
    setOutputSlices(data.output || []);
    setOverlaySlices(data.overlay || []);
    // setGifUrl(data.gif || null);
  };

  const handleNewUpload = (file) => {
    setUploadedFile(file);
    setInputSlices([]);
    setOutputSlices([]);
    setOverlaySlices([]);
    setShowMode("input");
    setCurrentIndex(0);
    // No need to manually hide button — auto handled by effect above
  };

  return (
    <ImageContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        handleNewUpload,
        inputSlices,
        setInputSlices,
        outputSlices,
        setOutputSlices,
        overlaySlices,
        setOverlaySlices,
        showMode,
        setShowMode,
        currentIndex,
        setCurrentIndex,
        setProcessedImages,
        showResultButton,
        setShowResultButton,
         // ✅ Shared progress + status
        progress,
        setProgress,
        statusMessage,
        setStatusMessage,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
