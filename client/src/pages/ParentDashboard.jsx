import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';

const ParentDashboard = () => {
  const { lang, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChildId, setActiveChildId] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getDashboardData();
        setData(res);
        if (res.children && res.children.length > 0) {
          setActiveChildId(res.children[0]._id);
        }
      } catch (err) {
        console.error('Error fetching parent dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-4xl text-moroccan-green">progress_activity</span>
      </div>
    );
  }

  const { profile, children } = data || {};
  const activeChild = children?.find(c => c._id === activeChildId);

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Overview Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Tableau de Bord Parent
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-black tracking-widest leading-loose">
            Bienvenue {profile?.firstName}, suivi de la progression de vos enfants.
          </p>
        </div>
        
        {children?.length > 0 && (
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50">
             {children.map(child => (
               <button 
                 key={child._id}
                 onClick={() => setActiveChildId(child._id)}
                 className={`${activeChildId === child._id ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400'} px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}
               >
                 {child.firstName} ({child.grade})
               </button>
             ))}
          </div>
        )}
      </div>

      {!activeChild ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">child_care</span>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aucun enfant lié à ce compte</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-8">
             {/* Recent Grades/Exams */}
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className="flex justify-between items-center mb-10">
                   <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                      <span className="w-2 h-6 bg-moroccan-green rounded-full"></span>
                      Examens & Résultats de {activeChild.firstName}
                   </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {activeChild.exams?.length > 0 ? activeChild.exams.map((exam, i) => (
                     <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all flex justify-between items-center group/card">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{exam.subject?.name}</p>
                           <p className="text-[11px] font-bold text-slate-800 uppercase">{exam.title}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-moroccan-gold uppercase tracking-widest">{new Date(exam.date).toLocaleDateString()}</span>
                        </div>
                     </div>
                   )) : (
                     <p className="col-span-2 text-center text-[10px] font-black text-slate-300 uppercase py-8">Aucun examen récent</p>
                   )}
                </div>
             </div>

             {/* Subjects & Progress */}
             <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
                <div className="flex justify-between items-center mb-10 relative z-10">
                   <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                      <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
                      Matières & Progrès
                   </h3>
                </div>
                <div className="space-y-6 relative z-10">
                   {activeChild.subjects?.map((sub, idx) => (
                      <div key={idx} className="space-y-2">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                           <span>{sub.name}</span>
                           <span className="text-moroccan-gold">{sub.progress}%</span>
                         </div>
                         <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                           <div className="h-full bg-moroccan-gold rounded-full" style={{ width: `${sub.progress}%` }}></div>
                         </div>
                      </div>
                   ))}
                </div>
                <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[180px] text-white/5 pointer-events-none group-hover:rotate-12 transition-transform duration-700">menu_book</span>
             </div>
          </div>

          {/* Sidebar Widgets (Attendance) */}
          <div className="space-y-8">
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-8">Présence</h3>
                <div className="space-y-4">
                   {activeChild.attendance?.length > 0 ? activeChild.attendance.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                         <div className="min-w-0">
                            <p className="text-[10px] font-black text-slate-800 truncate uppercase">{p.subject?.name}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{new Date(p.date).toLocaleDateString()}</p>
                         </div>
                         <div className="text-right shrink-0">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${p.students.find(s => s.student === activeChild._id)?.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {p.students.find(s => s.student === activeChild._id)?.status}
                            </span>
                         </div>
                      </div>
                   )) : (
                     <p className="text-center text-[10px] font-black text-slate-300 uppercase py-8">Aucun relevé</p>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
