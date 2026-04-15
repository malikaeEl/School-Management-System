import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';
import { getSubjectBarStyle, getSubjectAccentStyle } from '../utils/subjectColors';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localProgress, setLocalProgress] = useState({});

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

  useEffect(() => {
    if (data?.subjects) {
      const initial = {};
      data.subjects.forEach(s => { initial[s._id] = s.progress || 0 });
      setLocalProgress(initial);
    }
  }, [data?.subjects]);

  const handleSliderChange = (subjectId, val) => {
    setLocalProgress(prev => ({ ...prev, [subjectId]: val }));
  };

  const handleProgressCommit = async (subjectId) => {
    const val = localProgress[subjectId];
    if (val === undefined) return;
    
    setData(prev => {
      if (!prev || !prev.subjects) return prev;
      const newSubjects = prev.subjects.map(s => 
        s._id === subjectId ? { ...s, progress: val } : s
      );
      return { ...prev, subjects: newSubjects };
    });
    
    try {
      await dashboardService.updateSubjectProgress(subjectId, val);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span>
      </div>
    );
  }

  const { profile, subjects, studentsCount, students, timetable, salaryTransactions, events } = data || {};
  const lastSalaryPayment = salaryTransactions?.[0]; // most recent, already sorted desc

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Welcome Section */}
      <div className="bg-linear-to-br from-slate-900 to-deep-emerald p-8 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-deep-emerald/20">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight uppercase">
            {t('welcome')}, Prof. {profile?.lastName}!
          </h1>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-lg leading-relaxed uppercase tracking-widest">
            {timetable?.length > 0 
              ? `${t('you_have')} ${timetable.length} ${t('sessions_scheduled')}` 
              : t('no_sessions')}
          </p>
          <div className="flex gap-4 mt-8">
            <button onClick={() => navigate('/attendance')} className="bg-moroccan-gold text-deep-emerald px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20">
              {t('call_roll')}
            </button>
            <button onClick={() => navigate('/exams')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              {t('enter_grades')}
            </button>
            <button onClick={() => navigate('/teacher/leaves')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              {t('request_leave')}
            </button>
            <button onClick={() => navigate('/messages')} className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">forum</span>
              {t('contact_admin')}
            </button>
          </div>
        </div>
        <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[240px] text-white/5 rotate-12 pointer-events-none">auto_stories</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-moroccan-green/10 text-moroccan-green flex items-center justify-center">
                   <span className="material-symbols-outlined">groups</span>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('students')}</p>
                   <h3 className="text-xl font-black text-slate-800">{studentsCount || 0}</h3>
                </div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-moroccan-gold/10 text-moroccan-gold flex items-center justify-center">
                   <span className="material-symbols-outlined">menu_book</span>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('subjects')}</p>
                   <h3 className="text-xl font-black text-slate-800">{subjects?.length || 0}</h3>
                </div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                   <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t('monthly_salary')}</p>
                   <h3 className="text-xl font-black text-slate-800">{profile?.salary?.toLocaleString() || 0} MAD</h3>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-moroccan-green rounded-full"></span>
              {t('management_actions')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/messages')} 
                className="flex items-center justify-between p-6 bg-white hover:bg-moroccan-gold hover:text-white rounded-4xl transition-all group/btn border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-moroccan-gold/10 rounded-2xl flex items-center justify-center text-moroccan-gold group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined">forum</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm uppercase tracking-tight">{t('messaging')}</p>
                    <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">{t('messaging_desc')}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all">chevron_right</span>
              </button>

              <button 
                onClick={() => navigate('/teacher/leaves')} 
                className="flex items-center justify-between p-6 bg-white hover:bg-moroccan-green hover:text-white rounded-4xl transition-all group/btn border border-slate-100 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-moroccan-green/10 rounded-2xl flex items-center justify-center text-moroccan-green group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-sm">
                    <span className="material-symbols-outlined">event_busy</span>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-sm uppercase tracking-tight">{t('my_leaves')}</p>
                    <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">{t('requests_status')}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Timetable Overview */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
              {t('timetable')}
            </h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {timetable?.length > 0 ? timetable.map((item, i) => {
                const subjectName = item.teacher?.subject || item.subject?.name || '';
                return (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-6">
                    <div className="w-1 h-12 rounded-full" style={getSubjectBarStyle(subjectName)}></div>
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
                        {{
                          'monday': t('monday'),
                          'tuesday': t('tuesday'),
                          'wednesday': t('wednesday'),
                          'thursday': t('thursday'),
                          'friday': t('friday'),
                          'saturday': t('saturday')
                        }[item.day?.toLowerCase()] || item.day} · {item.startTime} - {item.endTime}
                      </p>
                      <h3 className="text-lg font-black uppercase tracking-tight" style={getSubjectAccentStyle(subjectName)}>{subjectName}</h3>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    {item.grade && (
                      <p className="text-[10px] font-black text-moroccan-green uppercase tracking-widest">
                        <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">school</span>
                        {item.grade}
                      </p>
                    )}
                    <p className="text-[10px] font-black text-slate-300 uppercase italic">
                      <span className="material-symbols-outlined text-[10px] align-middle mr-0.5">location_on</span>
                      {t('room')} {item.room}
                    </p>
                  </div>
                </div>
              );
              }) : (
                <div className="p-12 text-center">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">{t('no_sessions')}</p>
                </div>
              )}
            </div>
          </div>

          {/* New Sections: Leaves & Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Leaves Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  <span className="w-2 h-6 bg-moroccan-green rounded-full"></span>
                  {t('my_leaves')}
                </h2>
                <button onClick={() => navigate('/teacher/leaves')} className="text-[10px] font-black text-moroccan-green uppercase tracking-widest hover:underline">{t('view_all')}</button>
              </div>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                {data?.leaveRequests?.length > 0 ? data.leaveRequests.slice(0, 3).map((lv, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div>
                      <p className="text-[10px] font-black text-slate-800 uppercase leading-none mb-1">{lv.type}</p>
                      <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{new Date(lv.startDate).toLocaleDateString('fr-FR')} - {new Date(lv.endDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : lv.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                      {t(lv.status.toLowerCase())}
                    </span>
                  </div>
                )) : (
                  <div className="py-4 text-center">
                    <p className="text-[10px] text-slate-300 font-black uppercase italic">{t('no_requests')}</p>
                  </div>
                )}
                <button onClick={() => navigate('/teacher/leaves')} className="w-full py-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 hover:text-moroccan-green transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  {t('new_request')}
                </button>
              </div>
            </div>

            {/* Salary Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                {t('salary_details')}
              </h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="p-6 bg-linear-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 mb-4">
                   <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2">{t('base_salary')}</p>
                   <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-slate-800 tracking-tighter">{profile?.salary?.toLocaleString() || 0}</span>
                      <span className="text-xs font-black text-slate-400 capitalize">MAD / {t('month')}</span>
                   </div>
                </div>
                <div className="space-y-3">
                   <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('status')}</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{t('active')} ✓</span>
                   </div>
                   <div className="flex justify-between items-center px-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t('last_payment')}</span>
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                        {lastSalaryPayment
                          ? new Date(lastSalaryPayment.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                          : '—'}
                      </span>
                   </div>
                   {lastSalaryPayment && (
                     <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Dernier montant</span>
                        <span className="text-[10px] font-black text-moroccan-green uppercase tracking-widest">{lastSalaryPayment.amount?.toLocaleString()} MAD</span>
                     </div>
                   )}
                   {!lastSalaryPayment && (
                     <div className="px-2">
                        <p className="text-[9px] text-amber-400 font-bold uppercase italic">Aucun paiement enregistré</p>
                     </div>
                   )}
                   <div className="pt-2 border-t border-slate-50">
                      <p className="text-[9px] text-slate-300 font-bold uppercase italic leading-relaxed">{t('payroll_info')}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 px-2">
            <span className="w-1.5 h-6 bg-moroccan-green rounded-full"></span>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t('students')}</h2>
          </div>
          
          {/* Students list */}
          <div className="bg-white rounded-4xl border border-slate-100 shadow-sm p-8 relative overflow-hidden">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center justify-between">
              {t('my_students')}
              <span className="px-2 py-0.5 bg-moroccan-green/10 text-moroccan-green rounded text-[10px]">{students?.length || 0}</span>
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {students?.length > 0 ? students.slice(0, 10).map((s, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group" onClick={() => navigate(`/students/${s._id}`)}>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-moroccan-green group-hover:text-white transition-all overflow-hidden border border-slate-200">
                    {s.avatar ? <img src={`${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}${s.avatar}`} className="w-full h-full object-cover" /> : `${s.firstName?.[0]}${s.lastName?.[0]}`}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800 truncate leading-none mb-1">{s.firstName} {s.lastName}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{s.grade}</p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-sm opacity-0 group-hover:opacity-100">visibility</span>
                </div>
              )) : (
                <p className="text-center py-6 text-[10px] font-black text-slate-300 uppercase italic">{t('no_students_found')}</p>
              )}
              {students?.length > 10 && (
                <button onClick={() => navigate('/students')} className="w-full py-3 text-[10px] font-black text-moroccan-green uppercase tracking-widest hover:underline text-center">
                  {t('view_all_students')} ({students.length})
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6">{t('subjects_taught')}</h3>
              <div className="space-y-4">
               {subjects?.map((s, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-moroccan-green rounded-full"></div>
                      <span className="text-xs font-black text-slate-700 uppercase">{s.name}</span>
                    </div>
                    <span className="text-[10px] font-black px-3 py-1 bg-white border border-slate-100 text-moroccan-green rounded-lg shadow-sm">{s.grade}</span>
                 </div>
               ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-5 bg-moroccan-gold rounded-full"></span>
                {t('events') || 'Événements'}
              </h3>
              <button onClick={() => navigate('/events')} className="text-[9px] font-black text-moroccan-green uppercase tracking-widest hover:underline">{t('view_all')}</button>
            </div>
            <div className="space-y-3">
              {events?.length > 0 ? events.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-moroccan-gold/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-moroccan-gold/10 text-moroccan-gold flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm">event</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-slate-800 uppercase leading-tight truncate">{ev.title}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(ev.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} · {ev.time}
                    </p>
                    {ev.location && (
                      <p className="text-[9px] text-moroccan-green font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[9px]">location_on</span>
                        {ev.location}
                      </p>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-[10px] text-slate-300 font-black uppercase italic text-center py-4">Aucun événement à venir</p>
              )}
            </div>
            <button onClick={() => navigate('/events')} className="mt-4 block w-full py-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-moroccan-gold/5 hover:text-moroccan-gold hover:border-moroccan-gold/30 transition-all text-center">
              Voir le calendrier complet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
