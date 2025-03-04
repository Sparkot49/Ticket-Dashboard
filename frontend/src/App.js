import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ServerDashboard from './pages/ServerDashboard';
import TicketView from './pages/TicketView';
import UserProfile from './pages/UserProfile';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/server/:serverId" 
            element={
              <PrivateRoute>
                <ServerDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ticket/:ticketId" 
            element={
              <PrivateRoute>
                <TicketView />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/user/:userId" 
            element={
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;