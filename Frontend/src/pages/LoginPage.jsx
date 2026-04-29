import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft, Loader2 } from 'lucide-react';

const LoginPage = ({ onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
     
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      if (response.ok) {
        const data = await response.json();
        onLoginSuccess(data.user); // On remonte les infos à App.jsx
        navigate('/dashboard'); // REDIRECTION VERS LE DASHBOARD
      } else {
        alert("Identifiants incorrects");
      }
    } catch (error) {
      alert("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-8 transition">
          <ArrowLeft size={18} /> Retour
        </Link>

        <h2 className="text-3xl font-black text-slate-900 mb-8">Connexion</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            placeholder="Nom d'utilisateur"
            className="w-full bg-slate-50 border-none rounded-xl p-4"
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          />
          <input 
            type="password" 
            placeholder="Mot de passe"
            className="w-full bg-slate-50 border-none rounded-xl p-4"
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 transition">
            {loading ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> Se connecter</>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Pas encore de compte ? <Link to="/register" className="text-indigo-600 font-bold hover:underline">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;