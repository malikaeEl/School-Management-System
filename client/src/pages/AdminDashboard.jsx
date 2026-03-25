import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={`animate-in fade-in duration-500 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <h1 className="text-3xl font-black text-deep-emerald dark:text-moroccan-gold mb-8 flex items-center gap-3">
        <span className="w-1.5 h-8 bg-moroccan-gold rounded-full"></span>
        {t('dashboard')}
      </h1>
      
      {/* BEGIN: Analytics Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-purpose="stats-grid">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24 text-moroccan-green" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t('students')}</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">1,248</h3>
            </div>
            <div className="p-3 bg-moroccan-green/10 rounded-xl text-moroccan-green">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              +12%
            </span>
            <span className="text-[10px] text-slate-400 font-medium">vs {lang === 'ar' ? 'الشهر الماضي' : 'mois dernier'}</span>
          </div>
        </div>
        
        {/* Staff Count */}
        <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24 text-moroccan-red" fill="currentColor" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t('teachers')}</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">86</h3>
            </div>
            <div className="p-3 bg-moroccan-red/10 rounded-xl text-moroccan-red">
              <span className="material-symbols-outlined">work</span>
            </div>
          </div>
          <div className="mt-4">
             <span className="text-[10px] text-slate-400 font-medium">2 nouveaux cette semaine</span>
          </div>
        </div>
        
        {/* Revenue */}
        <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24 text-moroccan-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t('revenue')}</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">450.2k <span className="text-xs font-medium text-slate-400">MAD</span></h3>
            </div>
            <div className="p-3 bg-moroccan-gold/10 rounded-xl text-moroccan-gold">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 mt-4 rounded-full overflow-hidden">
            <div className="bg-moroccan-gold h-full w-[75%] rounded-full"></div>
          </div>
        </div>
        
        {/* Attendance Rate */}
        <div className="bg-white dark:bg-slate-900 dark:border-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24 text-deep-emerald" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{t('attendance')}</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">94.8%</h3>
            </div>
            <div className="p-3 bg-deep-emerald/10 rounded-xl text-deep-emerald">
              <span className="material-symbols-outlined">edit_calendar</span>
            </div>
          </div>
          <div className="mt-4">
             <span className="text-[10px] text-slate-400 font-medium">Taux journalier actuel</span>
          </div>
        </div>
      </section>
      {/* END: Analytics Overview */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* BEGIN: Activity Graph (Simulated) */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
            <h2 className="font-black text-deep-emerald dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-moroccan-green">insights</span>
              Aperçu des revenus
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-[10px] font-bold bg-slate-100 rounded-lg text-slate-600">Daily</button>
              <button className="px-3 py-1 text-[10px] font-bold bg-moroccan-green text-white rounded-lg">Monthly</button>
            </div>
          </div>
          <div className="p-8 h-64 flex items-end justify-between gap-2">
            {[40, 65, 30, 85, 45, 70, 90, 55, 60, 75, 50, 80].map((height, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  className="w-full bg-slate-100 rounded-t-lg group-hover:bg-moroccan-green transition-all duration-500 relative cursor-pointer" 
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-deep-emerald text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {height}k
                  </div>
                </div>
                <div className="mt-2 text-[9px] text-slate-400 text-center font-bold">M{i+1}</div>
              </div>
            ))}
          </div>
        </section>

        {/* BEGIN: Quick Actions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-black text-deep-emerald dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-moroccan-gold">bolt</span>
            {t('quick_actions')}
          </h2>
          <div className="space-y-4">
            <button onClick={() => navigate('/admission')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-moroccan-green hover:text-white rounded-xl transition-all group border border-transparent hover:shadow-lg hover:shadow-moroccan-green/20">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white dark:bg-slate-700 rounded-lg text-moroccan-green group-hover:bg-white/20 group-hover:text-white shadow-sm transition-colors">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <span className="font-bold text-sm dark:text-slate-200 group-hover:text-white">{t('add_student')}</span>
              </div>
              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-sm">arrow_forward</span>
            </button>
            <button onClick={() => navigate('/attendance')} className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-moroccan-red hover:text-white rounded-xl transition-all group border border-transparent hover:shadow-lg hover:shadow-moroccan-red/20">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-lg text-moroccan-red group-hover:bg-white/20 group-hover:text-white shadow-sm transition-colors">
                  <span className="material-symbols-outlined">how_to_reg</span>
                </div>
                <span className="font-bold text-sm">{t('mark_attendance')}</span>
              </div>
              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-sm">arrow_forward</span>
            </button>
            <button onClick={() => navigate('/reports')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-deep-emerald hover:text-white rounded-xl transition-all group border border-transparent hover:shadow-lg hover:shadow-deep-emerald/20">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white dark:bg-slate-700 rounded-lg text-deep-emerald group-hover:bg-white/20 group-hover:text-white shadow-sm transition-colors">
                  <span className="material-symbols-outlined">summarize</span>
                </div>
                <span className="font-bold text-sm dark:text-slate-200 group-hover:text-white">{t('generate_report')}</span>
              </div>
              <span className="material-symbols-outlined opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-sm">arrow_forward</span>
            </button>
          </div>
          
          <div className="mt-8 p-6 bg-moroccan-gold/3 border border-moroccan-gold/10 rounded-2xl text-center relative overflow-hidden">
            <p className="text-sm text-deep-emerald/80 italic mb-3 font-medium leading-relaxed">
              "L'éducation est l'arme la plus puissante que vous pouvez utiliser pour changer le monde."
            </p>
            <span className="text-[10px] text-moroccan-gold uppercase tracking-[0.2em] font-black">— Nelson Mandela</span>
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BEGIN: Recent Activity */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
             <h2 className="font-black text-deep-emerald dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-moroccan-red">history</span>
              {t('recent_activity')}
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {[
              { user: 'Ahmed Alami', doc: 'Inscription Nouveau Étudiant', time: '2 mins ago', type: 'add' },
              { user: 'Fatima Zohra', doc: 'Paiement Frais Scolaires', time: '15 mins ago', type: 'payment' },
              { user: 'Mustapha Ben', doc: 'Mise à jour Emploi du temps', time: '1 hour ago', type: 'edit' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                <div className={`w-2 h-10 rounded-full ${i === 0 ? 'bg-moroccan-green' : i === 1 ? 'bg-moroccan-gold' : 'bg-moroccan-red'} opacity-50`}></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{activity.user}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{activity.doc}</p>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{activity.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BEGIN: Upcoming Events */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
             <h2 className="font-black text-deep-emerald dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-moroccan-gold">event</span>
              Événements à venir
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {[
               { title: 'Réunion Parents-Professeurs', date: '24 Oct', place: 'Auditorium' },
               { title: 'Marche Verte (Férié)', date: '06 Nov', place: 'Établissement' },
            ].map((event, i) => (
              <div key={i} className="flex items-center gap-5 group cursor-pointer">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-deep-emerald dark:text-moroccan-gold group-hover:bg-deep-emerald group-hover:text-white transition-colors duration-300">
                  <span className="text-[10px] font-black uppercase tracking-tighter">{event.date.split(' ')[1]}</span>
                  <span className="text-xl font-black leading-none">{event.date.split(' ')[0]}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-moroccan-green transition-colors">{event.title}</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">location_on</span>
                    {event.place}
                  </p>
                </div>
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 group-hover:text-moroccan-green transition-transform group-hover:translate-x-1">chevron_right</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
