import { SecretaryLayout } from '@/components/layout/SecretaryLayout'
import { useTodaySchedule } from '@/hooks/useSecretary'
import { formatDa } from '@/lib/mock/secretary.mock'

export function SecretaryCalendarPage() {
  const { data = [] } = useTodaySchedule()
  return (
    <SecretaryLayout title="Calendrier">
      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm text-gray-500 mb-3">Vue semaine - gestion des rendez-vous du médecin assigné.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.map((a) => (
            <div key={a.id} className="border rounded-lg p-3">
              <p className="font-medium">{a.patientName}</p>
              <p className="text-sm text-gray-600">{a.time} - {a.endTime}</p>
              <p className="text-sm">{a.consultationTypeName}</p>
              <p className="text-xs mt-1 bg-gray-100 inline-block px-2 py-1 rounded">Montant: {formatDa(a.fee)} (lecture seule)</p>
            </div>
          ))}
        </div>
      </div>
    </SecretaryLayout>
  )
}
