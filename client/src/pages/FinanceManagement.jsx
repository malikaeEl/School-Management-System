import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import financeService from '../services/financeService';
import userService from '../services/userService';

const FinanceManagement = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ userId: '', amount: '', type: 'Scolarité' });

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const [overviewData, transactionsData, feesData, usersData] = await Promise.all([
          financeService.getOverview(),
          financeService.getTransactions(),
          financeService.getFees(),
          userService.getAll()
        ]);
        setOverview(overviewData);
        setTransactions(transactionsData);
        setFees(feesData);
        setStudents(usersData.filter(u => u.role === 'student'));
      }
    } catch {
      showToast('Erreur chargement données', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      await financeService.generateInvoice(invoiceForm);
      showToast('Facture générée ✓');
      setShowInvoiceModal(false);
      setInvoiceForm({ userId: '', amount: '', type: 'Scolarité' });
      fetchFinanceData(); // Refresh data
    } catch {
      showToast('Erreur génération', 'bg-moroccan-red');
    }
  };

  const exportFinanceCSV = () => {
    if (!transactions.length) return showToast('Aucune donnée à exporter', 'bg-slate-500');
    
    const headers = ['Facture', 'Élève', 'Date', 'Type', 'Montant', 'Statut'];
    const rows = transactions.map(t => [
      t.invoiceNumber,
      `${t.user?.firstName} ${t.user?.lastName}`,
      new Date(t.date).toLocaleDateString(),
      t.type,
      `${t.amount} MAD`,
      t.status
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'finance_atlas.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Export CSV réussi ✓');
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-in fade-in zoom-in duration-500">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">gpp_bad</span>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Accès Restreint</h2>
        <p className="text-sm font-bold text-slate-400 mt-2">Le module financier est réservé aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right duration-300`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
             <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
             Tableau de Bord Financier
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-relaxed">
             Gérez les revenus, les frais de scolarité et les analyses budgétaires
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={exportFinanceCSV} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300 shadow-sm">
            <span className="material-symbols-outlined text-lg">file_download</span>
            Exporter Excel
          </button>
          <button onClick={() => setShowInvoiceModal(true)} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-8 py-3 bg-moroccan-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-moroccan-green/20">
            <span className="material-symbols-outlined text-lg">add</span>
            Générer Facture
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-3xl w-fit border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
        <button onClick={() => setActiveTab('overview')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-900 text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Aperçu</button>
        <button onClick={() => setActiveTab('invoices')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'invoices' ? 'bg-white dark:bg-slate-900 text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Factures & Reçus</button>
        <button onClick={() => setActiveTab('structure')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'structure' ? 'bg-white dark:bg-slate-900 text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Structure Frais</button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green text-4xl">progress_activity</span></div>
      ) : (
        <>
          {activeTab === 'overview' && overview && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Revenu Total', value: `${overview.totalRevenue?.toLocaleString()} MAD`, sub: 'Cumul Global', icon: 'payments', color: 'text-moroccan-green', bg: 'bg-moroccan-green/10' },
                  { label: 'Frais en Attente', value: `${overview.pendingFees?.toLocaleString()} MAD`, sub: `${transactions.filter(t => t.status === 'Pending').length} Factures`, icon: 'error_outline', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Transactions', value: transactions.length, sub: 'Total', icon: 'receipt_long', color: 'text-moroccan-gold', bg: 'bg-moroccan-gold/10' },
                  { label: 'Taux Recouvrement', value: `${Math.round((transactions.filter(t=>t.status==='Paid').length / (transactions.length||1))*100)}%`, sub: 'Efficacité', icon: 'analytics', color: 'text-deep-emerald', bg: 'bg-deep-emerald/10' }
                ].map((metric, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-4 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl ${metric.bg} ${metric.color} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-2xl">{metric.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{metric.label}</p>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">{metric.value}</h3>
                      </div>
                    </div>
                    <p className={`text-[9px] font-black uppercase mt-3 tracking-widest ${metric.color} relative z-10`}>{metric.sub}</p>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Chart Area */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
                        Revenus Mensuels
                      </h3>
                    </div>
                    <div className="h-[300px] flex items-end gap-3 px-4">
                      {overview.stats.map((val, i) => {
                        const max = Math.max(...overview.stats, 1);
                        const height = (val / max) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-moroccan-gold/80 transition-all relative" style={{ height: `${height}%`, minHeight: '10px' }}>
                              <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
                                {val.toLocaleString()} MAD
                              </div>
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase shrink-0">{['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i]}</span>
                          </div>
                      )})}
                    </div>
                </div>

                {/* Breakdown View */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Répartition Globale</h3>
                  <div className="space-y-6 flex-1">
                    {[
                      { label: 'Scolarité', color: 'bg-moroccan-green', type: 'Scolarité' },
                      { label: 'Transport', color: 'bg-moroccan-gold', type: 'Transport' },
                      { label: 'Activités', color: 'bg-moroccan-red', type: 'Activités' },
                    ].map((item, i) => {
                       const totalType = transactions.filter(t => t.type === item.type && t.status === 'Paid').reduce((a, b) => a + b.amount, 0);
                       const pct = overview.totalRevenue > 0 ? ((totalType / overview.totalRevenue) * 100).toFixed(0) : 0;
                       return (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                            {item.label}
                          </span>
                          <span className="text-[10px] font-black text-slate-900 dark:text-white">{pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full rounded-full`} style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    )})}
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                     <div className="bg-linear-to-br from-slate-900 to-slate-800 p-6 rounded-4xl text-white relative overflow-hidden group shadow-xl">
                        <div className="absolute inset-0 bg-moroccan-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 relative z-10 text-slate-400">Balance Totale</h4>
                        <p className="text-3xl font-black relative z-10 tracking-tight">{overview.totalRevenue?.toLocaleString()} <span className="text-xs text-moroccan-gold uppercase tracking-widest">MAD</span></p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
               <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="relative w-full md:w-96">
                    <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
                    <input 
                      type="text" 
                      placeholder="Rechercher facture..." 
                      className="w-full pl-14 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                     <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 shadow-sm hover:scale-105 transition-transform">Tous</button>
                     <button className="px-6 py-3 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 dark:border-amber-500/20 hover:scale-105 transition-transform">En Attente</button>
                  </div>
               </div>
               <div className="overflow-x-auto min-h-[400px]">
                 <table className="w-full text-left">
                    <thead className="bg-white dark:bg-slate-900 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                       <tr>
                          <th className="px-8 py-6">Facture</th>
                          <th className="px-8 py-6">Date</th>
                          <th className="px-8 py-6">Montant</th>
                          <th className="px-8 py-6">Statut</th>
                          <th className="px-8 py-6 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800">
                       {transactions.length === 0 ? (
                         <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 uppercase tracking-widest text-[10px] font-black">Aucune transaction</td></tr>
                       ) : transactions.map(t => (
                         <tr key={t._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                            <td className="px-8 py-5">
                               <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-moroccan-green transition-colors uppercase">{t.invoiceNumber}</p>
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{t.user?.firstName} {t.user?.lastName}</p>
                               </div>
                            </td>
                            <td className="px-8 py-5 text-xs font-bold text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="px-8 py-5 text-sm font-black text-slate-900 dark:text-white tracking-tight">{t.amount.toLocaleString()} MAD</td>
                            <td className="px-8 py-5">
                               <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                  t.status === 'Paid' ? 'text-moroccan-green bg-moroccan-green/10' :
                                  t.status === 'Pending' ? 'text-amber-500 bg-amber-500/10' :
                                  'text-moroccan-red bg-moroccan-red/10'
                               }`}>{t.status}</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                               <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-moroccan-gold hover:bg-moroccan-gold/10 flex items-center justify-center transition-all ml-auto">
                                 <span className="material-symbols-outlined text-sm">print</span>
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 xl:grid-cols-3 gap-8">
               {fees.map(fee => (
                 <div key={fee._id} className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 relative z-0 overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-moroccan-gold/5 rounded-bl-[100px] z-[-1] group-hover:bg-moroccan-gold/10 transition-colors"></div>
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-linear-to-r from-moroccan-green to-moroccan-gold"></div>
                    
                    <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-block">Niveau</span>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-10 leading-none">{fee.grade}</h3>
                    
                    <div className="space-y-6 mb-12">
                       <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-slate-50 dark:border-slate-800 pb-4">
                          <span className="uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-[10px] text-moroccan-green">menu_book</span> Scolarité</span>
                          <span className="text-slate-900 dark:text-white font-black">{fee.tuition.toLocaleString()} MAD</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-slate-50 dark:border-slate-800 pb-4">
                          <span className="uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-[10px] text-moroccan-gold">directions_bus</span> Transport</span>
                          <span className="text-slate-900 dark:text-white font-black">{fee.transport.toLocaleString()} MAD</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold text-slate-500 border-b border-slate-50 dark:border-slate-800 pb-4">
                          <span className="uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined text-[10px] text-moroccan-red">sports_soccer</span> Activités</span>
                          <span className="text-slate-900 dark:text-white font-black">{fee.activities.toLocaleString()} MAD</span>
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-end bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl">
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Mensuel</p>
                          <p className="text-3xl font-black text-deep-emerald tracking-tighter">{(fee.tuition + fee.transport + fee.activities).toLocaleString()}</p>
                       </div>
                       <button className="w-12 h-12 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 dark:hover:bg-moroccan-gold shadow-sm transition-all transform group-hover:rotate-12">
                          <span className="material-symbols-outlined font-black">edit_square</span>
                       </button>
                    </div>
                 </div>
               ))}
               {fees.length === 0 && (
                 <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] opacity-50">
                    <span className="text-[10px] font-black uppercase tracking-widest">Aucune structure de frais définie</span>
                 </div>
               )}
            </div>
          )}
        </>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-deep-emerald/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-300 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nouvelle Facture</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="text-slate-400 hover:text-moroccan-red transition-colors bg-white dark:bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <form onSubmit={handleGenerateInvoice} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Élève Facturé</label>
                <select 
                  required 
                  value={invoiceForm.userId} 
                  onChange={e => setInvoiceForm(p => ({...p, userId: e.target.value}))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-moroccan-green dark:focus:border-moroccan-green rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-white outline-none transition-all uppercase tracking-widest"
                >
                  <option value="">-- Choisir un élève --</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Montant (MAD)</label>
                <input 
                  type="number" required min="0"
                  value={invoiceForm.amount} 
                  onChange={e => setInvoiceForm(p => ({...p, amount: e.target.value}))} 
                  placeholder="EX: 3500" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-moroccan-green rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-white outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Catégorie</label>
                <select 
                  value={invoiceForm.type} 
                  onChange={e => setInvoiceForm(p => ({...p, type: e.target.value}))} 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-moroccan-green rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-white outline-none transition-all uppercase tracking-widest"
                >
                  {['Scolarité', 'Transport', 'Activités', 'Autre'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-deep-emerald text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-deep-emerald/20 hover:brightness-110 transition-all">Créer Facture</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default FinanceManagement;
