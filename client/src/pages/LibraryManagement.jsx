import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import libraryService from '../services/libraryService';
import userService from '../services/userService';

const LibraryManagement = () => {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'teacher';

  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [overview, setOverview] = useState(null);
  const [books, setBooks] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [showAddBook, setShowAddBook] = useState(false);
  const [bookForm, setBookForm] = useState({ title: '', author: '', isbn: '', category: 'Roman' });

  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ bookId: '', userId: '' });

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isStaff) {
        const [overviewData, booksData, borrowsData, usersData] = await Promise.all([
          libraryService.getOverview(),
          libraryService.getBooks(),
          libraryService.getBorrows(),
          userService.getAll()
        ]);
        setOverview(overviewData);
        setBooks(booksData);
        setBorrows(borrowsData);
        setStudents(usersData.filter(u => u.role === 'student'));
      }
    } catch {
      showToast('Erreur chargement données', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    try {
      await libraryService.addBook(bookForm);
      showToast('Livre ajouté ✓');
      setShowAddBook(false);
      setBookForm({ title: '', author: '', isbn: '', category: 'Roman' });
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur ajout', 'bg-moroccan-red');
    }
  };

  const handleBorrowBook = async (e) => {
    e.preventDefault();
    try {
      await libraryService.borrowBook(borrowForm);
      showToast('Livre emprunté ✓');
      setShowBorrowModal(false);
      setBorrowForm({ bookId: '', userId: '' });
      fetchData();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur emprunt', 'bg-moroccan-red');
    }
  };

  const exportCSV = () => {
    if (!books.length) return showToast('Aucun livre à exporter', 'bg-slate-500');
    
    const headers = ['Titre', 'Auteur', 'ISBN', 'Catégorie', 'Statut'];
    const rows = books.map(b => [b.title, b.author, b.isbn, b.category, b.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bibliotheque_atlas.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Export CSV réussi ✓');
  };

  if (!isStaff) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-in fade-in zoom-in duration-500">
        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">gpp_bad</span>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">Accès Restreint</h2>
        <p className="text-sm font-bold text-slate-400 mt-2">La gestion de la bibliothèque est réservée au personnel.</p>
      </div>
    );
  }

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {/* Toast */}
      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right duration-300`}>{toast.msg}</div>}

      {/* Add Book Modal */}
      {showAddBook && (
        <div className="fixed inset-0 bg-deep-emerald/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Ajouter un Livre</h2>
              <button onClick={() => setShowAddBook(false)} className="text-slate-400 hover:text-moroccan-red transition-colors bg-white dark:bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <form onSubmit={handleAddBook} className="p-8 space-y-6">
              {[
                { key: 'title',  label: 'Titre', placeholder: 'Le Petit Prince' },
                { key: 'author', label: 'Auteur', placeholder: 'Antoine de Saint-Exupéry' },
                { key: 'isbn',   label: 'ISBN', placeholder: '978-X-XXX-XXXXX-X' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{f.label}</label>
                  <input value={bookForm[f.key]} onChange={e => setBookForm(p => ({...p, [f.key]: e.target.value}))} placeholder={f.placeholder} required className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-moroccan-green rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-white outline-none transition-all"/>
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Catégorie</label>
                <select value={bookForm.category} onChange={e => setBookForm(p => ({...p, category: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-moroccan-green rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-white outline-none transition-all uppercase tracking-widest">
                  {['Roman', 'Science', 'Histoire', 'Mathématiques', 'Philosophie', 'Informatique', 'Littérature', 'Autre'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddBook(false)} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-moroccan-green text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-moroccan-green/20 hover:brightness-110 transition-all">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Book Modal */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-deep-emerald/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Nouvel Emprunt</h2>
              <button onClick={() => setShowBorrowModal(false)} className="text-slate-400 hover:text-moroccan-red transition-colors bg-white dark:bg-slate-900 w-8 h-8 rounded-full flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>
            <form onSubmit={handleBorrowBook} className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Livre (Disponible)</label>
                <select required value={borrowForm.bookId} onChange={e => setBorrowForm(p => ({...p, bookId: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-moroccan-green rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-white outline-none transition-all uppercase tracking-widest">
                  <option value="">-- Choisir un livre --</option>
                  {books.filter(b => b.status === 'Disponible').map(b => <option key={b._id} value={b._id}>{b.title} ({b.author})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Élève</label>
                <select required value={borrowForm.userId} onChange={e => setBorrowForm(p => ({...p, userId: e.target.value}))} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-moroccan-green rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-white outline-none transition-all uppercase tracking-widest">
                  <option value="">-- Choisir un élève --</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.grade})</option>)}
                </select>
              </div>
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowBorrowModal(false)} className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Annuler</button>
                <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:brightness-110 transition-all">Enregistrer l'Emprunt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase flex items-center gap-3">
             <span className="w-2 h-8 bg-moroccan-green rounded-full"></span>
             Tableau de Bord Libraire
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest leading-relaxed">
             Gérer les ressources de la bibliothèque, la circulation et les activités des membres
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button onClick={exportCSV} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-300 shadow-sm">
            <span className="material-symbols-outlined text-lg">file_download</span> Exporter Excel
          </button>
          <button onClick={() => setShowAddBook(true)} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-8 py-3 bg-moroccan-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-moroccan-green/20">
            <span className="material-symbols-outlined text-lg">add</span> Livre
          </button>
          <button onClick={() => setShowBorrowModal(true)} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-8 py-3 bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-blue-500/20">
            <span className="material-symbols-outlined text-lg">outbound</span> Emprunt
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><span className="material-symbols-outlined animate-spin text-moroccan-green text-4xl">progress_activity</span></div>
      ) : (
        <>
          {/* Stats Overview */}
          {overview && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Livres', value: overview.totalBooks, sub: 'Fonds documentaire', icon: 'auto_stories', color: 'text-moroccan-green', bg: 'bg-moroccan-green/10' },
                { label: 'Emprunts Actifs', value: overview.activeBorrows, sub: 'En circulation', icon: 'outbound', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Retards', value: overview.overdueCount, sub: 'Urgent', icon: 'error', color: 'text-moroccan-red', bg: 'bg-moroccan-red/10', pulse: true },
                { label: 'Amendes', value: `${overview.totalFines} MAD`, sub: 'Cumul', icon: 'account_balance_wallet', color: 'text-moroccan-gold', bg: 'bg-moroccan-gold/10' }
              ].map((metric, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className={`w-12 h-12 ${metric.bg} rounded-2xl flex items-center justify-center ${metric.color}`}>
                      <span className="material-symbols-outlined">{metric.icon}</span>
                    </div>
                    {metric.pulse && <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 text-white bg-moroccan-red rounded-full animate-pulse shadow-lg shadow-moroccan-red/30`}>{metric.sub}</span>}
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest relative z-10">{metric.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white relative z-10 mt-1 tracking-tight">{metric.value}</p>
                  <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${metric.bg} rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50`}></div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-3xl w-fit border border-slate-200 dark:border-slate-700 backdrop-blur-sm">
            <button onClick={() => setActiveTab('inventory')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-white dark:bg-slate-900 text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Inventaire</button>
            <button onClick={() => setActiveTab('borrowers')} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'borrowers' ? 'bg-white dark:bg-slate-900 text-blue-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>Circulation ({borrows.length})</button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            {activeTab === 'inventory' && (
              <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Livre</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Auteur</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">ISBN</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Catégorie</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {books.length === 0 ? (
                      <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 uppercase tracking-widest text-[10px] font-black">Aucun livre dans l'inventaire</td></tr>
                    ) : books.map(book => (
                      <tr key={book._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-moroccan-gold/5 dark:bg-slate-800 rounded-2xl border border-moroccan-gold/10 dark:border-slate-700 flex items-center justify-center shrink-0 group-hover:bg-moroccan-gold/10 transition-colors">
                              <span className="material-symbols-outlined text-moroccan-gold">book_2</span>
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900 dark:text-white uppercase group-hover:text-moroccan-green transition-colors">{book.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{book.author}</td>
                        <td className="px-8 py-5 text-[10px] font-mono font-black text-slate-400"><span className="bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg w-fit inline-block">{book.isbn}</span></td>
                        <td className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">{book.category}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            book.status === 'Disponible' ? 'bg-moroccan-green/10 text-moroccan-green' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {book.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'borrowers' && (
               <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Élève</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Livre</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Emprunt Le</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Retour Prévu</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {borrows.length === 0 ? (
                      <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-400 uppercase tracking-widest text-[10px] font-black">Aucun emprunt en cours</td></tr>
                    ) : borrows.map(borrow => (
                      <tr key={borrow._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 uppercase text-xs">
                                {borrow.user?.firstName?.[0]}{borrow.user?.lastName?.[0]}
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{borrow.user?.firstName} {borrow.user?.lastName}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm font-black text-slate-800 dark:text-slate-300 uppercase tracking-tight">{borrow.book?.title}</td>
                        <td className="px-8 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{new Date(borrow.borrowDate).toLocaleDateString()}</td>
                        <td className="px-8 py-5 text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{new Date(borrow.dueDate).toLocaleDateString()}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            borrow.status === 'Overdue' ? 'bg-moroccan-red/10 text-moroccan-red animate-pulse' :
                            borrow.status === 'Active' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {borrow.status === 'Overdue' ? `Retard (${borrow.fine} MAD)` : borrow.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LibraryManagement;
