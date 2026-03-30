import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login({ email, password });

      // Role-based redirection
      if (user.role === 'student') {
        navigate('/student-dashboard');
      } else if (user.role === 'parent') {
        navigate('/parent-dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher-dashboard');
      } else if (user.role === 'admin') {
        navigate('/');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-emerald-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="mx-auto w-20 h-20 bg-moroccan-gold rounded-3xl flex items-center justify-center mb-5 shadow-2xl shadow-moroccan-gold/30 transform rotate-3 hover:rotate-0 transition-transform duration-300">
            <span className="material-symbols-outlined text-deep-emerald text-4xl">school</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Atlas Academy</h1>
          <p className="text-slate-400 mt-2 font-medium">Portail de gestion scolaire</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden border border-slate-100">
          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500">error</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Adresse Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green outline-none transition-all text-slate-800 font-medium"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green outline-none transition-all text-slate-800 font-medium pr-14"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-moroccan-green transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-deep-emerald hover:bg-black text-white rounded-2xl font-black mt-6 shadow-xl shadow-deep-emerald/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Connexion...
                  </>
                ) : (
                  <>
                    Se Connecter
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Enrollment link */}
          <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium mb-2">Nouveau à Atlas Academy ?</p>
            <Link
              to="/enroll"
              className="text-[11px] font-black text-moroccan-green uppercase tracking-widest hover:underline inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Faire une demande d'inscription
            </Link>
          </div>
        </div>

        <p className="text-center mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} Atlas Academy · Tous droits réservés
        </p>
      </div>
    </div>
  );
};

export default Login;
