import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ALL_LEVELS } from '../constants/schoolLevels';
import userService from '../services/userService';

const API_URL = 'http://localhost:5000/api';

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
};

const PersonnelProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [person, setPerson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const avatarInputRef = useRef(null);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchPerson = async () => {
    setLoading(true);
    try {
      const data = await userService.getById(id);
      setPerson(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors du chargement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerson();
  }, [id]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await fetch(`${API_URL}/users/${id}/avatar`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPerson(prev => ({ ...prev, avatar: data.avatar }));
      showToast('Photo de profil mise à jour ✓');
    } catch {
      showToast('Erreur upload photo.', 'bg-moroccan-red');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const openEdit = () => {
    setEditForm({
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      role: person.role,
      subject: person.subject || '',
      classes: person.classes || [],
      isActive: person.isActive,
      salary: person.salary || 0,
    });
    setIsEditing(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setPerson(prev => ({ ...prev, ...updated }));
      setIsEditing(false);
      showToast('Profil mis à jour ✓');
    } catch {
      showToast('Erreur mise à jour.', 'bg-moroccan-red');
    } finally {
      setSaving(false);
    }
  };

  const toggleClass = (grade) => {
    const current = editForm.classes || [];
    if (current.includes(grade)) {
      setEditForm({ ...editForm, classes: current.filter(g => g !== grade) });
    } else {
      setEditForm({ ...editForm, classes: [...current, grade] });
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 animate-pulse">
      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
      <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
    </div>
  );

  if (error || !person) return (
    <div className="p-20 text-center">
      <div className="w-20 h-20 bg-moroccan-red/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-moroccan-red">
        <span className="material-symbols-outlined text-4xl">error</span>
      </div>
      <h2 className="text-xl font-black text-slate-900">{error}</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-moroccan-green font-black hover:underline uppercase tracking-widest text-xs">Retour</button>
    </div>
  );

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 text-gray-900 bg-slate-50/50 p-4 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right`}>
          {toast.msg}
        </div>
      )}

      <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-black text-deep-emerald tracking-tight">
            Registre du Personnel <span className="text-moroccan-gold">#{person._id?.substring(0, 8)}</span>
          </h2>
        </div>
        <button onClick={openEdit} className="px-6 py-2.5 bg-moroccan-green text-white rounded-xl text-xs font-black shadow-lg shadow-moroccan-green/20 hover:bg-deep-emerald transition-all uppercase tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">edit</span>
          Modifier les informations
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col items-center">
          <div 
            onClick={() => avatarInputRef.current?.click()}
            className="w-32 h-32 rounded-3xl bg-slate-100 border-4 border-white shadow-xl overflow-hidden relative group cursor-pointer mb-6"
          >
            {person.avatar ? (
              <img src={`http://localhost:5000${person.avatar}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300">
                {person.firstName?.[0]}{person.lastName?.[0]}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? <span className="material-symbols-outlined text-white animate-spin">progress_activity</span> : <span className="material-symbols-outlined text-white">photo_camera</span>}
            </div>
          </div>
          
          <h3 className="text-2xl font-black text-slate-900 mb-1">{person.firstName} {person.lastName}</h3>
          <span className="px-4 py-1.5 bg-moroccan-gold/10 text-moroccan-gold text-[10px] font-black rounded-full uppercase tracking-widest border border-moroccan-gold/20 mb-8">
            {person.role === 'teacher' ? 'Enseignant' : 'Administration'}
          </span>

          <div className="w-full space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="material-symbols-outlined text-moroccan-green">mail</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Professionnel</p>
                <p className="text-xs font-black text-slate-700 truncate">{person.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="material-symbols-outlined text-moroccan-green">call</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Téléphone</p>
                <p className="text-xs font-black text-slate-700">{person.phone || 'Non renseigné'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Details */}
        <div className="lg:col-span-2 space-y-8">
          {person.role === 'teacher' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              <h3 className="text-lg font-black mb-6 flex items-center text-deep-emerald uppercase tracking-widest">
                <span className="w-2 h-7 bg-moroccan-gold rounded-full mr-4 ml-4"></span>
                Section Enseignant
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Spécialité / Matière</label>
                  <div className="px-5 py-4 bg-moroccan-green/5 border border-moroccan-green/10 rounded-2xl text-moroccan-green font-black text-sm uppercase tracking-widest">
                    {person.subject || 'Non assignée'}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Nombre de Classes</label>
                  <div className="px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 font-black text-sm uppercase tracking-widest">
                    {person.classes?.length || 0} Classes actives
                  </div>
                </div>
                {/* Salary removed for teacher view/account as per request */}
                {(JSON.parse(localStorage.getItem('user'))?.role === 'admin' || JSON.parse(localStorage.getItem('user'))?._id === person._id) && (
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Salaire Mensuel (MAD)</label>
                    <div className="px-5 py-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-amber-600 font-black text-sm uppercase tracking-widest">
                      {person.salary ? `${person.salary.toLocaleString()} MAD` : 'Non renseigné'}
                    </div>
                  </div>
                )}
              </div>

              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Classes Enseignées</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {person.classes && person.classes.length > 0 ? (
                  person.classes.map(grade => (
                    <div key={grade} className="px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 group hover:border-moroccan-green transition-all">
                      <div className="w-2 h-2 rounded-full bg-moroccan-green"></div>
                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{grade}</span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-xs text-slate-400 font-bold italic py-4">Aucune classe assignée pour le moment.</p>
                )}
              </div>
            </div>
          )}

          {/* Account Status / Other Info */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
             <h3 className="text-lg font-black mb-6 flex items-center text-deep-emerald uppercase tracking-widest">
                <span className="w-2 h-7 bg-slate-200 rounded-full mr-4 ml-4"></span>
                État du Compte
              </h3>
              <div className="flex items-center gap-6 p-6 border border-slate-100 rounded-3xl bg-slate-50/50">
                <div className={`w-4 h-4 rounded-full ${person.isActive ? 'bg-moroccan-green shadow-lg shadow-moroccan-green/50' : 'bg-slate-300'}`}></div>
                <div>
                   <p className="text-sm font-black text-slate-800 uppercase tracking-widest">
                     {person.isActive ? 'Employé Actif' : 'Compte Suspendu / Inactif'}
                   </p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                     Dernière connexion : —
                   </p>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsEditing(false)}>
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Modifier l'Employé</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mise à jour du dossier personnel</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prénom</label>
                  <input type="text" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom</label>
                  <input type="text" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black" required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Téléphone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Spécialité (Enseignant)</label>
                  <input type="text" value={editForm.subject} onChange={e => setEditForm({...editForm, subject: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black disabled:opacity-50" disabled={editForm.role !== 'teacher'} />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Salaire (MAD)</label>
                  <input type="number" value={editForm.salary} onChange={e => setEditForm({...editForm, salary: e.target.value})} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black" />
                </div>
              </div>

              {editForm.role === 'teacher' && (
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Classes assignées</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {ALL_LEVELS.filter(l => l !== 'N/A').map(grade => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => toggleClass(grade)}
                        className={`px-3 py-2 text-[9px] font-black rounded-xl border transition-all uppercase tracking-tight ${
                          editForm.classes?.includes(grade)
                            ? 'bg-moroccan-green text-white border-moroccan-green shadow-md shadow-moroccan-green/20'
                            : 'bg-white text-slate-400 border-slate-100 hover:border-moroccan-green/30'
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 mt-8">
                <input type="checkbox" checked={editForm.isActive} onChange={e => setEditForm({...editForm, isActive: e.target.checked})} className="w-5 h-5 rounded-lg text-moroccan-green" id="activeChk" />
                <label htmlFor="activeChk" className="text-sm font-black text-slate-700 cursor-pointer">Compte Actif (Accès plateforme autorisé)</label>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-4 font-black text-sm text-slate-500 rounded-2xl border border-slate-100">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-4 bg-moroccan-green text-white font-black text-sm rounded-2xl shadow-xl shadow-moroccan-green/20 disabled:opacity-50">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonnelProfile;
