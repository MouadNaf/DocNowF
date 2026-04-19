import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Download,
  FileText,
  User as UserIcon,
  Layout
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { adminService } from '@/services/admin.service';
import { useEffect, useState, useMemo } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';

const roleMap: Record<string, string> = {
  'DOCTOR': 'Médecin',
  'SECRETARY': 'Secrétaire',
  'CLINIC_ADMIN': 'Clinique',
  'CABINET_ADMIN': 'Cabinet',
  'PLATFORM_ADMIN': 'Administrateur'
};

const statusMap: Record<string, string> = {
  'ACTIVE': 'Actif',
  'PENDING_APPROVAL': 'En attente',
  'SUSPENDED': 'Suspendu',
  'REJECTED': 'Rejeté'
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (userId: number, status: string) => {
    try {
      await adminService.updateUserStatus(userId, status);
      await fetchUsers(); // Refresh list
      setSelectedUser(null); // Close drawer
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const statsSummary = useMemo(() => {
    return {
      total: users.length,
      pending: users.filter(u => u.status === 'PENDING_APPROVAL').length,
      active: users.filter(u => u.status === 'ACTIVE').length
    };
  }, [users]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING_APPROVAL': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'SUSPENDED': return 'bg-red-50 text-red-600 border-red-100';
      case 'REJECTED': return 'bg-gray-50 text-gray-500 border-gray-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500">Gérer les comptes de la plateforme</p>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <div className="flex gap-3">
              <span className="text-xs font-bold text-gray-900">{statsSummary.total} Total</span>
              <span className="text-xs font-bold text-orange-600">{statsSummary.pending} En attente</span>
              <span className="text-xs font-bold text-emerald-600">{statsSummary.active} Actifs</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={18} /> Exporter CSV
          </button>
        </div>
      </div>
{/* ... (keep filters bar) */}
      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou ID..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1D9E75]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-[#F8FAFC] border-none rounded-xl text-sm px-4 py-3 font-bold text-gray-600 focus:ring-2 focus:ring-[#1D9E75]/20 min-w-[140px]">
            <option>Tous les rôles</option>
            <option>Médecin</option>
            <option>Secrétaire</option>
            <option>Clinique</option>
          </select>
          <select className="bg-[#F8FAFC] border-none rounded-xl text-sm px-4 py-3 font-bold text-gray-600 focus:ring-2 focus:ring-[#1D9E75]/20 min-w-[140px]">
            <option>Tous les statuts</option>
            <option>Actif</option>
            <option>En attente</option>
            <option>Suspendu</option>
          </select>
          <button className="bg-gray-900 text-white p-3 rounded-xl hover:bg-gray-800 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Nom / Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Rôle</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Statut</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Vérifié</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">S'inscrit le</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                        {user.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                        <p className="text-xs font-medium text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                      {roleMap[user.role] || user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[11px] font-bold px-3 py-1.5 rounded-full border",
                      getStatusStyle(user.status)
                    )}>
                      {statusMap[user.status] || user.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {user.status === 'ACTIVE' ? (
                      <CheckCircle size={18} className="text-[#1D9E75] mx-auto" strokeWidth={3} />
                    ) : (
                      <XCircle size={18} className="text-red-400 mx-auto" strokeWidth={3} />
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-gray-400 hover:text-[#1D9E75] hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                        title="Voir informations"
                      >
                        <Eye size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-xl bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Détails de l'utilisateur</h3>
                <p className="text-sm text-gray-500 mt-1">Vérification des documents officiels</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Profile Overview */}
              <div className="flex items-center gap-6 p-6 rounded-[24px] bg-[#F8FAFC] border border-gray-100">
                <div className="w-16 h-16 rounded-[20px] bg-[#1D9E75]/10 text-[#1D9E75] flex items-center justify-center text-2xl font-bold">
                  {selectedUser.full_name?.charAt(0)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedUser.full_name}</h4>
                  <p className="text-sm font-medium text-gray-500">{selectedUser.email}</p>
                  <p className="text-xs font-bold text-[#1D9E75] uppercase mt-2 tracking-wider flex items-center gap-1">
                    <Layout size={12} /> {selectedUser.role} 
                  </p>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Numéro de téléphone</p>
                  <p className="text-sm font-bold text-gray-900">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Spécialité</p>
                  <p className="text-sm font-bold text-gray-900">{selectedUser.speciality || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date d'inscription</p>
                  <p className="text-sm font-bold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Statut actuel</p>
                  <span className={cn("inline-block text-[11px] font-bold px-3 py-1 rounded-full border mt-1", getStatusStyle(selectedUser.status))}>
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              {/* Documents Section */}
              <div className="space-y-6">
                <h5 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-gray-400" /> Documents de vérification
                </h5>
                
                <div className="grid grid-cols-1 gap-4">
                  {selectedUser.national_id_path ? (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-gray-700">Carte d'identité Nationale</p>
                      <div className="aspect-[16/10] bg-gray-100 rounded-[20px] overflow-hidden border border-gray-200 group relative">
                        <img src={`${API_BASE_URL}/${selectedUser.national_id_path}`} alt="ID Card" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={`${API_BASE_URL}/${selectedUser.national_id_path}`} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold">
                            <Download size={16} /> Voir / Télécharger
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600">
                      <Clock size={20} /> <p className="text-sm font-medium">Carte d'identité non disponible</p>
                    </div>
                  )}

                  {selectedUser.medical_license_path ? (
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-gray-700">Diplôme / Autorisation d'exercice</p>
                      <div className="aspect-[16/10] bg-gray-100 rounded-[20px] overflow-hidden border border-gray-200 group relative">
                        <img src={`${API_BASE_URL}/${selectedUser.medical_license_path}`} alt="License" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={`${API_BASE_URL}/${selectedUser.medical_license_path}`} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold">
                            <Download size={16} /> Voir / Télécharger
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center gap-3 text-red-600">
                      <Clock size={20} /> <p className="text-sm font-medium">Document de licence non disponible</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-8 border-t border-gray-100 flex gap-4 bg-white shrink-0">
              <button 
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-[18px] font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                onClick={() => handleUpdateStatus(selectedUser.id, 'ACTIVE')}
              >
                <ShieldCheck size={20} /> Approuver le compte
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-100 py-4 rounded-[18px] font-bold hover:bg-red-50 transition-all active:scale-95"
                onClick={() => handleUpdateStatus(selectedUser.id, 'REJECTED')}
              >
                <ShieldAlert size={20} /> Rejeter / Bloquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
