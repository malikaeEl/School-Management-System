import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import libraryService from '../../services/libraryService';

const Sidebar = () => {
  const { lang } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const fetchOverdue = async () => {
      if (user?.role === 'student') {
        try {
          const myBorrows = await libraryService.getMyBorrows();
          const count = myBorrows.filter(b => b.status === 'Overdue').length;
          setOverdueCount(count);
        } catch (err) {
          console.error('Error fetching library overdue count', err);
        }
      }
    };
    fetchOverdue();
  }, [user]);

  const menuCategories = [
    {
      id: 'portail',
      labels: { fr: 'PORTAIL', ar: 'البوابة' },
      items: [
        { title: 'Dashboard', icon: 'grid_view', path: '/', roles: ['admin'], arabic: 'لوحة الإدارة', french: 'Tableau de bord' },
        { title: 'My Dashboard', icon: 'person_outline', path: '/student-dashboard', roles: ['student'], arabic: 'لوحتي', french: 'Mon Tableau de bord' },
        { title: 'My Dashboard', icon: 'person_outline', path: '/teacher-dashboard', roles: ['teacher'], arabic: 'لوحتي', french: 'Mon Tableau de bord' },
        { title: 'My Dashboard', icon: 'family_restroom', path: '/parent-dashboard', roles: ['parent'], arabic: 'لوحتي', french: 'Mon Tableau de bord' },
        { title: 'My Leaves', icon: 'event_busy', path: '/teacher/leaves', roles: ['teacher'], arabic: 'طلبات الإجازة', french: 'Mes Congés' },
        { title: 'My Salary', icon: 'payments', path: '/teacher/salary', roles: ['teacher'], arabic: 'تفاصيل الراتب', french: 'Bulletin de Paie' },
        { title: 'Messages', icon: 'forum', path: '/messages', roles: ['admin', 'teacher', 'parent', 'student'], arabic: 'الرسائل', french: 'Messages' },
      ]
    },
    {
      id: 'administration',
      labels: { fr: 'ADMINISTRATION', ar: 'الإدارة' },
      roles: ['admin', 'finance'],
      items: [
        { title: 'Accounts', icon: 'manage_accounts', path: '/users', roles: ['admin'], arabic: 'إدارة الحسابات', french: 'Gestion des Comptes' },
        { title: 'Admissions', icon: 'how_to_reg', path: '/admission', roles: ['admin'], arabic: 'القبول والتسجيل', french: 'Admission & Inscription' },
        { title: 'Finance', icon: 'account_balance', path: '/finance', roles: ['admin', 'finance'], arabic: 'المالية', french: 'Finances' },
        { title: 'HR & Staff', icon: 'badge', path: '/hr', roles: ['admin', 'finance'], arabic: 'الموارد البشرية', french: 'RH & Personnel' },
      ]
    },
    {
      id: 'academique',
      labels: { fr: 'ACADÉMIQUE', ar: 'الأكاديمي' },
      roles: ['admin', 'teacher', 'student', 'parent'],
      items: [
        { title: 'Students', icon: 'school', path: '/students', roles: ['admin', 'teacher'], arabic: 'الطلاب', french: 'Étudiants' },
        { title: 'Attendance', icon: 'edit_calendar', path: '/attendance', roles: ['admin', 'teacher'], arabic: 'الحضور', french: 'Présence' },
        { title: 'Exams', icon: 'assignment', path: '/exams', roles: ['admin', 'teacher', 'student', 'parent'], arabic: 'الامتحانات', french: 'Examens & Notes' },
        { title: 'Timetable', icon: 'calendar_today', path: '/timetable', roles: ['admin', 'teacher', 'student'], arabic: 'الجدول الزمن', french: 'Emploi du temps' },
      ]
    },
    {
      id: 'services',
      labels: { fr: 'SERVICES', ar: 'الخدمات' },
      roles: ['admin', 'librarian', 'student', 'parent', 'finance'],
      items: [
        { title: 'Library', icon: 'local_library', path: '/library', roles: ['admin', 'librarian', 'student'], arabic: 'المكتبة', french: 'Bibliothèque' },
        { title: 'Inventory', icon: 'inventory_2', path: '/inventory', roles: ['admin', 'librarian', 'finance'], arabic: 'المخزون', french: 'Inventaire' },
        { title: 'Events', icon: 'event', path: '/events', roles: ['admin', 'teacher', 'student', 'parent'], arabic: 'الفعاليات', french: 'Événements' },
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed inset-y-0 ${lang === 'ar' ? 'right-0' : 'left-0'} w-64 bg-deep-emerald dark:bg-[#021f15] text-white transition-all duration-300 z-50 flex flex-col overflow-hidden border-inline-end border-white/5`}
      id="sidebar"
    >
      {/* Logo - Clickable to Home */}
      <Link to="/" className="p-6 flex items-center gap-3 border-b border-white/5 shrink-0 bg-white/5 dark:bg-transparent hover:bg-white/10 transition-colors group">
        <div className="w-10 h-10 bg-moroccan-gold rounded-xl flex items-center justify-center font-black text-deep-emerald shadow-lg shadow-black/20 shrink-0 transform rotate-3 group-hover:rotate-0 transition-transform">
          <span className="material-symbols-outlined">school</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-widest text-white leading-none">ATLAS</span>
          <span className="text-[10px] font-bold text-moroccan-gold tracking-[0.2em] leading-tight">ACADEMY</span>
        </div>
      </Link>

      {/* Scrollable Navigation */}
      <nav className={`flex-1 overflow-y-auto mt-4 px-3 space-y-6 scrollbar-hide ${lang === 'ar' ? 'font-arabic text-right' : 'font-sans'}`}>
        {menuCategories.map((cat) => {
          // Filter items within category based on user role
          const filteredItems = cat.items.filter(item => !item.roles || item.roles.includes(user?.role));
          if (filteredItems.length === 0) return null;

          return (
            <div key={cat.id} className="space-y-1.5">
              <p className="px-4 text-[9px] font-black text-white/30 tracking-[0.2em] uppercase mb-2">
                {lang === 'ar' ? cat.labels.ar : cat.labels.fr}
              </p>
              {filteredItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative
                    ${isActive(item.path)
                      ? 'bg-white/10 text-white shadow-inner font-bold border border-white/5'
                      : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                  <span className={`material-symbols-outlined transition-transform duration-300 shrink-0 ${isActive(item.path) ? 'scale-110 text-moroccan-gold' : 'group-hover:scale-110 group-hover:text-moroccan-gold'}`}>
                    {item.icon}
                  </span>
                  <span className="text-xs font-bold tracking-wide truncate">
                    {lang === 'ar' ? (item.arabic || item.title) : (item.french || item.title)}
                  </span>
                  
                  {/* Notification Badge for Library Overdue */}
                  {item.path === '/library' && overdueCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  )}

                  {isActive(item.path) && (
                    <div className={`w-1.5 h-1.5 rounded-full bg-moroccan-gold shadow-[0_0_8px_rgba(212,175,55,0.8)] shrink-0 ${lang === 'ar' ? 'mr-auto' : 'ml-auto'}`}></div>
                  )}
                </Link>
              ))}
            </div>
          );
        })}
      </nav>

      {/* ── Last section: User Profile + Logout ── */}
      <div className={`px-3 pt-3 pb-4 border-t border-white/10 shrink-0 ${lang === 'ar' ? 'font-arabic' : ''} bg-white/5 dark:bg-transparent`}>
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-moroccan-green to-moroccan-gold p-[2px] shrink-0">
            <div className="w-full h-full bg-deep-emerald dark:bg-[#021f15] rounded-[10px] flex items-center justify-center font-black text-white text-xs uppercase">
              {user?.firstName?.charAt(0) || user?.name?.substring(0, 2) || 'AD'}
            </div>
          </div>
          {/* Name & Role */}
          <div className="flex-1 truncate text-left min-w-0">
            <p className="text-sm font-black text-white truncate leading-none capitalize">{user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.name || 'Administrateur')}</p>
            <p className="text-[10px] text-white/40 font-bold mt-0.5 uppercase tracking-tighter">{user?.role || 'admin'}</p>
          </div>
          {/* Logout Button */}
          <button
            onClick={logout}
            title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
            className="text-white/40 hover:text-red-400 transition-colors shrink-0 p-1.5 rounded-lg hover:bg-red-400/10"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
