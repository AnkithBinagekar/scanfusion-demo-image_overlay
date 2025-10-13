import React, { createContext, useState } from "react";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputSlices, setInputSlices] = useState([]);
  const [outputSlices, setOutputSlices] = useState([]);
  const [overlaySlices, setOverlaySlices] = useState([]);
  //const [gifUrl, setGifUrl] = useState(null);

  const [showMode, setShowMode] = useState("input"); // input | mask | overlay
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ new state to persist visibility of "Open Detailed View" button
  const [showResultButton, setShowResultButton] = useState(false);

  // ✅ Helper: set all processed images at once (for demo or upload)
  const setProcessedImages = (data) => {
    if (!data) return;
    setInputSlices(data.input || []);
    setOutputSlices(data.output || []);
    setOverlaySlices(data.overlay || []);
    //setGifUrl(data.gif || null);

    // ✅ when new processed data arrives, show the Detailed View button
    setShowResultButton(true);
  };

  // ✅ Auto-reset when user uploads new scan
  const handleNewUpload = (file) => {
    setUploadedFile(file);
    setInputSlices([]);
    setOutputSlices([]);
    setOverlaySlices([]);
    setShowMode("input");
    setCurrentIndex(0);
    setShowResultButton(false); // hide “Detailed View” button on new upload
  };

 return (
  <ImageContext.Provider
    value={{
      uploadedFile,
      setUploadedFile,      // ✅ keep original React setter
      handleNewUpload,      // ✅ new helper with auto-reset logic
      inputSlices,
      setInputSlices,
      outputSlices,
      setOutputSlices,
      overlaySlices,
      setOverlaySlices,
      //gifUrl,
      //setGifUrl,
      showMode,
      setShowMode,
      currentIndex,
      setCurrentIndex,
      setProcessedImages,
      showResultButton,
      setShowResultButton,
    }}
  >
    {children}
  </ImageContext.Provider>
);

};

