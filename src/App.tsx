import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ServerPage from './pages/ServerPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from './context/ThemeContext';
import SettingsPage from './pages/SettingsPage';
import { AdminThemeProvider } from './context/AdminThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AdminThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/server/:id" element={<ServerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AdminThemeProvider>
    </ThemeProvider>
  );
}

export default App;