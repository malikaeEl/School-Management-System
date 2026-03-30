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

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);
  const [linkingParent, setLinkingParent] = useState(false);
  const [allParents, setAllParents] = useState([]);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [savingParent, setSavingParent] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  const showToast = (msg, color = 'bg-slate-900') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        const data = await userService.getById(id);
        setStudent(data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Profil introuvable.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudent();
  }, [id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/users/${id}/documents`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: formData,
      });
      if (!res.ok) throw new Error('Erreur upload');
      const docs = await res.json();
      setStudent(prev => ({ ...prev, documents: docs }));
      showToast('Document ajouté ✓', 'bg-moroccan-green');
    } catch {
      showToast('Erreur lors de l\'upload.', 'bg-moroccan-red');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteDoc = async (docId) => {
    setDeletingDoc(docId);
    try {
      await fetch(`${API_URL}/users/${id}/documents/${docId}`, {
        method: 'DELETE',
        headers: getAuthHeader(),
      });
      setStudent(prev => ({ ...prev, documents: prev.documents.filter(d => d._id !== docId) }));
      showToast('Document supprimé.');
    } catch {
      showToast('Erreur suppression.', 'bg-moroccan-red');
    } finally {
      setDeletingDoc(null);
    }
  };

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
      setStudent(prev => ({ ...prev, avatar: data.avatar }));
      showToast('Photo mise à jour ✓', 'bg-moroccan-green');
    } catch {
      showToast('Erreur upload photo.', 'bg-moroccan-red');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const openLinkParent = async () => {
    setLinkingParent(true);
    setSelectedParentId(student.parentId?._id || student.parentId || '');
    try {
      const res = await fetch(`${API_URL}/users`, { headers: getAuthHeader() });
      const all = await res.json();
      setAllParents(all.filter(u => u.role === 'parent'));
    } catch {
      showToast('Erreur lors du chargement des parents.', 'bg-moroccan-red');
    }
  };

  const handleSaveParent = async () => {
    setSavingParent(true);
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: selectedParentId || null }),
      });
      if (!res.ok) throw new Error();
      // Reload student to get populated parent
      const updated = await (await fetch(`${API_URL}/users/${id}`, { headers: getAuthHeader() })).json();
      setStudent(updated);
      setLinkingParent(false);
      showToast('Parent lié avec succès ✓', 'bg-moroccan-green');
    } catch {
      showToast('Erreur lors de la liaison.', 'bg-moroccan-red');
    } finally {
      setSavingParent(false);
    }
  };

  const handleUnlinkParent = async () => {
    setSavingParent(true);
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId: null }),
      });
      if (!res.ok) throw new Error();
      setStudent(prev => ({ ...prev, parentId: null }));
      showToast('Parent délié.', 'bg-slate-900');
    } catch {
      showToast('Erreur lors de la déliaison.', 'bg-moroccan-red');
    } finally {
      setSavingParent(false);
    }
  };

  const openEditProfile = () => {
    setEditForm({
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      grade: student.grade,
      isActive: student.isActive,
    });
    setIsEditingProfile(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingParent(true);
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      // Reload to get populated parentId if needed, or just update local
      setStudent(prev => ({ ...prev, ...updated }));
      setIsEditingProfile(false);
      showToast('Profil mis à jour ✓', 'bg-moroccan-green');
    } catch {
      showToast('Erreur mise à jour.', 'bg-moroccan-red');
    } finally {
      setSavingParent(false);
    }
  };

  const handlePrintBadge = async () => {
    // Convert avatar URL to base64 so it embeds correctly in the print iframe
    let avatarImgTag = '';
    if (student.avatar) {
      try {
        const res = await fetch(`http://localhost:5000${student.avatar}`);
        const blob = await res.blob();
        const b64 = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        avatarImgTag = `<img src="${b64}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />`;
      } catch { /* fall back to initials */ }
    }

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html><html><head><title>Badge Étudiant — ${student.firstName} ${student.lastName}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;900&display=swap');
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        @page { size: 85.6mm 54mm; margin: 0; }
        body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f8fafc; font-family: 'Inter', sans-serif; }
        .badge {
          width: 85.6mm; height: 54mm;
          border-radius: 16px; padding: 16px;
          background: linear-gradient(135deg, #0a3d28, #1C5B42) !important;
          color: white; display: flex; flex-direction: column; justify-content: space-between;
          box-shadow: 0 20px 60px rgba(10,92,68,0.4); position: relative; overflow: hidden;
        }
        .badge-bg {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 80% 20%, rgba(201,150,59,0.15) 0%, transparent 60%) !important;
        }
        .badge-top { display: flex; justify-content: space-between; align-items: flex-start; position: relative; }
        .avatar { width: 56px; height: 56px; background: rgba(255,255,255,0.2) !important; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900;
          color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.25); overflow: hidden; }
        .school { text-align: right; }
        .school-name { font-size: 13px; font-weight: 900; color: #c9963b !important; text-transform: uppercase; letter-spacing: 0.2em; }
        .school-sub { font-size: 8px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }
        .info { position: relative; }
        .student-name { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.01em; margin-bottom: 4px; }
        .badge-tags { display: flex; align-items: center; gap: 6px; }
        .tag { font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.12em;
          background: rgba(255,255,255,0.12) !important; padding: 2px 7px; border-radius: 5px; color: #c9963b !important; }
        .grade-label { font-size: 8px; font-weight: 900; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.12em; }
        .card-id { position: absolute; bottom: 16px; right: 16px; font-size: 7px; opacity: 0.4; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
      </style></head><body>
      <div class="badge">
        <div class="badge-bg"></div>
        <div class="badge-top">
          <div class="avatar">${avatarImgTag || (student.firstName?.[0] || '') + (student.lastName?.[0] || '')}</div>
          <div class="school">
            <div class="school-name">Atlas Academy</div>
            <div class="school-sub">Digital Campus</div>
          </div>
        </div>
        <div class="info">
          <div class="student-name">${student.firstName} ${student.lastName}</div>
          <div class="badge-tags">
            <span class="tag">Étudiant</span>
            <span class="grade-label">${student.grade}</span>
          </div>
        </div>
        <div class="card-id">ID: ${student._id?.slice(-8).toUpperCase()}</div>
      </div>
      </body></html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 2000);
    }, 600); // wait for font load
  };

  const handleExportPDF = () => handlePrintBadge();

  const getFileIcon = (mimetype = '') => {
    if (mimetype.includes('pdf')) return 'picture_as_pdf';
    if (mimetype.includes('image')) return 'image';
    if (mimetype.includes('word') || mimetype.includes('doc')) return 'description';
    return 'attach_file';
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 animate-pulse">
      <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
      <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
    </div>
  );

  if (error || !student) return (
    <div className="p-20 text-center">
      <div className="w-20 h-20 bg-moroccan-red/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-moroccan-red">
        <span className="material-symbols-outlined text-4xl">error</span>
      </div>
      <h2 className="text-xl font-black text-slate-900">{error}</h2>
      <button onClick={() => navigate(-1)} className="mt-4 text-moroccan-green font-black hover:underline uppercase tracking-widest text-xs">Retour</button>
    </div>
  );

  const docs = student.documents || [];

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 text-gray-900 bg-slate-50/50 p-4 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right`}>
          {toast.msg}
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" onChange={handleUpload} />
      <input ref={avatarInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={handleAvatarChange} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-xl font-black text-deep-emerald tracking-tight">
            Profil de l'Étudiant <span className="text-moroccan-gold">#{student._id?.substring(0, 8)}</span>
          </h2>
        </div>
        <div className="flex items-center space-x-3 gap-2">
          <button
            onClick={openEditProfile}
            className="px-5 py-2.5 border border-moroccan-green/20 bg-white rounded-xl text-xs font-black hover:bg-moroccan-green/5 text-moroccan-green shadow-sm transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Modifier
          </button>
          <button
            onClick={handleExportPDF}
            className="px-5 py-2.5 border border-slate-300 bg-white rounded-xl text-xs font-black hover:bg-slate-50 text-slate-700 shadow-sm transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
            Exporter PDF
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* TopGrid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Details */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col">
            <h3 className="text-lg font-black mb-8 flex items-center">
              <span className="w-2 h-7 bg-moroccan-gold rounded-full mr-3 ml-3"></span>
              <span className="text-deep-emerald uppercase tracking-widest">Détails de l'Étudiant</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Prénom</label>
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-3.5 px-5 text-sm font-black text-slate-800">{student.firstName}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Nom</label>
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-3.5 px-5 text-sm font-black text-slate-800">{student.lastName}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Académique</label>
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-3.5 px-5 text-sm font-black text-slate-800">{student.email || '—'}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Téléphone</label>
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-3.5 px-5 text-sm font-black text-slate-800">{student.phone || 'Non renseigné'}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Niveau / Classe</label>
                <div className="w-full rounded-2xl bg-moroccan-green/5 border border-moroccan-green/10 py-3.5 px-5 text-sm font-black text-moroccan-green uppercase tracking-widest">{student.grade}</div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Statut du Compte</label>
                <div className={`w-full rounded-2xl py-3.5 px-5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${student.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${student.isActive ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                  {student.isActive ? 'Actif' : 'Inactif'}
                </div>
              </div>
            </div>
          </div>

          {/* Student Badge */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col items-center print:shadow-none">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 self-start">Badge Officiel</h3>
            <div id="student-badge" className="w-full aspect-[1.58/1] bg-linear-to-br from-deep-emerald to-moroccan-green rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
              <div className="absolute inset-0 zellige-pattern opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  {/* Clickable avatar — click to change photo */}
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-24 h-24 rounded-3xl bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl shrink-0"
                    title="Cliquer pour changer la photo"
                  >
                    {student.avatar ? (
                      <img src={`http://localhost:5000${student.avatar}`} alt="Photo" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-white/50 flex items-center justify-center w-full h-full">{student.firstName?.[0]}{student.lastName?.[0]}</span>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                      {uploadingAvatar
                        ? <span className="material-symbols-outlined text-white text-lg animate-spin">progress_activity</span>
                        : <span className="material-symbols-outlined text-white text-lg">photo_camera</span>
                      }
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-moroccan-gold uppercase tracking-[0.2em]">Atlas Academy</p>
                    <p className="text-[9px] font-bold opacity-70 uppercase tracking-widest">Digital Campus</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black tracking-tight uppercase">{student.firstName} {student.lastName}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] text-moroccan-gold font-black uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-md border border-white/5">Étudiant</span>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">{student.grade}</p>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 opacity-40">
                <span className="material-symbols-outlined text-4xl">fingerprint</span>
              </div>
            </div>
            <button
              onClick={handlePrintBadge}
              className="mt-8 text-[11px] text-moroccan-green font-black hover:text-deep-emerald transition-colors flex items-center gap-2 uppercase tracking-[0.2em] px-4 py-2 rounded-xl hover:bg-moroccan-green/5"
            >
              <span className="material-symbols-outlined text-lg">print</span>
              Imprimer le badge
            </button>
          </div>
        </div>

        {/* MiddleGrid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Parent Section */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center text-deep-emerald uppercase tracking-widest">
                <span className="w-2 h-7 bg-moroccan-green rounded-full mr-3 ml-3"></span>
                Parent / Tuteur
              </h3>
            </div>
            {student.parentId ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center p-5 border border-moroccan-green/10 rounded-3xl bg-moroccan-green/2 transition-all hover:bg-moroccan-green/5 group">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-moroccan-green font-black text-xl mr-5 group-hover:scale-110 transition-transform shrink-0">
                    <span className="material-symbols-outlined">family_restroom</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-black text-slate-800">
                        {student.parentId.firstName} {student.parentId.lastName}
                      </p>
                      <span className="text-[9px] px-2.5 py-1 bg-moroccan-green text-white rounded-lg font-black uppercase tracking-widest shrink-0 ml-2">Vérifié</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate">{student.parentId.email || '—'}</p>
                    {student.parentId.phone && <p className="text-[10px] text-slate-400 font-medium">{student.parentId.phone}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={openLinkParent}
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-moroccan-green hover:text-moroccan-green transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">swap_horiz</span> Changer
                  </button>
                  <button
                    onClick={handleUnlinkParent}
                    disabled={savingParent}
                    className="flex-1 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-moroccan-red hover:text-moroccan-red transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">link_off</span> Délier
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-100 rounded-3xl p-10 text-center flex flex-col items-center justify-center flex-1">
                <span className="material-symbols-outlined text-slate-200 text-4xl mb-3">link_off</span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aucun parent rattaché</p>
                <button
                  onClick={openLinkParent}
                  className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add_link</span>
                  Lier un compte
                </button>
              </div>
            )}

            {/* Inline link-parent modal */}
            {linkingParent && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setLinkingParent(false)}>
                <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <h3 className="text-lg font-black text-slate-900 mb-1">Lier un Parent</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Sélectionner le compte parent</p>
                  <select
                    value={selectedParentId}
                    onChange={e => setSelectedParentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800 mb-6 focus:outline-none focus:ring-2 focus:ring-moroccan-green/20 focus:border-moroccan-green"
                  >
                    <option value="">— Aucun parent —</option>
                    {allParents.map(p => (
                      <option key={p._id} value={p._id}>{p.firstName} {p.lastName}{p.email ? ` (${p.email})` : ''}</option>
                    ))}
                  </select>
                  <div className="flex gap-3">
                    <button onClick={() => setLinkingParent(false)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all">Annuler</button>
                    <button
                      onClick={handleSaveParent}
                      disabled={savingParent}
                      className="flex-1 py-3 rounded-2xl bg-moroccan-green text-white text-sm font-black hover:bg-deep-emerald transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {savingParent ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                      Enregistrer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Documents Section */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center text-deep-emerald uppercase tracking-widest">
                <span className="w-2 h-7 bg-moroccan-red rounded-full mr-3 ml-3"></span>
                Pièces Jointes
              </h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-moroccan-green text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-deep-emerald transition-all shadow-lg shadow-moroccan-green/20 disabled:opacity-50"
              >
                {uploading
                  ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                  : <span className="material-symbols-outlined text-sm">upload_file</span>
                }
                {uploading ? 'Import...' : 'Ajouter'}
              </button>
            </div>

            {docs.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-slate-100 bg-slate-50/50 rounded-3xl p-10 text-center flex flex-col items-center justify-center flex-1 cursor-pointer hover:bg-slate-50 hover:border-moroccan-green/20 transition-all group"
              >
                <span className="material-symbols-outlined text-slate-200 group-hover:text-moroccan-green/30 text-4xl mb-3 transition-colors">upload_file</span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Cliquer pour importer un document</p>
                <p className="text-[9px] text-slate-300 mt-1 font-bold">PDF, JPG, PNG, DOC — Max 10 Mo</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {docs.map(doc => (
                  <div key={doc._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 text-moroccan-green shrink-0">
                      <span className="material-symbols-outlined text-lg">{getFileIcon(doc.mimetype)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{doc.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={`http://localhost:5000${doc.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-moroccan-green hover:bg-moroccan-green/10 rounded-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(doc._id)}
                        disabled={deletingDoc === doc._id}
                        className="p-1.5 text-slate-400 hover:text-moroccan-red hover:bg-moroccan-red/10 rounded-lg transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">{deletingDoc === doc._id ? 'progress_activity' : 'delete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full py-3 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 hover:text-moroccan-green hover:border-moroccan-green/30 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Ajouter un document
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Academic History */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="font-black text-deep-emerald flex items-center gap-3 uppercase tracking-widest text-sm">
              <span className="w-2 h-6 bg-deep-emerald rounded-full"></span>
              Parcours Scolaire
            </h3>
            <span className="text-[10px] text-slate-400 font-black bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm uppercase tracking-widest">
              Registre Académique Atlas
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] tracking-[0.2em] font-black">
                <tr>
                  <th className="px-8 py-5">Année Scolaire</th>
                  <th className="px-6 py-5">Classe</th>
                  <th className="px-6 py-5">Moyenne Générale</th>
                  <th className="px-6 py-5 text-center">Appréciation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-black text-slate-800">2025-2026</td>
                  <td className="px-6 py-5 text-slate-600 font-black uppercase tracking-widest">{student.grade}</td>
                  <td className="px-6 py-5 font-black text-moroccan-green">— / 20</td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 bg-slate-100 text-slate-400 text-[9px] font-black rounded-full uppercase tracking-widest">En cours...</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsEditingProfile(false)}>
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-xl shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">Modifier le Profil</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Édition des informations personnelles</p>
              </div>
              <button onClick={() => setIsEditingProfile(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Prénom</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-moroccan-green/20 focus:border-moroccan-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Nom</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-moroccan-green/20 focus:border-moroccan-green"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email (Optionnel)</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-moroccan-green/20 focus:border-moroccan-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Téléphone</label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-moroccan-green/20 focus:border-moroccan-green"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Niveau / Classe</label>
                  <select
                    value={editForm.grade}
                    onChange={e => setEditForm({ ...editForm, grade: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-800 focus:outline-none focus:ring-2 focus:ring-moroccan-green/20 focus:border-moroccan-green"
                  >
                    {ALL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-slate-300 text-moroccan-green focus:ring-moroccan-green/20"
                />
                <label htmlFor="isActive" className="text-sm font-black text-slate-700 cursor-pointer">Compte Actif</label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 py-4 rounded-2xl border border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingParent}
                  className="flex-1 py-4 rounded-2xl bg-moroccan-green text-white text-sm font-black hover:bg-deep-emerald transition-all shadow-xl shadow-moroccan-green/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingParent ? <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> : null}
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
