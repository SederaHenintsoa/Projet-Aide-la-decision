import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientPage from './pages/PatientPage';
import AdminPage from './pages/AdminPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérification propre du cache
    const savedUser = localStorage.getItem('rb_user');
    if (savedUser && savedUser !== "undefined") {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('rb_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.clear(); // Nettoyage total pour éviter les bugs de rôle
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-black text-indigo-600 uppercase tracking-widest">Initialisation...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Inscription : Aucune redirection automatique vers dashboard ici */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Connexion : Redirige vers dashboard SI l'utilisateur est déjà loggé */}
        <Route 
          path="/login" 
          element={!user ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />} 
        />

        {/* Dashboard : Dispatcher selon le rôle */}
        <Route 
          path="/dashboard" 
          element={
            user ? (
              user.role === 'DOCTOR' 
                ? <AdminPage user={user} onLogout={handleLogout} /> 
                : <PatientPage user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;