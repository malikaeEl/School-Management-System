import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import timetableService from '../services/timetableService';
import subjectService from '../services/subjectService'; // Keep for other uses if any, but we favor userService here
import userService from '../services/userService';
import { SCHOOL_CYCLES } from '../constants/schoolLevels';
import { getSubjectGradientStyle } from '../utils/subjectColors';

const Timetable = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const [slots, setSlots] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState(user?.role === 'student' ? user.grade : 'CP');
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null); // null = add mode, object = edit mode
  const [form, setForm] = useState({ teacherId: '', day: 'monday', startTime: '08:00', endTime: '10:00', room: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
  const ALL_GRADES = Object.values(SCHOOL_CYCLES).flatMap(c => c.levels);

  const showToast = (msg, color = 'bg-slate-900') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [timetableData, usersData] = await Promise.all([
        timetableService.getAll({ grade: selectedGrade }),
        isAdmin ? userService.getAll() : Promise.resolve([])
      ]);
      setSlots(timetableData);
      // Filter for teachers who teach this specific grade
      if (isAdmin) {
        setTeachers(usersData.filter(u => u.role === 'teacher' && u.classes?.includes(selectedGrade)));
      }
    } catch {
      showToast('Erreur chargement données.', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
     fetchData();
  }, [selectedGrade]);

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingSlot) {
        // Edit mode
        const updated = await timetableService.updateSlot(editingSlot._id, { ...form, grade: selectedGrade });
        setSlots(prev => prev.map(s => s._id === updated._id ? updated : s));
        showToast('Créneau modifié ✓');
      } else {
        // Add mode
        const payload = { ...form, grade: selectedGrade };
        const newSlot = await timetableService.addSlot(payload);
        setSlots(prev => [...prev, newSlot]);
        showToast('Créneau ajouté ✓');
      }
      setShowModal(false);
      setEditingSlot(null);
      setForm({ teacherId: '', day: 'monday', startTime: '08:00', endTime: '10:00', room: '' });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur.', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (slot) => {
    setEditingSlot(slot);
    setForm({
      teacherId: slot.teacher?._id || '',
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: slot.room,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingSlot(null);
    setForm({ teacherId: '', day: 'monday', startTime: '08:00', endTime: '10:00', room: '' });
    setShowModal(true);
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Supprimer ce créneau ?')) return;
    try {
      await timetableService.removeSlot(id);
      setSlots(prev => prev.filter(s => s._id !== id));
      showToast('Créneau supprimé');
    } catch {
      showToast('Erreur suppression.', 'bg-moroccan-red');
    }
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
             <span className="w-2 h-8 bg-moroccan-gold rounded-full"></span>
             Emploi du Temps
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest leading-relaxed">
            {loading ? 'Chargement du calendrier...' : `Gestion du planning hebdomadaire - ${selectedGrade}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
            {user?.role !== 'student' && (
              <select 
                value={selectedGrade} 
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest outline-none shadow-sm focus:ring-2 focus:ring-moroccan-gold/20"
              >
                {ALL_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            )}
            {isAdmin && (
              <button onClick={openAddModal} className="bg-moroccan-green text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-moroccan-green/20 hover:opacity-90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">add_task</span>
                Programmer
              </button>
            )}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden group">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-6 border-r border-slate-100 dark:border-slate-800 w-24"></th>
                {days.map(day => (
                  <th key={day} className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-[0.2em] border-r border-slate-100 dark:border-slate-800 last:border-0 uppercase">
                    {t(day)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {hours.map((hour, hourIdx) => (
                <tr key={hour} className="group/row">
                  <td className="p-6 text-[10px] font-black text-slate-400 dark:text-slate-500 border-r border-b border-slate-100 dark:border-slate-800 group-hover/row:text-moroccan-green transition-colors">
                    {hour}
                  </td>
                  {days.map(day => {
                    // Check if this cell is covered by a slot starting in a previous row
                    const isCovered = slots.some(s => {
                      if (s.day !== day) return false;
                      const startIdx = hours.indexOf(s.startTime);
                      const endIdx = hours.indexOf(s.endTime);
                      return hourIdx > startIdx && hourIdx < endIdx;
                    });

                    if (isCovered) return null;

                    // Check if a slot starts here
                    const slot = slots.find(s => s.day === day && s.startTime === hour);
                    
                    if (slot) {
                      const startIdx = hours.indexOf(slot.startTime);
                      const endIdx = hours.indexOf(slot.endTime);
                      const rowSpan = endIdx > startIdx ? (endIdx - startIdx) : 1;

                      return (
                        <td key={day} rowSpan={rowSpan} className="p-2 border-r border-b border-slate-100 dark:border-slate-800 last:border-0 relative">
                          <div
                            className="absolute inset-2 rounded-2xl p-4 text-left text-white shadow-lg overflow-hidden group/slot cursor-pointer"
                            style={getSubjectGradientStyle(slot.teacher?.subject)}
                            onClick={() => isAdmin && openEditModal(slot)}
                          >
                            <div className={`relative z-10 h-full flex flex-col ${rowSpan === 1 ? 'justify-center items-center text-center p-2' : 'justify-between'}`}>
                              <div className={rowSpan === 1 ? 'mb-1' : ''}>

                                <p className="text-[11px] font-black leading-tight mb-2 uppercase">{slot.teacher?.subject || 'Matière'}</p>
                                <p className="text-[9px] font-bold opacity-80 uppercase italic">{slot.teacher?.firstName} {slot.teacher?.lastName}</p>
                              </div>
                              <div className={`flex items-center ${rowSpan === 1 ? 'justify-center mt-1' : 'justify-between'}`}>
                                <div className="flex items-center gap-1 opacity-60">
                                  <span className="material-symbols-outlined text-[10px]">location_on</span>
                                  <span className="text-[9px] font-bold">{slot.room}</span>
                                </div>
                                {isAdmin && (
                                  <div className="flex items-center gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); openEditModal(slot); }} className="opacity-0 group-hover/slot:opacity-100 transition-opacity text-white/70 hover:text-white p-1">
                                      <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot._id); }} className="opacity-0 group-hover/slot:opacity-100 transition-opacity text-white/50 hover:text-white p-1">
                                      <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="absolute inset-0 zellige-pattern opacity-10 pointer-events-none"></div>
                          </div>
                        </td>
                      );
                    }

                    // Empty cell
                    return (
                      <td key={day} className="p-2 border-r border-b border-slate-100 dark:border-slate-800 last:border-0 relative min-h-[120px]">
                        <div className="w-full h-full min-h-[90px] bg-slate-50/30 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 group-hover:bg-slate-50/50 transition-colors"></div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Slot */}
      {showModal && (
        <div className="fixed inset-0 bg-deep-emerald/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white">
              <h2 className="text-xl font-black uppercase tracking-tight">{editingSlot ? 'Modifier le cours' : 'Programmer un cours'}</h2>
              <button onClick={() => setShowModal(false)} className="text-white hover:text-white/70 transition-colors"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleAddSlot} className="p-8 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Enseignant & Matière ({selectedGrade})</label>
                <select required value={form.teacherId} onChange={e => setForm(p => ({...p, teacherId: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none">
                  <option value="">Sélectionner un enseignant...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName} — {t.subject}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jour</label>
                  <select value={form.day} onChange={e => setForm(p => ({...p, day: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none uppercase">
                    {days.map(d => <option key={d} value={d}>{t(d)}</option>)}
                  </select>
                 </div>
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Salle</label>
                  <input required value={form.room} onChange={e => setForm(p => ({...p, room: e.target.value}))} placeholder="ex: Salle 102" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none"/>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Début</label>
                  <select value={form.startTime} onChange={e => setForm(p => ({...p, startTime: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                 </div>
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fin</label>
                  <select value={form.endTime} onChange={e => setForm(p => ({...p, endTime: e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white text-sm focus:outline-none">
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                 </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-xs font-black text-slate-400 hover:text-slate-600 transition-all uppercase tracking-widest">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-3 bg-moroccan-green text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-moroccan-green/20 hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Enregistrement...' : editingSlot ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
