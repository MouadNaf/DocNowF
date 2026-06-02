import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SecretaryLayout } from '@/components/layout/SecretaryLayout';
import { useSecretaryTreatments, useSecretaryTreatmentStats } from '@/hooks/useSecretary';
import { ROUTES } from '@/constants/routes';
import { Search, Filter, X, ChevronRight, ClipboardList } from 'lucide-react';
import type { TreatmentStatus } from '@/entities/treatment';

const STATUS_CONFIG: Record<TreatmentStatus, { label: string; badge: string }> = {
    planned: { label: 'Planifié', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress: { label: 'En cours', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed: { label: 'Terminé', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    cancelled: { label: 'Annulé', badge: 'bg-red-50 text-red-600 border-red-200' },
};

const fmtDate = (iso?: string) =>
    iso
        ? new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
          })
        : '—';

export function SecretaryTreatmentsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const { data: treatmentStats } = useSecretaryTreatmentStats();

    const { data, isLoading } = useSecretaryTreatments({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 10,
    });

    const treatments = data?.data ?? [];
    const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 10, total: 0 };

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setPage(1);
    };

    const hasActiveFilters = search || status;

    return (
        <SecretaryLayout title="Traitements">
            <div className="space-y-5">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Traitements</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Gestion administrative des plans de traitement
                    </p>
                </div>

                {/* Treatment KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard label="Traitements actifs" value={treatmentStats?.active_treatments ?? 0} color="bg-[#E8F7F1] text-[#0F5132]" />
                    <StatCard label="Visites à venir" value={treatmentStats?.upcoming_visits ?? 0} color="bg-white border text-gray-800" />
                    <StatCard label="Traitements terminés" value={treatmentStats?.completed_treatments ?? 0} color="bg-emerald-50 text-emerald-700" />
                    <StatCard label="Soldes impayés" value={`${(treatmentStats?.outstanding_balance ?? 0).toLocaleString('fr-DZ')} DA`} color="bg-orange-50 text-orange-700" />
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtres</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-7 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Rechercher patient ou traitement..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg text-sm focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]/20"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="planned">Planifié</option>
                                <option value="in_progress">En cours</option>
                                <option value="completed">Terminé</option>
                                <option value="cancelled">Annulé</option>
                            </select>
                        </div>
                        <button
                            onClick={resetFilters}
                            disabled={!hasActiveFilters}
                            className="md:col-span-1 h-10 flex items-center justify-center text-gray-500 border border-gray-200 rounded-lg disabled:opacity-40 hover:text-red-500"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <p className="text-gray-400 text-sm py-12 text-center">Chargement...</p>
                    ) : treatments.length === 0 ? (
                        <div className="text-center py-16 space-y-3">
                            <ClipboardList size={32} className="mx-auto text-gray-300" />
                            <p className="text-gray-600 font-medium">Aucun traitement trouvé</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px] text-sm">
                                    <thead>
                                        <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b bg-gray-50/50">
                                            <th className="px-4 py-3">Patient</th>
                                            <th className="px-4 py-3">Traitement</th>
                                            <th className="px-4 py-3">Médecin</th>
                                            <th className="px-4 py-3">Statut</th>
                                            <th className="px-4 py-3">Progression</th>
                                            <th className="px-4 py-3">Prochaine visite</th>
                                            <th className="px-4 py-3">Solde restant</th>
                                            <th className="px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {treatments.map((t) => {
                                            const statusCfg = STATUS_CONFIG[t.status];
                                            const progress = t.progress;
                                            return (
                                                <tr key={t.id} className="hover:bg-[#f9fefd]">
                                                    <td className="px-4 py-3 font-medium text-gray-900">
                                                        {t.patient?.name || `Patient #${t.patient_id}`}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-800">{t.title}</td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {t.doctor?.name || '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full border ${statusCfg.badge}`}
                                                        >
                                                            {statusCfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {progress?.completed_steps ?? 0}/{progress?.total_steps ?? 0}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600">
                                                        {t.next_visit?.date ? fmtDate(t.next_visit.date) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 font-semibold text-gray-900">
                                                        {(t.remaining_balance ?? 0) > 0
                                                            ? `${(t.remaining_balance ?? 0).toLocaleString('fr-DZ')} DA`
                                                            : '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    ROUTES.SECRETARY_TREATMENT_DETAIL.replace(':id', t.id),
                                                                )
                                                            }
                                                            className="inline-flex items-center gap-1 text-[#1D9E75] font-semibold text-xs hover:underline"
                                                        >
                                                            Voir <ChevronRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
                                    <span className="text-gray-500">
                                        Page {meta.current_page} / {meta.last_page} ({meta.total} total)
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            disabled={page >= meta.last_page}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="px-3 py-1.5 border rounded-lg disabled:opacity-40"
                                        >
                                            Suivant
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </SecretaryLayout>
    );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className={`rounded-xl p-4 shadow-sm ${color}`}>
            <p className="text-3xl font-black">{value}</p>
            <p className="text-xs mt-1 font-medium opacity-70 uppercase tracking-wide">{label}</p>
        </div>
    );
}
