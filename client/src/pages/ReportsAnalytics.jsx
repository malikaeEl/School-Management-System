import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ReportsAnalytics = () => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('performance');
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const generateReport = () => {
    const rows=[['Section','Valeur','Tendance'],['Taux de réussite','87%','+3%'],['Présence moyenne','94%','+1%'],['Revenus encaissés','1.2M MAD','+8%'],['Livres empruntés','320','+15%']];
    const csv = rows.map(r=>r.join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download='rapport_analytique_atlas.csv';a.click();
    URL.revokeObjectURL(url);
    showToast('Rapport généré et téléchargé ✓');
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black`}>{toast.msg}</div>}
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
            Rapports & Statistiques
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-black tracking-widest">
            Analyse complète des performances scolaires
          </p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={generateReport} className="bg-white text-slate-600 px-5 py-2.5 rounded-2xl text-[10px] font-black border border-slate-100 shadow-sm hover:shadow-md transition-all uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">file_download</span>
              Générer Rapport
            </button>
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 hover:opacity-90 shadow-xl shadow-black/20 transition-all uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">print</span>
              Imprimer
            </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-3xl w-fit border border-slate-200/50 backdrop-blur-sm">
        <button 
          onClick={() => setActiveTab('performance')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'performance' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Performance
        </button>
        <button 
          onClick={() => setActiveTab('attendance')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'attendance' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Présence
        </button>
        <button 
          onClick={() => setActiveTab('financial')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'financial' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Finance
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Inscriptions', value: '1,240', change: '+5%', icon: 'group', color: 'text-moroccan-green', bg: 'bg-moroccan-green/10' },
          { label: 'Taux de Réussite', value: '92.4%', change: '+1.2%', icon: 'school', color: 'text-moroccan-gold', bg: 'bg-moroccan-gold/10' },
          { label: 'Présence', value: '95.4%', change: '-0.5%', icon: 'how_to_reg', color: 'text-deep-emerald', bg: 'bg-deep-emerald/10' },
          { label: 'Util. Budget', value: '78%', change: 'Normal', icon: 'account_balance_wallet', color: 'text-slate-600', bg: 'bg-slate-100' }
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col h-full">
               <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-xl">{kpi.icon}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${kpi.change.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{kpi.change}</span>
               </div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
               <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value}</h3>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {activeTab === 'performance' && (
          <>
            {/* Academic Heatmap */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative">
               <div className="flex justify-between items-center mb-8 relative z-10">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
                    Performance Académique
                  </h3>
               </div>
               <div className="space-y-4">
                  {[
                    { subject: 'Français', scores: [85, 92, 78, 88, 95, 82, 90], color: 'bg-moroccan-green' },
                    { subject: 'Arabe', scores: [90, 85, 92, 80, 88, 94, 86], color: 'bg-moroccan-gold' },
                    { subject: 'Mathématiques', scores: [72, 80, 85, 75, 70, 82, 78], color: 'bg-moroccan-red' },
                    { subject: 'Sciences', scores: [88, 90, 85, 92, 84, 86, 90], color: 'bg-deep-emerald' },
                    { subject: 'Histoire-Géo', scores: [80, 82, 85, 88, 84, 80, 82], color: 'bg-slate-600' }
                  ].map((sub, i) => (
                    <div key={i} className="flex items-center gap-6">
                      <span className="w-32 text-[10px] font-black text-slate-400 uppercase truncate text-left">{sub.subject}</span>
                      <div className="flex-1 flex gap-2">
                        {sub.scores.map((score, idx) => (
                          <div key={idx} className="flex-1 h-12 rounded-xl relative group">
                             <div 
                               className={`absolute inset-0 rounded-xl transition-all duration-300 group-hover:scale-[1.05] ${sub.color}`} 
                               style={{ opacity: score / 100 }}
                             ></div>
                             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black text-white">{score}%</span>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
               <div className="flex justify-between mt-8 text-[9px] font-black text-slate-300 uppercase tracking-widest pl-32 ml-6">
                  {['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6ème', 'Collège'].map((lvl) => (
                    <span key={lvl} className="flex-1 text-center">{lvl}</span>
                  ))}
               </div>
            </div>

            {/* Department Performance */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h3 className="text-xl font-black uppercase tracking-tight mb-8">Scores Dépt.</h3>
                  <div className="space-y-8">
                     {[
                       { label: 'Académique', val: 94, color: 'bg-moroccan-green' },
                       { label: 'Administration', val: 82, color: 'bg-moroccan-gold' },
                       { label: 'Maintenance', val: 75, color: 'bg-moroccan-red' }
                     ].map((dept, i) => (
                        <div key={i}>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{dept.label}</span>
                              <span className="text-sm font-black">{dept.val}%</span>
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
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  <span className="w-2 h-6 bg-deep-emerald rounded-full"></span>
                  Tendances de Présence
                </h3>
             </div>
             <div className="h-[400px] relative">
                {/* Simulated Chart SVG */}
                <svg viewBox="0 0 1000 400" className="w-full h-full">
                   <defs>
                      <linearGradient id="attendGrad" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="0%" stopColor="#C5A059" stopOpacity="0.2" />
                         <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
                      </linearGradient>
                   </defs>
                   <path 
                     d="M0,350 Q100,280 200,320 T400,150 T600,200 T800,100 T1000,50 L1000,400 L0,400 Z" 
                     fill="url(#attendGrad)" 
                   />
                   <path 
                     d="M0,350 Q100,280 200,320 T400,150 T600,200 T800,100 T1000,50" 
                     fill="none" 
                     stroke="#C5A059" 
                     strokeWidth="4" 
                     strokeLinecap="round" 
                   />
                </svg>
                <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-8">
                   {['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                      <span key={m}>{m}</span>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="lg:col-span-3 animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8">
                   Prévisions Financières
                </h3>
                <div className="space-y-6">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:border-moroccan-green/30">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Q4 Target Completion</p>
                      <div className="flex items-end justify-between">
                         <p className="text-3xl font-black text-slate-900">85%</p>
                         <span className="text-green-500 font-black text-xs">↑ 4.2%</span>
                      </div>
                      <div className="h-1.5 w-full bg-white rounded-full mt-4 overflow-hidden border border-slate-100">
                         <div className="h-full bg-moroccan-green rounded-full" style={{ width: '85%' }}></div>
                      </div>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all hover:border-moroccan-gold/30">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Year-End Rev.</p>
                      <p className="text-3xl font-black text-slate-900">5.8M <span className="text-xs text-slate-400 font-bold">MAD</span></p>
                   </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-9xl text-slate-50 group-hover:rotate-12 transition-transform duration-700">insights</span>
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
