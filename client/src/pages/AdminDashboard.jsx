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

  return (
    <div className={`animate-in fade-in duration-500 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <h1 className="text-3xl font-black text-deep-emerald dark:text-moroccan-gold mb-8 flex items-center gap-3">
        <span className="w-1.5 h-8 bg-moroccan-gold rounded-full"></span>
        Tableau de Bord Administrateur
      </h1>
      
      {/* Analytics Overview */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Students */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Étudiants</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">{stats?.students || 0}</h3>
            </div>
            <div className="p-3 bg-moroccan-green/10 rounded-xl text-moroccan-green">
              <span className="material-symbols-outlined">group</span>
            </div>
          </div>
        </div>
        
        {/* Total Teachers */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Enseignants</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">{stats?.teachers || 0}</h3>
            </div>
            <div className="p-3 bg-moroccan-red/10 rounded-xl text-moroccan-red">
              <span className="material-symbols-outlined">work</span>
            </div>
          </div>
        </div>
        
        {/* Total Parents */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Parents</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">{stats?.parents || 0}</h3>
            </div>
            <div className="p-3 bg-moroccan-gold/10 rounded-xl text-moroccan-gold">
              <span className="material-symbols-outlined">family_restroom</span>
            </div>
          </div>
        </div>
        
        {/* Total Subjects */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Matières</p>
              <h3 className="text-3xl font-black mt-1 text-deep-emerald dark:text-white">{stats?.subjects || 0}</h3>
            </div>
            <div className="p-3 bg-deep-emerald/10 rounded-xl text-deep-emerald">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
           <h2 className="font-black text-deep-emerald dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-moroccan-green">insights</span>
            Statistiques Rapides
          </h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl">
             <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Graphique de croissance (Bientôt disponible)</p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
          <h2 className="font-black text-deep-emerald dark:text-white mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-moroccan-gold">bolt</span>
            Actions Rapides
          </h2>
          <div className="space-y-4">
            <button onClick={() => navigate('/users')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-moroccan-green hover:text-white rounded-xl transition-all group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined p-2 bg-white dark:bg-slate-700 rounded-lg text-moroccan-green group-hover:bg-white/20 group-hover:text-white">person_add</span>
                <span className="font-bold text-sm">Gérer les Utilisateurs</span>
              </div>
            </button>
            <button onClick={() => navigate('/academic')} className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 hover:bg-moroccan-gold hover:text-white rounded-xl transition-all group">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined p-2 bg-white dark:bg-slate-700 rounded-lg text-moroccan-gold group-hover:bg-white/20 group-hover:text-white">menu_book</span>
                <span className="font-bold text-sm">Programmes Académiques</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
