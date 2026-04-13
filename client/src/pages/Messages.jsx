import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import messageService from '../services/messageService';
import userService from '../services/userService';

const Messages = () => {
  const { lang, t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new messages every 10 seconds
    const interval = setInterval(() => {
       if (selectedContact) fetchMessages(selectedContact._id);
       fetchConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedContact]);

  useEffect(scrollToBottom, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const data = await messageService.getMessages(userId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    setMessages([]);
    setShowNewChatModal(false);
    fetchMessages(contact._id);
  };

  const handleOpenNewChat = async () => {
    setShowNewChatModal(true);
    try {
      const allUsers = await userService.getAll();
      // Filter out self and according to roles:
      // If admin: show all but self
      // If parent/teacher: only show admins
      const filtered = allUsers.filter(u => {
        if (u._id === currentUser._id) return false;
        if (currentUser.role === 'admin') return true;
        return u.role === 'admin';
      });
      setAvailableUsers(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    setSending(true);
    try {
      await messageService.sendMessage(selectedContact._id, newMessage);
      setNewMessage('');
      fetchMessages(selectedContact._id);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-120px)] bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in duration-500 ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <div className="flex h-full">
        
        {/* Sidebar: Conversations */}
        <div className="w-1/3 border-r border-slate-50 dark:border-slate-800 flex flex-col">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-deep-emerald tracking-tight uppercase">{t('messaging')}</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('school_discussions')}</p>
            </div>
            <button 
              onClick={handleOpenNewChat}
              className="w-10 h-10 rounded-xl bg-moroccan-green text-white flex items-center justify-center shadow-lg shadow-moroccan-green/20 hover:scale-105 active:scale-95 transition-all"
              title="Nouvelle discussion"
            >
              <span className="material-symbols-outlined">add_comment</span>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center p-10"><span className="material-symbols-outlined animate-spin text-moroccan-green">progress_activity</span></div>
            ) : conversations.length > 0 ? (
              conversations.map(c => (
                <div 
                  key={c._id}
                  onClick={() => handleSelectContact(c)}
                  className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all ${
                    selectedContact?._id === c._id ? 'bg-moroccan-green/10 border border-moroccan-green/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 overflow-hidden">
                       {c.avatar ? <img src={`${(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000')}${c.avatar}`} alt="" className="w-full h-full object-cover" /> : c.firstName[0]}
                    </div>
                    {c.isActive && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-moroccan-green border-4 border-white dark:border-slate-900"></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                       <h4 className="font-black text-sm text-slate-800 dark:text-white truncate uppercase tracking-tight">{c.firstName} {c.lastName}</h4>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.role === 'admin' ? 'Administration' : c.role === 'teacher' ? 'Enseignant' : 'Parent'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 opacity-30 px-6">
                <span className="material-symbols-outlined text-4xl mb-2">auto_messages</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Aucune discussion en cours</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950/20">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-moroccan-gold/10 text-moroccan-gold flex items-center justify-center font-black text-xs">
                     {selectedContact.firstName[0]}{selectedContact.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedContact.firstName} {selectedContact.lastName}</h3>
                    <p className="text-[9px] font-black text-moroccan-green uppercase tracking-widest">{selectedContact.isActive ? 'En ligne' : 'Occupé'}</p>
                  </div>
                </div>
              </div>

              {/* Messages Thread */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {messages.map((m, idx) => {
                  const isMine = m.sender === currentUser._id;
                  return (
                    <div key={idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMine ? 'order-1' : 'order-2'}`}>
                        <div className={`p-5 rounded-[2rem] text-sm shadow-xl shadow-slate-200/20 ${
                          isMine 
                            ? 'bg-linear-to-br from-moroccan-green to-deep-emerald text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none'
                        }`}>
                          <p className="font-medium leading-relaxed">{m.content}</p>
                          <div className={`mt-2 text-[9px] font-black uppercase tracking-tighter opacity-50 ${isMine ? 'text-white' : 'text-slate-400'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSend} className="p-6 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                 <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 rounded-3xl p-2 pl-6 shadow-inner">
                    <input 
                      type="text"
                      placeholder="Écrivez votre message ici..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-medium text-slate-700 dark:text-slate-200"
                    />
                    <button 
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="w-12 h-12 rounded-2xl bg-moroccan-gold text-white flex items-center justify-center shadow-lg shadow-moroccan-gold/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                       <span className="material-symbols-outlined text-xl">send</span>
                    </button>
                 </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
               <div className="w-24 h-24 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 mb-6 border border-slate-50 dark:border-slate-800">
                  <span className="material-symbols-outlined text-5xl">forum</span>
               </div>
               <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Votre Messagerie</h3>
               <p className="text-sm text-slate-400 font-medium max-w-sm mt-2">Sélectionnez une conversation pour commencer à échanger avec l'administration.</p>
            </div>
          )}
        </div>

      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 overflow-hidden">
             <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{t('new_discussion')}</h3>
                <button onClick={() => setShowNewChatModal(false)} className="material-symbols-outlined text-slate-400">close</button>
             </div>
             
             <div className="p-6">
                <div className="relative mb-6">
                   <span className="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-sm">search</span>
                   <input 
                     type="text" 
                     placeholder="Rechercher un membre..."
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full pl-11 pr-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-black text-xs text-slate-700 dark:text-white uppercase tracking-widest"
                   />
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                   {availableUsers
                     .filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
                     .map(u => (
                      <div 
                        key={u._id}
                        onClick={() => handleSelectContact(u)}
                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                      >
                         <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400">
                            {u.firstName[0]}{u.lastName[0]}
                         </div>
                         <div className="flex-1">
                            <h4 className="font-black text-xs text-slate-800 dark:text-white uppercase tracking-tight">{u.firstName} {u.lastName}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{u.role === 'admin' ? 'Administration' : u.role === 'teacher' ? 'Enseignant' : 'Parent'}</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
