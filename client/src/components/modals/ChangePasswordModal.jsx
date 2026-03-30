import React, { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { useLanguage } from '../../context/LanguageContext';

const ChangePasswordModal = ({ isOpen, onClose, userId = null, userName = '' }) => {
  const { lang } = useLanguage();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (form.newPassword !== form.confirmPassword) {
      return setError('Les nouveaux mots de passe ne correspondent pas.');
    }

    if (form.newPassword.length < 6) {
      return setError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
    }

    setLoading(true);
    try {
      if (userId) {
        // Admin resetting another user's password
        await userService.update(userId, { password: form.newPassword });
      } else {
        // User changing own password
        await userService.changePassword({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword
        });
      }
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-deep-emerald/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-500 ${lang === 'ar' ? 'pr-64' : 'pl-64'}`}>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-[340px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/10">
        
        {/* Header - More compact */}
        <div className="p-6 border-b border-white/5 bg-linear-to-br from-deep-emerald to-moroccan-green text-white relative">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-inner shrink-0">
               <span className="material-symbols-outlined text-xl">lock_reset</span>
            </div>
            <div className="min-w-0">
               <h2 className="text-sm font-black uppercase tracking-tight truncate">Sécurité</h2>
               <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-0.5 truncate">
                 {userId ? `${userName}` : 'Changer mot de passe'}
               </p>
            </div>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Content - Tighter padding */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center animate-in zoom-in duration-500">
               <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10 border border-emerald-100">
                  <span className="material-symbols-outlined text-3xl">done_all</span>
               </div>
               <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1">Succès</h3>
               <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-relaxed">Mise à jour effectuée ✓</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-moroccan-red/10 border border-moroccan-red/20 text-moroccan-red rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top">
                  <span className="material-symbols-outlined text-xs">error</span>
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {!userId && (
                <div>
                  <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Ancien mot de passe</label>
                  <div className="relative">
                    <input 
                      type={showPass ? "text" : "password"}
                      required 
                      value={form.currentPassword}
                      onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-moroccan-gold/10 focus:border-moroccan-gold transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nouveau mot de passe</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"}
                    required 
                    value={form.newPassword}
                    onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-moroccan-green transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirmation</label>
                <input 
                  type={showPass ? "text" : "password"}
                  required 
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green transition-all"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} className="flex-1 py-3 text-[9px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-[0.2em] transition-all">Retour</button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3 bg-moroccan-green text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-moroccan-green/20 hover:bg-deep-emerald disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <span className="material-symbols-outlined animate-spin text-xs">progress_activity</span> : 'Valider'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
