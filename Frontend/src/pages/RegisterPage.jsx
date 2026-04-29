import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'PATIENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Succès : on informe l'utilisateur et on redirige vers le LOGIN
        alert("Inscription réussie ! Vous allez être redirigé vers la page de connexion.");
        navigate('/login'); 
      } else {
        setError(data.error || data.msg || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Impossible de contacter le serveur Flask.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-6 transition font-bold text-xs uppercase">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>

        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">Créer un compte</h2>
        <p className="text-slate-500 text-sm mb-8">Rejoignez le système d'évaluation bayésien.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1">Nom d'utilisateur</label>
            <input 
              type="text" required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 transition-all outline-none"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1">Votre Rôle</label>
            <select 
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 outline-none font-bold text-slate-600"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="PATIENT">Patient (Évaluation)</option>
              <option value="DOCTOR">Docteur / Responsable</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 px-1">Mot de passe</label>
            <input 
              type="password" required
              className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 transition-all outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><UserPlus size={18} /> S'INSCRIRE</>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium">
          Déjà inscrit ? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;