import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const CommunicationHub = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inbox');
  const isParent = user?.role === 'parent';

  const conversations = [
    { id: 1, name: 'Mme. Bennani', class: 'CP-B', msg: "Merci pour le suivi concernant l'absence de Sofia...", time: '10:42', avatar: '1', isAdmin: false, isFinance: false },
    { id: 2, name: 'M. Tazi', class: '3ème A', msg: "Est-ce que l'excursion de demain est maintenue ?", time: 'Hier', avatar: '2', isAdmin: false, isFinance: false },
    { id: 3, name: 'Direction', class: 'Admin', msg: "Le nouveau calendrier des examens est prêt.", time: 'Mon', avatar: '3', isAdmin: true, isFinance: false },
    { id: 4, name: 'Service Financier', class: 'Comptabilité', msg: "Reçu de paiement disponible.", time: 'Ven', avatar: '4', isAdmin: false, isFinance: true }
  ];

  const filteredConversations = isParent 
    ? conversations.filter(c => c.isAdmin || c.isFinance) 
    : conversations;

  const [selectedChat, setSelectedChat] = useState(filteredConversations[0] || conversations[0]);

  return (
    <div className={`animate-in fade-in duration-500 w-full h-[calc(100vh-120px)] flex flex-col lg:flex-row bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden -m-4 sm:-m-6 lg:-m-8 ${lang === 'ar' ? 'font-arabic flex-row-reverse' : ''}`}>
      
      {/* Sidebar: Inbox List */}
      <div className={`w-full lg:w-96 flex flex-col border-slate-100 bg-slate-50/50 ${lang === 'ar' ? 'border-l' : 'border-r'}`}>
        <div className="p-6 border-b border-slate-100 flex flex-col gap-4">
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">Messagerie</h1>
          {/* ... search ... */}
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((chat, i) => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChat(chat)}
              className={`p-6 border-b border-slate-100 cursor-pointer transition-all hover:bg-white relative group ${selectedChat.id === chat.id ? 'bg-white' : ''}`}
            >
              {selectedChat.id === chat.id && <div className={`absolute top-0 bottom-0 w-1.5 bg-moroccan-gold ${lang === 'ar' && !isParent ? 'right-0' : 'left-0'}`}></div>}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border border-slate-100 shadow-sm transition-transform group-hover:scale-105">
                    <img src={`https://i.pravatar.cc/150?u=${chat.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  {selectedChat.id === chat.id && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{chat.name}</h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{chat.time}</span>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tight mb-1">{chat.class}</p>
                  <p className="text-xs text-slate-500 line-clamp-1 italic">{chat.msg}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white min-w-0 relative">
        {/* Chat Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 overflow-hidden shadow-inner">
               <img src={`https://i.pravatar.cc/150?u=${selectedChat.avatar}`} alt="active-avatar" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedChat.name} ({selectedChat.class})</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">En ligne</span>
              </div>
            </div>
          </div>
          {/* ... icons ... */}
        </div>

        {/* Messages */}
        <div className="flex-1 p-8 overflow-y-auto space-y-6 bg-slate-50/20">
          <div className={`flex gap-4 max-w-[80%] ${(lang === 'ar' && !isParent) ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-xl bg-white shrink-0 overflow-hidden mt-auto shadow-sm">
               <img src={`https://i.pravatar.cc/150?u=${selectedChat.avatar}`} alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className={`p-4 rounded-3xl shadow-sm border border-slate-100 ${(lang === 'ar' && !isParent) ? 'bg-white rounded-br-none' : 'bg-white rounded-bl-none'}`}>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {selectedChat.isAdmin ? "Le calendrier est prêt." : "Bonjour, avez-vous des nouvelles ?"}
              </p>
              <span className="text-[10px] font-black text-slate-300 uppercase mt-2 block">{selectedChat.time}</span>
            </div>
          </div>

          <div className={`flex gap-4 max-w-[80%] justify-end ml-auto ${(lang === 'ar' && !isParent) ? 'flex-row-reverse' : ''}`}>
            <div className={`p-4 rounded-3xl shadow-xl shadow-moroccan-green/10 ${(lang === 'ar' && !isParent) ? 'bg-moroccan-green text-white rounded-bl-none' : 'bg-moroccan-green text-white rounded-br-none'}`}>
              <p className="text-sm leading-relaxed font-medium">Merci pour l'information.</p>
              <span className="text-[10px] font-black text-white/40 uppercase mt-2 block text-right">10:45</span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-deep-emerald shrink-0 overflow-hidden mt-auto shadow-sm">
               <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-white uppercase">{user?.name?.substring(0,2)}</div>
            </div>
          </div>
        </div>

        {/* Composer */}
        <div className="p-6 border-t border-slate-100 bg-white">
          <div className={`flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-moroccan-green transition-all ${(lang === 'ar' && !isParent) ? 'flex-row-reverse' : ''}`}>
             <button className="w-10 h-10 rounded-xl text-slate-400 hover:text-moroccan-green hover:bg-white transition-all">
               <span className="material-symbols-outlined">attach_file</span>
             </button>
             <input 
               type="text" 
               placeholder="Tapez votre message..."
               className={`flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium outline-none p-2 ${(lang === 'ar' && !isParent) ? 'text-right' : ''}`}
             />
             <button className="w-10 h-10 rounded-xl text-slate-400 hover:text-moroccan-gold hover:bg-white transition-all">
               <span className="material-symbols-outlined">mood</span>
             </button>
             <button className="w-12 h-12 rounded-xl bg-moroccan-gold text-deep-emerald flex items-center justify-center shadow-lg shadow-moroccan-gold/20 hover:brightness-110 transition-all">
               <span className="material-symbols-outlined">send</span>
             </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Announcements (Desktop Only) */}
      <div className={`hidden xl:flex w-96 flex-col border-slate-100 bg-slate-50/30 ${(lang === 'ar' && !isParent) ? 'border-r' : 'border-l'}`}>
         <div className="p-6 border-b border-slate-100">
            <h3 className="text-[10px] font-black text-moroccan-gold uppercase tracking-[0.2em] mb-4">Annonces</h3>
            <div className="space-y-4">
               {[
                 { title: 'Réunion Trimestrielle', date: "Aujourd'hui", type: 'URGENT', color: 'bg-moroccan-red' },
                 { title: 'Menu Cantine: Octobre', date: 'Hier', type: 'INFO', color: 'bg-moroccan-green' }
               ].map((ann, i) => (
                 <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className={`absolute top-0 bottom-0 w-1 ${(lang === 'ar' && !isParent) ? 'right-0' : 'left-0'} ${ann.color}`}></div>
                    <div className="flex justify-between items-start mb-2">
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${ann.color}`}>{ann.type}</span>
                       <span className="text-[9px] font-black text-slate-300 uppercase">{ann.date}</span>
                    </div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight">{ann.title}</h4>
                 </div>
               ))}
            </div>
         </div>

         <div className="p-8 mt-auto">
            <div className="bg-deep-emerald p-6 rounded-3xl text-white relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-sm font-black uppercase tracking-tight mb-2 italic">Broadcast</h4>
                  <p className="text-[11px] text-white/60 font-medium leading-relaxed mb-6">Envoyez une annonce groupée par Mobile, Email et SMS en un clic.</p>
                  <button className="w-full py-3 bg-moroccan-gold text-deep-emerald rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-black/20">
                    Composer
                  </button>
               </div>
               <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-7xl text-white/5 group-hover:rotate-12 transition-transform duration-700">campaign</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CommunicationHub;
