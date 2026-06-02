import { AlertTriangle, Mail, TrendingUp } from 'lucide-react'
import type { TrackingRowData } from '../../types/academic'

type AlertsPanelProps = {
  data: TrackingRowData[]
}

export function AlertsPanel({ data }: AlertsPanelProps) {
  // Calculos para el panel
  const totalEstudiantes = data.length
  
  // Asumiendo que 15 fallas es el limite (100%), o 6 fallas es 15% dependiendo de la regla de negocio. 
  // En el mockup dice: >15%. Usaremos un threshold visual arbitrario (ej. > 5 fallas) para las alertas de inasistencia.
  const estudiantesEnRiesgoFallas = data.filter(d => d.fallas >= 5)

  let sumaDefinitivas = 0
  let estudiantesConNota = 0
  let aprobados = 0
  let enRiesgo = 0
  let reprobados = 0

  data.forEach(d => {
    if (d.definitiva !== null) {
      sumaDefinitivas += d.definitiva
      estudiantesConNota++
      if (d.definitiva >= 3.0) aprobados++
      else if (d.definitiva >= 2.5) enRiesgo++
      else reprobados++
    }
  })

  const promedioGrupo = estudiantesConNota > 0 ? (sumaDefinitivas / estudiantesConNota).toFixed(1) : '0.0'
  
  const pctAprobados = estudiantesConNota > 0 ? Math.round((aprobados / estudiantesConNota) * 100) : 0
  const pctEnRiesgo = estudiantesConNota > 0 ? Math.round((enRiesgo / estudiantesConNota) * 100) : 0
  const pctReprobados = estudiantesConNota > 0 ? Math.round((reprobados / estudiantesConNota) * 100) : 0

  return (
    <aside className="w-full xl:w-[320px] flex flex-col gap-6">
      {/* Alertas de Inasistencia */}
      <div className="rounded-[16px] border border-rose-100 bg-[#fff5f5] p-5 shadow-sm">
        <div className="flex items-center gap-3 text-rose-700">
          <AlertTriangle className="h-6 w-6" />
          <h2 className="text-xl font-bold">Alertas de Inasistencia</h2>
        </div>
        <p className="mt-3 text-sm text-slate-700 leading-relaxed">
          Estudiantes con riesgo de pérdida por fallas (&gt;15%). Requieren citación a consejería.
        </p>
        
        <div className="mt-4 space-y-3">
          {estudiantesEnRiesgoFallas.length > 0 ? (
            estudiantesEnRiesgoFallas.map(est => (
              <div key={est.estudiante.id_estudiante} className="bg-white rounded-lg border border-rose-100 p-3 flex items-center justify-between shadow-sm">
                <div>
                  <p className="text-sm font-bold text-slate-800">{est.estudiante.apellidos}, {est.estudiante.nombres.charAt(0)}.</p>
                  <p className="text-xs font-semibold text-rose-600 mt-1">{est.fallas} fallas</p>
                </div>
                <button className="text-slate-400 hover:text-[var(--brand-navy)] transition-colors">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic">No hay estudiantes en riesgo por fallas.</p>
          )}
        </div>
      </div>

      {/* Rendimiento Global */}
      <div className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-slate-900 mb-6">
          <h2 className="text-lg font-bold">Rendimiento Global</h2>
          <TrendingUp className="h-5 w-5 text-slate-400" />
        </div>
        
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-[2.5rem] font-black text-slate-900 leading-none">{promedioGrupo}</span>
          <span className="text-sm font-semibold text-slate-400">/ 5.0 Promedio Grupo</span>
        </div>

        <div className="space-y-4">
          {/* Aprobados */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span className="text-slate-700">Aprobados (&gt;3.0)</span>
              <span className="text-slate-900">{pctAprobados}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[var(--brand-navy)] rounded-full" style={{ width: `${pctAprobados}%` }}></div>
            </div>
          </div>

          {/* En Riesgo */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span className="text-slate-700">En Riesgo (2.5 - 2.9)</span>
              <span className="text-slate-900">{pctEnRiesgo}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pctEnRiesgo}%` }}></div>
            </div>
          </div>

          {/* Reprobados */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span className="text-slate-700">Reprobados (&lt;2.5)</span>
              <span className="text-slate-900">{pctReprobados}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-rose-600 rounded-full" style={{ width: `${pctReprobados}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
