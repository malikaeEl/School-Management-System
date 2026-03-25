import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import examService from '../services/examService';
import subjectService from '../services/subjectService';
import userService from '../services/userService';
import { ALL_LEVELS } from '../constants/schoolLevels';

const ExamsGrades = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [examForm, setExamForm] = useState({ title: '', subjectId: '', date: '', duration: '2h', type: 'Contrôle', grade: 'CP' });
  
  // For Marks Tab
  const [selectedExamId, setSelectedExamId] = useState('');
  const [examStudents, setExamStudents] = useState([]);
  const [marksData, setMarksData] = useState({}); // { studentId: { score, comments } }
  const [marksLoading, setMarksLoading] = useState(false);

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStaff = isTeacher || isAdmin;

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examsData, subjectsData] = await Promise.all([
        examService.getAll(),
        isStaff ? subjectService.getAll() : Promise.resolve([])
      ]);
      setExams(examsData);
      setSubjects(subjectsData);
    } catch {
      showToast('Erreur chargement données.', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await examService.create({
        ...examForm,
        subject: examForm.subjectId
      });
      showToast('Examen planifié ✓');
      setShowModal(false);
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur planification.', 'bg-moroccan-red');
    }
  };

  const handleExamChangeForMarks = async (examId) => {
    setSelectedExamId(examId);
    if (!examId) return;
    setMarksLoading(true);
    try {
      const exam = exams.find(e => e._id === examId);
      const [allUsers, existingGrades] = await Promise.all([
        userService.getAll(),
        examService.getGrades(examId)
      ]);
      
      const studentsInGrade = allUsers.filter(u => u.role === 'student' && u.grade === exam.grade);
      setExamStudents(studentsInGrade);
      
      const marks = {};
      studentsInGrade.forEach(s => {
        const grade = existingGrades.find(g => g.student._id === s._id);
        marks[s._id] = { score: grade?.score || '', comments: grade?.comments || '' };
      });
      setMarksData(marks);
    } catch {
      showToast('Erreur chargement élèves/notes.', 'bg-moroccan-red');
    } finally {
      setMarksLoading(false);
    }
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleSubmitMarks = async () => {
    try {
      const formatted = Object.entries(marksData).map(([id, data]) => ({
        studentId: id,
        score: Number(data.score),
        comments: data.comments
      })).filter(m => !isNaN(m.score));
      
      await examService.submitGrades(selectedExamId, formatted);
      showToast('Notes enregistrées ✓');
    } catch {
      showToast('Erreur enregistrement notes.', 'bg-moroccan-red');
    }
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right`}>{toast.msg}</div>}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
             <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
             Examens & Notes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest leading-relaxed">
             Gestion des évaluations académiques et suivi des performances
          </p>
        </div>
        {isStaff && (
          <button onClick={() => setShowModal(true)} className="bg-moroccan-green text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-moroccan-green/20 hover:opacity-90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">event_available</span>
            Programmer
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-3xl w-fit border border-slate-200 dark:border-slate-700 backdrop-blur-sm self-start">
        <button onClick={() => setActiveTab('schedule')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'schedule' ? 'bg-white dark:bg-slate-900 text-moroccan-green shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Examens</button>
        {isStaff && <button onClick={() => setActiveTab('marks')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'marks' ? 'bg-white dark:bg-slate-900 text-moroccan-green shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Saisir Notes</button>}
      </div>

      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full py-20 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green">progress_activity</span></div>
          ) : exams.length === 0 ? (
             <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-50 uppercase text-[10px] font-black tracking-widest">Aucun examen programmé</div>
          ) : exams.map(exam => (
            <div key={exam._id} className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-moroccan-green/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
               <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <p className="text-[9px] font-black text-moroccan-gold uppercase tracking-widest mb-1">{exam.subject?.name} · {exam.grade}</p>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{exam.title}</h3>
                     </div>
                     <span className="text-[9px] font-black px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">{exam.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> {new Date(exam.date).toLocaleDateString()} · {exam.duration}</span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">person</span> {exam.teacher?.firstName} {exam.teacher?.lastName}
                     </span>
                     <button className="text-[10px] font-black text-moroccan-green uppercase tracking-widest hover:underline">Détails</button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'marks' && (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
           <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex-1 w-full max-w-md">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sélectionner l'Examen</label>
                 <select 
                   value={selectedExamId}
                   onChange={(e) => handleExamChangeForMarks(e.target.value)}
                   className="w-full bg-white dark:bg-slate-900 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-800 outline-none"
                 >
                    <option value="">-- Choisir un examen --</option>
                    {exams.filter(e => isTeacher ? e.teacher?._id === user._id : true).map(e => (
                      <option key={e._id} value={e._id}>{e.title} ({e.subject?.name} - {e.grade})</option>
                    ))}
                 </select>
              </div>
              {selectedExamId && (
                <button onClick={handleSubmitMarks} className="bg-moroccan-gold text-deep-emerald px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-moroccan-gold/20 hover:brightness-105 transition-all">
                   Enregistrer les Notes
                </button>
              )}
           </div>
           
           <div className="overflow-x-auto min-h-[400px]">
              {marksLoading ? (
                 <div className="py-40 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green">progress_activity</span></div>
              ) : !selectedExamId ? (
                 <div className="py-40 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">Veuillez sélectionner un examen pour saisir les notes</div>
              ) : examStudents.length === 0 ? (
                 <div className="py-40 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">Aucun élève trouvé pour ce niveau</div>
              ) : (
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-8 py-5">Élève</th>
                      <th className="px-8 py-5">Note (/20)</th>
                      <th className="px-8 py-5">Observations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {examStudents.map(s => (
                      <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="px-8 py-4">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 uppercase text-xs">
                                 {s.firstName?.[0]}{s.lastName?.[0]}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-800 dark:text-white uppercase">{s.firstName} {s.lastName}</p>
                                 <p className="text-[9px] text-slate-400 font-black tracking-tighter italic">ID: #{s._id?.slice(-6)}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-4">
                           <input 
                             type="number" 
                             min="0" max="20"
                             value={marksData[s._id]?.score} 
                             onChange={(e) => handleMarkChange(s._id, 'score', e.target.value)}
                             className="w-20 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-sm font-black text-slate-800 dark:text-white border-2 border-transparent focus:border-moroccan-green outline-none transition-all" />
                        </td>
                        <td className="px-8 py-4">
                           <input 
                             type="text" 
                             placeholder="Observation..."
                             value={marksData[s._id]?.comments} 
                             onChange={(e) => handleMarkChange(s._id, 'comments', e.target.value)}
                             className="w-full max-w-sm bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border-2 border-transparent focus:border-moroccan-green outline-none transition-all" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
           </div>
        </div>
      )}

      {/* Modal Add Exam */}
      {showModal && (
        <div className="fixed inset-0 bg-deep-emerald/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white">
              <h2 className="text-xl font-black uppercase tracking-tight">Planifier un Examen</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-white/70 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleCreateExam} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Titre</label>
                <input required value={examForm.title} onChange={e => setExamForm(p => ({...p, title: e.target.value}))} placeholder="ex: Contrôle n°1" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white text-sm focus:outline-none"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Niveau</label>
                  <select value={examForm.grade} onChange={e => setExamForm(p => ({...p, grade: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white text-sm focus:outline-none">
                     {ALL_LEVELS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</label>
                  <input required type="date" value={examForm.date} onChange={e => setExamForm(p => ({...p, date: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white text-sm focus:outline-none"/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Matière</label>
                <select required value={examForm.subjectId} onChange={e => setExamForm(p => ({...p, subjectId: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white text-sm focus:outline-none">
                   <option value="">-- Choisir --</option>
                   {subjects.filter(s => s.grade === examForm.grade).map(s => <option key={s._id} value={s._id}>{s.name} ({s.teacher?.firstName})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Type</label>
                  <select value={examForm.type} onChange={e => setExamForm(p => ({...p, type: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white text-sm focus:outline-none">
                    {['Contrôle', 'Examen Blanc', 'Examen Final', 'Test'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Durée</label>
                  <input value={examForm.duration} onChange={e => setExamForm(p => ({...p, duration: e.target.value}))} placeholder="ex: 2h" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 dark:text-white text-sm focus:outline-none"/>
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest">Annuler</button>
                <button type="submit" className="flex-1 py-3 bg-moroccan-green text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-moroccan-green/20 hover:opacity-90 transition-all">Programmer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamsGrades;
