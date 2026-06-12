import { useState } from 'react'
import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useCalendar } from '@/hooks/useSecretary'

const TODAY = new Date().toISOString().slice(0, 10)

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'border-l-blue-500',
  cancelled:  'border-l-red-400',
  completed:  'border-l-green-500',
  pending:    'border-l-yellow-400',
}
const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
  completed: 'Terminé',
  pending: 'En attente',
}

export function SecretaryCalendarPage() {
  const [date, setDate] = useState(TODAY)
  const { data = [], isLoading } = useCalendar(date)

  return (
    <SecretaryLayout title="Calendrier">
      {/* Date picker */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm">
        <button
          onClick={() => {
            const d = new Date(date)
            d.setDate(d.getDate() - 1)
            setDate(d.toISOString().slice(0, 10))
          }}
          className="h-11 w-11 flex items-center justify-center bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
        >
          ‹
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-11 bg-gray-50 text-gray-700 rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
        <button
          onClick={() => {
            const d = new Date(date)
            d.setDate(d.getDate() + 1)
            setDate(d.toISOString().slice(0, 10))
          }}
          className="h-11 w-11 flex items-center justify-center bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
        >
          ›
        </button>
        <button
          onClick={() => setDate(TODAY)}
          className="h-11 px-5 bg-blue-50 text-blue-600 font-medium rounded-xl hover:bg-blue-100 transition-colors ml-2"
        >
          Aujourd'hui
        </button>
        <span className="ml-auto text-sm font-medium text-gray-500 px-2">
          {new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Slots list */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        {isLoading ? (
          <p className="text-gray-400 text-sm py-8 text-center">Chargement...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Aucun rendez-vous ce jour.</p>
        ) : (
          <div className="space-y-3">
            {data.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-l-4 bg-gray-50/50 hover:bg-gray-50 transition-colors ${STATUS_COLOR[a.status] ?? 'border-l-gray-300'}`}
              >
                <div className="text-sm font-bold text-gray-800 w-14 shrink-0">{a.time}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-800">{a.name ?? 'Patient inconnu'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{a.phone ?? '—'}</p>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-md shadow-sm">
                  {STATUS_LABEL[a.status] ?? a.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SecretaryLayout>
  )
}
