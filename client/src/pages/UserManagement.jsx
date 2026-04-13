import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from 'react-router-dom';
import { SCHOOL_CYCLES, ALL_LEVELS } from '../constants/schoolLevels';
import userService from '../services/userService';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';

const ROLES = [
  { value: 'student', label: 'Élève', icon: 'school', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'teacher', label: 'Enseignant', icon: 'person_book', color: 'bg-amber-100 text-amber-800' },
  { value: 'parent', label: 'Parent', icon: 'family_restroom', color: 'bg-blue-100 text-blue-800' },
];

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'student',
  grade: 'CP',
  classes: [],
  subject: '',
  password: '',
  hasLogin: true,
  parentId: '',
  salary: 0,
};

const UserManagement = () => {
  const { lang } = useLanguage();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null); // null = create mode
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('student');
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetModal, setResetModal] = useState({ open: false, userId: null, userName: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch {
      showToast('Erreur lors du chargement des utilisateurs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Handle prefilled data from navigation state (e.g. from Admissions)
  useEffect(() => {
    if (location.state?.prefill) {
      setForm({
        ...emptyForm,
        ...location.state.prefill
      });
      setEditUser(null);
      setShowModal(true);
      // Clean up the window history to avoid re-opening modal on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const openCreate = () => {
    setEditUser(null);
    setForm({
      ...emptyForm,
      role: filter === 'all' ? 'student' : filter,
      grade: selectedGrade || 'CP'
    });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      grade: user.grade || 'N/A',
      classes: user.classes || [],
      subject: user.subject || '',
      hasLogin: !!user.email,
      parentId: user.parentId || '',
      salary: user.salary || 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editUser) {
        const updated = await userService.update(editUser._id, form);
        setUsers(prev => prev.map(u => u._id === updated._id ? updated : u));
        showToast('Compte mis à jour avec succès.');
      } else {
        const created = await userService.create(form);
        setUsers(prev => [created, ...prev]);
        if (form.hasLogin) {
          setSuccessData({
            email: created.email,
            password: created.generatedPassword || form.password || 'Généré aléatoirement'
          });
        }
        showToast('Compte créé avec succès.');
      }
      setShowModal(false);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Une erreur est survenue.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await userService.remove(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      showToast('Utilisateur supprimé.');
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur lors de la suppression.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const filtered = users
    .filter(u => filter === 'all' || u.role === filter)
    .filter(u => {
      if (search) return true; // Bypass grade filter when searching
      if (!selectedGrade) return true;
      if (filter === 'student') return u.grade === selectedGrade;
      if (filter === 'teacher') return u.classes?.includes(selectedGrade);
      if (filter === 'parent') {
        const hasNoChildren = !users.some(stu => stu.role === 'student' && stu.parentId === u._id);
        const hasChildInGrade = users.some(stu => stu.role === 'student' && stu.parentId === u._id && stu.grade === selectedGrade);
        return hasNoChildren || hasChildInGrade;
      }
      return true;
    })
    .filter(u => {
      const s = search.toLowerCase();
      return !s || u.firstName.toLowerCase().includes(s) || u.lastName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
    });

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    parents: users.filter(u => u.role === 'parent').length,
  };

  const roleConfig = {
    student: { label: 'Élève', color: 'bg-emerald-100 text-emerald-700' },
    teacher: { label: 'Enseignant', color: 'bg-amber-100 text-amber-700' },
    parent: { label: 'Parent', color: 'bg-blue-100 text-blue-700' },
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-9999 px-6 py-4 rounded-2xl shadow-2xl text-sm font-black flex items-center gap-2 animate-in slide-in-from-right duration-300 ${toast.type === 'error' ? 'bg-moroccan-red text-white' : 'bg-moroccan-green text-white'}`}>
          <span className="material-symbols-outlined">{toast.type === 'error' ? 'error' : 'check_circle'}</span>
          {toast.msg}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-moroccan-red/10 text-moroccan-red rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">Confirmer la suppression</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 rounded-2xl bg-moroccan-red text-white font-black hover:bg-red-700 transition-all">Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2">Compte créé !</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Voici les identifiants de connexion :</p>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-left border border-slate-100 dark:border-slate-700">
              <div className="mb-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">{successData.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mot de passe</p>
                <p className="text-sm font-mono font-black text-moroccan-green select-all tracking-wider">{successData.password || (form.password || 'Auto-généré')}</p>
              </div>
            </div>

            <button 
              onClick={() => setSuccessData(null)} 
              className="w-full py-4 rounded-2xl bg-deep-emerald text-white font-black shadow-lg hover:bg-black transition-all"
            >
              C'est noté
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
            <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
            {t('user_management')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase text-[10px] tracking-[0.2em]">
            {t('user_management_subtitle')}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-moroccan-green text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-moroccan-green/20 hover:bg-deep-emerald transition-all transform hover:-translate-y-0.5"
        >
          <span className="material-symbols-outlined">person_add</span>
          {t('add_user')}
        </button>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          {[{ v: 'all', l: 'Tout' }, { v: 'student', l: 'Élèves' }, { v: 'teacher', l: 'Enseignants' }, { v: 'parent', l: 'Parents' }].map(tab => (
            <button
              key={tab.v}
              onClick={() => { setFilter(tab.v); setSelectedGrade(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === tab.v ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {tab.l} ({users.filter(u => tab.v === 'all' || u.role === tab.v).length})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedGrade ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="text-center py-6">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Répertoire des Comptes</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Sélectionnez une catégorie ci-dessus ou une classe ci-dessous</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(SCHOOL_CYCLES).map(([key, cycle]) => (
                <div key={key} className="space-y-4">
                   <div className="flex items-center gap-3 px-2">
                      <span className="w-1.5 h-6 bg-moroccan-gold rounded-full"></span>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{cycle.label}</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                      {cycle.levels.map(level => {
                        const count = users.filter(u => {
                           if (u.role !== filter && filter !== 'all') return false;
                           if (u.role === 'student' || filter === 'student') return u.grade === level;
                           if (u.role === 'teacher' || filter === 'teacher') return u.classes?.includes(level);
                           return false;
                        }).length;

                        return (
                          <button 
                            key={level}
                            onClick={() => setSelectedGrade(level)}
                            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-moroccan-green transition-all flex items-center justify-between group overflow-hidden relative"
                          >
                             <div className="absolute inset-0 bg-moroccan-green/0 group-hover:bg-moroccan-green/5 transition-colors"></div>
                             <div className="relative z-10">
                                <span className="text-sm font-black text-slate-800 dark:text-white group-hover:text-moroccan-green transition-colors">{level}</span>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                  {count} Comptes
                                </p>
                             </div>
                             <span className="material-symbols-outlined text-slate-200 group-hover:text-moroccan-green transition-all transform group-hover:translate-x-1">chevron_right</span>
                          </button>
                        );
                      })}
                   </div>
                </div>
              ))}

           </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center px-8">
             <div className="flex items-center gap-4">
                <button onClick={() => setSelectedGrade(null)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-moroccan-green transition-all">
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Retour aux classes
                </button>
                <span className="h-4 w-px bg-slate-200"></span>
                <span className="text-xs font-black uppercase text-moroccan-green tracking-widest">{selectedGrade}</span>
             </div>
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{filtered.length} Comptes trouvés</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16 text-slate-400">
              <span className="material-symbols-outlined animate-spin text-4xl mr-3 text-moroccan-green">progress_activity</span>
              <span className="font-bold">Chargement...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-16">
              <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700 block mb-4">group_off</span>
              <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Aucun utilisateur trouvé</p>
              <button onClick={openCreate} className="mt-6 px-6 py-3 bg-moroccan-green text-white rounded-2xl font-black text-sm shadow-lg hover:bg-deep-emerald transition-all">
                Créer le premier compte
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-widest font-black border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Utilisateur</th>
                  <th className="px-6 py-4">Rôle</th>
                  <th className="px-6 py-4">Classe / Matière</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(user => (
                  <tr key={user._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-moroccan-green/10 text-moroccan-green flex items-center justify-center font-black text-sm">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 dark:text-white text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{user.phone || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roleConfig[user.role]?.color || 'bg-slate-100 text-slate-600'}`}>
                        {roleConfig[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-300">
                      {user.role === 'teacher' ? (
                        <span className="text-amber-600">{user.subject || <span className="text-slate-300">—</span>}</span>
                      ) : user.role === 'student' ? (
                        <div className="flex items-center gap-2">
                          {user.grade && user.grade !== 'N/A' ? <span>{user.grade}</span> : <span className="text-slate-300">—</span>}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 font-medium">{user.email || <span className="text-[10px] uppercase font-black text-slate-300 tracking-widest">Aucun accès</span>}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setResetModal({ open: true, userId: user._id, userName: `${user.firstName} ${user.lastName}` })} className="p-2 text-slate-400 hover:text-moroccan-gold hover:bg-moroccan-gold/10 rounded-xl transition-all" title="Réinitialiser le mot de passe">
                          <span className="material-symbols-outlined text-lg">lock_reset</span>
                        </button>
                        <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-moroccan-green hover:bg-moroccan-green/10 rounded-xl transition-all">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => setConfirmDelete(user._id)} className="p-2 text-slate-400 hover:text-moroccan-red hover:bg-moroccan-red/10 rounded-xl transition-all">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-7 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined">{editUser ? 'manage_accounts' : 'person_add'}</span>
                </div>
                <div>
                  <h2 className="text-lg font-black">{editUser ? 'Modifier le Compte' : 'Nouveau Compte'}</h2>
                  <p className="text-white/60 text-xs">{editUser ? 'Mettre à jour les informations' : 'Les identifiants seront envoyés par email'}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="w-9 h-9 bg-white/10 hover:bg-white hover:text-deep-emerald rounded-xl flex items-center justify-center transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Role picker */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rôle</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(r => (
                    <button
                      type="button"
                      key={r.value}
                      onClick={() => {
                        const isStudent = r.value === 'student';
                        const isPrimary = isStudent && ['CP', 'CE1', 'CE2', 'CM1', 'CM2'].includes(form.grade);
                        setForm(p => ({ 
                          ...p, 
                          role: r.value, 
                          grade: isStudent ? 'CP' : 'N/A', 
                          subject: r.value === 'teacher' ? '' : 'N/A',
                          hasLogin: isPrimary ? false : p.hasLogin
                        }));
                      }}
                      className={`py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-all ${form.role === r.value ? 'border-moroccan-green bg-moroccan-green/5 text-moroccan-green' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                    >
                      <span className="material-symbols-outlined text-lg">{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Prénom</label>
                  <input type="text" required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} placeholder="Ahmed" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom</label>
                  <input type="text" required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} placeholder="Alami" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all" />
                </div>
              </div>

              {/* Login toggle removed as per user request (Auto-enabled) */}


              {/* Email */}
              {((form.role !== 'student') || form.hasLogin) && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                  <input type="email" required={form.hasLogin} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="exemple@email.com" className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all" />
                </div>
              )}

              {/* Phone */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Téléphone</label>
                <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+212 6..." className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all" />
              </div>

              {/* Grade — only for students */}
              {form.role === 'student' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Classe</label>
                  <select 
                    value={form.grade} 
                    onChange={e => {
                      const newGrade = e.target.value;
                      setForm(p => ({ 
                        ...p, 
                        grade: newGrade
                      }));
                    }} 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
                  >
                    {Object.values(SCHOOL_CYCLES).map(cycle => (
                      <optgroup key={cycle.label} label={cycle.label}>
                        {cycle.levels.map(l => <option key={l} value={l}>{l}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              )}

              {/* Teacher Section */}
              {form.role === 'teacher' && (
                <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-4 bg-moroccan-gold rounded-full"></span>
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Section Enseignant</h4>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Spécialité / Matière</label>
                    <input 
                      type="text" 
                      value={form.subject} 
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} 
                      placeholder="Mathématiques, Arabe, etc." 
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Classes Assignées</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {ALL_LEVELS.filter(l => l !== 'N/A').map(level => (
                        <label key={level} className="flex items-center gap-2 p-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 cursor-pointer hover:border-moroccan-green/30 transition-all">
                          <input 
                            type="checkbox" 
                            checked={form.classes.includes(level)} 
                            onChange={() => {
                              const newClasses = form.classes.includes(level)
                                ? form.classes.filter(c => c !== level)
                                : [...form.classes, level];
                              setForm(p => ({ ...p, classes: newClasses }));
                            }}
                            className="w-4 h-4 rounded text-moroccan-green"
                          />
                          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HR Section */}
              {form.role !== 'student' && form.role !== 'parent' && (
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                    <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-widest">Section RH</h4>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Salaire Mensuel (MAD)</label>
                    <input 
                      type="number" 
                      value={form.salary || 0} 
                      onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} 
                      placeholder="ex: 5000" 
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all" 
                    />
                  </div>
                </div>
              )}

              {/* Parent */}
              {form.role === 'student' && (
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Parent Lié (Obligatoire pour les élèves)</label>
                  <select value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))} className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all">
                    <option value="">Sélectionner un parent (Optionnel)...</option>
                    {users.filter(u => u.role === 'parent').map(p => (
                      <option key={p._id} value={p._id}>{p.firstName} {p.lastName} {p.email ? `(${p.email})` : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password */}
              {((form.role !== 'student') || form.hasLogin) && (
                <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                  Mot de passe {editUser ? '(Laisser vide pour ne pas modifier)' : ''}
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={form.password || ''} 
                    onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
                    placeholder={editUser ? "******" : "Généré automatiquement si vide"} 
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all pr-12" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-moroccan-green transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              )}

              {((form.role !== 'student') || form.hasLogin) && !editUser && !form.password && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-start gap-3">
                  <span className="material-symbols-outlined text-blue-500 text-xl mt-0.5">info</span>
                  <div>
                    <p className="text-xs font-black text-blue-700 dark:text-blue-300">Mot de passe automatique</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">Un mot de passe sécurisé sera généré et envoyé à l'adresse email fournie si vous laissez le champ vide.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-2xl bg-moroccan-green text-white text-sm font-black shadow-lg shadow-moroccan-green/20 hover:bg-deep-emerald transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> En cours...</> : (editUser ? 'Enregistrer' : 'Créer & Envoyer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ChangePasswordModal 
        isOpen={resetModal.open} 
        onClose={() => setResetModal({ open: false, userId: null, userName: '' })}
        userId={resetModal.userId}
        userName={resetModal.userName}
      />
    </div>
  );
};

export default UserManagement;
