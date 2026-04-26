import { Download } from 'lucide-react'

export function DailyExportButton({ rows }: { rows: number }) {
  return <button className="h-9 px-3 rounded-lg border text-sm flex items-center gap-2" onClick={() => window.alert(`Export CSV simulé (${rows} lignes)`)}><Download size={14} />Exporter</button>
}
