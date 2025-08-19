import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ImageProvider } from './contexts/ImageContext';

import LandingPage from './pages/LandingPage';
import FusionPage from './pages/FusionPage';
import FusionResult from './pages/FusionResult';

const App = () => {
  return (
    <ImageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/fusion" element={<FusionPage />} />
          <Route path="/results" element={<FusionResult />} />
        </Routes>
      </Router>
    </ImageProvider>
  );
};

export default App;
