import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import dashboardService from '../services/dashboardService';
import { getSubjectBorderStyle, getSubjectAccentStyle } from '../utils/subjectColors';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const { lang, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChildId, setActiveChildId] = useState(null);
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('academic'); // 'academic', 'schedule', 'finance'

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

  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open('', '_blank');
    if(!printWindow) return alert('Veuillez autoriser les pop-ups pour imprimer la facture');
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .header { border-bottom: 2px solid #e1e7ec; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            h1 { color: #1a3c34; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 1px; }
            h2 { color: #c29d6d; margin-top: 5px; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px; }
            .details p { margin: 8px 0; font-size: 14px; }
            .amount-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; text-align: center; }
            .amount { font-size: 32px; font-weight: 900; color: #166534; margin: 10px 0 0 0; }
            .footer { margin-top: 50px; text-align: center; color: #64748b; font-size: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Atlas Academy</h1>
              <h2>Reçu de Transaction</h2>
            </div>
            <div style="text-align: right;">
              <p><strong>N° Facture:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <p><strong>Élève:</strong> ${activeChild.firstName} ${activeChild.lastName}</p>
              <p><strong>Niveau:</strong> ${activeChild.grade}</p>
            </div>
            <div>
              <p><strong>Type:</strong> ${invoice.type}</p>
              <p><strong>Statut:</strong> Payé</p>
            </div>
          </div>
          <div class="amount-box">
            <p style="margin:0; text-transform:uppercase; font-size:12px; font-weight:bold; color:#166534;">Montant Total</p>
            <p class="amount">${invoice.amount.toLocaleString()} MAD</p>
          </div>
          <div class="footer"><p>© Atlas Academy — Document Officiel</p></div>
          <script>window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 500); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            {t('dashboard')}
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-loose">
            Espace {t('parents')} — {t('welcome')} {profile?.firstName}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
           {/* Section Tabs */}
           <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/50 h-fit">
              <button onClick={() => setActiveSection('academic')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'academic' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400'}`}>{t('academics')}</button>
              <button onClick={() => setActiveSection('schedule')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'schedule' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400'}`}>{t('timetable')}</button>
              <button onClick={() => setActiveSection('finance')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'finance' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400'}`}>{t('finances')}</button>
           </div>

           {/* Children Tabs */}
           {children?.length > 1 && (
             <div className="flex bg-moroccan-green/5 p-1.5 rounded-2xl border border-moroccan-green/10 h-fit">
                {children.map(child => (
                  <button key={child._id} onClick={() => setActiveChildId(child._id)} className={`${activeChildId === child._id ? 'bg-moroccan-green text-white shadow-lg' : 'text-moroccan-green'} px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all`}>
                    {child.firstName}
                  </button>
                ))}
             </div>
           )}
        </div>
      </div>

      {!activeChild ? (
        <div className="bg-white p-20 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
          <span className="material-symbols-outlined text-5xl text-slate-200 mb-4">child_care</span>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('no_child_linked') || 'Aucun enfant lié'}</p>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          
          {/* Library Alert Notification for Child */}
          {activeChild.library?.overdueBorrows > 0 && (
            <div className="bg-moroccan-red/10 border border-moroccan-red/20 p-6 rounded-[2.5rem] flex items-center justify-between gap-6 mb-8 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-moroccan-red text-white rounded-2xl flex items-center justify-center shadow-lg shadow-moroccan-red/20">
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div>
                  <h3 className="text-moroccan-red font-black uppercase tracking-tight">{t('library_alert')} : {activeChild.firstName}</h3>
                  <p className="text-moroccan-red/70 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {activeChild.firstName} {t('has')} {activeChild.library.overdueBorrows} {t('overdue_books') || 'livres en retard.'}
                  </p>
                </div>
              </div>
              <div className="hidden sm:block px-6 py-2 bg-moroccan-red/20 text-moroccan-red rounded-xl text-[9px] font-black uppercase tracking-widest border border-moroccan-red/10">{t('action_required') || 'Action Requise'}</div>
            </div>
          )}

          {/* Child Profile Overview Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
            <div className="w-24 h-24 rounded-3xl bg-linear-to-tr from-moroccan-green/20 to-moroccan-gold/20 flex items-center justify-center shrink-0 border-2 border-white shadow-xl">
              <span className="material-symbols-outlined text-4xl text-moroccan-green">face</span>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{activeChild.firstName} {activeChild.lastName}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                <span className="px-4 py-1.5 bg-moroccan-green/10 text-moroccan-green rounded-full text-[10px] font-black uppercase tracking-widest border border-moroccan-green/5 italic">{activeChild.grade}</span>
                <span className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100">ID: {activeChild._id.substring(activeChild._id.length - 6).toUpperCase()}</span>
                <span className="px-4 py-1.5 bg-moroccan-gold/10 text-moroccan-gold rounded-full text-[10px] font-black uppercase tracking-widest border border-moroccan-gold/5">{t('academic_year') || 'Année Académique'} 2025-2026</span>
              </div>
            </div>
            <div className="hidden lg:flex items-center border-l border-slate-100 pl-8">
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">{t('subjects')}</p>
                  <p className="text-xl font-black text-slate-800">{activeChild.subjects?.length || 0}</p>
               </div>
            </div>
            <span className="material-symbols-outlined absolute -top-10 -right-10 text-[160px] text-slate-50 pointer-events-none group-hover:scale-110 transition-transform duration-1000">school</span>
          </div>

          {activeSection === 'finance' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
                        {t('payment_history') || 'Historique des Paiements de'} {activeChild.firstName}
                     </h3>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                           <tr>
                              <th className="px-6 py-4">Facture</th>
                              <th className="px-6 py-4">Élève / Niveau</th>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Type</th>
                              <th className="px-6 py-4">Montant</th>
                              <th className="px-6 py-4 text-right">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {activeChild.transactions?.length > 0 ? activeChild.transactions.map(t => (
                             <tr key={t._id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 text-[11px] font-black text-slate-900 uppercase">{t.invoiceNumber}</td>
                                <td className="px-6 py-4">
                                   <div className="flex flex-col">
                                      <span className="text-[10px] font-black text-slate-700 uppercase">{activeChild.firstName} {activeChild.lastName}</span>
                                      <span className="text-[8px] font-bold text-moroccan-gold uppercase">{activeChild.grade}</span>
                                   </div>
                                </td>
                                <td className="px-6 py-4 text-[11px] font-bold text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                                <td className="px-6 py-4"><span className="px-3 py-1 bg-slate-100 text-[9px] font-black uppercase tracking-widest rounded-full text-slate-500">{t.type}</span></td>
                                <td className="px-6 py-4 text-[11px] font-black text-moroccan-green">{t.amount.toLocaleString()} MAD</td>
                                <td className="px-6 py-4 text-right">
                                   <button onClick={() => handlePrintInvoice(t)} className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 hover:text-moroccan-gold hover:bg-moroccan-gold/10 flex items-center justify-center transition-all ml-auto">
                                     <span className="material-symbols-outlined text-sm">print</span>
                                   </button>
                                </td>
                             </tr>
                           )) : (
                             <tr><td colSpan="6" className="px-6 py-20 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Aucune facture disponible</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          ) : activeSection === 'schedule' ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <span className="w-2 h-6 bg-moroccan-emerald rounded-full"></span>
                        Emploi du temps de {activeChild.firstName}
                     </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(dayName => {
                      const dayKey = {
                        'Lundi': 'monday',
                        'Mardi': 'tuesday',
                        'Mercredi': 'wednesday',
                        'Jeudi': 'thursday',
                        'Vendredi': 'friday'
                      }[dayName];

                      return (
                      <div key={dayName} className="space-y-4">
                        <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-black text-center text-slate-900 uppercase tracking-widest">{dayName}</p>
                        </div>
                        <div className="space-y-3">
                          {activeChild.timetable?.filter(t => t.day?.toLowerCase() === dayKey).sort((a,b) => a.startTime.localeCompare(b.startTime)).map((slot, i) => {
                            const subjectName = slot.teacher?.subject || slot.subject?.name || '';
                            return (
                             <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow border-l-4" style={getSubjectBorderStyle(subjectName)}>
                               <p className="text-[9px] font-black uppercase mb-1" style={getSubjectAccentStyle(subjectName)}>{slot.startTime} - {slot.endTime}</p>
                               <p className="text-[11px] font-bold text-slate-800 uppercase line-clamp-1">{subjectName}</p>
                               <p className="text-[8px] font-medium text-slate-400 uppercase mt-0.5">{slot.room || 'Salle TBD'}</p>
                             </div>
                            );
                          })}
                          {(!activeChild.timetable || activeChild.timetable.filter(t => t.day?.toLowerCase() === dayKey).length === 0) && (
                            <div className="py-10 text-center">
                              <p className="text-[8px] font-black text-slate-200 uppercase tracking-widest italic">Aucun cours</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )})}
                  </div>
               </div>
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
                              {exam.score != null ? (
                                <span className="text-[12px] font-black text-moroccan-green uppercase block mb-1">{exam.score}/20</span>
                              ) : (
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">En attente</span>
                              )}
                              <span className="text-[10px] font-black text-moroccan-gold uppercase tracking-widest">{new Date(exam.date).toLocaleDateString()}</span>
                            </div>
                         </div>
                       )) : (
                         <p className="col-span-2 text-center text-[10px] font-black text-slate-300 uppercase py-8">Aucun examen récent</p>
                       )}
                    </div>
                 </div>

                 {/* Messaging Hub (Like Admin Account) */}
                 <div className="bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group mb-8">
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                       <div className="text-center sm:text-left">
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2 italic">{t('messaging')}</h3>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">Assistance & Communication en direct</p>
                          <button 
                            onClick={() => navigate('/messages')}
                            className="mt-8 px-10 py-4 bg-moroccan-gold text-deep-emerald rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-moroccan-gold/20 mx-auto sm:mx-0"
                          >
                             <span className="material-symbols-outlined text-base">forum</span>
                             {t('messaging')}
                          </button>
                       </div>
                       <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-white/10 group-hover:scale-110 transition-transform duration-700">
                          <span className="material-symbols-outlined text-6xl">auto_messages</span>
                       </div>
                    </div>
                    <span className="material-symbols-outlined absolute -bottom-10 -right-10 text-[240px] text-white/5 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">chat_bubble</span>
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
      )}
    </div>
  );
};

export default ParentDashboard;
