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
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => {
            const d = new Date(date)
            d.setDate(d.getDate() - 1)
            setDate(d.toISOString().slice(0, 10))
          }}
          className="h-10 w-10 flex items-center justify-center border rounded-lg hover:bg-gray-50"
        >
          ‹
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="h-10 border rounded-lg px-3 text-sm font-medium"
        />
        <button
          onClick={() => {
            const d = new Date(date)
            d.setDate(d.getDate() + 1)
            setDate(d.toISOString().slice(0, 10))
          }}
          className="h-10 w-10 flex items-center justify-center border rounded-lg hover:bg-gray-50"
        >
          ›
        </button>
        <button
          onClick={() => setDate(TODAY)}
          className="h-10 px-4 border rounded-lg text-sm hover:bg-gray-50"
        >
          Aujourd'hui
        </button>
        <span className="ml-auto text-sm text-gray-500">
          {new Date(date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Slots list */}
      <div className="bg-white border rounded-xl p-4">
        {isLoading ? (
          <p className="text-gray-400 text-sm py-8 text-center">Chargement...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">Aucun rendez-vous ce jour.</p>
        ) : (
          <div className="space-y-2">
            {data.map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-4 p-3 rounded-lg border-l-4 bg-gray-50 ${STATUS_COLOR[a.status] ?? 'border-l-gray-300'}`}
              >
                <div className="text-sm font-bold text-gray-700 w-14 shrink-0">{a.time}</div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{a.name ?? 'Patient inconnu'}</p>
                  <p className="text-xs text-gray-500">{a.phone ?? '—'}</p>
                </div>
                <span className="text-xs text-gray-500">{STATUS_LABEL[a.status] ?? a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SecretaryLayout>
  )
}
