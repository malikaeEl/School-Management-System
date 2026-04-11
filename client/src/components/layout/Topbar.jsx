import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import ChangePasswordModal from '../modals/ChangePasswordModal';
import notificationService from '../../services/notificationService';

const Topbar = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showPassModal, setShowPassModal] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-4 z-30 transition-colors">
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4 lg:gap-6">

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
          title={theme === 'light' ? 'Mode Sombre' : 'Mode Clair'}
        >
          <span className="material-symbols-outlined text-xl">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm relative group"
          >
            <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-white dark:border-slate-900"></span>
            )}
          </button>

          {showNotifications && (
            <div className={`absolute top-full mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-top-2 duration-300 z-50 ${lang === 'ar' ? 'left-0' : 'right-0'}`}>
               <div className="p-5 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && <span className="text-[9px] font-black bg-red-50 text-red-500 px-2 py-0.5 rounded-full uppercase">{unreadCount} nouvelles</span>}
               </div>
               <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800">
                  {notifications.length > 0 ? notifications.map((n) => (
                    <div 
                      key={n._id} 
                      onClick={() => handleMarkRead(n._id)}
                      className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-moroccan-green/5' : ''}`}
                    >
                       <div className="flex gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type === 'exam' ? 'bg-amber-50 text-amber-500' : 
                            n.type === 'invoice' ? 'bg-emerald-50 text-emerald-500' : 
                            'bg-moroccan-gold/10 text-moroccan-gold'
                          }`}>
                             <span className="material-symbols-outlined text-[18px]">
                               {n.type === 'exam' ? 'assignment' : n.type === 'invoice' ? 'receipt_long' : 'notifications'}
                             </span>
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase leading-tight mb-1">{n.title}</p>
                             <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-relaxed">{n.message}</p>
                             <p className="text-[9px] text-slate-300 font-black uppercase italic mt-1.5">{new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                       </div>
                       {!n.read && <div className="absolute top-4 right-4 w-2 h-2 bg-moroccan-green rounded-full shadow-sm"></div>}
                    </div>
                  )) : (
                    <div className="p-10 text-center">
                       <p className="text-[10px] text-slate-400 font-black uppercase italic tracking-widest">Aucune notification</p>
                    </div>
                  )}
               </div>
               {notifications.length > 0 && (
                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 text-center">
                    <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-moroccan-green transition-colors">Tout marquer comme lu</button>
                 </div>
               )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 relative">
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <div className="flex items-center justify-center gap-3 p-1 px-4 rounded-xl border border-transparent">
            <div className="w-9 h-9 bg-moroccan-gold/10 rounded-lg flex items-center justify-center border border-moroccan-gold/20">
              <span className="material-symbols-outlined text-moroccan-gold">account_circle</span>
            </div>
            <div className="hidden lg:block text-center">
              <p className="text-xs font-black text-slate-800 dark:text-white leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tighter text-center">
                {user?.role === 'admin' ? 'Administration' : user?.role === 'teacher' ? 'Enseignant' : user?.role === 'parent' ? 'Parent' : 'Élève'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal 
        isOpen={showPassModal} 
        onClose={() => setShowPassModal(false)} 
      />
    </header>
  );
};

export default Topbar;
