import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const ParentDashboard = () => {
  const { lang, t } = useLanguage();
  const [activeStudent, setActiveStudent] = useState('sofia');

  const students = {
    sofia: { name: 'Sofia', level: '6ème', gender: 'f' },
    omar: { name: 'Omar', level: '2nde', gender: 'm' }
  };

  const payments = [
    { date: '12 Mars 2026', desc: 'Scolarité Mars', status: 'Payé', amount: '2,500 MAD', type: 'success' },
    { date: '05 Mars 2026', desc: 'Cantine Mars', status: 'Payé', amount: '600 MAD', type: 'success' },
    { date: '15 Fév 2026', desc: 'Scolarité Février', status: 'Payé', amount: '2,500 MAD', type: 'success' },
    { date: '01 Fév 2026', desc: 'Transport Février', status: 'Payé', amount: '450 MAD', type: 'success' },
  ];

  const timetables = {
    sofia: [
      { day: 'Lundi', sessions: ['08:30 - Mathématiques (S1)', '10:30 - Français (S4)', '14:30 - Sport (Gym)'] },
      { day: 'Mardi', sessions: ['09:00 - Histoire-Géo (S2)', '11:00 - Anglais (Labo)', '15:00 - Arts (S8)'] }
    ],
    omar: [
      { day: 'Lundi', sessions: ['09:00 - Physique (L1)', '11:00 - Philosophie (S6)', '15:00 - SVT (L2)'] },
      { day: 'Mercredi', sessions: ['08:30 - Allemand (S3)', '10:30 - Mathématiques (S1)', '14:00 - Informatique (Labo)'] }
    ]
  };

  const currentTimetable = timetables[activeStudent] || [];

  return (
    <div className="animate-in fade-in duration-500 w-full flex flex-col gap-8">
      {/* Overview Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Tableau de Bord Parent
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-black tracking-widest leading-loose">
            Bienvenue Mme. Dahbi, suivi de la progression de {students[activeStudent].name}.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
           <button 
             onClick={() => setActiveStudent('sofia')}
             className={`${activeStudent === 'sofia' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400'} px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
           >
             Sofia (6ème)
           </button>
           <button 
             onClick={() => setActiveStudent('omar')}
             className={`${activeStudent === 'omar' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400'} px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
           >
             Omar (2nde)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
           {/* Recent Grades */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                    <span className="w-2 h-6 bg-moroccan-green rounded-full"></span>
                    Notes Récentes
                 </h3>
                 <button className="text-moroccan-green text-[10px] font-black uppercase tracking-widest hover:underline transition-all">
                   Bulletin Complet
                 </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {[
                   { sub: 'Mathématiques', score: activeStudent === 'sofia' ? '18/20' : '14/20', date: 'Hier', color: 'text-green-600' },
                   { sub: 'Histoire-Géo', score: activeStudent === 'sofia' ? '15.5/20' : '16/20', date: 'Lundi', color: 'text-green-600' },
                   { sub: 'Français', score: activeStudent === 'sofia' ? '14/20' : '12.5/20', date: '12 Oct', color: activeStudent === 'sofia' ? 'text-blue-600' : 'text-slate-600' },
                   { sub: 'Anglais', score: activeStudent === 'sofia' ? '19/20' : '15/20', date: '08 Oct', color: 'text-green-600' }
                 ].map((grade, i) => (
                   <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all flex justify-between items-center group/card">
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{grade.sub}</p>
                         <p className="text-[10px] font-bold text-slate-300 uppercase italic">{grade.date}</p>
                      </div>
                      <span className={`text-lg font-black tracking-tight ${grade.color}`}>{grade.score}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Timetable Overview */}
           <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
              <div className="flex justify-between items-center mb-10 relative z-10">
                 <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                    <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
                    Emplois du temps
                 </h3>
                 <button className="text-moroccan-gold text-[10px] font-black uppercase tracking-widest hover:underline">Voir Tout</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 font-sans">
                 {currentTimetable.map((day, idx) => (
                    <div key={idx} className="space-y-3">
                       <p className="text-xs font-black text-moroccan-gold uppercase tracking-widest">{day.day}</p>
                       <div className="space-y-2">
                          {day.sessions.map((session, sIdx) => (
                             <div key={sIdx} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-medium text-white/80">
                                {session}
                             </div>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
              <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[180px] text-white/5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">calendar_month</span>
           </div>
        </div>

        {/* Sidebar Widgets (Finance) */}
        <div className="space-y-8">
           {/* Financial Summary */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Paiements</h3>
              <div className="p-6 bg-moroccan-gold/10 rounded-3xl mb-8 text-center border border-moroccan-gold/20">
                 <p className="text-[10px] font-black text-moroccan-gold uppercase tracking-widest mb-2">Total Dû</p>
                 <p className="text-3xl font-black text-deep-emerald tracking-tighter">1,200 <span className="text-xs">MAD</span></p>
              </div>
              
              <div className="space-y-4 mb-8">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Historique Récent</p>
                 {payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                       <div className="min-w-0">
                          <p className="text-[10px] font-black text-slate-800 truncate uppercase">{p.desc}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{p.date}</p>
                       </div>
                       <div className="text-right shrink-0">
                          <p className="text-[10px] font-black text-slate-800">{p.amount}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${p.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                       </div>
                    </div>
                 ))}
              </div>

              <button className="w-full py-4 bg-deep-emerald text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-xl shadow-deep-emerald/20 transition-all">Régler Par Carte</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
