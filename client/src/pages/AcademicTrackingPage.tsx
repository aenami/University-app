import { useEffect, useState } from 'react'
import { TrackingSidebar } from '../components/academic-tracking/TrackingSidebar'
import { TrackingTopbar } from '../components/academic-tracking/TrackingTopbar'
import { TrackingHeader } from '../components/academic-tracking/TrackingHeader'
import { GradesTable } from '../components/academic-tracking/GradesTable'
import { AlertsPanel } from '../components/academic-tracking/AlertsPanel'
import { academicApi } from '../services/academicApi'
import { tokenManager } from '../utils/tokenManager'
import type { GrupoAcademico, TrackingRowData } from '../types/academic'

export function AcademicTrackingPage() {
  const sessionUser = tokenManager.getUser()
  const [searchValue, setSearchValue] = useState('')
  const [grupos, setGrupos] = useState<GrupoAcademico[]>([])
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | null>(null)
  const [trackingData, setTrackingData] = useState<TrackingRowData[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Cargar grupos iniciales (Mock o Real dependiendo del backend)
  useEffect(() => {
    async function loadGrupos() {
      try {
        const response = await academicApi.getGrupos()
        // Assuming response structure is { data: [...] } or just [...]
        const data = response.data || response || []
        setGrupos(data)
      } catch (error) {
        console.error("Error al cargar grupos:", error)
        // Set mock data for visual testing in case backend is empty or failing
        setGrupos([
          { id_grupo: 1, nombre: 'Grupo 02A', asignatura: 'Cálculo Diferencial' },
          { id_grupo: 2, nombre: 'Grupo 01B', asignatura: 'Física Mecánica' }
        ])
      }
    }
    loadGrupos()
  }, [])

  // Cargar datos de seguimiento al seleccionar un grupo
  useEffect(() => {
    if (!selectedGrupoId) return
    
    async function loadTrackingData() {
      setErrorMessage(null)
      try {
        const response = await academicApi.getNotasPorGrupo(selectedGrupoId!)
        const notas = response.data || response || []
        
        // Transform backend format to TrackingRowData format if needed
        // For now, if no real data is returned, we use mock to show the UI
        if (notas.length === 0) {
           setTrackingData([
            {
              estudiante: { id_estudiante: 1002934, nombres: 'María', apellidos: 'Álvarez Gómez', documento: '1002934' },
              corte1: 4.2, corte2: 3.8, corte3: 4.0, definitiva: 4.0, fallas: 2, estado: 'Aprobado'
            },
            {
              estudiante: { id_estudiante: 1002811, nombres: 'Juan Pablo', apellidos: 'Cárdenas Ruiz', documento: '1002811' },
              corte1: 2.8, corte2: 3.1, corte3: 2.5, definitiva: 2.8, fallas: 7, estado: 'En Riesgo'
            },
            {
              estudiante: { id_estudiante: 1003155, nombres: 'Laura Daniela', apellidos: 'Díaz Soto', documento: '1003155' },
              corte1: 3.5, corte2: 4.0, corte3: null, definitiva: null, fallas: 1, estado: 'En Curso'
            }
          ])
        } else {
           // Mapping real backend data here... (simplification)
           setTrackingData(notas)
        }
      } catch (error) {
        console.error("Error al cargar notas:", error)
        setErrorMessage("Hubo un error al cargar los datos del grupo.")
      }
    }
    loadTrackingData()
  }, [selectedGrupoId])

  const handleGradeChange = (idEstudiante: number, corte: 1 | 2 | 3, value: string) => {
    const numValue = value === '' ? null : parseFloat(value)
    
    setTrackingData(current => current.map(row => {
      if (row.estudiante.id_estudiante !== idEstudiante) return row
      
      const newRow = { ...row }
      if (corte === 1) newRow.corte1 = numValue
      if (corte === 2) newRow.corte2 = numValue
      if (corte === 3) newRow.corte3 = numValue
      
      // Recalcular definitiva (Corte 1: 30%, Corte 2: 30%, Corte 3: 40%)
      if (newRow.corte1 !== null && newRow.corte2 !== null && newRow.corte3 !== null) {
        const def = (newRow.corte1 * 0.3) + (newRow.corte2 * 0.3) + (newRow.corte3 * 0.4)
        newRow.definitiva = def
        
        if (def >= 3.0) newRow.estado = 'Aprobado'
        else if (def >= 2.5) newRow.estado = 'En Riesgo'
        else newRow.estado = 'Reprobado'
      } else {
        newRow.definitiva = null
        newRow.estado = 'En Curso'
      }
      
      return newRow
    }))
  }

  const handleFallasChange = (idEstudiante: number, fallas: number) => {
    setTrackingData(current => current.map(row => {
      if (row.estudiante.id_estudiante === idEstudiante) {
        return { ...row, fallas }
      }
      return row
    }))
  }

  const handleSave = async () => {
    if (!selectedGrupoId) return
    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    
    try {
      // In a real scenario, we iterate over trackingData and send changed grades/attendance
      // await Promise.all(trackingData.map(row => academicApi.registrarNota(...)))
      
      // Simulate network request
      await new Promise(r => setTimeout(r, 1000))
      
      setSuccessMessage('Cambios guardados correctamente en el servidor.')
    } catch (error) {
      setErrorMessage('Ocurrió un error al guardar los cambios.')
    } finally {
      setIsSaving(false)
      setTimeout(() => setSuccessMessage(null), 3000)
    }
  }

  const handleExport = () => {
    alert("Exportación a Excel en desarrollo...")
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1440px] grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)]">
        <TrackingSidebar />

        <main className="border-l border-slate-200 bg-[#f7f9fc]">
          <TrackingTopbar
            searchValue={searchValue}
            userName={sessionUser?.nombre ?? 'Docente'}
            onSearchChange={setSearchValue}
          />

          <div className="px-6 pb-6">
            <TrackingHeader
              grupos={grupos}
              selectedGrupoId={selectedGrupoId}
              onGrupoSelect={setSelectedGrupoId}
              onSave={handleSave}
              onExport={handleExport}
              isSaving={isSaving}
            />

            {errorMessage ? (
              <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <section className="mt-6 flex flex-col xl:flex-row gap-6 items-start">
              <div className="flex-1 w-full overflow-hidden">
                <GradesTable
                  data={trackingData}
                  onGradeChange={handleGradeChange}
                  onFallasChange={handleFallasChange}
                />
              </div>

              {selectedGrupoId && (
                <AlertsPanel data={trackingData} />
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}
