import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { SCHOOL_CYCLES } from '../constants/schoolLevels';
import { useAuth } from '../context/AuthContext';

const emptyForm = { firstName: '', lastName: '', email: '', role: 'student', grade: 'CP', subject: '', phone: '' };

const StudentManagement = () => {
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [students, setStudents]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [gradeFilter, setGradeFilter] = useState('all');
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [deleteId, setDeleteId]     = useState(null);
  const [toast, setToast]           = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      // Filter for students only
      setStudents(data.filter(u => u.role === 'student'));
    } catch {
      showToast('Erreur lors du chargement des étudiants.', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  // ── Filtering ──────────────────────────────────────
  const filtered = students.filter(s => {
    const isAccessible = isAdmin || (user?.classes?.includes(s.grade));
    if (!isAccessible) return false;

    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const matchSearch = fullName.includes(searchTerm.toLowerCase()) ||
                        (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? s.isActive : !s.isActive);
    const matchGrade = gradeFilter === 'all' || s.grade === gradeFilter;
    return matchSearch && matchStatus && matchGrade;
  });

  // ── Export CSV ─────────────────────────────────────
  const exportCSV = () => {
    const headers = ['ID', 'Prénom', 'Nom', 'Classe', 'Email', 'Téléphone', 'Statut'];
    const rows = students.map(s => [s._id, s.firstName, s.lastName, s.grade, s.email, s.phone, s.isActive ? 'Actif' : 'Inactif']);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'etudiants_atlas.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Export CSV réussi ✓');
  };

  // ── Add Student ────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await userService.create(form);
      setStudents(prev => [created, ...prev]);
      setForm(emptyForm);
      setShowModal(false);
      showToast('Étudiant créé — les identifiants ont été envoyés par email ✓');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur lors de la création.', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete Student ─────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await userService.remove(id);
      setStudents(prev => prev.filter(s => s._id !== id));
      setDeleteId(null);
      showToast('Compte étudiant supprimé ✓');
    } catch (err) {
      showToast('Erreur lors de la suppression.', 'bg-moroccan-red');
    }
  };

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className={`animate-in fade-in duration-500 space-y-8 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black animate-in slide-in-from-right duration-300`}>
          {toast.msg}
        </div>
      )}

      {/* ── Add Student Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white">
              <h2 className="text-xl font-black">{editUser ? 'Modifier Étudiant' : 'Nouveau Étudiant'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prénom</label>
                  <input required type="text" placeholder="Yassine" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom</label>
                  <input required type="text" placeholder="Alami" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input required type="email" placeholder="etudiant@atlas.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10" />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Téléphone</label>
                <input type="tel" placeholder="+212 6..." value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Classe</label>
                  <select value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm">
                    {Object.values(SCHOOL_CYCLES).map(cycle => (
                      <optgroup key={cycle.label} label={cycle.label}>
                        {cycle.levels.map(l => <option key={l} value={l}>{l}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Matière</label>
                  <input type="text" placeholder="Général, Sciences..." value={form.subject || ''} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10" />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-moroccan-green text-white text-sm font-black shadow-lg hover:bg-deep-emerald disabled:opacity-50">
                  {submitting ? 'Création...' : 'Créer & Envoyer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-8 animate-in zoom-in duration-200 text-center border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-moroccan-red/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-moroccan-red">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Cette action supprimera le compte de cet étudiant.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-3 rounded-xl bg-moroccan-red text-white text-sm font-black shadow-lg">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-deep-emerald dark:text-white flex items-center gap-3">
            <span className="w-1.5 h-8 bg-moroccan-green rounded-full shadow-[0_0_12px_rgba(26,60,52,0.3)]"></span>
            Gestion des Étudiants
          </h1>
          <p className="text-slate-400 text-[10px] font-black mt-1 uppercase tracking-[0.2em] flex items-center gap-2">
            Base de données Scolaire
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            {loading ? 'Chargement...' : `${filtered.length} inscrit(s)`}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 bg-moroccan-green text-white px-7 py-3.5 rounded-2xl font-black shadow-lg shadow-moroccan-green/20 hover:bg-deep-emerald transition-all transform hover:-translate-y-1">
            <span className="material-symbols-outlined">person_add</span>
            Ajouter un Étudiant
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="p-7 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-center bg-slate-50/20">
          <div className="relative group w-full lg:w-96">
            <span className="absolute inset-y-0 left-4 flex items-center text-slate-400">
              <span className="material-symbols-outlined text-xl">search</span>
            </span>
            <input
              type="text"
              placeholder="Nom ou email de l'étudiant..."
              className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 dark:text-white rounded-2xl outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto relative">
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:border-moroccan-green transition-all"
            >
              <option value="all">Toutes les classes</option>
              {isAdmin ? (
                Object.values(SCHOOL_CYCLES).flatMap(c => c.levels).map(l => (
                    <option key={l} value={l}>{l}</option>
                ))
              ) : (
                user?.classes?.map(l => (
                    <option key={l} value={l}>{l}</option>
                ))
              )}
            </select>
            <button
              onClick={() => setShowFilter(v => !v)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${filterStatus !== 'all' ? 'bg-moroccan-green text-white border-moroccan-green shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'}`}>
              <span className="material-symbols-outlined text-lg">filter_list</span>
              Statut
            </button>
            {showFilter && (
              <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-20 p-2 min-w-[200px] animate-in slide-in-from-top-2">
                {[{ v: 'all', l: 'Tous les statuts' }, { v: 'active', l: 'Actifs uniquement' }, { v: 'inactive', l: 'Inactifs uniquement' }].map(opt => (
                  <button key={opt.v} onClick={() => { setFilterStatus(opt.v); setShowFilter(false); }}
                    className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === opt.v ? 'bg-moroccan-green text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {opt.l}
                  </button>
                ))}
              </div>
            )}
            <button onClick={exportCSV}
              className="flex items-center justify-center gap-2 px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[11px] font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">download</span>
              Exporter
            </button>
          </div>
        </div>

        {/* ── Table / Loading ── */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Chargement des données...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-20 text-center flex flex-col items-center gap-4">
              <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800">group_off</span>
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Aucun étudiant trouvé</p>
            </div>
          ) : (
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-[0.2em] font-black">
                <tr>
                  <th className="px-8 py-5">Étudiant</th>
                  <th className="px-6 py-5">Classe / Matière</th>
                  <th className="px-6 py-5">Email & Contact</th>
                  <th className="px-6 py-5">Statut</th>
                  <th className="px-8 py-5 text-right font-black">Gestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(s => (
                  <tr key={s._id} className="hover:bg-moroccan-green/2 dark:hover:bg-white/2 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/students/${s._id}`)}>
                    <td className="px-8 py-5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 font-black text-sm group-hover:bg-moroccan-green group-hover:text-white transition-all transform group-hover:scale-105">
                          {s.firstName?.[0]}{s.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-[15px] font-black text-slate-800 dark:text-white leading-none">{s.firstName} {s.lastName}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1.5 uppercase tracking-tighter">ID: {s._id?.substring(0,8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 mr-2">{s.grade}</span>
                      {s.subject && <span className="text-[11px] font-bold text-amber-600 dark:text-amber-500">{s.subject}</span>}
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-300">{s.email}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{s.phone || 'Non renseigné'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-moroccan-green shadow-[0_0_8px_rgba(26,60,52,0.5)]' : 'bg-slate-300'}`}></div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${s.isActive ? 'text-moroccan-green' : 'text-slate-400'}`}>{s.isActive ? 'Actif' : 'Bloqué'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/students/${s._id}`)}
                          className="p-2.5 text-slate-400 hover:text-moroccan-green hover:bg-moroccan-green/10 rounded-xl transition-all">
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        {isAdmin && (
                          <button onClick={() => setDeleteId(s._id)}
                            className="p-2.5 text-slate-400 hover:text-moroccan-red hover:bg-moroccan-red/10 rounded-xl transition-all">
                            <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer / Stats ── */}
        {!loading && (
          <div className="p-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
              Atlas Academy · Registre Officiel · {new Date().getFullYear()}
            </span>
            <div className="flex gap-2">
               <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 transition-all">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-moroccan-green text-white font-black shadow-lg shadow-moroccan-green/20">1</button>
              <button className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 transition-all">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentManagement;
