import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import financeService from '../services/financeService';

const TeacherSalary = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchSalary = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res.profile);
      } catch (err) {
        console.error('Error fetching salary details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, []);

  const handleOpenHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const data = await financeService.getMyTransactions();
      // Filter only salary types for this view
      setTransactions(data.filter(t => t.type === 'Salaire'));
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span>
      </div>
    );
  }

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
           <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
           Mon Bulletin de Paie
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase text-[10px] tracking-[0.2em]">
           Suivi des rémunérations et historique des paiements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Salary Overview Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm p-10 overflow-hidden relative">
          <div className="relative z-10 space-y-8">
             <div className="p-8 bg-linear-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-4xl border border-amber-100 dark:border-amber-500/20">
                <p className="text-[12px] font-black text-amber-600 uppercase tracking-widest mb-4">Salaire Mensuel Actuel</p>
                <div className="flex items-baseline gap-3">
                   <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                     {data?.salary?.toLocaleString() || 0}
                   </span>
                   <span className="text-lg font-black text-slate-400 dark:text-slate-500 uppercase">MAD / mois</span>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Statut de Paiement</p>
                   <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-sm font-black text-slate-800 dark:text-white uppercase">À jour</span>
                   </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Dernier Virement</p>
                   <span className="text-sm font-black text-slate-800 dark:text-white uppercase">02 Mars 2026</span>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                   <span className="material-symbols-outlined text-amber-500">info</span>
                   Composition du Salaire
                </h3>
                <div className="space-y-3">
                   <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Salaire de Base</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">{data?.salary?.toLocaleString()} MAD</span>
                   </div>
                   <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Indemnités de Transport</span>
                      <span className="text-sm font-black text-emerald-500 uppercase">Inclus</span>
                   </div>
                </div>
             </div>
          </div>
          <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[200px] text-slate-50 dark:text-slate-800/20 pointer-events-none">payments</span>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="bg-linear-to-br from-deep-emerald to-moroccan-green p-8 rounded-[2.5rem] text-white shadow-xl">
              <span className="material-symbols-outlined text-4xl mb-4">history_edu</span>
              <h3 className="text-lg font-black uppercase tracking-tight mb-2">Note Administrative</h3>
              <p className="text-white/70 text-[11px] font-medium leading-relaxed uppercase tracking-widest italic">
                 Vos fiches de paie sont générées automatiquement en début de chaque mois. Pour toute réclamation, contactez le département RH.
              </p>
              <button 
                onClick={handleOpenHistory}
                className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Consulter l'Historique
              </button>
           </div>
        </div>
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Historique des Paiements</h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-moroccan-red transition-colors bg-white dark:bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {historyLoading ? (
                <div className="py-20 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green">progress_activity</span></div>
              ) : transactions.length > 0 ? (
                <div className="space-y-4">
                  <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Référence</th>
                        <th className="px-4 py-3">Montant</th>
                        <th className="px-4 py-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {transactions.map(t => (
                        <tr key={t._id} className="text-sm">
                          <td className="px-4 py-4 font-bold text-slate-600 dark:text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                          <td className="px-4 py-4 font-black text-slate-900 dark:text-white uppercase">{t.invoiceNumber || 'N/A'}</td>
                          <td className="px-4 py-4 font-black text-moroccan-green">{t.amount.toLocaleString()} MAD</td>
                          <td className="px-4 py-4">
                            <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Payé</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-4xl text-slate-200 mb-4">payments</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Aucun historique de paiement trouvé</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSalary;
