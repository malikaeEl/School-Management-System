import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import admissionService from '../services/admissionService';

const AdmissionsEnrollment = () => {
  const { lang, t } = useLanguage();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const data = await admissionService.getAll();
      setAdmissions(data);
    } catch {
      showToast('Erreur chargement admissions.', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await admissionService.updateStatus(id, status);
      setAdmissions(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      showToast(`Statut mis à jour : ${status}`);
    } catch {
      showToast('Erreur mise à jour statut.', 'bg-moroccan-red');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return;
    try {
      await admissionService.remove(id);
      setAdmissions(prev => prev.filter(a => a._id !== id));
      showToast('Demande supprimée.');
    } catch {
      showToast('Erreur suppression.', 'bg-moroccan-red');
    }
  };

  const exportCSV = () => {
    const headers = ['Nom Étudiant', 'Niveau', 'Parent', 'Email', 'Téléphone', 'Statut', 'Date'];
    const rows = admissions.map(a => [
      a.studentName,
      a.grade,
      a.parentName,
      a.email,
      a.phone,
      a.status,
      new Date(a.createdAt).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'admissions_atlas.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Export réussi ✓');
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 text-slate-900 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right`}>{toast.msg}</div>}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
             <span className="w-1.5 h-8 bg-moroccan-gold rounded-full"></span>
             Admissions & Inscriptions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black mt-1 uppercase tracking-[0.2em] italic">
             Gestion en temps réel des nouvelles candidatures
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportCSV} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-white px-5 py-2.5 rounded-2xl font-black shadow-sm text-xs hover:bg-slate-50 transition-all uppercase tracking-widest">
            <span className="material-symbols-outlined text-xl">file_download</span>
            Exporter Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Demandes</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{admissions.length}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">En attente</p>
            <p className="text-2xl font-black text-amber-500">{admissions.filter(a => a.status === 'Pending').length}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Qualifiés</p>
            <p className="text-2xl font-black text-moroccan-green">{admissions.filter(a => a.status === 'Qualified').length}</p>
         </div>
         <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm text-center flex items-center justify-center">
             <span className="material-symbols-outlined text-moroccan-gold text-4xl opacity-20">verified_user</span>
         </div>
      </div>

      {/* Main List */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">Candidat</th>
                <th className="px-6 py-5">Niveau</th>
                <th className="px-6 py-5">Parent</th>
                <th className="px-6 py-5">Contact</th>
                <th className="px-6 py-5">Statut</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                 <tr><td colSpan="6" className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green">progress_activity</span></td></tr>
              ) : admissions.length === 0 ? (
                 <tr><td colSpan="6" className="p-20 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">Aucune demande trouvée</td></tr>
              ) : admissions.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 uppercase text-xs">
                        {a.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase">{a.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-bold italic">{new Date(a.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-moroccan-gold/10 text-moroccan-gold text-[10px] font-black rounded-lg uppercase tracking-widest">
                      {a.grade}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">{a.parentName}</p>
                    <p className="text-[10px] text-slate-400">{a.email}</p>
                  </td>
                  <td className="px-6 py-5 text-xs font-bold text-slate-500">{a.phone}</td>
                  <td className="px-6 py-5">
                    <select 
                      value={a.status} 
                      onChange={(e) => handleStatusUpdate(a._id, e.target.value)}
                      className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest outline-none border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 ${
                        a.status === 'Qualified' ? 'text-moroccan-green' : a.status === 'Pending' ? 'text-amber-500' : 'text-slate-400'
                      }`}
                    >
                      {['Pending', 'Inquiry', 'Assessment', 'Interview', 'Qualified', 'Rejected'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleDelete(a._id)} className="p-2 text-slate-300 hover:text-moroccan-red transition-colors">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdmissionsEnrollment;
