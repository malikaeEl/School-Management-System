import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

const InventoryManagement = () => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('assets');
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: 'Mobilier', quantity: '', location: '' });

  const showToast = (msg, color = 'bg-moroccan-green') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>

      {toast && <div className={`fixed top-6 right-6 z-50 ${toast.color} text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black`}>{toast.msg}</div>}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-deep-emerald">Nouvel Article</h2>
              <button onClick={()=>setShowModal(false)} className="text-slate-400 hover:text-moroccan-red"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={e=>{e.preventDefault();setShowModal(false);showToast('Article ajouté avec succès ✓');setForm({name:'',category:'Mobilier',quantity:'',location:''}); }} className="p-6 space-y-4">
              {[
                {key:'name',label:'Nom de l\'article',placeholder:'ex: Chaise de classe'},
                {key:'quantity',label:'Quantité',placeholder:'50'},
                {key:'location',label:'Emplacement',placeholder:'ex: Salle 12, Magasin B'},
              ].map(f=>(
                <div key={f.key}>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">{f.label}</label>
                  <input value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.placeholder} required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moroccan-green/30"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Catégorie</label>
                <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none">
                  {['Mobilier','Informatique','Laboratoire','Sport','Papeterie','Maintenance'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={()=>setShowModal(false)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-black text-slate-600 hover:bg-slate-50">Annuler</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-moroccan-green text-white text-sm font-black shadow-lg shadow-moroccan-green/20">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase flex items-center gap-3">
            {t('inventory')}
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-black tracking-widest">
            Suivi des actifs, des fournitures et de l'inventaire des équipements
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={() => showToast('Ouverture du scanner... (webcam required)')} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-5 py-2.5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-600 shadow-sm">
            <span className="material-symbols-outlined text-lg">barcode_scanner</span>
            Scanner
          </button>
          <button onClick={()=>setShowModal(true)} className="flex-1 md:flex-none flex justify-center items-center gap-2 px-6 py-3 bg-moroccan-green text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:shadow-xl hover:shadow-moroccan-green/20 transition-all shadow-lg shadow-moroccan-green/10">
            <span className="material-symbols-outlined text-lg">add_box</span>
            Nouvel Article
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('total_assets'), value: '1,240', sub: 'Calculated value: 1.2M MAD', icon: 'inventory_2', color: 'text-moroccan-green', bg: 'bg-moroccan-green/10' },
          { label: t('consumables'), value: '450', sub: 'Stationery & Lab supplies', icon: 'category', color: 'text-moroccan-gold', bg: 'bg-moroccan-gold/10' },
          { label: t('stock_alerts'), value: '12', sub: 'Low stock items', icon: 'notifications_active', color: 'text-moroccan-red', bg: 'bg-moroccan-red/10' },
          { label: t('maintenance'), value: '08', sub: 'In repair / Under service', icon: 'build', color: 'text-deep-emerald', bg: 'bg-deep-emerald/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</h3>
              </div>
            </div>
            <p className={`text-[9px] font-black uppercase mt-3 tracking-widest ${stat.color} relative z-10`}>{stat.sub}</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
      </div>

      {/* Tabs Navigation */}
      <div className="flex bg-slate-100/50 p-1.5 rounded-3xl w-fit border border-slate-200/50 backdrop-blur-sm">
        <button 
          onClick={() => setActiveTab('assets')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'assets' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Actifs
        </button>
        <button 
          onClick={() => setActiveTab('consumables')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'consumables' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          {t('consumables')}
        </button>
        <button 
          onClick={() => setActiveTab('alerts')}
          className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'alerts' ? 'bg-white text-deep-emerald shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Stock Faible
        </button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">
                  {activeTab === 'assets' ? 'Registre des Biens' : 'Inventaire Consommables'}
                </h3>
                <div className="flex gap-4">
                   <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm">search</span>
                      <input type="text" placeholder="Filtrer..." className="bg-white border border-slate-100 pl-10 pr-4 py-2 rounded-xl text-[10px] font-black uppercase outline-none focus:ring-2 focus:ring-moroccan-green/10" />
                   </div>
                </div>
             </div>
             <div className="overflow-x-auto whitespace-nowrap">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-slate-50/50 uppercase text-[9px] font-black text-slate-400 tracking-widest">
                         <th className="px-8 py-5">Article</th>
                         <th className="px-8 py-5">Identifiant / ID</th>
                         <th className="px-8 py-5">Catégorie</th>
                         <th className="px-8 py-5">État / Quantité</th>
                         <th className="px-8 py-5 text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {[
                        { name: 'MacBook Air M2', cat: 'Informatique', id: 'IT-MAC-042', status: 'Optimal', val: 'New', color: 'text-green-600 bg-green-50' },
                        { name: 'Projecteur Epson', cat: 'Multimédia', id: 'AV-EPS-112', status: 'Maintenance', val: 'Repair', color: 'text-moroccan-red bg-moroccan-red/10' },
                        { name: 'Tableau Blanc Interactif', cat: 'Mobilier', id: 'CL-WB-090', status: 'Optimal', val: 'Good', color: 'text-green-600 bg-green-50' }
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-moroccan-green transition-colors">
                                    <span className="material-symbols-outlined">devices</span>
                                 </div>
                                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-[10px] font-black text-slate-400 italic font-mono">{item.id}</td>
                           <td className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase">{item.cat}</td>
                           <td className="px-8 py-5">
                              <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                           </td>
                           <td className="px-8 py-5 text-right">
                              <button className="text-slate-200 hover:text-moroccan-green transition-all"><span className="material-symbols-outlined">more_horiz</span></button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           </div>
        </div>

        {/* Quick Assignment / Stock Alert */}
        <div className="space-y-8">
           <div className="bg-moroccan-red/5 p-8 rounded-[2.5rem] border border-moroccan-red/10">
              <h3 className="text-lg font-black text-moroccan-red uppercase tracking-tight mb-6 flex items-center gap-2">
                 <span className="material-symbols-outlined">error</span>
                 {t('stock_alerts')}
              </h3>
              <div className="space-y-4">
                 {[
                   { name: 'Cartouches Encre', level: '2 restants', color: 'bg-moroccan-red' },
                   { name: 'Papier A4', level: '5 rames', color: 'bg-moroccan-gold' },
                   { name: 'Produits Labo', level: '10% rest.', color: 'bg-moroccan-red' }
                 ].map((alert, i) => (
                   <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                      <div>
                         <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{alert.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{alert.level}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${alert.color} animate-pulse`}></div>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-8 py-4 bg-moroccan-red text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-moroccan-red/20">
                Commander Maintenant
              </button>
           </div>

           <div className="bg-deep-emerald p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
              <h3 className="text-xl font-black uppercase tracking-tight mb-4 relative z-10">Affectation</h3>
              <p className="text-xs text-white/50 font-medium leading-relaxed mb-8 relative z-10">Attribuer des équipements informatiques ou du mobilier aux enseignants ou salles de classe.</p>
              <button className="bg-white text-deep-emerald px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all relative z-10">Attribuer</button>
              <span className="material-symbols-outlined absolute -bottom-8 -right-8 text-9xl text-white/5 group-hover:rotate-12 transition-transform duration-700">move_to_inbox</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;
