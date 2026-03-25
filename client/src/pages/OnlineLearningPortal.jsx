import React, { useState } from 'react';

const OnlineLearningPortal = () => {
  const [toast, setToast] = useState(null);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="animate-in fade-in duration-500 w-full flex flex-col font-display text-slate-900 dark:text-slate-100 bg-background-light dark:bg-background-dark -mx-4 sm:-mx-6 lg:-mx-8 -my-4 sm:-my-6 lg:-my-8 p-8 min-h-screen">

      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black`}>{toast.msg}</div>}
      {/* Dashboard Content */}
      <div className="mb-8 mt-4 sm:mt-0">
        <h2 className="text-3xl font-black text-secondary dark:text-primary leading-tight">Tableau de Bord <span className="text-lg font-normal mx-2 opacity-50">/</span> لوحة القيادة</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Bienvenue à l'Académie Atlas, Omar. Prêt pour vos cours d'aujourd'hui?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Course Overview & Performance */}
        <div className="lg:col-span-8 space-y-8">
          {/* Course Overview Card */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-secondary dark:text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">auto_stories</span>
                Aperçu des cours / نظرة عامة
              </h3>
              <button onClick={() => showToast('Chargement du planning...')} className="text-xs font-bold text-primary hover:underline">Voir tout le planning</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <span className="material-symbols-outlined">science</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter bg-green-100 text-green-700 px-2 py-1 rounded">Actif</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-primary">Sciences Naturelles (SVT)</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex-1">Chapitre 4: Écosystèmes marocains</p>
                  <div className="mt-4 flex gap-2 w-full">
                    <button className="flex-1 bg-secondary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-secondary/90 transition-colors">
                      <span className="material-symbols-outlined text-sm">download</span> Syllabus
                    </button>
                    <button className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors">
                      <span className="material-symbols-outlined text-sm">play_circle</span> Cours
                    </button>
                  </div>
                </div>
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-primary transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-primary/10 text-primary p-2 rounded-lg">
                      <span className="material-symbols-outlined">calculate</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter bg-green-100 text-green-700 px-2 py-1 rounded">Actif</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-primary">Mathématiques Avancées</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 flex-1">Calcul intégral et différentiel</p>
                  <div className="mt-4 flex gap-2 w-full">
                    <button className="flex-1 bg-secondary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-secondary/90 transition-colors">
                      <span className="material-symbols-outlined text-sm">download</span> Syllabus
                    </button>
                    <button className="flex-1 bg-primary text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors">
                      <span className="material-symbols-outlined text-sm">play_circle</span> Cours
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Exam Section */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-secondary dark:text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">quiz</span>
                Examens en ligne / الامتحانات الإلكترونية
              </h3>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-500">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Examen</th>
                    <th className="px-6 py-3 font-semibold">Date</th>
                    <th className="px-6 py-3 font-semibold">Statut</th>
                    <th className="px-6 py-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Arabe: Analyse de texte</p>
                      <p className="text-[10px] text-slate-500">Durée: 60 min</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">Demain, 09:00</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase">À venir</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-bold text-xs opacity-50 cursor-not-allowed">Préparer</button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Physique-Chimie: Quiz Hebdo</p>
                      <p className="text-[10px] text-slate-500">Durée: 20 min</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">En cours</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold uppercase">En cours</span>
                    </td>
                     <td className="px-6 py-4 text-right">
                       <button onClick={() => showToast('Lancement de l\'examen...')} className="bg-primary text-white px-4 py-1.5 rounded-lg font-bold text-xs hover:bg-primary/90 transition-colors">Lancer</button>
                     </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Histoire-Géo: Terme 1</p>
                      <p className="text-[10px] text-slate-500">Durée: 120 min</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">12 Mai 2024</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase">Complété</span>
                    </td>
                    <td className="px-6 py-4 text-right text-green-600 font-bold">18.5/20</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Column: Assignments & Resources */}
        <div className="lg:col-span-4 space-y-8">
          {/* Performance Tracking */}
          <section className="bg-secondary text-white rounded-xl p-6 shadow-lg relative overflow-hidden h-48 flex flex-col justify-center">
            <div className="relative z-10">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Performance / الأداء
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-white">92%</span>
                <span className="text-xs text-white/80 mb-1">Moyenne Globale</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-4 overflow-hidden">
                <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-[10px] mt-4 opacity-70">En hausse de 4% par rapport au mois dernier</p>
            </div>
            <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl opacity-10 pointer-events-none select-none">trending_up</span>
          </section>

          {/* Assignments Area */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-secondary dark:text-primary">Devoirs / الواجبات</h3>
              <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">4</span>
            </div>
            <div className="p-6 space-y-4 flex-1">
              <div className="flex gap-4 p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 rounded-r-lg">
                <span className="material-symbols-outlined text-red-500">priority_high</span>
                <div>
                  <p className="text-xs font-black text-red-900 dark:text-red-100">Dissertation Français</p>
                  <p className="text-[10px] text-red-700 dark:text-red-400 font-black tracking-widest uppercase">À rendre aujourd'hui</p>
                </div>
              </div>
              <div className="flex gap-4 p-3 border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/10 rounded-r-lg">
                <span className="material-symbols-outlined text-amber-500">pending_actions</span>
                <div>
                  <p className="text-xs font-black text-amber-900 dark:text-amber-100">Exercices Algèbre</p>
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 font-black tracking-widest uppercase">Échéance: 3 jours</p>
                </div>
              </div>
              <div className="flex gap-4 p-3 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10 rounded-r-lg">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <div>
                  <p className="text-xs font-black text-green-900 dark:text-green-100">Projet Info: Python</p>
                  <p className="text-[10px] text-green-700 dark:text-green-400 font-black tracking-widest uppercase">Noté: A+ (19/20)</p>
                </div>
              </div>
            </div>
             <button onClick={() => showToast('Gestion des devoirs...')} className="w-full py-4 text-xs font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800 hover:text-primary transition-colors bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">Gérer tous les devoirs</button>
          </section>

          {/* Resources Library */}
          <section className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-secondary dark:text-primary flex items-center gap-2">
                <span className="material-symbols-outlined">library_books</span>
                Ressources / الموارد
              </h3>
            </div>
            <div className="p-4 space-y-2">
              <a className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors" href="#!">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Guide de l'étudiant 2024</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm transition-colors cursor-pointer">download</span>
              </a>
              <a className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors" href="#!">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-500">video_library</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Tuto: Utilisation du labo</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm transition-colors cursor-pointer">open_in_new</span>
              </a>
              <a className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg group transition-colors" href="#!">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">link</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Bibliothèque numérique</span>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm transition-colors cursor-pointer">open_in_new</span>
              </a>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 p-8 border-t border-slate-200 dark:border-slate-800 text-center text-slate-400 text-xs">
        <p>© 2024 Atlas Academy Morocco. Excellence & Tradition. | 2024 أكاديمية أطلس المغربية. التميز والتقاليد</p>
      </footer>
    </div>
  );
};

export default OnlineLearningPortal;
