import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';

const StudentDashboard = () => {
  const { lang, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error fetching student dashboard:', err);
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

  const { profile, subjects, exams, attendance, timetable } = data || {};

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Welcome Section */}
      <div className="bg-linear-to-br from-deep-emerald to-moroccan-green p-8 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-deep-emerald/20">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight uppercase">
            Bienvenue, {profile?.firstName}!
          </h1>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-lg leading-relaxed uppercase tracking-widest">
            {timetable?.length > 0 
              ? `Vous avez ${timetable.length} séances cette semaine pour votre niveau (${profile?.grade}).` 
              : `Bienvenue dans votre espace étudiant (${profile?.grade}).`}
          </p>
          <div className="flex gap-4 mt-8">
            <button className="bg-moroccan-gold text-deep-emerald px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20">
              Mon Emploi du temps
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              Mes Notes
            </button>
          </div>
        </div>
        <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[240px] text-white/5 rotate-12 pointer-events-none">school</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
              Emploi du temps
            </h2>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            {timetable?.length > 0 ? timetable.map((lesson, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-1 h-12 rounded-full bg-moroccan-green"></div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{lesson.day} · {lesson.startTime} - {lesson.endTime}</p>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-moroccan-green transition-colors">{lesson.subject?.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-300 mt-1 uppercase">Salle {lesson.room}</p>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-slate-400 font-bold uppercase text-xs tracking-widest">
                Aucun cours programmé
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Upcoming Exams */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-black/20">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-moroccan-gold text-2xl">event_upcoming</span>
                  <h3 className="text-lg font-black uppercase tracking-tight">Examens à venir</h3>
                </div>
                <div className="space-y-4">
                  {exams?.length > 0 ? exams.slice(0, 2).map((exam, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{exam.subject?.name}</p>
                      <h4 className="text-sm font-black uppercase tracking-tight">{exam.title}</h4>
                      <p className="text-[10px] font-bold text-moroccan-gold mt-2 uppercase">{new Date(exam.date).toLocaleDateString()}</p>
                    </div>
                  )) : (
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pas d'examens programmés</p>
                  )}
                </div>
             </div>
          </div>

          {/* Attendance Stats */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Dernières Présences</h3>
             <div className="space-y-4">
                {attendance?.length > 0 ? attendance.map((record, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{record.subject?.name}</p>
                      <p className="text-[8px] font-bold text-slate-300 uppercase">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    {record.students.find(s => s.student === profile._id)?.status === 'Present' ? (
                      <span className="material-symbols-outlined text-green-500">check_circle</span>
                    ) : (
                      <span className="material-symbols-outlined text-red-500">cancel</span>
                    )}
                  </div>
                )) : (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-4">Pas encore de relevés</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
