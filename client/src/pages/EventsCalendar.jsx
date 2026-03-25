import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EventsCalendar = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', type: 'Académique', location: '' });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic Date State
  const [viewDate, setViewDate] = useState(new Date());

  const isAdmin = user?.role === 'admin';

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEvents = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/events');
      setEvents(resp.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching events:', err);
      showToast('Erreur lors du chargement des événements', 'bg-moroccan-red');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  const monthNamesAr = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
    'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
  ];

  const { daysInMonth, firstDayOfMonth } = useMemo(() => {
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    return { daysInMonth: lastDay, firstDayOfMonth: firstDay };
  }, [currentMonth, currentYear]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset, 1);
    setViewDate(newDate);
  };

  const handleCellClick = (day) => {
    if (!isAdmin) return;
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setForm(p => ({ ...p, date: dateStr }));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      await axios.post('http://localhost:5000/api/events', form);
      showToast('Événement ajouté avec succès ✓');
      setShowModal(false);
      setForm({title:'',date:'',time:'',type:'Académique',location:''});
      fetchEvents();
    } catch (err) {
      showToast('Erreur lors de l\'ajout', 'bg-moroccan-red');
    }
  };

  const deleteEvent = async (id, e) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('Supprimer cet événement ?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/${id}`);
      showToast('Événement supprimé');
      fetchEvents();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'bg-moroccan-red');
    }
  };

  const getEventsForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(ev => ev.date === dateStr);
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black uppercase tracking-widest`}>{toast.msg}</div>}

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-deep-emerald">Nouvel Événement</h2>
              <button onClick={()=>setShowModal(false)} className="text-slate-400 hover:text-moroccan-red transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                {key:'title',label:'Titre',placeholder:'ex: Fête de l\'Aid'},
                {key:'date',label:'Date',placeholder:'',type:'date'},
                {key:'time',label:'Heure',placeholder:'',type:'time'},
                {key:'location',label:'Lieu',placeholder:'ex: Salle des fêtes'},
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{f.label}</label>
                  <input type={f.type||'text'} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moroccan-green/30 transition-all"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Type</label>
                <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moroccan-green/30 transition-all">
                  {['Académique','Fête','Sport','Culture','Sortie scolaire','Réunion Parents'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">Annuler</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-deep-emerald text-white text-sm font-black shadow-lg shadow-deep-emerald/20 hover:brightness-110 transition-all uppercase tracking-widest">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
            Événements & Calendrier
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-relaxed">
            Planifier les événements académiques, les vacances et les activités
          </p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => { setViewDate(new Date()); showToast('Aujourd\'hui: '+new Date().toLocaleDateString('fr-FR')) }} className="bg-white text-slate-600 px-5 py-2.5 rounded-2xl text-[10px] font-black border border-slate-100 shadow-sm hover:shadow-md transition-all uppercase tracking-widest">
              Aujourd'hui
            </button>
            {isAdmin && (
              <button onClick={()=>setShowModal(true)} className="bg-deep-emerald text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:opacity-90 shadow-xl shadow-deep-emerald/20 transition-all uppercase tracking-widest">
                <span className="material-symbols-outlined text-xl">add_circle</span>
                Nouvel Événement
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar View (Left) */}
        <div className="lg:col-span-3">
          <section className="bg-white rounded-4xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
               <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">
                    {`${monthNames[currentMonth]} ${currentYear}`}
                  </h2>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-inner border border-slate-100">
                    <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                       <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
                       <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                  </div>
               </div>
               <div className="flex p-1 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest bg-moroccan-green text-white rounded-xl shadow-lg shadow-moroccan-green/20 transition-all">Mois</button>
                  <button className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-moroccan-green transition-colors">Semaine</button>
               </div>
            </div>
            
            <div className="overflow-x-auto custom-scrollbar">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-7 border-b border-slate-50 bg-slate-50/30">
                    {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                      <div key={day} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{t(day).substring(0,3)}</div>
                    ))}
                </div>
                <div className="grid grid-cols-7">
                    {[...Array(42)].map((_, i) => {
                      const dayNumber = i - firstDayOfMonth + 1;
                      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                      const dayEvents = isCurrentMonth ? getEventsForDay(dayNumber) : [];
                      
                      return (
                        <div 
                          key={i} 
                          onClick={() => isCurrentMonth && handleCellClick(dayNumber)}
                          className={`min-h-[140px] p-2 border-r border-b border-slate-50 relative group/day transition-colors ${isCurrentMonth ? (isAdmin ? 'cursor-pointer hover:bg-slate-50/50' : '') : 'bg-slate-50/20'}`}
                        >
                          <span className={`text-sm font-black m-2 w-8 h-8 flex items-center justify-center rounded-xl transition-all 
                            ${isCurrentMonth 
                              ? 'text-slate-800 group-hover/day:text-moroccan-green group-hover/day:bg-slate-100' 
                              : 'text-slate-200'}`}
                          >
                            {isCurrentMonth ? dayNumber : ''}
                          </span>
                          
                          <div className="flex flex-col gap-1 mt-1">
                            {dayEvents.map(ev => (
                              <div key={ev._id} className="relative group/ev">
                                <div className={`px-2 py-1 rounded-lg text-[8px] font-black text-white truncate shadow-sm ${ev.type === 'Sport' ? 'bg-blue-500' : ev.type === 'Fête' ? 'bg-moroccan-gold text-deep-emerald' : 'bg-moroccan-green'}`}>
                                  {ev.title}
                                </div>
                                {isAdmin && (
                                  <button onClick={(e) => deleteEvent(ev._id, e)} className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full w-3 h-3 flex items-center justify-center opacity-0 group-hover/ev:opacity-100 transition-opacity border border-slate-200">
                                    <span className="material-symbols-outlined text-[8px] font-black">close</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Widgets (Right) */}
        <div className="lg:col-span-1 flex flex-col gap-8">
           <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm uppercase tracking-widest">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-8 text-slate-400 italic">
                <span className="material-symbols-outlined text-moroccan-gold text-lg">event_upcoming</span>
                À venir
              </h3>
              <div className="space-y-6">
                 {events.slice(0, 3).map(ev => (
                    <div key={ev._id} className="flex gap-4 group cursor-pointer relative">
                      <div className={`w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-moroccan-green group-hover:text-white transition-all duration-300`}>
                         <span className="text-[10px] font-black uppercase opacity-50 leading-none mb-1">{new Date(ev.date).toLocaleDateString('fr-FR', {month: 'short'})}</span>
                         <span className="text-xl font-black leading-none">{new Date(ev.date).getDate()}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                         <h4 className="font-black text-sm text-slate-800 truncate group-hover:text-moroccan-green transition-colors">{ev.title}</h4>
                         <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{ev.type}</p>
                      </div>
                      {isAdmin && (
                        <button onClick={(e) => deleteEvent(ev._id, e)} className="text-red-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      )}
                    </div>
                 ))}
                 {events.length === 0 && !loading && (
                   <p className="text-[10px] text-slate-300 font-black italic">Aucun événement à venir</p>
                 )}
              </div>
           </section>

           <section className="bg-linear-to-br from-deep-emerald to-moroccan-green rounded-3xl p-8 text-white shadow-xl shadow-deep-emerald/20 relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black mb-2 uppercase tracking-tight">Exporter</h3>
                <p className="text-white/60 text-[10px] font-bold mb-6 leading-relaxed uppercase tracking-[0.2em]">Download full calendar as PDF or ICS file.</p>
                <button 
                  onClick={() => showToast('Génération du calendrier...')}
                  className="w-full py-4 bg-moroccan-gold text-deep-emerald rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">download</span>
                  Télécharger
                </button>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default EventsCalendar;
