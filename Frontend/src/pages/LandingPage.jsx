import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronRight, BrainCircuit, Database, ShieldCheck, UserPlus } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="flex justify-between items-center px-10 py-6 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <Activity className="text-indigo-600" size={28} />
          <span className="font-black text-xl tracking-tighter">RB-EVALUATION</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition">Se connecter</Link>
          <Link to="/register" className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-600 transition shadow-lg">S'inscrire</Link>
        </div>
      </nav>

      <header className="px-10 py-24 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">IA Médicale Bayésienne</span>
          <h1 className="text-6xl font-black leading-tight mt-6">Évaluez vos risques avec <span className="text-indigo-600">précision.</span></h1>
          <p className="text-slate-500 mt-6 text-lg leading-relaxed max-w-lg">Utilisez la puissance des réseaux bayésiens pour analyser vos symptômes en toute sécurité.</p>
          <div className="mt-10 flex gap-4">
            <Link to="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              Commencer l'évaluation <ChevronRight size={20} />
            </Link>
          </div>
        </div>
        <div className="bg-slate-100 rounded-3xl p-12 flex justify-center items-center">
            <BrainCircuit size={200} className="text-indigo-500 opacity-20" />
        </div>
      </header>
    </div>
  );
};

export default LandingPage;