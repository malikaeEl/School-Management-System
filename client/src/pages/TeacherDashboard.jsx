import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span>
      </div>
    );
  }

  const { profile, subjects, studentsCount, timetable } = data || {};

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Welcome Section */}
      <div className="bg-linear-to-br from-slate-900 to-deep-emerald p-8 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-deep-emerald/20">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight uppercase">
            Bonjour, Prof. {profile?.lastName}!
          </h1>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-lg leading-relaxed uppercase tracking-widest">
            {timetable?.length > 0 
              ? `Vous avez ${timetable.length} séances programmées cette semaine.` 
              : "Aucune séance programmée pour le moment."}
          </p>
          <div className="flex gap-4 mt-8">
            <button onClick={() => navigate('/attendance')} className="bg-moroccan-gold text-deep-emerald px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20">
              Faire l'appel
            </button>
            <button onClick={() => navigate('/exams')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              Saisir les Notes
            </button>
          </div>
        </div>
        <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[240px] text-white/5 rotate-12 pointer-events-none">auto_stories</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-moroccan-green/10 text-moroccan-green flex items-center justify-center">
                   <span className="material-symbols-outlined">groups</span>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Étudiants Totaux</p>
                   <h3 className="text-xl font-black text-slate-800">{studentsCount || 0}</h3>
                </div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-moroccan-gold/10 text-moroccan-gold flex items-center justify-center">
                   <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Matières</p>
                   <h3 className="text-xl font-black text-slate-800">{subjects?.length || 0}</h3>
                </div>
             </div>
          </div>

          {/* Timetable Overview */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
              Emploi du temps
            </h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {timetable?.length > 0 ? timetable.map((item, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-1 h-12 rounded-full bg-moroccan-green"></div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.day} · {item.startTime} - {item.endTime}</p>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-moroccan-green transition-colors uppercase tracking-tight">{item.subject?.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase italic">Salle {item.room}</p>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucun cours trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">Matières Enseignées</h3>
              <div className="space-y-4">
                {subjects?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <span className="text-xs font-black text-slate-700 uppercase">{s.name}</span>
                    <span className="text-[10px] font-black px-2 py-1 bg-moroccan-green/10 text-moroccan-green rounded-lg">{s.grade}</span>
                  </div>
                ))}
              </div>
           </div>

           <div className="bg-moroccan-gold/5 p-8 rounded-[2.5rem] border border-moroccan-gold/20 relative overflow-hidden">
              <h3 className="text-lg font-black text-deep-emerald uppercase tracking-tight mb-2">Conseil du Jour</h3>
              <p className="text-xs text-deep-emerald/70 leading-relaxed font-bold italic">
                "Favoriser l'esprit critique permet aux élèves de mieux appréhender les défis de demain."
              </p>
              <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-moroccan-gold/10">lightbulb</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
