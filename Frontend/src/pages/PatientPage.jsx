import React, { useState, useEffect } from 'react';
import { Activity, LogOut, User, PlusCircle, ArrowLeft, ClipboardList, Send, Loader2, CheckCircle, AlertTriangle, ShieldAlert, Clock } from 'lucide-react';

const PatientPage = ({ user, onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // RÉINTÉGRATION DE TOUS LES PARAMÈTRES (5 au total)
  const [symptoms, setSymptoms] = useState({
    fievre: 'Non',
    toux: 'Aucune',
    anosmie: 'Non', // Paramètre rétabli
    contact: 0,
    cluster: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/history/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Erreur de récupération de l'historique");
    }
  };

  const getRecommendation = (score) => {
    if (score >= 70) return { title: "Risque Élevé", color: "text-red-600", bgColor: "bg-red-50", icon: <ShieldAlert size={24} />, action: "Isolez-vous immédiatement et consultez." };
    if (score >= 30) return { title: "Risque Modéré", color: "text-orange-600", bgColor: "bg-orange-50", icon: <AlertTriangle size={24} />, action: "Restez vigilant, portez un masque." };
    return { title: "Risque Faible", color: "text-emerald-600", bgColor: "bg-emerald-50", icon: <CheckCircle size={24} />, action: "Continuez les gestes barrières." };
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, data: symptoms })
      });
      const data = await response.json();
      if (response.ok) {
        setResult(data.probability);
        fetchHistory(); // Met à jour le tableau après l'analyse
      }
    } catch (error) {
      alert("Erreur lors de l'analyse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg"><Activity className="text-white" size={20} /></div>
          <span className="font-black text-xl tracking-tighter uppercase text-slate-900">RB-EVALUATION</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
            <User size={16} className="text-indigo-600" />
            <span className="font-bold text-sm text-slate-700">{user?.username}</span>
          </div>
          <button onClick={onLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><LogOut size={22} /></button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-10">
        {!showForm ? (
          <div className="space-y-8">
            {/* Widget Bienvenue */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 p-12 flex justify-between items-center animate-in fade-in">
              <div>
                <h1 className="text-4xl font-black text-slate-900 mb-2">Santé Connectée</h1>
                <p className="text-slate-500 text-lg font-medium">Gérez vos évaluations bayésiennes</p>
              </div>
              <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center gap-3">
                <PlusCircle size={24} /> NOUVELLE ÉVALUATION
              </button>
            </div>

            {/* TABLEAU D'HISTORIQUE */}
            <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                <Clock className="text-indigo-600" size={24} />
                <h2 className="font-black uppercase tracking-widest text-sm text-slate-400">Historique des Diagnostics</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 border-b">
                      <th className="px-8 py-5">Date d'analyse</th>
                      <th className="px-8 py-5 text-center">Score de Risque</th>
                      <th className="px-8 py-5">Symptômes Déclenchés</th>
                      <th className="px-8 py-5 text-right">Décision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.length > 0 ? history.map((item, index) => (
                      <tr key={index} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-8 py-5 font-bold text-slate-600 text-sm">
                          {new Date(item.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className={`text-xl font-black ${item.probability > 50 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {item.probability}%
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex gap-1 flex-wrap">
                            {item.fever === 'Oui' && <span className="bg-red-50 text-red-600 text-[8px] font-black px-2 py-0.5 rounded-md border border-red-100 uppercase">Fièvre</span>}
                            {item.anosmia === 'Oui' && <span className="bg-orange-50 text-orange-600 text-[8px] font-black px-2 py-0.5 rounded-md border border-orange-100 uppercase">Anosmie</span>}
                            {item.contact === 1 && <span className="bg-blue-50 text-blue-600 text-[8px] font-black px-2 py-0.5 rounded-md border border-blue-100 uppercase">Contact</span>}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${item.probability > 50 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {item.probability > 50 ? <ShieldAlert size={12}/> : <CheckCircle size={12}/>}
                            {item.probability > 50 ? 'Surveillance' : 'Stable'}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center">
                          <div className="opacity-20 flex flex-col items-center gap-4">
                            <ClipboardList size={48} />
                            <p className="font-black uppercase text-xs tracking-widest">Aucun historique disponible</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Formulaire (Avec Anosmie Rétablie) */
          <div className="w-full max-w-3xl bg-white rounded-[40px] shadow-xl border border-slate-100 p-10 animate-in slide-in-from-bottom-4">
            <button onClick={() => { setShowForm(false); setResult(null); }} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 mb-8 font-bold text-xs uppercase tracking-widest transition-colors"><ArrowLeft size={18} /> Retour</button>

            {result !== null ? (
              <div className="py-4 animate-in zoom-in duration-500 text-center">
                <div className="grid md:grid-cols-5 gap-6 text-left">
                  <div className="md:col-span-2 bg-slate-900 p-8 rounded-[32px] text-center shadow-xl flex flex-col justify-center">
                    <span className="text-6xl font-black text-white">{result}%</span>
                    <p className="text-[10px] font-black text-indigo-400 uppercase mt-4 tracking-widest">Probabilité de risque</p>
                  </div>
                  <div className={`md:col-span-3 p-8 rounded-[32px] border-2 ${getRecommendation(result).bgColor} ${getRecommendation(result).color} flex flex-col justify-center`}>
                    <div className="flex items-center gap-3 mb-4">{getRecommendation(result).icon} <h3 className="font-black text-lg uppercase tracking-tight">{getRecommendation(result).title}</h3></div>
                    <p className="text-slate-700 font-medium leading-relaxed">{getRecommendation(result).action}</p>
                  </div>
                </div>
                <button onClick={() => {setResult(null); setShowForm(false);}} className="w-full mt-10 bg-slate-900 text-white py-5 rounded-2xl font-black hover:bg-indigo-600 shadow-lg transition-all">RETOUR AU TABLEAU DE BORD</button>
              </div>
            ) : (
              <form onSubmit={handleAnalyze} className="space-y-8">
                <div className="flex items-center gap-3 mb-10">
                  <div className="bg-indigo-50 p-3 rounded-2xl"><ClipboardList className="text-indigo-600" size={28} /></div>
                  <div><h2 className="text-2xl font-black text-slate-900 uppercase">Questionnaire</h2><p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Calcul Bayésien</p></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-400 px-1">Fièvre</label>
                    <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition-all" value={symptoms.fievre} onChange={(e) => setSymptoms({...symptoms, fievre: e.target.value})}><option value="Non">Non</option><option value="Oui">Oui</option></select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-400 px-1">Toux</label>
                    <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition-all" value={symptoms.toux} onChange={(e) => setSymptoms({...symptoms, toux: e.target.value})}><option value="Aucune">Aucune</option><option value="Sèche">Sèche</option><option value="Grasse">Grasse</option></select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase text-slate-400 px-1">Anosmie (Odorat)</label>
                    <select className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl p-4 outline-none font-bold text-slate-700 transition-all" value={symptoms.anosmie} onChange={(e) => setSymptoms({...symptoms, anosmie: e.target.value})}><option value="Non">Non</option><option value="Oui">Oui</option></select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer border-2 border-transparent focus-within:border-indigo-100"><input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600" onChange={(e) => setSymptoms({...symptoms, contact: e.target.checked ? 1 : 0})} /><span className="text-sm font-bold text-slate-700">Contact avec un cas positif</span></label>
                  <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer border-2 border-transparent focus-within:border-indigo-100"><input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600" onChange={(e) => setSymptoms({...symptoms, cluster: e.target.checked ? 1 : 0})} /><span className="text-sm font-bold text-slate-700">Zone cluster visitée</span></label>
                </div>

                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-lg hover:bg-indigo-600 flex justify-center items-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> ANALYSER MAINTENANT</>}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default PatientPage;