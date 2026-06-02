import React, { useState } from 'react';
import { DoctorLayout } from '@/widgets/layout/DoctorLayout';
import { useTreatments } from '@/shared/api/hooks';
import { CreateTreatmentModal } from '@/components/doctor/CreateTreatmentModal';
import { StatCard } from '@/components/ui/StatCard';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import {
    Search,
    Plus,
    Filter,
    X,
    ChevronRight,
    ClipboardList,
    Clock,
    CheckCircle2,
    CircleCheck,
} from 'lucide-react';
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
              month: 'short',
              year: 'numeric',
          })
        : '—';

export function DoctorTreatmentsPage() {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [showCreate, setShowCreate] = useState(false);
    const navigate = useNavigate();

    const { treatments, meta, loading, refresh } = useTreatments({
        search: search || undefined,
        status: status || undefined,
        page,
        per_page: 10,
    });

    const resetFilters = () => {
        setSearch('');
        setStatus('');
        setPage(1);
    };

    const hasActiveFilters = search || status;

    const stats = {
        total: meta.total,
        planned: treatments.filter((t) => t.status === 'planned').length,
        inProgress: treatments.filter((t) => t.status === 'in_progress').length,
        completed: treatments.filter((t) => t.status === 'completed').length,
    };

    return (
        <DoctorLayout>
            <div className="space-y-6 max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Traitements</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Gérez les plans de traitement et suivez la progression de vos patients.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-[#1D9E75] hover:bg-[#15805d] text-white text-sm font-bold transition-all shadow-sm"
                    >
                        <Plus size={18} />
                        Nouveau traitement
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        title="Total"
                        value={stats.total}
                        icon={<ClipboardList size={22} />}
                        iconBgClass="bg-emerald-50"
                        iconColorClass="text-[#1D9E75]"
                    />
                    <StatCard
                        title="Planifiés"
                        value={stats.planned}
                        icon={<Clock size={22} />}
                        iconBgClass="bg-blue-50"
                        iconColorClass="text-blue-500"
                    />
                    <StatCard
                        title="En cours"
                        value={stats.inProgress}
                        icon={<CheckCircle2 size={22} />}
                        iconBgClass="bg-amber-50"
                        iconColorClass="text-amber-500"
                    />
                    <StatCard
                        title="Terminés"
                        value={stats.completed}
                        icon={<CircleCheck size={22} />}
                        iconBgClass="bg-slate-50"
                        iconColorClass="text-slate-600"
                    />
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={16} className="text-gray-400" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtres</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-7 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                            <input
                                type="text"
                                placeholder="Rechercher par nom de patient..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full h-11 pl-10 pr-4 border border-gray-200 rounded-xl focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm bg-white"
                            />
                        </div>
                        <div className="md:col-span-4">
                            <select
                                value={status}
                                onChange={(e) => {
                                    setStatus(e.target.value);
                                    setPage(1);
                                }}
                                className="w-full h-11 px-4 border border-gray-200 rounded-xl focus:border-[#1D9E75] focus:ring-2 focus:ring-[#1D9E75]/20 text-sm bg-white text-gray-700"
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
                            className="md:col-span-1 h-11 flex items-center justify-center gap-1.5 text-gray-500 font-semibold text-sm hover:text-red-500 disabled:opacity-40 transition-colors rounded-xl border border-gray-200"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <div className="animate-spin h-9 w-9 border-[3px] border-[#1D9E75] border-t-transparent rounded-full mb-4" />
                            <p className="text-sm font-medium">Chargement des traitements...</p>
                        </div>
                    ) : treatments.length === 0 ? (
                        <div className="text-center py-20 space-y-4">
                            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <ClipboardList size={28} className="text-gray-300" />
                            </div>
                            <p className="text-gray-700 font-semibold">Aucun traitement trouvé</p>
                            <p className="text-sm text-gray-400">Créez un nouveau plan de traitement pour commencer.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-gray-50 bg-gray-50/50">
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                Traitement
                                            </th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                Patient
                                            </th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                Statut
                                            </th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                Progression
                                            </th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                Coût
                                            </th>
                                            <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {treatments.map((treatment) => {
                                            const statusCfg = STATUS_CONFIG[treatment.status];
                                            const progress = treatment.progress;
                                            const percent = progress?.percent ?? 0;

                                            return (
                                                <tr
                                                    key={treatment.id}
                                                    className="group hover:bg-[#f9fefd] transition-colors cursor-pointer"
                                                    onClick={() =>
                                                        navigate(
                                                            ROUTES.DOCTOR_TREATMENT_DETAIL.replace(':id', treatment.id),
                                                        )
                                                    }
                                                >
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-bold text-gray-900 group-hover:text-[#1D9E75] transition-colors">
                                                            {treatment.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Début: {fmtDate(treatment.start_date)}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {treatment.patient?.name || `Patient #${treatment.patient_id}`}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span
                                                            className={`inline-flex px-3 py-1 text-[11px] font-bold rounded-full border ${statusCfg.badge}`}
                                                        >
                                                            {statusCfg.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 min-w-[160px]">
                                                        <div className="space-y-1.5">
                                                            <p className="text-xs font-semibold text-gray-500">
                                                                {progress?.completed_steps ?? 0}/{progress?.total_steps ?? 0}{' '}
                                                                étapes
                                                            </p>
                                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-[#1D9E75] rounded-full transition-all"
                                                                    style={{ width: `${percent}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            {treatment.total_cost > 0
                                                                ? `${treatment.total_cost.toLocaleString('fr-DZ')} DA`
                                                                : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(
                                                                    ROUTES.DOCTOR_TREATMENT_DETAIL.replace(
                                                                        ':id',
                                                                        treatment.id,
                                                                    ),
                                                                );
                                                            }}
                                                            className="inline-flex items-center gap-1 px-4 py-2 bg-[#1D9E75] hover:bg-[#168a65] text-white text-xs font-bold rounded-xl transition-all"
                                                        >
                                                            Détails <ChevronRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {meta.last_page > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-50">
                                    <p className="text-sm text-gray-500">
                                        Page {meta.current_page} sur {meta.last_page} ({meta.total} total)
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                                        >
                                            Précédent
                                        </button>
                                        <button
                                            disabled={page >= meta.last_page}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
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

            <CreateTreatmentModal
                isOpen={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={refresh}
            />
        </DoctorLayout>
    );
}
