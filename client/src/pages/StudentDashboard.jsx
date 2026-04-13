import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
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

  const { profile, subjects, exams, attendance, timetable, library } = data || {};

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      
      {/* Library Alert Notification */}
      {library?.overdueBorrows > 0 && (
        <div className="bg-moroccan-red/10 border border-moroccan-red/20 p-6 rounded-[2rem] flex items-center justify-between gap-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-moroccan-red text-white rounded-2xl flex items-center justify-center shadow-lg shadow-moroccan-red/20">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div>
              <h3 className="text-moroccan-red font-black uppercase tracking-tight">{t('library_alert')}</h3>
              <p className="text-moroccan-red/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {t('overdue_notice_1')} {library.overdueBorrows} {t('overdue_notice_2')}
              </p>
            </div>
          </div>
          <a href="/library" className="px-6 py-2 bg-moroccan-red text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-moroccan-red/20 hover:brightness-110 transition-all">{t('view_borrows')}</a>
        </div>
      )}

      {/* Student Profile Overview Card */}
      <div className="bg-linear-to-br from-deep-emerald to-moroccan-green p-8 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-deep-emerald/20 flex flex-col md:flex-row items-center gap-8 group">
        <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-xl">
          <span className="material-symbols-outlined text-4xl text-white">face</span>
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <p className="text-moroccan-gold text-[10px] font-black uppercase tracking-[0.3em] mb-2">{t('student_space')}</p>
          <h1 className="text-3xl font-black uppercase tracking-tight">{t('welcome')}, {profile?.firstName}!</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">{profile?.grade}</span>
            <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">ID: {profile?._id?.substring(profile._id.length - 6).toUpperCase()}</span>
            <span className="px-4 py-1.5 bg-moroccan-gold text-deep-emerald rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20">{t('academic_year')} 2025-26</span>
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-2 gap-8 border-l border-white/10 pl-8 relative z-10">
           <div className="text-center">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('subjects')}</p>
              <p className="text-2xl font-black text-white">{subjects?.length || 0}</p>
           </div>
           <div className="text-center px-8 border-l border-white/10">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t('status')}</p>
              <p className="text-2xl font-black text-moroccan-gold">{t('active')}</p>
           </div>
        </div>
        <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[240px] text-white/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">school</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Exams - Moved to main area */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-black/20 min-h-[300px] flex flex-col justify-center">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-moroccan-gold text-2xl">event_upcoming</span>
                    <h3 className="text-xl font-black uppercase tracking-tight">{t('upcoming_exams')}</h3>
                  </div>
                  <a href="/exams" className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-moroccan-gold transition-colors">{t('view_all')}</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {exams?.length > 0 ? exams.slice(0, 4).map((exam, i) => (
                    <div key={i} className="p-5 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group/card">
                      <div className="flex justify-between items-start mb-3">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{exam.subject?.name}</p>
                        <span className="text-[10px] font-bold text-moroccan-gold uppercase">{new Date(exam.date).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-sm font-black uppercase tracking-tight group-hover/card:text-moroccan-gold transition-colors">{exam.title}</h4>
                    </div>
                  )) : (
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest py-8 text-center col-span-2">{t('no_scheduled_exams')}</p>
                  )}
                </div>
             </div>
             <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-white/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-1000">assignment</span>
          </div>

          {/* Attendance Stats - Moved to main area */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                  <span className="w-2 h-6 bg-moroccan-green rounded-full"></span>
                  {t('attendance_tracking')}
                </h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {attendance?.length > 0 ? attendance.map((record, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{record.subject?.name}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    {record.students.find(s => s.student === profile._id)?.status === 'Present' ? (
                      <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <span className="material-symbols-outlined text-sm">cancel</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center py-8 col-span-3">{t('no_records_yet')}</p>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Quick Links / Status */}
          <div className="bg-linear-to-br from-moroccan-gold to-[#c29d6d] p-8 rounded-[2.5rem] text-white shadow-xl shadow-moroccan-gold/20 relative overflow-hidden group hover:shadow-2xl transition-all">
             <h3 className="text-lg font-black uppercase tracking-tight mb-6">{t('my_school')}</h3>
             <div className="space-y-4 relative z-10">
                <a href="/timetable" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/20 transition-all">
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-white">calendar_today</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">{t('timetable')}</span>
                   </div>
                   <span className="material-symbols-outlined text-sm">chevron_right</span>
                </a>
                <a href="/library" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/5 hover:bg-white/20 transition-all">
                   <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-white">menu_book</span>
                     <span className="text-[10px] font-black uppercase tracking-widest">{t('my_library')}</span>
                   </div>
                   <span className="material-symbols-outlined text-sm">chevron_right</span>
                </a>
             </div>
          </div>

          {/* Quick Support */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">{t('contact_admin')}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed mb-6">{t('account_issue')}</p>
              <button 
                onClick={() => navigate('/messages')}
                className="w-full py-4 bg-moroccan-gold text-deep-emerald rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border-none shadow-lg shadow-moroccan-gold/20 hover:scale-105 transition-all"
              >
                {t('send_message')}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
