import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import analyticsService from '../services/analyticsService';

const ReportsAnalytics = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('performance');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getAnalytics();
      setAnalyticsData(data);
      setEditForm(JSON.parse(JSON.stringify(data))); // deep copy
    } catch (err) {
      showToast('Erreur chargement des données', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleSave = async () => {
    try {
      const updatedData = await analyticsService.updateAnalytics(editForm);
      setAnalyticsData(updatedData);
      setEditForm(JSON.parse(JSON.stringify(updatedData)));
      setIsEditing(false);
      showToast('Données analytiques mises à jour ✓');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur de sauvegarde', 'bg-moroccan-red');
    }
  };

  const cancelEdit = () => {
    setEditForm(JSON.parse(JSON.stringify(analyticsData)));
    setIsEditing(false);
  };

  const generateReport = () => {
    if (!analyticsData) return;
    const rows = [
      ['Section', 'Valeur', 'Tendance'],
      ['Inscriptions', analyticsData.kpis.enrollments.value, analyticsData.kpis.enrollments.change],
      ['Taux de réussite', analyticsData.kpis.successRate.value, analyticsData.kpis.successRate.change],
      ['Présence moyenne', analyticsData.kpis.attendance.value, analyticsData.kpis.attendance.change]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'rapport_analytique_atlas.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Rapport généré et téléchargé ✓');
  };

  // Helper for deep nesting updates in editForm
  const handleEditNested = (path, value) => {
    const keys = path.split('.');
    setEditForm(prev => {
      const newForm = { ...prev };
      let current = newForm;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newForm;
    });
  };

  if (loading) {
    return <div className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span></div>;
  }

  if (!analyticsData) {
    return <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest">Aucune donnée trouvée</div>;
  }

  const currentData = isEditing ? editForm : analyticsData;

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black uppercase tracking-widest`}>{toast.msg}</div>}
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
            <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
            Rapports & Statistiques
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-relaxed">
            Analyse complète des performances scolaires
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {isAdmin && (
              <>
                {isEditing ? (
                  <>
                    <button onClick={cancelEdit} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white px-5 py-2.5 rounded-2xl text-[10px] font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest">
                      Annuler
                    </button>
                    <button onClick={handleSave} className="bg-deep-emerald text-white px-6 py-2.5 rounded-2xl text-[10px] font-black shadow-xl shadow-deep-emerald/20 hover:brightness-110 transition-all uppercase tracking-widest flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">save</span> Sauvegarder
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="bg-moroccan-gold text-white px-5 py-2.5 rounded-2xl text-[10px] font-black shadow-lg shadow-moroccan-gold/20 hover:brightness-110 transition-all uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">edit</span> Modifier les données
                  </button>
                )}
              </>
            )}
            <button onClick={generateReport} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-2xl text-[10px] font-black shadow-sm transition-all uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">file_download</span> Exporter
            </button>
            <button onClick={() => window.print()} className="bg-slate-900 dark:bg-slate-800 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-xl shadow-black/20 transition-all uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">print</span> Imprimer
            </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-3xl w-fit border border-slate-200 dark:border-slate-700">
        <button onClick={() => setActiveTab('performance')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-white dark:bg-slate-900 text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>Performance</button>
        <button onClick={() => setActiveTab('attendance')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'attendance' ? 'bg-white dark:bg-slate-900 text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>Présence</button>
        <button onClick={() => setActiveTab('financial')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'financial' ? 'bg-white dark:bg-slate-900 text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>Finance</button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { key: 'enrollments', label: 'Inscriptions', icon: 'group', color: 'text-moroccan-green', bg: 'bg-moroccan-green/10' },
          { key: 'successRate', label: 'Taux de Réussite', icon: 'school', color: 'text-moroccan-gold', bg: 'bg-moroccan-gold/10' },
          { key: 'attendance', label: 'Présence', icon: 'how_to_reg', color: 'text-deep-emerald', bg: 'bg-deep-emerald/10' },
          { key: 'budget', label: 'Util. Budget', icon: 'account_balance_wallet', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-xl">{kpi.icon}</span>
                  </div>
                  {isEditing ? (
                     <input 
                        type="text" 
                        value={currentData.kpis[kpi.key].change} 
                        onChange={(e) => handleEditNested(`kpis.${kpi.key}.change`, e.target.value)}
                        className="w-16 bg-slate-50 border border-slate-200 rounded text-[10px] px-1 font-black text-center text-slate-900"
                      />
                  ) : (
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${currentData.kpis[kpi.key].change.startsWith('+') || currentData.kpis[kpi.key].change === 'Normal' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {currentData.kpis[kpi.key].change}
                    </span>
                  )}
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
               {isEditing ? (
                 <input 
                   type="text" 
                   value={currentData.kpis[kpi.key].value} 
                   onChange={(e) => handleEditNested(`kpis.${kpi.key}.value`, e.target.value)}
                   className="text-2xl font-black bg-slate-50 border border-slate-200 rounded px-2 w-full mt-1 text-slate-900"
                 />
               ) : (
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{currentData.kpis[kpi.key].value}</h3>
               )}
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full inset-0 m-auto mt-20 ml-32 opacity-20 transform scale-[5] group-hover:scale-[6] transition-transform duration-700 pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {activeTab === 'performance' && (
          <>
            {/* Academic Heatmap */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
               <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
                    Performance Académique
                  </h3>
               </div>
               <div className="space-y-4">
                  {currentData.academicStats.map((sub, i) => (
                    <div key={i} className="flex items-center gap-6">
                      <span className="w-32 text-[10px] font-black text-slate-400 uppercase truncate text-left">{sub.subject}</span>
                      <div className="flex-1 flex gap-2">
                        {sub.scores.map((score, idx) => (
                          <div key={idx} className="flex-1 h-12 rounded-xl relative group flex items-center justify-center border border-transparent">
                             {!isEditing && (
                               <>
                                 <div className={`absolute inset-0 rounded-xl transition-all duration-300 group-hover:scale-[1.05] ${sub.color}`} style={{ opacity: score / 100 }}></div>
                                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] font-black text-white">{score}%</span>
                                 </div>
                               </>
                             )}
                             {isEditing && (
                                <input 
                                  type="number" 
                                  max="100" min="0"
                                  value={score} 
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(100, Number(e.target.value)));
                                    const arr = [...editForm.academicStats];
                                    arr[i].scores[idx] = val;
                                    setEditForm({...editForm, academicStats: arr});
                                  }}
                                  className="w-full h-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-center text-[10px] font-black text-slate-900 dark:text-white z-10"
                                />
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-8 text-[9px] font-black text-slate-300 uppercase tracking-widest pl-32 ml-6">
                  {['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', 'Collège'].map((lvl) => <span key={lvl} className="flex-1 text-center">{lvl}</span>)}
               </div>
            </div>

            {/* Department Performance */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8">Scores Dépt.</h3>
                  <div className="space-y-8">
                     {currentData.departmentStats.map((dept, i) => (
                        <div key={i}>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{dept.label}</span>
                              {isEditing ? (
                                <input 
                                  type="number" 
                                  max="100" min="0"
                                  value={dept.val} 
                                  onChange={(e) => {
                                     const val = Math.max(0, Math.min(100, Number(e.target.value)));
                                     const arr = [...editForm.departmentStats];
                                     arr[i].val = val;
                                     setEditForm({...editForm, departmentStats: arr});
                                  }}
                                  className="w-16 bg-white/10 border-b border-white/20 text-center text-sm font-black text-white outline-none"
                                />
                              ) : (
                                <span className="text-sm font-black">{dept.val}%</span>
                              )}
                           </div>
                           <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                              <div className={`${dept.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${dept.val}%` }}></div>
                           </div>
                        </div>
                     ))}
                  </div>
                  <button className="w-full mt-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                    Détails des Scores
                  </button>
               </div>
               <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[180px] text-white/5 group-hover:rotate-12 transition-transform duration-700">stars</span>
            </div>
          </>
        )}

        {activeTab === 'attendance' && (
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                  <span className="w-2 h-6 bg-deep-emerald rounded-full"></span>
                  Tendances de Présence
                </h3>
             </div>
             
             {isEditing && (
               <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                 {currentData.attendanceTrends.months.map((m, i) => (
                   <div key={i} className="flex flex-col gap-1 w-16">
                     <span className="text-[9px] font-black uppercase text-slate-400 text-center">{m}</span>
                     <input 
                       type="text" 
                       value={currentData.attendanceTrends.dataPoints[i]} 
                       onChange={(e) => {
                          const arr = [...editForm.attendanceTrends.dataPoints];
                          arr[i] = e.target.value;
                          handleEditNested('attendanceTrends.dataPoints', arr);
                       }}
                       className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] p-1 text-center font-black"
                     />
                   </div>
                 ))}
               </div>
             )}

             <div className="h-[400px] relative">
                {/* Dynamically drawing path from data points */}
                <svg viewBox="0 0 1000 400" className="w-full h-full">
                   <defs>
                      <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#C5A059" stopOpacity="0.2" />
                         <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                      </linearGradient>
                   </defs>
                   {(() => {
                     // Very simple SVG path builder from generic points
                     const points = currentData.attendanceTrends.dataPoints.map(Number);
                     const max = Math.max(...points, 1);
                     const wStep = 1000 / (points.length - 1 || 1);
                     
                     // Build curve
                     let dBase = '';
                     points.forEach((p, i) => {
                       const x = i * wStep;
                       // Convert point relative to 400 height (reverse Y because SVG Y is down)
                       const y = 400 - ((p / max) * 350 + 20); // Add 20 padding
                       
                       if (i === 0) dBase += `M${x},${y} `;
                       else {
                         // Simple lines for visualization, or curve if preferred
                         dBase += `L${x},${y} `;
                       }
                     });
                     
                     const dFilled = `${dBase} L1000,400 L0,400 Z`;
                     
                     return (
                       <>
                         <path d={dFilled} fill="url(#attendGrad)" />
                         <path d={dBase} fill="none" stroke="#C5A059" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                         
                         {points.map((p, i) => (
                           <circle 
                             key={i} 
                             cx={i * wStep} 
                             cy={400 - ((p / max) * 350 + 20)} 
                             r="8" 
                             fill="#0f172a" 
                             stroke="#C5A059" 
                             strokeWidth="3" 
                           />
                         ))}
                       </>
                     );
                   })()}
                </svg>
                <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-8">
                   {currentData.attendanceTrends.months.map((m) => <span key={m}>{m}</span>)}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">
                   Prévisions Financières
                </h3>
                <div className="space-y-6 relative z-10">
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:border-moroccan-green/30">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Q4 Target Completion</p>
                      <div className="flex items-end justify-between">
                         {isEditing ? (
                           <input type="text" value={currentData.financeStats.q4Target.value} onChange={(e) => handleEditNested('financeStats.q4Target.value', e.target.value)} className="text-3xl font-black bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 w-24 rounded outline-none px-2 text-slate-900 dark:text-white" />
                         ) : (
                           <p className="text-3xl font-black text-slate-900 dark:text-white">{currentData.financeStats.q4Target.value}%</p>
                         )}
                         {isEditing ? (
                           <input type="text" value={currentData.financeStats.q4Target.change} onChange={(e) => handleEditNested('financeStats.q4Target.change', e.target.value)} className="text-xs font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-20 rounded outline-none p-1 text-green-500" />
                         ) : (
                           <span className="text-green-500 font-black text-xs">{currentData.financeStats.q4Target.change}</span>
                         )}
                      </div>
                      {!isEditing && (
                        <div className="h-1.5 w-full bg-white dark:bg-slate-700 rounded-full mt-4 overflow-hidden border border-slate-100 dark:border-slate-600">
                          <div className="h-full bg-moroccan-green rounded-full" style={{ width: `${currentData.financeStats.q4Target.value}%` }}></div>
                        </div>
                      )}
                   </div>
                   <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 transition-all hover:border-moroccan-gold/30">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Year-End Rev.</p>
                      {isEditing ? (
                        <input type="text" value={currentData.financeStats.yearEndRev.value} onChange={(e) => handleEditNested('financeStats.yearEndRev.value', e.target.value)} className="text-3xl font-black bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded outline-none px-2 text-slate-900 dark:text-white" />
                      ) : (
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{currentData.financeStats.yearEndRev.value} <span className="text-xs text-slate-400 font-bold">MAD</span></p>
                      )}
                   </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-9xl text-slate-50 dark:text-slate-800/20 group-hover:rotate-12 transition-transform duration-700">insights</span>
             </div>

             <div className="bg-slate-900 p-8 rounded-[2.5rem] flex flex-col justify-center relative overflow-hidden group">
                <div className="relative z-10">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Calculer ROI</h3>
                   <p className="text-sm text-white/50 font-medium mb-8 max-w-[280px]">Simulez l'impact financier des nouveaux investissements sur le budget scolaire.</p>
                   <button className="bg-moroccan-gold text-deep-emerald px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-black/20">
                     Démarrer Simulation
                   </button>
                </div>
                <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-white/5 group-hover:rotate-12 transition-transform duration-700">calculate</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
