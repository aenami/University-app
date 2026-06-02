import { Download, Save } from 'lucide-react'
import type { GrupoAcademico } from '../../types/academic'

type TrackingHeaderProps = {
  grupos: GrupoAcademico[]
  selectedGrupoId: number | null
  onGrupoSelect: (id: number) => void
  onSave: () => void
  onExport: () => void
  isSaving?: boolean
}

export function TrackingHeader({
  grupos,
  selectedGrupoId,
  onGrupoSelect,
  onSave,
  onExport,
  isSaving = false,
}: TrackingHeaderProps) {
  const selectedGrupo = grupos.find((g) => g.id_grupo === selectedGrupoId)

  return (
    <section className="flex flex-col gap-5 border-b border-slate-200 pb-6 pt-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2">
        {grupos.length > 0 ? (
          <select
            className="text-[2rem] font-extrabold tracking-[-0.04em] text-[var(--brand-navy)] bg-transparent border-none outline-none cursor-pointer appearance-none"
            value={selectedGrupoId || ''}
            onChange={(e) => onGrupoSelect(Number(e.target.value))}
          >
            <option value="" disabled>Selecciona un Grupo</option>
            {grupos.map((g) => (
              <option key={g.id_grupo} value={g.id_grupo}>
                {g.asignatura} - {g.nombre}
              </option>
            ))}
          </select>
        ) : (
          <h1 className="text-[2rem] font-extrabold tracking-[-0.04em] text-[var(--brand-navy)]">
            Cargando grupos...
          </h1>
        )}
        <p className="text-[1.02rem] text-slate-500">
          Periodo Académico Actual • Facultad de Ingeniería
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExport}
          className="flex h-[42px] items-center justify-center gap-2 rounded-[4px] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Exportar Notas
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !selectedGrupoId}
          className="flex h-[42px] items-center justify-center gap-2 rounded-[4px] bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,46,90,0.16)] transition hover:bg-[#0d264a] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </section>
  )
}
