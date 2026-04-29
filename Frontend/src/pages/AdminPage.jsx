import React, { useState, useEffect } from 'react';
import { Shield, LogOut, Search, Eye, User, X, Calendar, Loader2, Calculator, Info, FileText } from 'lucide-react';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import toast, { Toaster } from 'react-hot-toast';

const AdminPage = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedCalcPatient, setSelectedCalcPatient] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/patients');
      const data = await response.json();
      if (response.ok) setPatients(data);
    } catch (error) {
      console.error("Erreur serveur");
    }
  };

  // --- FONCTION DE GÉNÉRATION PDF CORRIGÉE ---
  const generatePDF = (patient) => {
    try {
      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.setTextColor(79, 70, 229);
      doc.text("RAPPORT DE DIAGNOSTIC RB-ADMIN", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Identifiant Patient : #D-${patient.id}`, 20, 30);
      doc.text(`Nom : ${patient.name}`, 20, 35);
      doc.text(`Date du rapport : ${new Date().toLocaleDateString('fr-FR')}`, 20, 40);

      // Vérification de la présence de autoTable
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          startY: 50,
          head: [['Indicateur', 'Valeur']],
          body: [
            ['Probabilité d\'Infection', `${patient.last_result}%`],
            ['Interprétation', patient.last_result > 50 ? 'RISQUE ÉLEVÉ' : 'RISQUE FAIBLE'],
            ['Méthodologie', 'Inférence Bayésienne (Théorème de Bayes)']
          ],
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] },
          styles: { font: "helvetica", fontSize: 10 }
        });
      } else {
        doc.text(`Résultat Probabilité : ${patient.last_result}%`, 20, 55);
      }

      doc.save(`Rapport_${patient.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error("Erreur PDF:", error);
      alert("Erreur lors de la génération du PDF. Vérifiez que jspdf-autotable est installé.");
    }
  };

  const handleViewDetails = async (patient) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    try {
      const response = await fetch(`http://localhost:5000/api/history/${patient.id}`);
      const data = await response.json();
      if (response.ok) setPatientHistory(data);
    } catch (error) {
      console.error("Erreur historique");
    } finally {
      setLoadingHistory(false);
    }
  };

  const getDynamicSymptoms = () => {
    if (!selectedCalcPatient) return [];
    const isHighRisk = selectedCalcPatient.last_result > 50;

    return [
      { 
        label: 'Anosmie (AA)', 
        valI: isHighRisk ? '0.65' : '0.12', 
        valS: isHighRisk ? '0.01' : '0.05', 
        obs: isHighRisk ? '311 / 478' : '57 / 478',
        status: isHighRisk ? 'Détecté' : 'Absent',
        desc: isHighRisk ? 'Signe clinique majeur détecté.' : 'Aucune perte d\'odorat signalée.'
      },
      { 
        label: 'Fièvre Forte (FF)', 
        valI: isHighRisk ? '0.85' : '0.20', 
        valS: isHighRisk ? '0.03' : '0.10', 
        obs: isHighRisk ? '406 / 478' : '95 / 478',
        status: isHighRisk ? 'Détecté' : 'Absent',
        desc: isHighRisk ? 'Température > 38.5°C.' : 'Température normale.'
      },
      { 
        label: 'Toux Sèche (TS)', 
        valI: '0.70', 
        valS: '0.10', 
        obs: '334 / 478',
        status: 'Détecté',
        desc: 'Toux persistante signalée.'
      }
    ];
  };

  const VariableLexicon = () => (
    <div className="mt-6 p-6 bg-indigo-50/50 border border-indigo-100 rounded-[24px] flex flex-wrap gap-8 justify-center shadow-inner">
      <div className="flex items-center gap-2">
        <span className="font-black text-indigo-600 text-[10px]">P(IC) :</span>
        <span className="text-[9px] font-bold text-slate-500 uppercase italic">Probabilité d'Infection</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-black text-indigo-600 text-[10px]">P(S|IC) :</span>
        <span className="text-[9px] font-bold text-slate-500 uppercase italic">Vraisemblance Symptôme</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-black text-indigo-600 text-[10px]">P(S) :</span>
        <span className="text-[9px] font-bold text-slate-500 uppercase italic">Preuve Globale</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-10">
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl"><Shield className="text-white" size={20} /></div>
          <span className="font-black text-lg tracking-tighter uppercase italic">RB-ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-bold text-[10px] text-slate-400 uppercase italic">Dr. {user?.username}</span>
          <button onClick={onLogout} className="text-slate-300 hover:text-red-500 transition-all"><LogOut size={20} /></button>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto p-6">
        <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit mb-8 border border-slate-200 shadow-sm">
          {['patients', 'demarche', 'modele'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              {tab === 'patients' ? 'Suivi Patients' : tab === 'demarche' ? 'Démarche de calcul' : 'Modèle Logique'}
            </button>
          ))}
        </div>

        {activeTab === 'demarche' && (
          <div className="grid grid-cols-4 gap-6 animate-in fade-in duration-500">
            <div className="col-span-1 bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm h-fit">
                <h3 className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-4 italic px-2">Patients suivis</h3>
                <div className="space-y-1">
                    {patients.map(p => (
                        <button key={p.id} onClick={() => setSelectedCalcPatient(p)} className={`w-full text-left px-4 py-3 rounded-xl font-black text-[10px] uppercase transition-all flex justify-between items-center ${selectedCalcPatient?.id === p.id ? 'bg-indigo-600 text-white shadow-md translate-x-1' : 'hover:bg-indigo-50 text-slate-500'}`}>
                            {p.name} <span className="opacity-50">→</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="col-span-3">
              {selectedCalcPatient ? (
                <div className="space-y-4">
                    <div className="bg-[#0F172A] rounded-[24px] px-8 py-4 text-white flex justify-between items-center shadow-lg border border-white/5">
                        <div className="flex items-center gap-6">
                            <span className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] border-r border-white/10 pr-6 italic">Théorème appliqué</span>
                            <h2 className="text-base font-black italic text-slate-100 tracking-tight">P(IC|S) = [ P(IC) × Π P(S|IC) ] / P(S)</h2>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => generatePDF(selectedCalcPatient)}
                                className="bg-white/10 hover:bg-white/20 text-indigo-300 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all border border-white/10"
                            >
                                <FileText size={14}/> Exporter PDF
                            </button>
                            <div className="text-right ml-2">
                                <span className="text-[11px] font-black italic text-indigo-400 mr-2">{selectedCalcPatient.name} :</span>
                                <span className="text-xl font-black italic">{selectedCalcPatient.last_result}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm">
                        <p className="text-slate-300 text-[9px] font-black uppercase tracking-widest mb-6 italic flex items-center gap-2">
                            <Info size={14} className="text-indigo-600"/> Inférence des paramètres cliniques
                        </p>
                        <div className="grid grid-cols-1 gap-4">
                            {getDynamicSymptoms().map((s, i) => (
                                <div key={i} className="p-5 rounded-[20px] bg-slate-50 border border-slate-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-black text-xs uppercase text-slate-700 italic">{s.label}</h4>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${s.status === 'Détecté' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{s.status}</span>
                                        </div>
                                        <p className="text-[9px] text-slate-400 font-bold italic">{s.desc}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-black uppercase text-indigo-500 italic"><span>P({s.label} | IC+)</span><span>{s.obs}</span></div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl font-black text-slate-800">{s.valI}</span>
                                                <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
                                                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${parseFloat(s.valI) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[8px] font-black uppercase text-emerald-500 italic"><span>P({s.label} | IC-)</span><span>SPF</span></div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl font-black text-slate-800">{s.valS}</span>
                                                <div className="flex-1 bg-slate-200 h-1 rounded-full overflow-hidden">
                                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${parseFloat(s.valS) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <VariableLexicon />
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-slate-100 text-center p-10">
                  <Calculator className="text-slate-100 mb-4" size={50}/>
                  <p className="text-slate-300 text-[10px] font-black uppercase tracking-widest italic">Sélectionnez un patient pour analyser le calcul</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'modele' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-[#0F172A] p-10 rounded-[32px] shadow-lg flex flex-col justify-center border border-white/5">
                    <h2 className="text-white text-xs font-black uppercase tracking-widest italic mb-6">Architecture Probabiliste</h2>
                    <div className="bg-white/5 border border-white/10 p-8 rounded-[24px] text-center backdrop-blur-md">
                        <code className="text-lg font-black text-indigo-400 italic">P(I|S) = [ P(S|I) * P(I) ] / P(S)</code>
                    </div>
                    <p className="text-slate-400 text-[10px] font-medium leading-relaxed mt-8 italic text-center">L'inférence met à jour la probabilité d'infection en fonction de la rareté des symptômes.</p>
                </div>
                <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black uppercase text-slate-300 tracking-widest mb-6 italic text-center">Matrice SPF 2021</p>
                    <table className="w-full text-left">
                        <thead>
                          <tr className="text-[8px] font-black text-slate-400 uppercase border-b border-slate-50">
                            <th className="py-3">Paramètre</th>
                            <th className="py-3 text-right">Infecté</th>
                            <th className="py-3 text-right">Sain</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 font-black italic">
                          {[{p:'Fièvre (Forte)', i:'0.85', s:'0.03'}, {p:'Anosmie', i:'0.65', s:'0.01'}, {p:'Toux (Sèche)', i:'0.70', s:'0.10'}].map((row, idx) => (
                            <tr key={idx}><td className="py-4 text-[10px] text-slate-600 uppercase">{row.p}</td><td className="py-4 text-right text-red-500 text-xs">{row.i}</td><td className="py-4 text-right text-emerald-500 text-xs">{row.s}</td></tr>
                          ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <VariableLexicon />
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-black italic uppercase text-slate-900 tracking-tighter text-lg text-indigo-600">Registre Patients</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Rechercher..." className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-[11px] font-bold outline-none focus:border-indigo-600 w-64" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black uppercase text-slate-300 border-b border-slate-50">
                  <th className="px-8 py-4">Nom Complet</th>
                  <th className="px-8 py-4">Probabilité</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-5 font-black text-slate-600 uppercase text-[11px] tracking-tighter italic">{p.name}</td>
                    <td className={`px-8 py-5 font-black text-sm ${p.last_result > 50 ? 'text-red-500' : 'text-emerald-500'}`}>{p.last_result}%</td>
                    <td className="px-8 py-5 text-right flex items-center justify-end gap-3">
                      <button 
                        onClick={() => generatePDF(p)} 
                        className="p-2 text-slate-300 hover:text-indigo-600 transition-all"
                        title="Télécharger le rapport"
                      >
                        <FileText size={18}/>
                      </button>
                      <button onClick={() => handleViewDetails(p)} className="bg-slate-100 text-slate-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2"><Eye size={12} /> Détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* MODAL HISTORIQUE */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white"><User size={20} /></div>
                <h2 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">{selectedPatient.name}</h2>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-300 hover:text-red-500"><X size={24} /></button>
            </div>
            <div className="p-8 overflow-y-auto flex-1">
              {loadingHistory ? ( <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600" size={30} /></div> ) : (
                <div className="space-y-3">
                  {patientHistory.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 p-6 rounded-[24px] flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-6">
                        <p className={`text-xl font-black italic ${item.probability > 50 ? 'text-red-500' : 'text-emerald-500'}`}>{item.probability}%</p>
                        <div className="h-6 w-[1px] bg-slate-200"></div>
                        <p className="text-[10px] font-black text-slate-600 uppercase italic">Le {new Date(item.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic ${item.probability > 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>{item.probability > 50 ? "Positif" : "Négatif"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;