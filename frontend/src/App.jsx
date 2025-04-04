import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Report from './pages/Report';
import Claim from './pages/Claim';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { isAdminAuthenticated } from './services/authService';
import AdminVerification from './pages/admin/AdminVerification';
import ClaimRequests from './pages/admin/ClaimRequests';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/claim" element={<Claim />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={
            isAdminAuthenticated() ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <AdminLogin />
            )
          } />
          
          <Route path="/admin/dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/claims" element={
            <ProtectedRoute>
              <ClaimRequests />
            </ProtectedRoute>
          } />

          {/* Redirect /admin to /admin/login */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

          <Route path="/admin/verification" element={<AdminVerification />} />

          {/* 404 Route */}
          <Route path="*" element={
            <>
              <Navbar />
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                  <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                  <a href="/" className="text-blue-500 hover:text-blue-600">
                    Go back home
                  </a>
                </div>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
