import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const Topbar = () => {
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex justify-between items-center mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 sticky top-4 z-30 transition-colors">
      <div className="relative group">
        <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 group-focus-within:text-moroccan-green transition-colors">
          <span className="material-symbols-outlined text-xl">search</span>
        </span>
        <input 
          className="pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-moroccan-green/10 focus:border-moroccan-green outline-none w-64 lg:w-96 text-sm transition-all placeholder:text-slate-400 font-medium dark:text-white" 
          placeholder={t('search')} 
          type="text" 
        />
      </div>
      
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

        <div className="flex items-center gap-2">
          <button className="relative p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all group">
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-moroccan-red rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <button className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
            <div className="w-9 h-9 bg-moroccan-gold/10 rounded-lg flex items-center justify-center border border-moroccan-gold/20">
              <span className="material-symbols-outlined text-moroccan-gold">account_circle</span>
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-black text-slate-800 dark:text-white leading-none">Admin User</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-tighter">Super Admin</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
