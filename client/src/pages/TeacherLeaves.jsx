import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import leaveService from '../services/leaveService';

const TeacherLeaves = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getByUser(user._id);
      setLeaves(data);
    } catch {
      showToast('Erreur lors du chargement des demandes', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchLeaves();
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await leaveService.submit({ ...formData, userId: user._id });
      showToast('Demande soumise avec succès ✓');
      setIsModalOpen(false);
      setFormData({ type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch {
      showToast('Erreur lors de l\'envoi', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black animate-in slide-in-from-right`}>{toast.msg}</div>}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
             <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
             Mes Demandes de Congé
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase text-[10px] tracking-[0.2em]">
             Gérez vos absences et demandes de congés
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-moroccan-green text-white px-6 py-3 rounded-xl text-sm font-black hover:bg-deep-emerald transition-all shadow-xl shadow-moroccan-green/20 flex items-center gap-2 uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Nouvelle Demande
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <section>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4 bg-white dark:bg-slate-900 p-4 rounded-4xl shadow-sm border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Filtres : Toutes les demandes</span>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span></div>
            ) : leaves.length > 0 ? leaves.map((leave) => (
              <div key={leave._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    leave.status === 'Approved' ? 'bg-moroccan-green/10 text-moroccan-green' : 
                    leave.status === 'Rejected' ? 'bg-moroccan-red/10 text-moroccan-red' : 
                    'bg-amber-500/10 text-amber-500'
                  }`}>
                    <span className="material-symbols-outlined text-3xl">
                      {leave.type === 'Sick Leave' ? 'medical_services' : 'flight_takeoff'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{leave.type === 'Sick Leave' ? 'Congé Maladie' : 'Congé Annuel'}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Du {new Date(leave.startDate).toLocaleDateString()} au {new Date(leave.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block px-4 border-r border-slate-100 dark:border-slate-800 min-w-[120px]">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
                      leave.status === 'Approved' ? 'text-moroccan-green' : 
                      leave.status === 'Rejected' ? 'text-moroccan-red' : 
                      'text-amber-500'
                    }`}>
                      {leave.status === 'Approved' ? 'Approuvé' : leave.status === 'Rejected' ? 'Refusé' : 'En attente'}
                    </span>
                  </div>
                  {leave.status === 'Pending' && (
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-300 hover:text-moroccan-red transition-all">
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                 <span className="material-symbols-outlined text-4xl mb-4 text-slate-300">history_edu</span>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucune demande soumise pour le moment</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal Submitting Leave */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Nouvelle Demande</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Veuillez remplir les informations</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Type de Congé</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-moroccan-green/20"
                  >
                    <option value="Sick Leave">Maladie</option>
                    <option value="Annual Leave">Annuel</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date de Début</label>
                  <input 
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-moroccan-green/20"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date de Fin</label>
                  <input 
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-moroccan-green/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Motif / Justification</label>
                <textarea 
                  required
                  rows="4"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 py-4 text-sm font-black text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-moroccan-green/20"
                  placeholder="Décrivez brièvement le motif de votre demande..."
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-moroccan-green text-white py-4 rounded-2xl text-xs font-black shadow-xl shadow-moroccan-green/20 uppercase tracking-widest hover:bg-deep-emerald transition-all disabled:opacity-50"
                >
                  {submitting ? 'Envoi...' : 'Soumettre Demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherLeaves;
