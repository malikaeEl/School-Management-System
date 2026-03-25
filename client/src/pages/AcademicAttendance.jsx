import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import subjectService from '../services/subjectService';
import userService from '../services/userService';
import attendanceService from '../services/attendanceService';

const AcademicAttendance = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'Present' | 'Absent' }
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const isTeacher = user?.role === 'teacher';

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await subjectService.getAll();
        // If teacher, only show their subjects
        const filtered = isTeacher ? data.filter(s => s.teacher?._id === user._id) : data;
        setSubjects(filtered);
      } catch {
        showToast('Erreur lors du chargement des matières.', 'bg-moroccan-red');
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, [isTeacher, user?._id]);

  const openModal = async (subject) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
    setLoading(true);
    try {
      const allUsers = await userService.getAll();
      const gradeStudents = allUsers.filter(u => u.role === 'student' && u.grade === subject.grade);
      setStudents(gradeStudents);
      
      // Initialize attendance state
      const initial = {};
      gradeStudents.forEach(s => { initial[s._id] = 'Present'; });
      setAttendanceData(initial);
    } catch {
      showToast('Erreur lors du chargement des élèves.', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formatted = Object.entries(attendanceData).map(([id, status]) => ({
        studentId: id,
        status
      }));
      await attendanceService.submit(selectedSubject._id, formatted);
      showToast('Présence enregistrée avec succès ✓');
      setIsModalOpen(false);
    } catch {
      showToast('Erreur lors de l\'enregistrement.', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black animate-in slide-in-from-right`}>{toast.msg}</div>}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
             <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
             Suivi de Présence
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase text-[10px] tracking-[0.2em]">
             Gestion des sessions quotidiennes et validation de la présence
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-white px-6 py-2.5 rounded-xl text-sm font-black hover:bg-slate-50 transition-all border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-xl">print</span>
              {t('print') || 'Imprimer Registre'}
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-moroccan-green">check_circle</span>
                Sessions Disponibles
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mt-1 uppercase tracking-widest text-[10px]">
                 Sélectionnez une matière pour démarrer l'appel
              </p>
            </div>
            <div className={`flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-[10px] font-black px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase tracking-widest text-slate-500`}>
               <span className="material-symbols-outlined text-sm">schedule</span>
               {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {subjects.length === 0 ? (
               <div className="lg:col-span-2 p-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl opacity-50">
                  <span className="material-symbols-outlined text-4xl mb-4">event_busy</span>
                  <p className="text-xs font-black uppercase tracking-widest">Aucune session programmée</p>
               </div>
            ) : subjects.map((s) => (
              <div key={s._id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-6 hover:shadow-xl transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-moroccan-green/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex-1 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black bg-moroccan-gold text-white px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm">{s.grade}</span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Session Ouverte</span>
                  </div>
                  <h4 className="font-black text-slate-800 dark:text-white text-2xl leading-tight mb-2">{s.name}</h4>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">person</span> {s.teacher?.firstName} {s.teacher?.lastName}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0 relative">
                  {isTeacher ? (
                    <button 
                      onClick={() => openModal(s)}
                      className="bg-moroccan-green text-white px-8 py-4 rounded-2xl text-xs font-black hover:opacity-90 transition-all shadow-xl shadow-moroccan-green/20 flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-xl">how_to_reg</span>
                      <span>Faire l'appel</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => openModal(s)}
                      className="bg-slate-50 dark:bg-slate-800 text-slate-500 px-8 py-4 rounded-2xl text-xs font-black border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2 uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-xl">visibility</span>
                      <span>Consulter</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-emerald/80 backdrop-blur-xl">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white relative">
              <div className="z-10 flex items-center gap-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                   <span className="material-symbols-outlined text-3xl text-moroccan-gold">checklist</span>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Registre d'appel</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{selectedSubject?.name} <span className="text-moroccan-gold opacity-100">· {selectedSubject?.grade}</span></h2>
                </div>
              </div>
              <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white text-white hover:text-deep-emerald transition-all z-10" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
              <div className="absolute inset-0 zellige-pattern opacity-10 pointer-events-none"></div>
            </div>

            <div className="max-h-[55vh] overflow-y-auto p-8 custom-scrollbar space-y-4 bg-slate-50/30 dark:bg-slate-900/50">
                {loading ? (
                   <div className="py-20 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green">progress_activity</span></div>
                ) : students.length === 0 ? (
                   <div className="py-20 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">Aucun élève trouvé pour ce niveau</div>
                ) : students.map((s, i) => (
                  <div key={s._id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl hover:shadow-md transition-all group/row">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center font-black text-slate-400 group-hover/row:bg-moroccan-green group-hover/row:text-white transition-all shadow-inner">
                         {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 dark:text-white">{s.firstName} {s.lastName}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">ID: #{s._id?.slice(-6)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                       <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                          <button 
                            disabled={!isTeacher}
                            onClick={() => handleStatusChange(s._id, 'Present')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${attendanceData[s._id] === 'Present' ? 'bg-moroccan-green text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                            Présent
                          </button>
                          <button 
                            disabled={!isTeacher}
                            onClick={() => handleStatusChange(s._id, 'Absent')}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${attendanceData[s._id] === 'Absent' ? 'bg-moroccan-red text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                            Absent
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                 {Object.values(attendanceData).filter(v => v === 'Present').length} Présents · {Object.values(attendanceData).filter(v => v === 'Absent').length} Absents
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest" onClick={() => setIsModalOpen(false)}>
                  Fermer
                </button>
                {isTeacher && students.length > 0 && (
                  <button 
                    disabled={submitting}
                    onClick={handleSubmit} 
                    className="px-10 py-3.5 text-xs font-black text-white bg-moroccan-green rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-moroccan-green/20 flex items-center gap-2 uppercase tracking-widest disabled:opacity-50"
                  >
                     {submitting ? 'Validation...' : 'Valider Présence'}
                     <span className="material-symbols-outlined text-sm">check_circle</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicAttendance;
