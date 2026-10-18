import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { Chapter1_Charges } from './pages/chapters/Chapter1_Charges';
import { Chapter2_Coulomb } from './pages/chapters/Chapter2_Coulomb';
import { Chapter3_Forces3D } from './pages/chapters/Chapter3_Forces3D';
import { Chapter4_ElectricField } from './pages/chapters/Chapter4_ElectricField';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chapter/1-charges" element={<Chapter1_Charges />} />
        <Route path="/chapter/2-coulomb" element={<Chapter2_Coulomb />} />
        <Route path="/chapter/3-forces-3d" element={<Chapter3_Forces3D />} />
        <Route path="/chapter/4-electric-field" element={<Chapter4_ElectricField />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
