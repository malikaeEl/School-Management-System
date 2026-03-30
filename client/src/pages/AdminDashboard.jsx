import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';

const AdminDashboard = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
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

  const { stats } = data || {};

  const statCards = [
    { label: 'Étudiants', value: stats?.students || 0, icon: 'group', color: 'bg-moroccan-green', text: 'text-moroccan-green' },
    { label: 'Enseignants', value: stats?.teachers || 0, icon: 'work', color: 'bg-moroccan-red', text: 'text-moroccan-red' },
    { label: 'Parents', value: stats?.parents || 0, icon: 'family_restroom', color: 'bg-moroccan-gold', text: 'text-moroccan-gold' },
    { label: 'Matières', value: stats?.subjects || 0, icon: 'menu_book', color: 'bg-deep-emerald', text: 'text-deep-emerald' },
  ];

  return (
    <div className={`animate-in fade-in duration-500 space-y-10 ${lang === 'ar' ? 'font-arabic text-right' : 'font-sans'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
            Vue d'ensemble
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-black tracking-[0.2em]">Pilotage de l'établissement Atlas Academy</p>
        </div>
      </div>
      
      {/* Analytics Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-4xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group hover:border-moroccan-gold/20 transition-all">
            <div className="relative z-10">
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
              <h3 className="text-4xl font-black mt-2 text-slate-900 dark:text-white leading-none">{stat.value}</h3>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-20 h-20 ${stat.text} opacity-5 group-hover:opacity-10 transition-all transform group-hover:scale-125 group-hover:-rotate-12`}>
              <span className="material-symbols-outlined text-8xl leading-none">{stat.icon}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="space-y-8">
        {/* Main Actions Area */}
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 p-8 pt-10">
          <h2 className="text-lg font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight">
            <span className="w-1.5 h-6 bg-moroccan-green rounded-full"></span>
            Actions de Gestion
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button 
              onClick={() => navigate('/users')} 
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 hover:bg-moroccan-green hover:text-white rounded-3xl transition-all group/btn border border-transparent shadow-xs"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-moroccan-green group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-tight">Comptes Utilisateurs</p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">Admin, Profs, Parents</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all">chevron_right</span>
            </button>

            <button 
              onClick={() => navigate('/hr')} 
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 hover:bg-moroccan-gold hover:text-white rounded-3xl transition-all group/btn border border-transparent shadow-xs"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-moroccan-gold group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-tight">RH & Personnel</p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">Équipe Atlas Academy</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all">chevron_right</span>
            </button>

            <button 
              onClick={() => navigate('/admission')} 
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 hover:bg-deep-emerald hover:text-white rounded-3xl transition-all group/btn border border-transparent shadow-xs"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-deep-emerald group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">how_to_reg</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-tight">Inscriptions</p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">Nouveaux Élèves</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all">chevron_right</span>
            </button>

            <button 
              onClick={() => navigate('/finance')} 
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-900 hover:text-white rounded-3xl transition-all group/btn border border-transparent shadow-xs"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-900 group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">account_balance</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-tight">Finances</p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">Facturation & Paie</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all">chevron_right</span>
            </button>

            <button 
              onClick={() => navigate('/attendance')} 
              className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 hover:bg-moroccan-green hover:text-white rounded-3xl transition-all group/btn border border-transparent shadow-xs"
            >
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-moroccan-green group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all shadow-sm">
                  <span className="material-symbols-outlined">edit_calendar</span>
                </div>
                <div className="text-left">
                  <p className="font-black text-sm uppercase tracking-tight">Présences</p>
                  <p className="text-[10px] opacity-60 uppercase tracking-widest mt-0.5">Suivi Quotidien</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300 group-hover/btn:text-white transform group-hover/btn:translate-x-1 transition-all">chevron_right</span>
            </button>

          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
