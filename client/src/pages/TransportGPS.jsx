import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const TransportGPS = () => {
  const { lang, t } = useLanguage();
  const [showAssignModal, setShowAssignModal] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState(null);
  const [toast, setToast] = React.useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const agadirPos = [30.4278, -9.5981];
  const busPositions = [
    { id: 'BUS-AG-04', pos: [30.435, -9.615], label: 'Tikiouine', status: 'Vers Tikiouine' },
    { id: 'BUS-AG-12', pos: [30.415, -9.585], label: 'Talborjt', status: 'Talborjt (10m delay)', alert: true },
    { id: 'BUS-AG-07', pos: [30.425, -9.555], label: 'Hay Dakhla', status: 'En route' }
  ];

  const busRoutes = [
    { name: 'Mohamed Ahmed', route: 'Ligne Tikiouine', id: 'BUS-04', status: 'On Time', color: 'text-green-500' },
    { name: 'Youssef Alami', route: 'Ligne Talborjt', id: 'BUS-12', status: 'Delayed', color: 'text-moroccan-red' },
    { name: 'Said Tazi', route: 'Ligne Inezgane', id: 'BUS-07', status: 'En route', color: 'text-blue-500' }
  ];

  const { user } = useAuth();
  const isParent = user?.role === 'parent';

  const [studentAssignments, setStudentAssignments] = React.useState([
    { id: 1, name: 'Sofia Kabbaj', initials: 'SK', bus: 'BUS-04', route: 'Ligne Tikiouine', stop: 'Tikiouine Agadir', status: 'À bord', parentName: 'Kabbaj' },
    { id: 2, name: 'Adam Mansouri', initials: 'AM', bus: 'BUS-12', route: 'Ligne Talborjt', stop: 'Place El Amal', status: 'En attente', parentName: 'Mansouri' },
    { id: 3, name: 'Lina Bennani', initials: 'LB', bus: 'BUS-07', route: 'Ligne Inezgane', stop: 'Souq Inezgane', status: 'À bord', parentName: 'Bennani' }
  ]);

  const filteredAssignments = React.useMemo(() => {
    if (!isParent) return studentAssignments;
    
    // Filter assignments that match the parent's last name
    const matches = studentAssignments.filter(s => 
      user?.lastName && s.name.toLowerCase().includes(user.lastName.toLowerCase())
    );

    // If no matching mock data exists for this parent, generate dummy children so the UI works
    if (matches.length === 0 && user?.lastName) {
      return [
        { id: parseInt(`${Math.random() * 1000}`), name: `Amine ${user.lastName}`, initials: `A${user.lastName[0]}`, bus: 'BUS-04', route: 'Ligne Tikiouine', stop: 'Arrêt Principal', status: 'À bord', parentName: user.lastName },
        { id: parseInt(`${Math.random() * 1000}`), name: `Salma ${user.lastName}`, initials: `S${user.lastName[0]}`, bus: 'BUS-12', route: 'Ligne Talborjt', stop: 'Avenue Hassan II', status: 'En attente', parentName: user.lastName }
      ];
    }
    return matches;
  }, [isParent, user, studentAssignments]);

  const [formData, setFormData] = React.useState({
    studentName: '',
    bus: '',
    stop: ''
  });

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      studentName: student.name,
      bus: `${student.bus} (${student.route.replace('Ligne ', '')})`,
      stop: student.stop
    });
    setShowAssignModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Supprimer cette affectation ?')) {
      setStudentAssignments(studentAssignments.filter(s => s.id !== id));
      showToast('Affectation supprimée ✓');
    }
  };

  return (
    <div className={`animate-in fade-in duration-500 w-full flex flex-col gap-8 ${lang === 'ar' ? 'font-arabic' : ''}`}>
      
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-moroccan-green text-white px-6 py-3 rounded-2xl shadow-2xl text-sm font-black uppercase tracking-widest animate-in slide-in-from-right duration-300">
          {toast}
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                {editingStudent 
                  ? 'Modifier l\'affectation'
                  : 'Affecter Étudiant'}
              </h2>
              <button onClick={() => { setShowAssignModal(false); setEditingStudent(null); }} className="text-slate-400 hover:text-moroccan-red transition-colors">
                <span className="material-symbols-outlined font-black">close</span>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const [busId, routeName] = formData.bus.split(' (');
              const initials = formData.studentName.split(' ').map(n => n[0]).join('').toUpperCase();
              
              if (editingStudent) {
                setStudentAssignments(studentAssignments.map(s => s.id === editingStudent.id ? {
                  ...s,
                  name: formData.studentName,
                  initials: initials || 'ST',
                  bus: busId,
                  route: routeName ? `Ligne ${routeName.replace(')', '')}` : 'Ligne Express',
                  stop: formData.stop,
                } : s));
                showToast('Affectation modifiée ✓');
              } else {
                const newEntry = {
                  id: Date.now(),
                  name: formData.studentName,
                  initials: initials || 'ST',
                  bus: busId,
                  route: routeName ? `Ligne ${routeName.replace(')', '')}` : 'Ligne Express',
                  stop: formData.stop,
                  status: 'En attente'
                };
                setStudentAssignments([newEntry, ...studentAssignments]);
                showToast('Étudiant affecté ✓');
              }

              setFormData({ studentName: '', bus: '', stop: '' });
              setEditingStudent(null);
              setShowAssignModal(false);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Étudiant</label>
                <select 
                  required 
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moroccan-green/30 transition-all font-bold"
                >
                  <option value="">Sélectionner un étudiant...</option>
                  <option>Yassine Amrani</option>
                  <option>Ibtissam Jalal</option>
                  <option>Khadija Rouissi</option>
                  <option>Omar Tazi</option>
                  <option>Sofia Kabbaj</option>
                  <option>Adam Mansouri</option>
                  <option>Lina Bennani</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Bus</label>
                <select 
                  required 
                  value={formData.bus}
                  onChange={(e) => setFormData({...formData, bus: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moroccan-green/30 transition-all font-bold"
                >
                  <option value="">Sélectionner un bus...</option>
                  {busRoutes.map(b => (
                    <option key={b.id} value={`${b.id} (${b.route.replace('Ligne ', '')})`}>{b.id} ({b.route})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Point d'arrêt</label>
                <input 
                  type="text" 
                  placeholder="ex: Angle Bd Gauthier" 
                  required 
                  value={formData.stop}
                  onChange={(e) => setFormData({...formData, stop: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-moroccan-green/30 transition-all font-bold" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAssignModal(false); setEditingStudent(null); }} className="flex-1 py-4 rounded-xl border border-slate-200 text-[10px] font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">
                  {lang === 'ar' ? 'إلغاء' : 'Annuler'}
                </button>
                <button type="submit" className="flex-1 py-4 rounded-xl bg-moroccan-green text-white text-[10px] font-black shadow-lg shadow-moroccan-green/20 hover:brightness-110 transition-all uppercase tracking-widest">
                  {'Confirmer'}
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
            Transport & Suivi GPS
          </h1>
          <p className="text-slate-500 mt-1 uppercase text-xs font-black tracking-widest text-[10px] leading-relaxed">
            Suivi des bus scolaires et gestion des itinéraires en temps réel
          </p>
        </div>
        <div className="flex items-center gap-2">
            <button className="bg-white text-slate-600 px-5 py-2.5 rounded-2xl text-[10px] font-black border border-slate-100 shadow-sm hover:shadow-md transition-all uppercase tracking-widest">
              {t('generate_report')}
            </button>
            <button onClick={() => showToast('Position GPS actualisée ✓')} className="bg-moroccan-green text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:opacity-90 shadow-xl shadow-moroccan-green/20 transition-all uppercase tracking-widest">
              <span className="material-symbols-outlined text-xl">refresh</span>
              Actualiser
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: t('bus_routes'), value: '12/15', sub: '80% Capacité', icon: 'directions_bus', color: 'text-moroccan-green', bg: 'bg-moroccan-green/10' },
          { label: 'Itinéraires', value: '08', sub: 'Agadir / Inezgane', icon: 'route', color: 'text-deep-emerald', bg: 'bg-deep-emerald/10' },
          { label: t('students'), value: '450', sub: 'Transportés ce matin', icon: 'group', color: 'text-moroccan-gold', bg: 'bg-moroccan-gold/10' },
          { label: 'Alertes', value: '01', sub: 'Talborjt Sector', icon: 'warning', color: 'text-moroccan-red', bg: 'bg-moroccan-red/10' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center gap-4 relative z-10">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-2xl font-black">{stat.icon}</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stat.value}</h3>
              </div>
            </div>
            <p className={`text-[9px] font-black uppercase mt-3 tracking-widest ${stat.color} relative z-10`}>{stat.sub}</p>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live GPS Map Simulation - Now REPLACED WITH REAL MAP */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-moroccan-green rounded-full"></span>
              Suivi GPS Agadir / تتبع الحافلات
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors uppercase tracking-tight">Secteur Agadir</button>
              <button onClick={() => showToast('Centré sur Agadir Marina')} className="px-3 py-1.5 text-xs font-bold bg-moroccan-green text-white rounded-lg shadow-sm flex items-center gap-1 hover:bg-deep-emerald transition-colors uppercase tracking-tight">
                <span className="material-symbols-outlined text-xs">gps_fixed</span> Centre
              </button>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-[2.5rem] border-12 border-slate-800 shadow-2xl overflow-hidden relative h-[500px] z-0">
             <MapContainer center={agadirPos} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {busPositions.map(bus => (
                  <Marker key={bus.id} position={bus.pos}>
                    <Popup>
                      <div className="font-sans">
                         <p className="font-black text-xs uppercase tracking-tight text-slate-900">{bus.id}</p>
                         <p className={`text-[10px] font-bold ${bus.alert ? 'text-moroccan-red' : 'text-slate-500'}`}>{bus.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
             </MapContainer>
             
             {/* UI Overlays */}
             <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-white/20 z-1000 shadow-2xl">
                <p className="text-[10px] font-black text-slate-900/60 uppercase tracking-widest mb-3">Secteur: Agadir Centre</p>
                <div className="flex gap-2">
                   <button className="w-8 h-8 bg-moroccan-gold text-deep-emerald rounded-lg flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-base font-black">map</span>
                   </button>
                   <button className="w-8 h-8 bg-white/50 text-slate-500 rounded-lg flex items-center justify-center hover:bg-white transition-all shadow-md">
                      <span className="material-symbols-outlined text-base font-black">satellite</span>
                   </button>
                   <button className="w-8 h-8 bg-white/50 text-slate-500 rounded-lg flex items-center justify-center hover:bg-white transition-all shadow-md">
                      <span className="material-symbols-outlined text-base font-black">traffic</span>
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Routes Status */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm h-full">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                 <span className="w-2 h-6 bg-moroccan-gold rounded-full"></span>
                 Lignes de Bus
              </h3>
              <div className="space-y-6">
                 {busRoutes.map((driver, i) => (
                   <div key={i} className="flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner flex items-center justify-center italic font-black text-slate-300">
                            DR
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{driver.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{driver.route}</p>
                            <span className="text-[9px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">{driver.id}</span>
                         </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${driver.color}`}>{driver.status}</span>
                   </div>
                 ))}
              </div>
              <button disabled className="w-full mt-10 py-4 bg-slate-50 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-dashed border-slate-200 cursor-not-allowed">
                Assigner un chauffeur
              </button>
           </div>
        </div>
      </div>

      {/* Student Management */}
      <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm mb-8">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
           <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">Liste d'affectation</h3>
           <div className="flex gap-4">
              <input type="text" placeholder="Rechercher..." className="bg-slate-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none border border-transparent focus:border-moroccan-green/20" />
              <button 
                onClick={() => {
                  setEditingStudent(null);
                  setFormData({ studentName: '', bus: '', stop: '' });
                  setShowAssignModal(true);
                }} 
                className="bg-deep-emerald text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all shadow-deep-emerald/10"
              >
                Affecter Étudiant
              </button>
           </div>
        </div>
        <div className="overflow-x-auto whitespace-nowrap">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-slate-50/50">
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Élève</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bus</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Itinéraire</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Point d'arrêt</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                   <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-50/50">
               {filteredAssignments.map((item) => (
                 <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-moroccan-gold/10 font-black text-moroccan-gold flex items-center justify-center text-xs">{item.initials}</div>
                          <div>
                             <p className="text-sm font-black text-slate-800">{item.name}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">ID: #459{item.id}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600">{item.bus}</span>
                    </td>
                    <td className="px-8 py-5 text-xs font-black text-slate-500 uppercase">{item.route}</td>
                    <td className="px-8 py-5 text-xs font-bold text-slate-400 italic">{item.stop}</td>
                    <td className="px-8 py-5">
                       <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${item.status === 'À bord' ? 'text-moroccan-green' : 'text-moroccan-gold'}`}>
                          <span className={`w-2 h-2 rounded-full ${item.status === 'À bord' ? 'bg-moroccan-green' : 'bg-moroccan-gold'} shadow-sm`}></span>
                          {item.status}
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-moroccan-green/10 hover:text-moroccan-green transition-all flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 hover:bg-moroccan-red/10 hover:text-moroccan-red transition-all flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransportGPS;
