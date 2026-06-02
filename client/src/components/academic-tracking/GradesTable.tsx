import React from 'react'
import type { TrackingRowData } from '../../types/academic'

type GradesTableProps = {
  data: TrackingRowData[]
  onGradeChange: (idEstudiante: number, corte: 1 | 2 | 3, value: string) => void
  onFallasChange: (idEstudiante: number, fallas: number) => void
}

export function GradesTable({ data, onGradeChange, onFallasChange }: GradesTableProps) {
  const getEstadoColor = (estado: TrackingRowData['estado']) => {
    switch (estado) {
      case 'Aprobado':
        return 'text-[#027A48] bg-[#ECFDF3]'
      case 'En Riesgo':
        return 'text-[#B42318] bg-[#FEF3F2]'
      case 'Reprobado':
        return 'text-[#B42318] bg-[#FEF3F2]'
      case 'En Curso':
      default:
        return 'text-slate-600 bg-slate-100'
    }
  }

  const renderGradeInput = (
    value: number | null,
    corte: 1 | 2 | 3,
    idEstudiante: number
  ) => {
    const isMissing = value === null || value === undefined
    
    // Si esta en riesgo o reprobado podriamos pintar el input de rojo, 
    // pero guiandonos por el mockup, las notas muy bajas (<3.0) van en rojo.
    const isLowGrade = !isMissing && value < 3.0

    return (
      <input
        type="number"
        min="0"
        max="5"
        step="0.1"
        value={isMissing ? '' : value}
        onChange={(e) => onGradeChange(idEstudiante, corte, e.target.value)}
        className={`w-16 text-center text-sm font-semibold p-1 outline-none border rounded ${
          isLowGrade ? 'text-rose-600 border-rose-200 bg-rose-50' : 'text-slate-700 border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white bg-transparent'
        }`}
        placeholder="-"
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-[12px] border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <h2 className="text-lg font-bold text-slate-900">Planilla de Calificaciones</h2>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-semibold">VISTA:</span>
          <select className="border border-slate-300 rounded p-1 outline-none">
            <option>Todos los Cortes</option>
            <option>Corte 1</option>
            <option>Corte 2</option>
            <option>Corte 3</option>
          </select>
        </div>
      </div>
      
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f8fafc] text-xs font-bold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="border-b border-slate-200 px-6 py-4">Estudiante</th>
            <th className="border-b border-slate-200 px-4 py-4 text-center">
              Corte 1 <br /><span className="text-[10px] font-medium">30%</span>
            </th>
            <th className="border-b border-slate-200 px-4 py-4 text-center">
              Corte 2 <br /><span className="text-[10px] font-medium">30%</span>
            </th>
            <th className="border-b border-slate-200 px-4 py-4 bg-slate-100 text-center">
              Corte 3 <br /><span className="text-[10px] font-medium">40%</span>
            </th>
            <th className="border-b border-slate-200 px-4 py-4 text-center">Definitiva</th>
            <th className="border-b border-slate-200 px-4 py-4 text-center">Fallas</th>
            <th className="border-b border-slate-200 px-6 py-4 text-center">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={7} className="p-8 text-center text-slate-500">
                No hay estudiantes cargados o selecciona un grupo primero.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.estudiante.id_estudiante} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-800">
                    {row.estudiante.apellidos}, {row.estudiante.nombres}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">ID: {row.estudiante.documento}</p>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  {renderGradeInput(row.corte1, 1, row.estudiante.id_estudiante)}
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  {renderGradeInput(row.corte2, 2, row.estudiante.id_estudiante)}
                </td>
                <td className="px-4 py-4 text-center align-middle bg-slate-50/50">
                  {renderGradeInput(row.corte3, 3, row.estudiante.id_estudiante)}
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <span className={`font-bold ${row.definitiva !== null && row.definitiva < 3.0 ? 'text-rose-600' : 'text-slate-800'}`}>
                    {row.definitiva !== null ? row.definitiva.toFixed(1) : '-'}
                  </span>
                </td>
                <td className="px-4 py-4 text-center align-middle">
                  <input
                    type="number"
                    min="0"
                    value={row.fallas}
                    onChange={(e) => onFallasChange(row.estudiante.id_estudiante, parseInt(e.target.value) || 0)}
                    className={`w-12 text-center text-sm font-semibold p-1 outline-none border rounded ${
                      row.fallas > 4 ? 'text-rose-600' : 'text-slate-700 hover:border-slate-300 focus:border-blue-500 bg-transparent'
                    }`}
                  />
                </td>
                <td className="px-6 py-4 text-center align-middle">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getEstadoColor(row.estado)}`}>
                    {row.estado}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
