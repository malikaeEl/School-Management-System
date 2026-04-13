import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import leaveService from '../services/leaveService';

const LeaveManagement = () => {
  const { lang, t } = useLanguage();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [processing, setProcessing] = useState(null); // id of the request being processed
  const [adminComment, setAdminComment] = useState('');

  const fetchAllLeaves = async () => {
    try {
      const data = await leaveService.getAll();
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLeaves();
  }, []);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await leaveService.updateStatus(id, { status, adminComment });
      showToast(`Demande ${status === 'Approved' ? 'approuvée' : 'refusée'} avec succès ! ✓`);
      setProcessing(null);
      setAdminComment('');
      fetchAllLeaves();
    } catch (err) {
      showToast('Erreur lors du traitement.', 'bg-moroccan-red');
    }
  };

  const statusStyles = {
    'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
    'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Rejected': 'bg-rose-100 text-rose-700 border-rose-200'
  };

  const statusLabels = {
    'Pending': 'En attente',
    'Approved': 'Approuvé',
    'Rejected': 'Refusé'
  };

  const leaveTypeLabels = {
    'Personal': 'Personnel',
    'Sickness': 'Maladie',
    'Vacation': 'Vacances',
    'Maternity': 'Maternité',
    'Other': 'Autre'
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right`}>
          {toast.msg}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Gestion des Congés</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Validez ou refusez les demandes d'absence du personnel</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                    <th className="px-8 py-5">Enseignant</th>
                    <th className="px-6 py-5">Période</th>
                    <th className="px-6 py-5">Type & Raison</th>
                    <th className="px-6 py-5 text-center">Statut</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <span className="material-symbols-outlined animate-spin text-slate-200 text-4xl">progress_activity</span>
                    </td>
                  </tr>
                ) : leaves.length > 0 ? leaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{l.teacher?.firstName} {l.teacher?.lastName}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{l.teacher?.subject || 'Administration'}</p>
                        </td>
                        <td className="px-6 py-6 font-medium text-xs text-slate-600">
                            Du {new Date(l.startDate).toLocaleDateString()}<br/>
                            Au {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-6 max-w-xs">
                            <span className="text-[10px] font-black text-moroccan-gold uppercase italic mb-1 block">{leaveTypeLabels[l.type] || l.type}</span>
                            <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed line-clamp-2">"{l.reason}"</p>
                        </td>
                        <td className="px-6 py-6 text-center">
                            <span className={`px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest ${statusStyles[l.status]}`}>
                                {statusLabels[l.status]}
                            </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                            {l.status === 'Pending' ? (
                                <button 
                                    onClick={() => setProcessing(l._id)}
                                    className="px-4 py-2 bg-moroccan-green text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-moroccan-green/10 hover:scale-105 transition-all"
                                >
                                    Traiter
                                </button>
                            ) : (
                                <span className="text-[10px] font-black text-slate-300 uppercase italic">Traité</span>
                            )}
                        </td>
                    </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Aucune demande en attente</p>
                    </td>
                  </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Processing Modal */}
      {processing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
             <h3 className="text-xl font-black text-slate-900 mb-2">Décision Administrative</h3>
             <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">Pour la demande de {leaves.find(l => l._id === processing)?.teacher?.firstName}</p>
             
             <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Commentaire (Facultatif)</label>
             <textarea 
                rows="3" 
                value={adminComment}
                onChange={e => setAdminComment(e.target.value)}
                placeholder="Ex: Justificatif médical reçu, congé validé..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold outline-none mb-8 resize-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
             ></textarea>

             <div className="flex gap-4">
                <button 
                  onClick={() => setProcessing(null)}
                  className="flex-1 py-4 font-black text-[10px] text-slate-400 uppercase tracking-widest rounded-2xl border border-slate-100 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleStatusUpdate(processing, 'Rejected')}
                  className="flex-1 py-4 bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20 hover:bg-rose-600"
                >
                  Refuser
                </button>
                <button 
                  onClick={() => handleStatusUpdate(processing, 'Approved')}
                  className="flex-1 py-4 bg-moroccan-green text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-moroccan-green/20 hover:bg-deep-emerald"
                >
                  Approuver
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
