import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import subjectService from '../services/subjectService';
import userService from '../services/userService';
import { SCHOOL_CYCLES } from '../constants/schoolLevels';

const AcademicManagement = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  
  const [activeTab, setActiveTab] = useState('subjects');
  const [toast, setToast] = useState(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', teacher: '', grade: 'CP' });
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [uploadingSubjectId, setUploadingSubjectId] = useState(null);
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
      setAllUsers(users);
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
      setSubjectForm({ name: '', teacher: '', grade: selectedGrade || 'CP' });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (subjectId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSubjectId(subjectId);
    try {
      const updatedSubject = await subjectService.uploadMaterial(subjectId, file);
      setSubjects(prev => prev.map(s => s._id === subjectId ? updatedSubject : s));
      showToast('Document ajouté avec succès', 'bg-moroccan-green');
    } catch (err) {
      showToast(err.response?.data?.message || 'Erreur lors du téléchargement', 'bg-moroccan-red');
    } finally {
      setUploadingSubjectId(null);
      e.target.value = null; // Reset input value
    }
  };

  const handleDeleteMaterial = async (subjectId, materialId) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    try {
      const updatedSubject = await subjectService.deleteMaterial(subjectId, materialId);
      setSubjects(prev => prev.map(s => s._id === subjectId ? updatedSubject : s));
      showToast('Document supprimé', 'bg-moroccan-green');
    } catch (err) {
      showToast('Erreur lors de la suppression', 'bg-moroccan-red');
    }
  };

  const filteredSubjects = subjects.filter(s => s.grade === selectedGrade);

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {/* Toast */}
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest`}>{toast.msg}</div>}

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
            {loading ? 'Chargement des modules...' : (selectedGrade ? `${filteredSubjects.length} Matière(s) en ${selectedGrade}` : 'Sélectionnez une classe pour commencer')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {selectedGrade && (
            <button 
              onClick={() => setSelectedGrade(null)}
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-black text-moroccan-green uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:bg-moroccan-green/5 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">grid_view</span>
              Changer de Classe
            </button>
          )}
          {selectedGrade && !isTeacher && (
            <button onClick={() => { setSubjectForm(p => ({...p, grade: selectedGrade})); setShowSubjectModal(true); }} className="bg-moroccan-green text-white px-7 py-3.5 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 hover:opacity-90 shadow-xl shadow-moroccan-green/20 transition-all uppercase tracking-widest transform hover:-translate-y-1">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Déclarer une Matière
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {!selectedGrade ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="text-center py-6">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Gestion par Classe</h2>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Sélectionnez un niveau pour voir les matières, élèves et l'équipe pédagogique</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(SCHOOL_CYCLES).map(([key, cycle]) => (
                <div key={key} className="space-y-4">
                   <div className="flex items-center gap-3 px-2">
                      <span className="w-1.5 h-6 bg-moroccan-gold rounded-full"></span>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{cycle.label}</h3>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                      {cycle.levels.map(level => (
                        <button 
                          key={level}
                          onClick={() => setSelectedGrade(level)}
                          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-moroccan-green transition-all flex items-center justify-between group overflow-hidden relative"
                        >
                           <div className="absolute inset-0 bg-moroccan-green/0 group-hover:bg-moroccan-green/5 transition-colors"></div>
                           <div className="relative z-10">
                              <span className="text-sm font-black text-slate-800 dark:text-white group-hover:text-moroccan-green transition-colors">{level}</span>
                              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                                {subjects.filter(s => s.grade === level).length} Matières
                              </p>
                           </div>
                           <span className="material-symbols-outlined text-slate-200 group-hover:text-moroccan-green transition-all transform group-hover:translate-x-1">chevron_right</span>
                        </button>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: 'book', label: 'Total Matières', val: filteredSubjects.length, color: 'text-moroccan-green', border: 'border-l-moroccan-green' },
              { icon: 'groups', label: 'Enseignants affectés', val: new Set(filteredSubjects.map(s => s.teacher?._id)).size, color: 'text-moroccan-gold', border: 'border-l-moroccan-gold' },
              { icon: 'school', label: 'Élèves inscrits', val: allUsers.filter(u => u.role === 'student' && u.grade === selectedGrade).length, color: 'text-deep-emerald', border: 'border-l-deep-emerald' },
            ].map(st => (
              <div key={st.label} className={`bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 border-l-4 ${st.border}`}>
                <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 ${st.color} flex items-center justify-center`}>
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
            <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
              {[
                { id: 'subjects', label: 'Matières' },
                { id: 'plans', label: 'Plans de Cours' },
                { id: 'students', label: 'Élèves' },
                { id: 'team', label: 'Équipe Pédagogique' }
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 px-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-moroccan-green' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'}`}>
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-moroccan-green rounded-t-full shadow-[0_-4px_8px_rgba(26,60,52,0.3)]"></div>}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-20 text-center flex flex-col items-center gap-4">
                <span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Chargement...</p>
              </div>
            ) : activeTab === 'subjects' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSubjects.length === 0 ? (
                   <div className="lg:col-span-3 p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                      <span className="material-symbols-outlined text-5xl text-slate-200 mb-2">library_books</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aucune matière enregistrée pour {selectedGrade}</p>
                   </div>
                ) : filteredSubjects.map((s) => (
                  <div key={s._id} className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-moroccan-green/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="flex justify-between items-start mb-6 relative">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-moroccan-green group-hover:text-white transition-all shadow-inner">
                        <span className="material-symbols-outlined text-2xl">menu_book</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 group-hover:text-moroccan-green transition-colors">{s.name}</h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">person_outline</span>
                      {s.teacher?.firstName} {s.teacher?.lastName} · <span className="text-moroccan-gold">{s.grade}</span>
                    </p>

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
                      {!isTeacher && (
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : activeTab === 'plans' ? (
              <div className="flex flex-col gap-6">
                {filteredSubjects.length === 0 ? (
                   <div className="bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 p-20 text-center">
                      <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-800 mb-4 scale-150">upload_file</span>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Connectez un service de stockage pour activer les plans de cours</p>
                   </div>
                ) : filteredSubjects.map(s => (
                   <div key={`mat-${s._id}`} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
                     <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <span className="w-2 h-6 bg-moroccan-green rounded-full"></span>
                           <h3 className="text-xl font-black text-slate-800 dark:text-white">{s.name}</h3>
                         </div>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-4">{s.grade} · {s.teacher?.firstName} {s.teacher?.lastName}</p>
                       </div>
                       
                       {isTeacher && (
                         <div className="relative">
                           <input 
                              type="file" 
                              id={`file-${s._id}`}
                              className="hidden" 
                              onChange={(e) => handleFileUpload(s._id, e)} 
                              disabled={uploadingSubjectId === s._id}
                           />
                           <label 
                              htmlFor={`file-${s._id}`}
                              className={`px-6 py-2.5 rounded-xl border border-dashed text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-2 ${
                                uploadingSubjectId === s._id ? 'border-slate-200 text-slate-400 cursor-wait bg-slate-50' : 'bg-green-50/50 border-moroccan-green/30 text-moroccan-green hover:bg-moroccan-green hover:text-white cursor-pointer'
                              }`}
                           >
                              <span className="material-symbols-outlined text-sm">{uploadingSubjectId === s._id ? 'hourglass_empty' : 'cloud_upload'}</span>
                              {uploadingSubjectId === s._id ? 'Upload...' : 'Ajouter un Document'}
                           </label>
                         </div>
                       )}
                     </div>
    
                     <div className="space-y-2">
                       {s.materials?.length > 0 ? (
                         s.materials.map(m => (
                           <div key={m._id} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group/doc">
                             <div className="flex items-center gap-4 truncate">
                               <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-moroccan-gold shadow-sm shrink-0">
                                 <span className="material-symbols-outlined text-xl">description</span>
                               </div>
                               <div className="truncate">
                                 <p className="text-sm font-black text-slate-800 dark:text-white truncate">{m.title}</p>
                                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Ajouté le {new Date(m.uploadedAt).toLocaleDateString()}</p>
                               </div>
                             </div>
                             <div className="flex items-center gap-2 shrink-0">
                               <a 
                                 href={`http://localhost:5000${m.url}`} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-400 hover:text-moroccan-green hover:shadow-sm border border-slate-100 dark:border-slate-600 transition-all"
                               >
                                 <span className="material-symbols-outlined text-[18px]">download</span>
                               </a>
                               {isTeacher && (
                                 <button 
                                   onClick={() => handleDeleteMaterial(s._id, m._id)}
                                   className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 text-slate-400 hover:text-moroccan-red hover:shadow-sm border border-slate-100 dark:border-slate-600 transition-all"
                                 >
                                   <span className="material-symbols-outlined text-[18px]">delete</span>
                                 </button>
                               )}
                             </div>
                           </div>
                         ))
                       ) : (
                         <div className="p-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucun document attaché à cette matière</p>
                         </div>
                       )}
                     </div>
                   </div>
                ))}
              </div>
            ) : activeTab === 'students' ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 dark:border-slate-800">
                       <tr>
                          <th className="px-6 py-4">Élève</th>
                          <th className="px-6 py-4">Contact</th>
                          <th className="px-6 py-4">Parent</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {allUsers.filter(u => u.role === 'student' && u.grade === selectedGrade).map(s => (
                          <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-moroccan-green/10 text-moroccan-green flex items-center justify-center font-black text-xs uppercase">{s.firstName[0]}{s.lastName[0]}</div>
                                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.firstName} {s.lastName}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className="text-xs font-medium text-slate-500">{s.phone || 'N/A'}</span>
                             </td>
                             <td className="px-6 py-4">
                                {allUsers.find(p => p._id === s.parentId) ? (
                                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">{allUsers.find(p => p._id === s.parentId).firstName} {allUsers.find(p => p._id === s.parentId).lastName}</span>
                                ) : <span className="text-xs text-slate-300 italic">Non lié</span>}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            ) : activeTab === 'team' ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allUsers.filter(u => u.role === 'teacher' && u.classes?.includes(selectedGrade)).map(t => (
                     <div key={t._id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center">
                           <span className="material-symbols-outlined">person_book</span>
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase">{t.firstName} {t.lastName}</h4>
                           <p className="text-[10px] font-bold text-moroccan-green uppercase tracking-widest">{t.subject || 'Enseignant'}</p>
                        </div>
                     </div>
                  ))}
               </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicManagement;
