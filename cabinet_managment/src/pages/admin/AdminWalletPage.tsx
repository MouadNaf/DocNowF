import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  Check, 
  X, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { cn } from '@/lib/utils/cn';

export function AdminWalletPage() {
  const [rechargeRequests, setRechargeRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await adminService.getRechargeRequests();
      setRechargeRequests(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: number) => {
    if (!confirm('Voulez-vous vraiment approuver cette recharge ?')) return;
    try {
      await adminService.approveRecharge(id);
      fetchRequests();
    } catch (err) {
      alert('Échec de l\'approbation');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Motif du rejet :');
    if (reason === null) return;
    try {
      await adminService.rejectRecharge(id, reason);
      fetchRequests();
    } catch (err) {
      alert('Échec du rejet');
    }
  };

  const filteredRequests = rechargeRequests.filter(req => 
    req.doctor?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.doctor?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recharges Portefeuille</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez et validez les demandes de recharge des médecins</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher par médecin..." 
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1D9E75] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-500">Filtrer par :</span>
          <select className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700">
            <option>Toutes les demandes</option>
            <option>En attente</option>
            <option>Approuvées</option>
            <option>Rejetées</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Médecin</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Montant</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Preuve de paiement</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loadingRequests ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className="text-gray-500 font-medium">Chargement des demandes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-gray-500 font-medium">
                    Aucune demande trouvée.
                  </td>
                </tr>
              ) : filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-gray-400 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-500">
                        {request.doctor?.user?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 leading-tight">{request.doctor?.user?.name}</p>
                        <p className="text-xs font-medium text-gray-500 mt-1">{request.doctor?.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className="text-base font-black text-gray-900">{request.amount}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">DA</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <a 
                      href={`http://127.0.0.1:8000/storage/${request.payment_proof}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <ExternalLink size={14} strokeWidth={2.5} />
                      Voir preuve
                    </a>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-900">{new Date(request.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] font-medium text-gray-400">{new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    {request.status === 'pending' ? (
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleReject(request.id)}
                          className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all hover:shadow-lg hover:shadow-red-100 hover:-translate-y-0.5 active:translate-y-0"
                          title="Rejeter"
                        >
                          <X size={20} strokeWidth={2.5} />
                        </button>
                        <button 
                          onClick={() => handleApprove(request.id)}
                          className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all hover:shadow-lg hover:shadow-emerald-100 hover:-translate-y-0.5 active:translate-y-0"
                          title="Approuver"
                        >
                          <Check size={20} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                        request.status === 'approved' 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-red-50 text-red-600 border-red-100"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full", request.status === 'approved' ? "bg-emerald-600" : "bg-red-600")} />
                        {request.status}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
