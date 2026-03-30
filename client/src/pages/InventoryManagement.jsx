import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import inventoryService from '../services/inventoryService';

const InventoryManagement = () => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('assets');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Mobilier', quantity: '', location: '', type: 'asset', status: 'Optimal' });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getAll();
      setItems(data);
    } catch {
      showToast('Erreur chargement inventaire.', 'bg-moroccan-red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        const updated = await inventoryService.updateItem(editingItem._id, form);
        setItems(prev => prev.map(i => i._id === updated._id ? updated : i));
        showToast('Article mis à jour ✓');
      } else {
        const created = await inventoryService.addItem(form);
        setItems(prev => [created, ...prev]);
        showToast('Article ajouté ✓');
      }
      setShowModal(false);
      setEditingItem(null);
      setForm({ name: '', category: 'Mobilier', quantity: '', location: '', type: 'asset', status: 'Optimal' });
    } catch (err) {
      showToast(err?.response?.data?.message || 'Erreur.', 'bg-moroccan-red');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cet article ?')) return;
    try {
      await inventoryService.removeItem(id);
      setItems(prev => prev.filter(i => i._id !== id));
      showToast('Article supprimé');
    } catch {
      showToast('Erreur suppression.', 'bg-moroccan-red');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      location: item.location,
      type: item.type,
      status: item.status
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ name: '', category: 'Mobilier', quantity: '', location: '', type: activeTab === 'consumables' ? 'consumable' : 'asset', status: 'Optimal' });
    setShowModal(true);
  };

  // Stats calculation
  const totalAssets = items.filter(i => i.type === 'asset').length;
  const totalConsumables = items.filter(i => i.type === 'consumable').length;
  const stockAlerts = items.filter(i => i.quantity <= 5).length;
  const inMaintenance = items.filter(i => i.status === 'Maintenance' || i.status === 'Réparation').length;

  const filteredItems = items.filter(item => {
    if (activeTab === 'assets') return item.type === 'asset';
    if (activeTab === 'consumables') return item.type === 'consumable';
    if (activeTab === 'alerts') return item.quantity <= 5;
    return true;
  });

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {toast && (
        <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-[10px] font-black uppercase tracking-widest animate-in slide-in-from-right`}>
          {toast.msg}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-linear-to-r from-deep-emerald to-moroccan-green text-white rounded-t-[2.5rem]">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">{editingItem ? 'Modifier l\'Article' : 'Nouvel Article'}</h2>
                <p className="text-[10px] opacity-70 font-black uppercase tracking-widest mt-1">Saisie des informations d'inventaire</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/70 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Nom de l'article</label>
                <input required value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="ex: MacBook Air M2" className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Quantité</label>
                  <input required type="number" min="0" value={form.quantity} onChange={e => setForm(p => ({...p, quantity: e.target.value}))} placeholder="10" className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                  <select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all">
                    <option value="asset text-black">Bien / Actif</option>
                    <option value="consumable text-black">Consommable</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Emplacement</label>
                <input required value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} placeholder="ex: Salle Info 1" className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Catégorie</label>
                  <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all">
                    {['Mobilier','Informatique','Laboratoire','Sport','Papeterie','Maintenance','Autre'].map(c=><option key={c} value={c} className="text-black">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">État</label>
                  <select value={form.status} onChange={e => setForm(p => ({...p, status: e.target.value}))} className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-moroccan-green/20 outline-none transition-all">
                    {['Optimal','Maintenance','Réparation','Déclassé'].map(s=><option key={s} value={s} className="text-black">{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-2xl border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Annuler</button>
                <button type="submit" disabled={submitting} className="flex-1 py-4 rounded-2xl bg-moroccan-green text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-moroccan-green/20 disabled:opacity-50">
                  {submitting ? 'Traitement...' : editingItem ? 'Actualiser' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
            <span className="w-2 h-8 bg-moroccan-green rounded-full"></span>
            {t('inventory')}
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest leading-relaxed">
            Suivi des actifs, des fournitures et de l'inventaire des équipements
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={openAddModal} className="w-full md:w-auto flex justify-center items-center gap-2 px-8 py-4 bg-moroccan-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-2xl hover:shadow-moroccan-green/20 transition-all shadow-xl shadow-moroccan-green/10 transform hover:-translate-y-1">
            <span className="material-symbols-outlined text-sm">add_box</span>
            Ajouter un article
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('total_assets'), value: totalAssets, sub: 'Équipements & Mobilier', icon: 'inventory_2', color: 'text-moroccan-green', bg: 'bg-moroccan-green/10' },
          { label: t('consumables'), value: totalConsumables, sub: 'Papeterie & Fournitures', icon: 'category', color: 'text-moroccan-gold', bg: 'bg-moroccan-gold/10' },
          { label: t('stock_alerts'), value: stockAlerts, sub: 'Quantité faible (<5)', icon: 'notifications_active', color: 'text-moroccan-red', bg: 'bg-moroccan-red/10' },
          { label: t('maintenance'), value: inMaintenance, sub: 'Hors service / Réparation', icon: 'build', color: 'text-deep-emerald', bg: 'bg-deep-emerald/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-4xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-5 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0 shadow-inner`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{loading ? '...' : stat.value}</h3>
              </div>
            </div>
            <p className={`text-[9px] font-black uppercase mt-4 tracking-widest ${stat.color} opacity-70 relative z-10`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-3xl w-fit border border-slate-200/50 backdrop-blur-sm">
        {[
          { id: 'assets', label: 'Biens Immobiles' },
          { id: 'consumables', label: 'Fournitures' },
          { id: 'alerts', label: 'Alerte Stock' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-moroccan-green shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid View */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden group">
        <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50/20 gap-6">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-moroccan-green animate-ping"></span>
            {activeTab === 'assets' ? 'Registre des Biens' : activeTab === 'consumables' ? 'Inventaire Consommables' : 'Articles en Rupture'}
          </h3>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">search</span>
            <input type="text" placeholder="Filtrer..." className="w-full bg-white border border-slate-200 pl-11 pr-4 py-3 rounded-2xl text-[10px] font-black uppercase outline-none focus:ring-4 focus:ring-moroccan-green/5 focus:border-moroccan-green/20 transition-all" />
          </div>
        </div>
        <div className="overflow-x-auto whitespace-nowrap custom-scrollbar">
          {loading ? (
            <div className="py-20 flex justify-center"><span className="material-symbols-outlined animate-spin text-moroccan-green text-3xl">progress_activity</span></div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 uppercase text-[9px] font-black text-slate-400 tracking-[0.2em]">
                  <th className="px-10 py-6 border-b border-slate-100">Désignation de l'article</th>
                  <th className="px-10 py-6 border-b border-slate-100 text-center">Catégorie</th>
                  <th className="px-10 py-6 border-b border-slate-100 text-center">Emplacement</th>
                  <th className="px-10 py-6 border-b border-slate-100 text-center">Quantité</th>
                  <th className="px-10 py-6 border-b border-slate-100 text-center">État</th>
                  <th className="px-10 py-6 border-b border-slate-100 text-right">Opérations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-all group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-moroccan-green group-hover:text-white group-hover:border-moroccan-green transition-all shadow-inner">
                          <span className="material-symbols-outlined">{item.type === 'asset' ? 'devices' : 'package_2'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none mb-1.5">{item.name}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{item._id.substring(item._id.length-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">{item.category}</span>
                    </td>
                    <td className="px-10 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-tight">{item.location}</td>
                    <td className="px-10 py-6 text-center text-sm font-black text-slate-800">{item.quantity}</td>
                    <td className="px-10 py-6 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                        item.status === 'Optimal' ? 'text-green-600 bg-green-50 border-green-100' : 
                        item.status === 'Déclassé' ? 'text-slate-400 bg-slate-50 border-slate-100' : 
                        'text-moroccan-red bg-moroccan-red/5 border-moroccan-red/10'
                      }`}>{item.status}</span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(item)} className="p-2.5 text-slate-400 hover:text-moroccan-green hover:bg-moroccan-green/5 rounded-xl transition-all">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2.5 text-slate-400 hover:text-moroccan-red hover:bg-moroccan-red/5 rounded-xl transition-all">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-20 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Aucun article trouvé</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;

