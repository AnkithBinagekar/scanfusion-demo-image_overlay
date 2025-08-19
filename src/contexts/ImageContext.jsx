import React, { createContext, useState } from "react";

export const ImageContext = createContext();

export const ImageProvider = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputSlices, setInputSlices] = useState([]);
  const [outputSlices, setOutputSlices] = useState([]);
  const [overlaySlices, setOverlaySlices] = useState([]);
  const [gifUrl, setGifUrl] = useState(null);

  const [showMode, setShowMode] = useState("input"); // input | mask | overlay
  const [currentIndex, setCurrentIndex] = useState(0);

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
        gifUrl,
        setGifUrl,
        showMode,
        setShowMode,
        currentIndex,
        setCurrentIndex,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
