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

  // ✅ Helper: set all processed images at once (for demo or upload)
  const setProcessedImages = (data) => {
    if (!data) return;
    setInputSlices(data.input || []);
    setOutputSlices(data.output || []);
    setOverlaySlices(data.overlay || []);
    //setGifUrl(data.gif || null);
  };

  return (
    <ImageContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        inputSlices,
        setInputSlices,
        outputSlices,
        setOutputSlices,
        overlaySlices,
        setOverlaySlices,
        //gifUrl,
       // setGifUrl,
        showMode,
        setShowMode,
        currentIndex,
        setCurrentIndex,
        setProcessedImages, // ✅ expose helper to other components
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
