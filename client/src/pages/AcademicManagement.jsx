import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import subjectService from '../services/subjectService';
import userService from '../services/userService';
import { SCHOOL_CYCLES } from '../constants/schoolLevels';

const AcademicManagement = () => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('subjects');
  const [toast, setToast] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', teacher: '', grade: 'CP' });
  const fileInputRef = useRef(null);

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editingSubject, setEditingSubject] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const ALL_GRADES = Object.values(SCHOOL_CYCLES).flatMap(c => c.levels);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subs, users] = await Promise.all([
        subjectService.getAll(),
        userService.getAll()
      ]);
      setSubjects(subs);
      setTeachers(users.filter(u => u.role === 'teacher'));
    } catch {
      showToast('Erreur lors du chargement des données.', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { 
        name: subjectForm.name, 
        teacherId: subjectForm.teacher, 
        grade: subjectForm.grade 
      };

      if (editingSubject) {
        const updated = await subjectService.update(editingSubject._id, payload);
        setSubjects(prev => prev.map(s => s._id === updated._id ? updated : s));
        showToast('Matière mise à jour ✓');
      } else {
        const created = await subjectService.create(payload);
        setSubjects(prev => [...prev, created]);
        showToast('Matière créée ✓');
      }
      setShowSubjectModal(false);
      setEditingSubject(null);
      setSubjectForm({ name: '', teacher: '', grade: 'CP' });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  const lessonPlans = [
    { id: 101, title: 'Calculus Introduction', subject: 'Mathematics', date: '2023-11-20', type: 'PDF' },
    { id: 102, title: 'Quantum Mechanics Basics', subject: 'Physics', date: '2023-11-22', type: 'DOCX' },
  ];

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {/* Toast */}
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black`}>{toast.msg}</div>}

      <input ref={fileInputRef} type="file" className="hidden" />

      {/* New Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white">
              <h2 className="text-xl font-black">{editingSubject ? 'Modifier la Matière' : 'Nouvelle Matière'}</h2>
              <button onClick={() => { setShowSubjectModal(false); setEditingSubject(null); }} className="text-white hover:text-white/70 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Nom de la matière</label>
                <input value={subjectForm.name} onChange={e => setSubjectForm(p => ({...p, name: e.target.value}))} placeholder="ex: Mathématiques" required className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-moroccan-green/30 outline-none transition-all"/>
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Enseignant Responsable</label>
                <select required value={subjectForm.teacher} onChange={e => setSubjectForm(p => ({...p, teacher: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none">
                  <option value="">Sélectionner un enseignant...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Niveau</label>
                <select value={subjectForm.grade} onChange={e => setSubjectForm(p => ({...p, grade: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none">
                  {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowSubjectModal(false); setEditingSubject(null); }} className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 rounded-xl bg-moroccan-green text-white text-sm font-black shadow-lg shadow-moroccan-green/20 disabled:opacity-50">
                   {submitting ? 'Enregistrement...' : (editingSubject ? 'Enregistrer' : 'Ajouter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
             <span className="w-2 h-8 bg-moroccan-green rounded-full"></span>
             Gestion Académique
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest">
            {loading ? 'Chargement des modules...' : `${subjects.length} Matières déclarées`}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowSubjectModal(true)} className="bg-moroccan-green text-white px-7 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 hover:opacity-90 shadow-xl shadow-moroccan-green/20 transition-all uppercase tracking-widest transform hover:-translate-y-1">
            <span className="material-symbols-outlined">add_circle</span>
            Déclarer une Matière
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: 'book', label: 'Total Matières', val: subjects.length, color: 'moroccan-green' },
          { icon: 'engineering', label: 'Progrès Global', val: subjects.length ? `${Math.round(subjects.reduce((a,b)=>a+b.progress,0)/subjects.length)}%` : '0%', color: 'moroccan-gold' },
          { icon: 'error', label: 'Matières Critiques', val: subjects.filter(s => s.status === 'Critical').length, color: 'moroccan-red' }
        ].map(st => (
          <div key={st.label} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 border-l-4 border-l-${st.color}`}>
            <div className={`w-12 h-12 rounded-2xl bg-${st.color}/10 text-${st.color} flex items-center justify-center`}>
              <span className="material-symbols-outlined text-2xl">{st.icon}</span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{st.label}</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">{loading ? '...' : st.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800">
          {['subjects', 'plans'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-moroccan-green' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}>
              {tab === 'subjects' ? 'Matières' : 'Plans de Cours'}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-moroccan-green rounded-t-full shadow-[0_-4px_8px_rgba(26,60,52,0.3)]"></div>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-4">
            <span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Initialisation des données...</p>
          </div>
        ) : activeTab === 'subjects' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.length === 0 ? (
               <div className="lg:col-span-3 p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                  <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">library_books</span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune matière enregistrée</p>
               </div>
            ) : subjects.map((s) => (
              <div key={s._id} className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-moroccan-green/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex justify-between items-start mb-6 relative">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-moroccan-green group-hover:text-white transition-all shadow-inner">
                    <span className="material-symbols-outlined text-2xl">menu_book</span>
                  </div>
                  <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-widest shadow-sm border ${
                    s.status === 'Critical' ? 'bg-moroccan-red text-white border-moroccan-red/20' : 
                    s.status === 'Behind'   ? 'bg-moroccan-gold text-white border-moroccan-gold/20' : 
                    'bg-green-50 text-moroccan-green border-moroccan-green/10'
                  }`}>
                    {s.status}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 group-hover:text-moroccan-green transition-colors">{s.name}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">person_outline</span>
                  {s.teacher?.firstName} {s.teacher?.lastName} · <span className="text-moroccan-gold">{s.grade}</span>
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>Progrès du Syllabus</span>
                    <span className="text-slate-600 dark:text-slate-300">{s.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        s.status === 'Critical' ? 'bg-moroccan-red animate-pulse' : 
                        s.status === 'Behind'   ? 'bg-moroccan-gold' : 'bg-moroccan-green'
                      }`}
                      style={{ width: `${s.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 mt-8 py-2">
                  <button 
                    onClick={() => {
                      setEditingSubject(s);
                      setSubjectForm({ name: s.name, teacher: s.teacher?._id, grade: s.grade });
                      setShowSubjectModal(true);
                    }} 
                    className="flex-1 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:bg-moroccan-green/10 hover:text-moroccan-green transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Éditer
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Supprimer cette matière ?')) {
                        try {
                          await subjectService.remove(s._id);
                          setSubjects(prev => prev.filter(x => x._id !== s._id));
                          showToast('Matière supprimée');
                        } catch {
                           showToast('Erreur lors de la suppression', 'bg-moroccan-red');
                        }
                      }
                    }} 
                    className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-300 hover:text-moroccan-red hover:bg-moroccan-red/10 transition-all"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
             <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-4 scale-150">upload_file</span>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Connectez un service de stockage pour activer les plans de cours</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicManagement;
