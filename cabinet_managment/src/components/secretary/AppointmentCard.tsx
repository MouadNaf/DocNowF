import { useState } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  Edit2,
  RefreshCw,
  UserCheck,
  CheckCircle,
  XCircle,
  Banknote,
  Trash2,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { useAppointmentStore } from '@/store/appointment.store';
import { RescheduleModal } from '@/components/secretary/RescheduleModal';
import { EditAppointmentModal } from '@/components/secretary/EditAppointmentModal';
import type { Appointment, AppointmentStatus, PaymentStatus, UserRole } from '@/types/secretary.types';
import { SECRETARY_PERMISSIONS, DOCTOR_PERMISSIONS } from '@/types/secretary.types';

// ─── Visual config ────────────────────────────────────────────────────────────
const STATUS_BADGE: Record<AppointmentStatus, string> = {
  Confirmé: 'bg-blue-100 text-blue-800 border-blue-200',
  Arrivé:   'bg-purple-100 text-purple-800 border-purple-200',
  Terminé:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  'No-show':'bg-orange-100 text-orange-800 border-orange-200',
  Annulé:   'bg-red-100 text-red-700 border-red-200',
};

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  Payé:      'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Non payé':'bg-amber-100 text-amber-800 border-amber-200',
};

const VISIT_BADGE: Record<string, string> = {
  'Première visite': 'bg-violet-50 text-violet-700',
  Suivi:             'bg-sky-50 text-sky-700',
};

const TOP_BAR: Record<AppointmentStatus, string> = {
  Confirmé: 'bg-gradient-to-r from-blue-400 to-blue-500',
  Arrivé:   'bg-gradient-to-r from-purple-400 to-purple-500',
  Terminé:  'bg-gradient-to-r from-emerald-400 to-emerald-500',
  'No-show':'bg-gradient-to-r from-orange-400 to-orange-500',
  Annulé:   'bg-gradient-to-r from-red-400 to-red-500',
};

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  Confirmé: 'Confirmé',
  Arrivé:   'Arrivé',
  Terminé:  'Terminé',
  'No-show':'No-show',
  Annulé:   'Annulé',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('fr-DZ', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

// ─── Sub-components ───────────────────────────────────────────────────────────

/** A disabled "Doctor only" locked button shown instead of restricted actions */
function LockedAction({ label }: { label: string }) {
  return (
    <div className="group relative">
      <button
        disabled
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-400 border border-dashed border-gray-200 cursor-not-allowed select-none"
      >
        <Lock size={11} className="text-gray-300" />
        {label}
      </button>
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 hidden group-hover:block pointer-events-none">
        <div className="bg-gray-900 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 shadow-xl">
          <Lock size={10} />
          Réservé au médecin
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  appointment: Appointment;
  role?: UserRole; // defaults to 'secretary'
}

export function AppointmentCard({ appointment, role = 'secretary' }: Props) {
  const patients          = useAppointmentStore((s) => s.patients);
  const updateStatus      = useAppointmentStore((s) => s.updateStatus);
  const cancelAppointment = useAppointmentStore((s) => s.cancelAppointment);
  const markPaid          = useAppointmentStore((s) => s.markPaid);
  const deleteAppointment = useAppointmentStore((s) => s.deleteAppointment);

  const [showReschedule, setShowReschedule] = useState(false);
  const [showEdit, setShowEdit]             = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);

  const perm   = role === 'doctor' ? DOCTOR_PERMISSIONS : SECRETARY_PERMISSIONS;
  const status = appointment.status;

  const patient  = patients.find((p) => p.id === appointment.patientId);
  const initials = patient?.name.split(' ').slice(0, 2).map((w) => w[0]).join('') ?? '?';

  // Derive actionable states
  const isActive   = status === 'Confirmé' || status === 'Arrivé';
  const isFinished = status === 'Terminé' || status === 'No-show' || status === 'Annulé';
  const canArrived  = status === 'Confirmé' && perm.canMarkArrived;
  const canComplete = status === 'Arrivé' && perm.canMarkComplete;
  const canNoShow   = isActive && perm.canMarkNoShow;
  const canCancel   = isActive && perm.canCancel;
  const canResch    = status === 'Confirmé' && perm.canUpdate;
  const canPay      = status === 'Terminé' && appointment.paymentStatus === 'Non payé' && perm.canMarkPaid;
  const canEdit     = !isFinished && perm.canUpdate;
  const canDelete   = perm.canCancel; // using canCancel as proxy for "can interact"

  // Doctor-only locked actions visible to secretary (transparency)
  const showLockedComplete = status === 'Arrivé' && !perm.canMarkComplete;
  const showLockedNoShow   = isActive && !perm.canMarkNoShow;

  return (
    <>
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden">

        {/* ── Top accent bar */}
        <div className={`h-1.5 w-full ${TOP_BAR[status]}`} />

        <div className="p-5 flex flex-col flex-1 gap-4">

          {/* ── Row 1: Date / Time + Badges ── */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
              <span className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                <Calendar size={12} className="text-blue-500" />
                {fmtDate(appointment.date)}
              </span>
              <span className="w-px h-3 bg-gray-300" />
              <span className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                <Clock size={12} className="text-blue-500" />
                {appointment.time}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${STATUS_BADGE[status]}`}>
                {STATUS_LABEL[status]}
              </span>
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${PAYMENT_BADGE[appointment.paymentStatus]}`}>
                {appointment.paymentStatus}
              </span>
            </div>
          </div>

          {/* ── Row 2: Patient ── */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm shadow-blue-200">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{patient?.name ?? '—'}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                <Phone size={11} />
                {patient?.phone ?? '—'}
              </div>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${VISIT_BADGE[appointment.visitType]}`}>
              {appointment.visitType === 'Première visite' ? '1ère visite' : 'Suivi'}
            </span>
          </div>

          {/* ── Notes ── */}
          {appointment.notes && (
            <p className="text-xs text-gray-400 italic border-l-2 border-blue-100 pl-3 py-0.5 bg-blue-50/30 rounded-r">
              {appointment.notes}
            </p>
          )}

          {/* ── Divider ── */}
          <div className="border-t border-gray-100" />

          {/* ── Action buttons zone ── */}
          <div className="flex flex-col gap-3">

            {/* Primary workflow actions */}
            {!isFinished && (
              <div className="flex flex-wrap gap-2">
                {/* ① Mark Arrived — secretary allowed */}
                {canArrived && (
                  <button
                    onClick={() => updateStatus(appointment.id, 'Arrivé')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 active:scale-95 transition-all"
                  >
                    <UserCheck size={13} /> Marquer arrivé
                  </button>
                )}

                {/* ② Mark Complete — doctor only, show locked to secretary */}
                {showLockedComplete && <LockedAction label="Marquer terminé" />}
                {canComplete && (
                  <button
                    onClick={() => updateStatus(appointment.id, 'Terminé')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all"
                  >
                    <CheckCircle size={13} /> Marquer terminé
                  </button>
                )}

                {/* ③ Reschedule — secretary allowed */}
                {canResch && (
                  <button
                    onClick={() => setShowReschedule(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 active:scale-95 transition-all"
                  >
                    <RefreshCw size={13} /> Replanifier
                  </button>
                )}

                {/* ④ No-show — doctor only */}
                {showLockedNoShow && <LockedAction label="No-show" />}
                {canNoShow && (
                  <button
                    onClick={() => updateStatus(appointment.id, 'No-show')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 active:scale-95 transition-all ml-auto"
                  >
                    <AlertCircle size={13} /> No-show
                  </button>
                )}

                {/* ⑤ Cancel — secretary action → 'Annulé' */}
                {canCancel && (
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    className={[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 active:scale-95 transition-all',
                      !canNoShow && !showLockedNoShow ? 'ml-auto' : '',
                    ].join(' ')}
                  >
                    <XCircle size={13} /> Annuler RDV
                  </button>
                )}
              </div>
            )}

            {/* Pay CTA — full-width, prominent */}
            {canPay && (
              <button
                onClick={() => markPaid(appointment.id)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-md shadow-emerald-100"
              >
                <Banknote size={17} />
                Encaisser le paiement
              </button>
            )}

            {/* Locked pay — show when Terminé but secretary can't pay (shouldn't happen but guard) */}
            {status === 'Terminé' && appointment.paymentStatus === 'Payé' && (
              <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold">
                <CheckCircle size={15} />
                Payé — consultation réglée
              </div>
            )}
          </div>

          {/* ── Footer: Edit / Delete ── */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
            {/* Edit — only when canEdit */}
            {canEdit ? (
              <button
                onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 font-medium transition-colors"
              >
                <Edit2 size={12} /> Modifier
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-gray-200 cursor-not-allowed select-none">
                <Edit2 size={12} /> Modifier
              </span>
            )}

            {/* Delete */}
            {canDelete && (
              confirmDelete ? (
                <div className="flex items-center gap-2 animate-in fade-in duration-150">
                  <span className="text-[11px] text-red-500 font-semibold">Confirmer la suppression ?</span>
                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    className="text-[11px] font-bold text-white bg-red-500 hover:bg-red-600 px-2.5 py-1 rounded-lg transition"
                  >
                    Oui, supprimer
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="text-[11px] font-bold text-gray-500 hover:text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 transition"
                  >
                    Non
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
                >
                  <Trash2 size={12} /> Supprimer
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {showReschedule && (
        <RescheduleModal appointment={appointment} onClose={() => setShowReschedule(false)} />
      )}
      {showEdit && (
        <EditAppointmentModal appointment={appointment} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}
