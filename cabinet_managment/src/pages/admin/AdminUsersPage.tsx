import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Download,
  FileText,
  Crown,
  Building2,
  Stethoscope,
  MapPin,
  Briefcase,
  Users,
  UserCircle,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { adminService } from '@/services/admin.service';
import { useEffect, useState, useCallback } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type UserStats = {
  total: number;
  pending: number;
  premium: number;
};

export function AdminUsersPage() {
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<PaginationMeta>({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [stats, setStats] = useState<UserStats>({ total: 0, pending: 0, premium: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        page,
        per_page: 15,
        search: debouncedSearch || undefined,
      });
      setEntities(res.data ?? []);
      setMeta(res.meta ?? { current_page: 1, last_page: 1, per_page: 15, total: 0 });
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDetail = async (entity: any) => {
    setSelectedEntity(entity);
    setDetailLoading(true);
    try {
      const detail = await adminService.getUserDetail(entity.entity_type, entity.id);
      setSelectedEntity(detail);
    } catch (err) {
      console.error('Failed to fetch entity details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (entity: any) => {
    try {
      if (entity.entity_type === 'doctor') await adminService.approveDoctor(entity.id);
      else if (entity.entity_type === 'clinic') await adminService.approveClinic(entity.id);
      else if (entity.entity_type === 'cabinet') await adminService.approveCabinet(entity.id);
      
      await fetchData();
      setSelectedEntity(null);
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleTogglePremium = async (entity: any) => {
    try {
      if (entity.entity_type === 'doctor') await adminService.toggleDoctorStatus(entity.id);
      else if (entity.entity_type === 'clinic') await adminService.toggleClinicStatus(entity.id);
      else if (entity.entity_type === 'cabinet') await adminService.toggleCabinetStatus(entity.id);
      
      setEntities(prev => prev.map(e =>
        e.entity_type === entity.entity_type && e.id === entity.id
          ? { ...e, is_active: !e.is_active }
          : e
      ));
    } catch (err) {
      console.error('Failed to toggle premium:', err);
    }
  };

  const handleReject = async (entity: any) => {
    if (!window.confirm('Etes-vous sûr de vouloir supprimer ce compte ?')) return;
    try {
      if (entity.entity_type === 'doctor') await adminService.rejectDoctor(entity.id);
      else if (entity.entity_type === 'clinic') await adminService.rejectClinic(entity.id);
      else if (entity.entity_type === 'cabinet') await adminService.rejectCabinet(entity.id);
      
      await fetchData();
      setSelectedEntity(null);
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des comptes</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-gray-500">Valider les médecins, cliniques et cabinets</p>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <div className="flex gap-3">
              <span className="text-xs font-bold text-gray-900">{stats.total} Total</span>
              <span className="text-xs font-bold text-orange-600">{stats.pending} En attente</span>
              <span className="text-xs font-bold text-blue-600">{stats.premium} Premium</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou établissement..." 
            className="w-full pl-12 pr-4 py-3 bg-[#F8FAFC] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#1D9E75]/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin text-[#1D9E75]" size={32} />
            <p className="text-sm font-medium text-gray-500">Chargement des comptes...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Utilisateur / Établissement</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Type</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Statut</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest text-center">Premium</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {entities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-sm font-medium text-gray-400">
                        Aucun compte trouvé
                      </td>
                    </tr>
                  ) : entities.map((entity) => (
                    <tr key={`${entity.entity_type}-${entity.id}`} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                            entity.entity_type === 'doctor' ? "bg-emerald-50 text-emerald-600" : 
                            entity.entity_type === 'private_cabinet' ? "bg-orange-50 text-orange-600" :
                            entity.entity_type === 'secretary' ? "bg-indigo-50 text-indigo-600" :
                            entity.entity_type === 'patient' ? "bg-pink-50 text-pink-600" :
                            "bg-blue-50 text-blue-600"
                          )}>
                            {entity.entity_type === 'doctor' ? <Stethoscope size={18} /> : 
                             entity.entity_type === 'secretary' ? <Users size={18} /> :
                             entity.entity_type === 'patient' ? <UserCircle size={18} /> :
                             <Building2 size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{entity.user?.name || entity.name}</p>
                            <p className="text-xs font-medium text-gray-500">{entity.user?.email}</p>
                            
                            {entity.entity_type === 'doctor' && entity.private_cabinet && (
                              <div className="flex items-center gap-1 mt-1">
                                <Building2 size={10} className="text-emerald-600" />
                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Cabinet: {entity.private_cabinet.name}</p>
                              </div>
                            )}
                            
                            {entity.entity_type === 'private_cabinet' && (
                              <div className="flex items-center gap-1 mt-1">
                                <Briefcase size={10} className="text-orange-600" />
                                <p className="text-[10px] font-bold text-orange-600 uppercase">Dr. {entity.doctor?.user?.name}</p>
                              </div>
                            )}

                            {(entity.entity_type === 'clinic' || entity.entity_type === 'cabinet') && entity.name && (
                              <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">{entity.name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider",
                          entity.entity_type === 'doctor' ? "bg-emerald-50 text-emerald-600" : 
                          entity.entity_type === 'clinic' ? "bg-purple-50 text-purple-600" : 
                          entity.entity_type === 'private_cabinet' ? "bg-orange-50 text-orange-600" :
                          entity.entity_type === 'secretary' ? "bg-indigo-50 text-indigo-600" :
                          entity.entity_type === 'patient' ? "bg-pink-50 text-pink-600" :
                          "bg-blue-50 text-blue-600"
                        )}>
                          {entity.entity_type === 'doctor' ? 'Médecin' : 
                           entity.entity_type === 'clinic' ? 'Clinique' : 
                           entity.entity_type === 'private_cabinet' ? 'Cabinet Privé' : 
                           entity.entity_type === 'secretary' ? 'Secrétaire' : 
                           entity.entity_type === 'patient' ? 'Patient' : 'Cabinet'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {(entity.is_verified || ['patient', 'secretary'].includes(entity.entity_type)) ? (
                          <div className="flex items-center justify-center gap-1 text-[#1D9E75]">
                            <CheckCircle size={16} strokeWidth={3} />
                            <span className="text-[10px] font-bold">Vérifié</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-orange-500">
                            <Clock size={16} />
                            <span className="text-[10px] font-bold">En attente</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => handleTogglePremium(entity)}
                          disabled={['private_cabinet', 'patient', 'secretary'].includes(entity.entity_type)}
                          className={cn(
                            "p-2 rounded-xl transition-all border",
                            entity.is_active 
                              ? "bg-blue-50 text-blue-600 border-blue-100" 
                              : "bg-gray-50 text-gray-400 border-gray-100 grayscale",
                            ['private_cabinet', 'patient', 'secretary'].includes(entity.entity_type) && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Crown size={18} fill={entity.is_active ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenDetail(entity)}
                            className="p-2 text-gray-400 hover:text-[#1D9E75] hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleReject(entity)}
                            className={cn(
                              "p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors",
                              ['private_cabinet', 'patient', 'secretary'].includes(entity.entity_type) && "hidden"
                            )}
                          >
                            <ShieldAlert size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta.last_page > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 text-sm">
                <span className="text-gray-500 font-medium">
                  Page <span className="text-gray-800">{meta.current_page}</span> sur {meta.last_page} ({meta.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl disabled:opacity-40 transition-colors"
                  >
                    Précédent
                  </button>
                  <button
                    disabled={page >= meta.last_page}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl disabled:opacity-40 transition-colors"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Drawer */}
      {selectedEntity && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setSelectedEntity(null)} />
          <div className="relative w-full max-w-xl bg-white h-screen shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Détails du compte</h3>
                <p className="text-sm text-gray-500 mt-1">Examen des informations de {selectedEntity.user?.name || selectedEntity.name}</p>
              </div>
              <button onClick={() => setSelectedEntity(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-[#1D9E75]" size={28} />
                  <p className="text-sm font-medium text-gray-500">Chargement des détails...</p>
                </div>
              ) : (
                <>
                  {/* Entity Info Header */}
                  <div className="bg-gray-50 rounded-[32px] p-6 space-y-6 border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "size-14 rounded-2xl flex items-center justify-center shadow-sm",
                        selectedEntity.entity_type === 'doctor' ? "bg-white text-[#1D9E75]" : 
                        selectedEntity.entity_type === 'secretary' ? "bg-white text-indigo-500" :
                        selectedEntity.entity_type === 'patient' ? "bg-white text-pink-500" :
                        "bg-white text-blue-500"
                      )}>
                        {selectedEntity.entity_type === 'doctor' ? <Stethoscope size={28} /> : 
                         selectedEntity.entity_type === 'secretary' ? <Users size={28} /> :
                         selectedEntity.entity_type === 'patient' ? <UserCircle size={28} /> :
                         <Building2 size={28} />}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type d'entité</p>
                        <p className="text-xl font-black text-gray-900 capitalize">{selectedEntity.entity_type?.replace('_', ' ')}</p>
                      </div>
                    </div>

                    {selectedEntity.entity_type === 'doctor' && selectedEntity.private_cabinet && (
                      <div className="pt-6 border-t border-gray-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Cabinet Privé Lié</p>
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <Building2 size={18} className="text-[#1D9E75]" />
                            <span className="font-bold text-gray-900">{selectedEntity.private_cabinet.name}</span>
                          </div>
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">ACTIF</span>
                        </div>
                      </div>
                    )}

                    {selectedEntity.entity_type === 'private_cabinet' && (
                      <div className="pt-6 border-t border-gray-200">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Médecin Propriétaire</p>
                        <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100">
                          <Briefcase size={18} className="text-orange-500" />
                          <span className="font-bold text-gray-900">Dr. {selectedEntity.doctor?.user?.name}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ville / Wilaya</p>
                      <p className="text-base font-bold text-gray-900">{selectedEntity.user?.city || selectedEntity.city || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Téléphonique</p>
                      <p className="text-base font-bold text-gray-900">{selectedEntity.user?.phone_number || 'N/A'}</p>
                    </div>
                  </div>

                  {(selectedEntity.private_cabinet || selectedEntity.entity_type === 'private_cabinet') && (
                    <div className="space-y-4">
                      <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin size={16} /> Adresse du cabinet
                      </h5>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-sm font-bold text-gray-900">{selectedEntity.address || selectedEntity.private_cabinet?.address}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">{selectedEntity.city || selectedEntity.private_cabinet?.city}</p>
                      </div>
                    </div>
                  )}

                  {/* Documents Section */}
                  <div className="space-y-4">
                    <h5 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <FileText size={16} /> Dossier de vérification
                    </h5>
                    
                    {selectedEntity.documents && typeof selectedEntity.documents === 'object' && Object.keys(selectedEntity.documents).length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {Object.entries(selectedEntity.documents).map(([key, path]: [string, any]) => (
                          <div key={key} className="space-y-2">
                            <p className="text-xs font-bold text-gray-600 capitalize ml-1">{String(key).replace('_', ' ')}</p>
                            <div className="aspect-video bg-gray-100 rounded-[24px] overflow-hidden border border-gray-200 group relative shadow-sm">
                              <img 
                                src={`${API_BASE_URL}/storage/${typeof path === 'string' ? path.replace('public/', '') : ''}`} 
                                alt={String(key)} 
                                className="w-full h-full object-cover" 
                                onError={(e: any) => e.target.src = 'https://placehold.co/600x400?text=Document'}
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <a href={`${API_BASE_URL}/storage/${typeof path === 'string' ? path.replace('public/', '') : ''}`} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-transform">
                                  <Download size={18} /> Consulter le document
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                        <p className="text-sm font-bold text-gray-400">Aucun document n'a été fourni.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {!detailLoading && !selectedEntity.is_verified && !['private_cabinet', 'patient', 'secretary'].includes(selectedEntity.entity_type) && (
              <div className="p-8 border-t border-gray-100 bg-white">
                <button 
                  onClick={() => handleApprove(selectedEntity)}
                  className="w-full flex items-center justify-center gap-2 bg-[#1D9E75] text-white py-5 rounded-[20px] font-bold hover:bg-[#15805d] transition-all shadow-xl shadow-emerald-100 text-lg"
                >
                  <ShieldCheck size={24} /> Approuver le compte maintenant
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
