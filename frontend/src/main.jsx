import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login'; 
import AdminDashboard from './pages/Admin/admin'; 
import DriverDashboard from './pages/Driver/driver'; 
import InspectorDashboard from './pages/Inspector/inspector'; 
import TechnicianDashboard from './pages/Technician/technician'; 

import './index.css'; 

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        
        
        <Route path="/admin" element={<AdminDashboard />} />        
        <Route path="/driver" element={<DriverDashboard/>} />
        <Route path="/inspector" element={<InspectorDashboard/>} />
        <Route path="/technician" element={<TechnicianDashboard/>} />

        <Route path="/dashboard" element={<div style={{padding: '20px'}}><h2>General Dashboard</h2></div>} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
