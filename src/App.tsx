import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { HomePage } from './pages/HomePage';
import { Chapter1_Charges } from './pages/chapters/Chapter1_Charges';
import { Chapter2_Coulomb } from './pages/chapters/Chapter2_Coulomb';
import { Chapter3_Forces3D } from './pages/chapters/Chapter3_Forces3D';
import { Chapter4_ElectricField } from './pages/chapters/Chapter4_ElectricField';
import { Chapter5_MovingCharge } from './pages/chapters/Chapter5_MovingCharge';
import { Chapter6_MagneticField } from './pages/chapters/Chapter6_MagneticField';
import { Chapter7_EMWaveVacuum } from './pages/chapters/Chapter7_EMWaveVacuum';
import { Chapter8_Metamaterials } from './pages/chapters/Chapter8_Metamaterials';
import { Chapter9_FDTDIntro } from './pages/chapters/Chapter9_FDTDIntro';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chapter/1-charges" element={<Chapter1_Charges />} />
          <Route path="/chapter/2-coulomb" element={<Chapter2_Coulomb />} />
          <Route path="/chapter/3-forces-3d" element={<Chapter3_Forces3D />} />
          <Route path="/chapter/4-electric-field" element={<Chapter4_ElectricField />} />
          <Route path="/chapter/5-moving-charge" element={<Chapter5_MovingCharge />} />
          <Route path="/chapter/6-magnetic-field" element={<Chapter6_MagneticField />} />
          <Route path="/chapter/7-em-wave-vacuum" element={<Chapter7_EMWaveVacuum />} />
          <Route path="/chapter/8-metamaterials" element={<Chapter8_Metamaterials />} />
          <Route path="/chapter/9-fdtd-intro" element={<Chapter9_FDTDIntro />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
