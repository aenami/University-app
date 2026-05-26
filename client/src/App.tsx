import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import GradesPortal from './pages/GradesPortal';
import AttendanceControl from './pages/AttendanceControl';

function App() {
  return (
    <>
      <Sidebar />
      <TopNav />
      <main style={{ marginLeft: '280px', paddingTop: '64px' }}>
        <Routes>
          <Route path="/grades" element={<GradesPortal />} />
          <Route path="/attendance" element={<AttendanceControl />} />
          <Route path="/" element={<Navigate to="/grades" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
