import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const StudentDashboard = () => {
  const { lang, t } = useLanguage();

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Welcome Section */}
      <div className="bg-linear-to-br from-deep-emerald to-moroccan-green p-8 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-deep-emerald/20">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black mb-4 tracking-tight uppercase">
            Bienvenue, Sofia!
          </h1>
          <p className="text-white/60 text-sm md:text-base font-medium max-w-lg leading-relaxed uppercase tracking-widest">
            Vous avez 3 cours aujourd'hui et un examen de mathématiques à venir.
          </p>
          <div className="flex gap-4 mt-8">
            <button className="bg-moroccan-gold text-deep-emerald px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-black/20">
              Emploi du temps
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              Portail d'Apprentissage
            </button>
          </div>
        </div>
        {/* Decorative elements */}
        <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[240px] text-white/5 rotate-12 pointer-events-none">school</span>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
              Emploi du temps du Lundi
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">Oct 16, 2023</span>
          </div>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            {[
              { time: '08:30 - 10:00', subject: 'Mathématiques', teacher: 'Prof. Alami', room: 'S104', color: 'bg-moroccan-green' },
              { time: '10:15 - 11:45', subject: 'Français', teacher: 'Prof. Bakari', room: 'Lab 02', color: 'bg-moroccan-gold' },
              { time: '14:00 - 15:30', subject: 'Physique-Chimie', teacher: 'Prof. Tazi', room: 'S201', color: 'bg-deep-emerald' },
            ].map((lesson, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className={`w-1 h-12 rounded-full ${lesson.color}`}></div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{lesson.time}</p>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-moroccan-green transition-colors">{lesson.subject}</h3>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lesson.teacher}</p>
                   <p className="text-[10px] font-black text-slate-300 mt-1 uppercase">{lesson.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          {/* Upcoming Exam */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-black/20">
             <div className="relative z-10 text-center">
                <span className="material-symbols-outlined text-moroccan-gold text-4xl mb-4">event_upcoming</span>
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Prochain Examen</p>
                <h3 className="text-xl font-black uppercase tracking-tight mb-1">Sciences Naturelles</h3>
                <p className="text-xs font-bold text-moroccan-red uppercase mb-6 tracking-widest">Dans 2 Jours</p>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">Consulter Syllabus</button>
             </div>
             <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-transparent to-deep-emerald opacity-50"></div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Performance</h3>
             <div className="space-y-6">
                {[
                  { label: 'Présence Mensuelle', val: '98%', color: 'bg-moroccan-green' },
                  { label: 'Moyenne Générale', val: '16.5', color: 'bg-moroccan-gold' },
                  { label: 'Livres Empruntés', val: '02', color: 'bg-deep-emerald' }
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                       <span className="text-xs font-black text-slate-900">{stat.val}</span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className={`h-full ${stat.color} rounded-full transition-all duration-1000`} style={{ width: stat.val.includes('.') ? `${(parseFloat(stat.val)/20)*100}%` : stat.val }}></div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
