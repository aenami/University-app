import { Download } from 'lucide-react'

type StudentsToolbarProps = {
  totalStudents: number
  onExport: () => void
}

export function StudentsToolbar({
  totalStudents,
  onExport,
}: StudentsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">
        Mostrando {totalStudents} estudiantes
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Download className="h-4 w-4" />
          Exportar
        </button>
      </div>
    </div>
  )
}
