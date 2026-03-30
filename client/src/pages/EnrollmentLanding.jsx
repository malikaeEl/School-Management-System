import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ALL_LEVELS } from '../constants/schoolLevels';
import admissionService from '../services/admissionService';

const EnrollmentLanding = () => {
  const { lang, t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    grade: 'CP',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await admissionService.submit(form);
      setSubmitted(true);
    } catch (err) {
      setError("Une erreur est survenue lors de l'envoi. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-moroccan-green/10 text-moroccan-green rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <h2 className="text-3xl font-black text-deep-emerald mb-4">Merci !</h2>
          <p className="text-slate-600 font-medium mb-8">
            Votre demande d'inscription pour <span className="font-black text-slate-800">{form.studentName}</span> a été reçue. 
            Notre équipe vous contactera très prochainement au <span className="font-bold">{form.phone}</span>.
          </p>
          <Link to="/login" className="inline-block bg-moroccan-gold text-deep-emerald px-8 py-3 rounded-2xl font-black shadow-lg shadow-moroccan-gold/20 hover:scale-105 transition-transform uppercase tracking-widest text-xs">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-white ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      {/* Navigation */}
      <nav className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-moroccan-gold rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="material-symbols-outlined text-deep-emerald">school</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-widest text-slate-900 leading-none uppercase">Atlas Academy</span>
            <span className="text-[10px] font-bold text-moroccan-gold tracking-[0.2em] leading-tight text-center">MOROCCO</span>
          </div>
        </div>
        <Link to="/login" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-moroccan-green transition-colors">
          Se Connecter
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Hero Content */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-moroccan-green/10 text-moroccan-green px-4 py-2 rounded-full border border-moroccan-green/20">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Inscriptions Ouvertes 2026-2027</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-deep-emerald tracking-tight leading-[0.9]">
            Façonner le <span className="text-moroccan-gold italic">Futur</span> à Atlas Academy
          </h1>
          <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
            Rejoignez une communauté d'excellence où l'innovation rencontre la tradition marocaine. Offrez à votre enfant une éducation de classe mondiale.
          </p>
          <div className="flex flex-wrap gap-8 items-center pt-4">
             <div className="flex flex-col">
                <span className="text-3xl font-black text-slate-900">98%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réussite</span>
             </div>
             <div className="w-px h-12 bg-slate-100"></div>
             <div className="flex flex-col">
                <span className="text-3xl font-black text-slate-900">12:1</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ratio Élève/Prof</span>
             </div>
          </div>
        </div>

        {/* Enrollment Form */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 lg:p-12 border border-slate-100 shadow-xl relative">
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-moroccan-gold/10 rounded-full blur-3xl"></div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Demande d'Inscription</h3>
          <p className="text-slate-500 font-bold text-sm mb-8 italic">Complétez le formulaire pour initier le processus.</p>
          
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom de l'élève</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Adam Bennani"
                  value={form.studentName}
                  onChange={e => setForm(p => ({...p, studentName: e.target.value}))}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Niveau Souhaité</label>
                <select 
                  value={form.grade}
                  onChange={e => setForm(p => ({...p, grade: e.target.value}))}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all appearance-none"
                >
                  {ALL_LEVELS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nom du Parent / Tuteur</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Mohamed Bennani"
                value={form.parentName}
                onChange={e => setForm(p => ({...p, parentName: e.target.value}))}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="parent@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({...p, email: e.target.value}))}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Téléphone</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+212 6..."
                  value={form.phone}
                  onChange={e => setForm(p => ({...p, phone: e.target.value}))}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Message (Optionnel)</label>
              <textarea 
                rows="3"
                placeholder="Parlez-nous un peu de votre enfant..."
                value={form.message}
                onChange={e => setForm(p => ({...p, message: e.target.value}))}
                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all resize-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-deep-emerald text-white py-4 rounded-2xl font-black shadow-xl shadow-deep-emerald/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? 'Envoi...' : 'Envoyer la Demande'}
              {!loading && <span className="material-symbols-outlined">send</span>}
            </button>
          </form>
        </div>
      </main>

      <footer className="mt-24 p-12 bg-slate-900 text-white text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Atlas Academy Education Group &copy; 2025</p>
      </footer>
    </div>
  );
};

export default EnrollmentLanding;
