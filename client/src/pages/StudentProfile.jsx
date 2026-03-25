import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import userService from '../services/userService';

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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
      <button onClick={() => navigate('/students')} className="mt-4 text-moroccan-green font-black hover:underline uppercase tracking-widest text-xs">Retour à la liste</button>
    </div>
  );

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 text-gray-900 bg-slate-50/50 p-4 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-black text-deep-emerald tracking-tight">
          Profil de l'Étudiant <span className="text-moroccan-gold">#{student._id?.substring(0, 8)}</span>
        </h2>
        <div className="flex items-center space-x-3 gap-2">
          <button className="px-5 py-2.5 border border-slate-300 rounded-xl text-xs font-black hover:bg-slate-50 text-slate-700 shadow-sm transition-all uppercase tracking-widest">
            Exporter PDF
          </button>
          <button className="px-5 py-2.5 bg-moroccan-green text-white rounded-xl text-xs font-black hover:bg-deep-emerald transition-all shadow-lg hidden sm:block uppercase tracking-widest">
            Sauvegarder
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* TopGrid (Personal & ID Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Details Form */}
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
                <div className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-3.5 px-5 text-sm font-black text-slate-800">{student.email}</div>
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

          {/* Student ID Card Preview */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col items-center">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 self-start">Badge Officiel</h3>
            <div className="w-full aspect-[1.58/1] bg-linear-to-br from-deep-emerald to-moroccan-green rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl border border-white/10 group">
              <div className="absolute inset-0 zellige-pattern opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 overflow-hidden shadow-inner">
                    <span className="text-3xl font-black text-white/50">{student.firstName?.[0]}{student.lastName?.[0]}</span>
                  </div>
                  <div className={`text-${lang === 'ar' ? 'left' : 'right'}`}>
                    <p className="text-[10px] font-black text-moroccan-gold uppercase tracking-[0.2em]">Atlas Academy</p>
                    <p className="text-[8px] font-bold opacity-70 uppercase tracking-widest">Digital Campus</p>
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
            <button className="mt-8 text-[11px] text-moroccan-green font-black hover:text-deep-emerald transition-colors flex items-center gap-2 uppercase tracking-[0.2em]">
              <span className="material-symbols-outlined text-lg">print</span>
              Imprimer le badge
            </button>
          </div>
        </div>

        {/* MiddleGrid (Documents & Parents) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Section Parent */}
           <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black flex items-center text-deep-emerald uppercase tracking-widest">
                <span className="w-2 h-7 bg-moroccan-green rounded-full mr-3 ml-3"></span>
                Parent / Tuteur
              </h3>
            </div>
            {student.parentId ? (
              <div className="flex items-center p-6 border border-moroccan-green/10 rounded-3xl bg-moroccan-green/2 transition-all hover:bg-moroccan-green/5 cursor-pointer group">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-moroccan-green font-black text-xl mr-5 ml-5 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">family_restroom</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-black text-slate-800">Compte Parent Lié</p>
                    <span className="text-[9px] px-2.5 py-1 bg-moroccan-green text-white rounded-lg font-black uppercase tracking-widest">Vérifié</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">ID: {student.parentId}</p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-100 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                 <span className="material-symbols-outlined text-slate-200 text-4xl mb-3">link_off</span>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Aucun parent rattaché</p>
                 <button className="mt-4 px-6 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest hover:bg-slate-800 transition-all">Lier un compte</button>
              </div>
            )}
          </div>

          {/* Section Documents */}
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 flex flex-col">
            <h3 className="text-lg font-black mb-6 flex items-center text-deep-emerald uppercase tracking-widest">
              <span className="w-2 h-7 bg-moroccan-red rounded-full mr-3 ml-3"></span>
              Pièces Jointes
            </h3>
            <div className="border border-slate-100 bg-slate-50/50 rounded-3xl p-10 text-center flex flex-col items-center justify-center flex-1">
                <span className="material-symbols-outlined text-slate-200 text-4xl mb-3">folder_open</span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">Aucun document importé pour le moment</p>
                <div className="mt-6 w-full max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div className="w-0 h-full bg-moroccan-green transition-all duration-1000"></div>
                </div>
            </div>
          </div>
        </div>

        {/* Academic History Mock (Static for UI) */}
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
                  <td className="px-8 py-5 font-black text-slate-800">2024-2025</td>
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
    </div>
  );
};

export default StudentProfile;
