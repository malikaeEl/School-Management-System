import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import userService from '../services/userService';

const HRManagement = () => {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', role: 'teacher', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      console.log('API Users Data:', data);
      
      // Inclusion criteria: any role that isn't 'student' or 'parent'
      const staffMembers = data.filter(u => {
        const role = u.role?.toLowerCase() || '';
        return !['student', 'parent'].includes(role);
      });
      
      console.log('Filtered Staff:', staffMembers);
      setStaff(staffMembers);
    } catch (err) {
      console.error('HR Fetch Error:', err);
      const errorMsg = err?.response?.data?.message || 'Erreur lors du chargement du personnel.';
      showToast(errorMsg, 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await userService.create(form);
      setStaff(prev => [created, ...prev]);
      setShowModal(false);
      setForm({ firstName: '', lastName: '', role: 'teacher', email: '', phone: '' });
      showToast('Membre du personnel ajouté — Identiants envoyés par email ✓');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur lors de la création.', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  const exportHR = () => {
    const headers = ['Nom','Rôle','Email','Téléphone'];
    const rows = staff.map(s => [`${s.firstName} ${s.lastName}`, s.role, s.email, s.phone || 'N/A']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'staff_atlas.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Export CSV réussi ✓');
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {/* Toast */}
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black animate-in slide-in-from-right`}>{toast.msg}</div>}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white">
              <h2 className="text-xl font-black">Nouveau Membre</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Prénom</label>
                  <input required value={form.firstName} onChange={e => setForm(p => ({...p, firstName: e.target.value}))} placeholder="Ahmed" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-moroccan-green/30 outline-none transition-all"/>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Nom</label>
                  <input required value={form.lastName} onChange={e => setForm(p => ({...p, lastName: e.target.value}))} placeholder="Alami" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-moroccan-green/30 outline-none transition-all"/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Email</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="alami@atlas.academy" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-moroccan-green/30 outline-none transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Téléphone</label>
                <input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+212 6..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-moroccan-green/30 outline-none transition-all"/>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Rôle</label>
                <select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none">
                  <option value="teacher">Enseignant</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-moroccan-green text-white text-sm font-black shadow-lg shadow-moroccan-green/20 disabled:opacity-50">
                  {submitting ? 'Création...' : 'Créer & Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
            <span className="w-2 h-8 bg-moroccan-green rounded-full"></span>
            Ressources Humaines
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest">
            Gestion du personnel et des comptes d'administration
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-moroccan-green text-white px-7 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:opacity-90 shadow-xl shadow-moroccan-green/20 transition-all uppercase tracking-widest transform hover:-translate-y-1">
          <span className="material-symbols-outlined">person_add</span>
          Déclarer un employé
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: 'groups', label: 'Total Staff', val: staff.length, color: 'moroccan-green' },
          { icon: 'school', label: 'Enseignants', val: staff.filter(s => s.role === 'teacher').length, color: 'moroccan-gold' },
          { icon: 'support_agent', label: 'Administration', val: staff.filter(s => s.role === 'admin').length, color: 'deep-emerald' },
        ].map(st => (
          <div key={st.label} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 border-l-4 border-l-${st.color} hover:shadow-md transition-all`}>
            <div className={`w-12 h-12 rounded-2xl bg-${st.color}/10 text-${st.color} flex items-center justify-center shrink-0 shadow-inner`}>
              <span className="material-symbols-outlined text-3xl">{st.icon}</span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{st.label}</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tighter">{loading ? '...' : st.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Staff Directory */}
        <div className="lg:col-span-1">
          <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-50/20">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 text-slate-400 dark:text-slate-300">
                <span className="material-symbols-outlined text-moroccan-gold text-xl">badge</span>
                Registre du Personnel
              </h2>
              <button onClick={exportHR} className="flex items-center gap-2 text-[10px] font-black text-moroccan-green uppercase tracking-widest hover:underline px-4 py-2 bg-moroccan-green/5 rounded-xl border border-moroccan-green/10">
                 <span className="material-symbols-outlined text-sm">download</span>
                 Exporter CSV
              </button>
            </div>
            
            <div className="overflow-x-auto flex-1">
              {loading ? (
                <div className="p-20 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green">progress_activity</span></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Employé</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {staff.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-20 text-center">
                          <div className="flex flex-col items-center justify-center opacity-40">
                            <span className="material-symbols-outlined text-4xl mb-2">person_off</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aucun personnel trouvé</p>
                            <button onClick={fetchStaff} className="mt-4 px-4 py-2 bg-slate-100 rounded-lg text-[9px] font-black hover:bg-slate-200 uppercase tracking-widest transition-all">Actualiser la liste</button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      staff.map(s => (
                        <tr key={s._id} onClick={() => navigate(`/hr/${s._id}`)} className="hover:bg-slate-50/50 dark:hover:bg-white/2 transition-all cursor-pointer group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-moroccan-green group-hover:text-white transition-all transform group-hover:scale-105 shadow-inner">
                                {s.firstName?.[0]}{s.lastName?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-800 dark:text-white leading-none mb-1">{s.firstName} {s.lastName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{s.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                             <span className="text-[10px] font-black px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700 uppercase tracking-widest">{s.role}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-moroccan-green' : 'bg-slate-300'}`}></div>
                               <span className={`text-[10px] font-black uppercase tracking-widest ${s.isActive ? 'text-moroccan-green' : 'text-slate-400'}`}>{s.isActive ? 'Active' : 'Offline'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-moroccan-gold"><span className="material-symbols-outlined">more_vert</span></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HRManagement;
