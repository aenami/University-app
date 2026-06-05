import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  GraduationCap,
  ListChecks,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Shield,
  TrendingUp,
  Users,
  X,
} from 'lucide-react'
import { ofertaAcademicaApi } from '../services/ofertaAcademicaApi'
import type {
  Asignatura,
  Grupo,
  HorarioAula,
  Pensum,
  Prerrequisito,
  Programa,
} from '../types/ofertaAcademica'

const weekDays = [
  { label: 'Lunes', dayNumber: 1 },
  { label: 'Martes', dayNumber: 2 },
  { label: 'Miércoles', dayNumber: 3 },
  { label: 'Jueves', dayNumber: 4 },
  { label: 'Viernes', dayNumber: 5 },
  { label: 'Sábado', dayNumber: 6 },
]

const startHourOptions = Array.from({ length: 15 }, (_, index) => index + 7)
const endHourOptions = Array.from({ length: 15 }, (_, index) => index + 8)
const PERIODO_ACADEMICO = '2026-1'

type SortDirection = 'ascending' | 'descending'
type SortConfig = { key: number; direction: SortDirection }

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrio un error inesperado.'
}

const toPositiveInteger = (value: string) => {
  const numberValue = Number(value)
  return Number.isInteger(numberValue) && numberValue > 0 ? numberValue : null
}

const formatTime = (value: string) => {
  return value.slice(0, 5)
}

const formatAula = (horario: HorarioAula) => {
  const aula = horario.aula ? ` - Aula ${horario.aula}` : ''
  return `Bloque ${horario.bloque}${aula}, piso ${horario.piso}`
}

const formatDisplayHour = (hour: number) => {
  if (hour === 12) {
    return '12:00 PM'
  }

  if (hour > 12) {
    return `${hour - 12}:00 PM`
  }

  return `${hour}:00 AM`
}

const formatHourValue = (hour: number) => `${String(hour).padStart(2, '0')}:00`

const getCurrentWeekDateForDay = (dayNumber: number) => {
  const today = new Date()
  const currentDay = today.getDay()
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() + mondayOffset + (dayNumber - 1))

  const year = targetDate.getFullYear()
  const month = String(targetDate.getMonth() + 1).padStart(2, '0')
  const day = String(targetDate.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getProgramCode = (programa: Programa) => {
  const facultyPrefix = (programa.facultad || 'PRO').slice(0, 3).toUpperCase()
  return `${facultyPrefix}-${programa.id_programa}`
}

const compareTableValues = (aVal: string | number | null, bVal: string | number | null, direction: SortDirection) => {
  if (aVal === null) return 1
  if (bVal === null) return -1

  const aNumber = typeof aVal === 'number' ? aVal : Number(aVal)
  const bNumber = typeof bVal === 'number' ? bVal : Number(bVal)
  const bothNumeric = Number.isFinite(aNumber) && Number.isFinite(bNumber)

  const result = bothNumeric
    ? aNumber - bNumber
    : String(aVal).localeCompare(String(bVal), 'es', { numeric: true, sensitivity: 'base' })

  return direction === 'ascending' ? result : -result
}

export function OfertaAcademicaPage() {
  const [programas, setProgramas] = useState<Programa[]>([])
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([])
  const [pensums, setPensums] = useState<Pensum[]>([])
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [horarios, setHorarios] = useState<HorarioAula[]>([])
  const [prerrequisitos, setPrerrequisitos] = useState<Prerrequisito[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProgramaModalOpen, setIsProgramaModalOpen] = useState(false)
  const [showAllPrograms, setShowAllPrograms] = useState(false)
  const [filtroProgramas, setFiltroProgramas] = useState('')
  const [filtroAsignaturas, setFiltroAsignaturas] = useState('')
  const [filtroPensums, setFiltroPensums] = useState('')
  const [filtroGrupos, setFiltroGrupos] = useState('')
  const [filtroHorarios, setFiltroHorarios] = useState('')
  const [programSortConfig, setProgramSortConfig] = useState<SortConfig | null>(null)

  const asignaturasSectionRef = useRef<HTMLElement | null>(null)
  const prerrequisitosSectionRef = useRef<HTMLElement | null>(null)
  const pensumsSectionRef = useRef<HTMLElement | null>(null)
  const gruposSectionRef = useRef<HTMLElement | null>(null)
  const horariosSectionRef = useRef<HTMLElement | null>(null)

  const [programaForm, setProgramaForm] = useState({
    nombre: '',
    tipoPrograma: 'Carreras',
    facultad: '',
  })
  const [asignaturaForm, setAsignaturaForm] = useState({ nombre: '', creditos: '' })
  const [prerrequisitoForm, setPrerrequisitoForm] = useState({
    idAsignatura: '',
    idAsignaturaRequisito: '',
  })
  const [consultaPrerrequisitoId, setConsultaPrerrequisitoId] = useState('')
  const [pensumForm, setPensumForm] = useState({ idPrograma: '', estado: 'Activo' })
  const [pensumAsignaturaForm, setPensumAsignaturaForm] = useState({ idPensum: '', idAsignatura: '' })
  const [grupoForm, setGrupoForm] = useState({
    numGrupo: '',
    cupoMaximo: '',
    idAsignatura: '',
  })
  const [horarioForm, setHorarioForm] = useState({
    idGrupo: '',
    dia: '',
    horaInicio: '',
    horaFin: '',
    piso: '',
    bloque: '',
    aula: '',
  })

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [programasResponse, asignaturasResponse, pensumsResponse, gruposResponse, horariosResponse] =
        await Promise.all([
          ofertaAcademicaApi.getProgramas(),
          ofertaAcademicaApi.getAsignaturas(),
          ofertaAcademicaApi.getPensums(),
          ofertaAcademicaApi.getGrupos(),
          ofertaAcademicaApi.getHorarios(),
        ])

      setProgramas(programasResponse)
      setAsignaturas(asignaturasResponse)
      setPensums(pensumsResponse)
      setGrupos(gruposResponse)
      setHorarios(horariosResponse)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const runSubmit = async (action: () => Promise<void>, successText: string) => {
    setIsSubmitting(true)
    setErrorMessage(null)
    setMessage(null)

    try {
      await action()
      setMessage(successText)
      setTimeout(() => setMessage(null), 5000)
      await loadData()
    } catch (error) {
      const errorText = getErrorMessage(error)
      setErrorMessage(errorText)
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadPrerrequisitos = async (idAsignatura: number) => {
    setErrorMessage(null)

    try {
      const prerrequisitosResponse = await ofertaAcademicaApi.getPrerrequisitos(idAsignatura)
      setPrerrequisitos(prerrequisitosResponse.detalle)
    } catch (error) {
      const errorText = getErrorMessage(error)
      setErrorMessage(errorText)
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }

  const showValidationError = (text: string) => {
    setErrorMessage(text)
    setTimeout(() => setErrorMessage(null), 5000)
  }

  const handleCreatePrograma = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!programaForm.nombre.trim() || !programaForm.tipoPrograma.trim() || !programaForm.facultad.trim()) {
      showValidationError('Complete los datos del programa.')
      return
    }

    void runSubmit(async () => {
      await ofertaAcademicaApi.crearPrograma({
        nombre: programaForm.nombre.trim(),
        tipoPrograma: programaForm.tipoPrograma.trim(),
        facultad: programaForm.facultad.trim(),
      })
      setProgramaForm({ nombre: '', tipoPrograma: 'Carreras', facultad: '' })
      setIsProgramaModalOpen(false)
    }, 'Programa creado correctamente.')
  }

  const handleCreateAsignatura = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const creditos = toPositiveInteger(asignaturaForm.creditos)

    if (!asignaturaForm.nombre.trim() || !creditos) {
      showValidationError('Ingrese una asignatura y creditos mayores que cero.')
      return
    }

    void runSubmit(async () => {
      await ofertaAcademicaApi.crearAsignatura({
        nombre: asignaturaForm.nombre.trim(),
        creditos,
      })
      setAsignaturaForm({ nombre: '', creditos: '' })
    }, 'Asignatura creada correctamente.')
  }

  const handleCreatePrerrequisito = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const idAsignatura = toPositiveInteger(prerrequisitoForm.idAsignatura)
    const idAsignaturaRequisito = toPositiveInteger(prerrequisitoForm.idAsignaturaRequisito)

    if (!idAsignatura || !idAsignaturaRequisito) {
      showValidationError('Seleccione la asignatura principal y su prerrequisito.')
      return
    }

    if (idAsignatura === idAsignaturaRequisito) {
      showValidationError('Una asignatura no puede ser prerrequisito de si misma.')
      return
    }

    void runSubmit(async () => {
      await ofertaAcademicaApi.crearPrerrequisito(idAsignatura, { idAsignaturaRequisito })
      setPrerrequisitoForm({ idAsignatura: '', idAsignaturaRequisito: '' })
      setConsultaPrerrequisitoId(String(idAsignatura))
      await loadPrerrequisitos(idAsignatura)
    }, 'Prerrequisito asociado correctamente.')
  }

  const handleConsultarPrerrequisitos = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const idAsignatura = toPositiveInteger(consultaPrerrequisitoId)

    if (!idAsignatura) {
      showValidationError('Seleccione una asignatura para consultar prerrequisitos.')
      return
    }

    void loadPrerrequisitos(idAsignatura)
  }

  const handleCreatePensum = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const idPrograma = toPositiveInteger(pensumForm.idPrograma)

    if (!idPrograma) {
      showValidationError('Seleccione un programa valido para crear el pensum.')
      return
    }

    void runSubmit(async () => {
      await ofertaAcademicaApi.crearPensum({
        idPrograma,
        estado: pensumForm.estado.trim() || undefined,
      })
      setPensumForm({ idPrograma: '', estado: 'Activo' })
    }, 'Pensum creado correctamente.')
  }

  const handleAsociarAsignaturaPensum = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const idPensum = toPositiveInteger(pensumAsignaturaForm.idPensum)
    const idAsignatura = toPositiveInteger(pensumAsignaturaForm.idAsignatura)

    if (!idPensum || !idAsignatura) {
      showValidationError('Seleccione un pensum y una asignatura validos.')
      return
    }

    void runSubmit(async () => {
      await ofertaAcademicaApi.asociarAsignaturaPensum(idPensum, { idAsignatura })
      setPensumAsignaturaForm({ idPensum: '', idAsignatura: '' })
    }, 'Asignatura asociada al pensum correctamente.')
  }

  const handleCreateGrupo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const numGrupo = toPositiveInteger(grupoForm.numGrupo)
    const cupoMaximo = toPositiveInteger(grupoForm.cupoMaximo)
    const idAsignatura = toPositiveInteger(grupoForm.idAsignatura)

    if (!numGrupo || !cupoMaximo || !idAsignatura) {
      showValidationError('Ingrese numero de grupo, cupo y asignatura validos.')
      return
    }

    void runSubmit(async () => {
      await ofertaAcademicaApi.crearGrupo({ numGrupo, cupoMaximo, idAsignatura })
      setGrupoForm({ numGrupo: '', cupoMaximo: '', idAsignatura: '' })
    }, 'Grupo creado correctamente.')
  }

  const handleCreateHorario = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const idGrupo = toPositiveInteger(horarioForm.idGrupo)
    const piso = toPositiveInteger(horarioForm.piso)

    if (
      !idGrupo ||
      !piso ||
      !horarioForm.dia.trim() ||
      !horarioForm.horaInicio.trim() ||
      !horarioForm.horaFin.trim() ||
      !horarioForm.bloque.trim()
    ) {
      showValidationError('Complete grupo, dia, horas, piso y bloque.')
      return
    }

    if (horarioForm.horaFin <= horarioForm.horaInicio) {
      showValidationError('La hora fin debe ser mayor que la hora inicio.')
      return
    }

    void runSubmit(async () => {
      await ofertaAcademicaApi.crearHorarioAula(idGrupo, {
        dia: horarioForm.dia.trim(),
        horaInicio: horarioForm.horaInicio.trim(),
        horaFin: horarioForm.horaFin.trim(),
        piso,
        bloque: horarioForm.bloque.trim(),
        aula: horarioForm.aula.trim() || undefined,
      })
      setHorarioForm({
        idGrupo: '',
        dia: '',
        horaInicio: '',
        horaFin: '',
        piso: '',
        bloque: '',
        aula: '',
      })
    }, 'Horario y aula registrados correctamente.')
  }

  const totalCreditos = useMemo(
    () => asignaturas.reduce((total, asignatura) => total + asignatura.creditos, 0),
    [asignaturas],
  )



  const scrollToSection = (sectionRef: React.MutableRefObject<HTMLElement | null>) => {
    sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSelectHorarioDay = (dayNumberValue: string) => {
    const dayNumber = Number(dayNumberValue)
    setHorarioForm((current) => ({
      ...current,
      dia: dayNumber ? getCurrentWeekDateForDay(dayNumber) : '',
    }))
  }

  const selectedHorarioDay = useMemo(() => {
    if (!horarioForm.dia) {
      return ''
    }

    const dayNumber = new Date(horarioForm.dia).getDay()
    return dayNumber >= 1 && dayNumber <= 6 ? String(dayNumber) : ''
  }, [horarioForm.dia])

  const filteredProgramas = programas.filter(p => 
    p.nombre.toLowerCase().includes(filtroProgramas.toLowerCase()) || 
    p.facultad.toLowerCase().includes(filtroProgramas.toLowerCase()) ||
    getProgramCode(p).toLowerCase().includes(filtroProgramas.toLowerCase())
  )
  
  const filteredAsignaturas = asignaturas.filter(a => 
    a.nombre.toLowerCase().includes(filtroAsignaturas.toLowerCase()) ||
    String(a.id_asignatura).includes(filtroAsignaturas)
  )



  const filteredPensums = pensums.filter(p =>
    p.programa.toLowerCase().includes(filtroPensums.toLowerCase()) ||
    p.estado.toLowerCase().includes(filtroPensums.toLowerCase()) ||
    String(p.id_pensum).includes(filtroPensums)
  )

  const filteredGrupos = grupos.filter(g =>
    g.asignatura.toLowerCase().includes(filtroGrupos.toLowerCase()) ||
    String(g.num_grupo).includes(filtroGrupos) ||
    String(g.id_grupo).includes(filtroGrupos)
  )

  const filteredHorarios = horarios.filter(h =>
    h.asignatura.toLowerCase().includes(filtroHorarios.toLowerCase()) ||
    String(h.num_grupo).includes(filtroHorarios) ||
    h.dia.toLowerCase().includes(filtroHorarios.toLowerCase()) ||
    formatAula(h).toLowerCase().includes(filtroHorarios.toLowerCase())
  )

  const sortedProgramas = useMemo(() => {
    if (!programSortConfig) {
      return filteredProgramas
    }

    return [...filteredProgramas].sort((a, b) => {
      const rowA = [getProgramCode(a), a.nombre, a.facultad, totalCreditos]
      const rowB = [getProgramCode(b), b.nombre, b.facultad, totalCreditos]
      return compareTableValues(rowA[programSortConfig.key], rowB[programSortConfig.key], programSortConfig.direction)
    })
  }, [filteredProgramas, programSortConfig, totalCreditos])

  const activePrograms = showAllPrograms ? sortedProgramas : sortedProgramas.slice(0, 5)

  const requestProgramSort = (key: number) => {
    setProgramSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }))
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-slate-200 bg-white px-5 py-8 lg:block">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-[#0b4778] text-2xl font-bold text-white">
            U
          </div>
          <div>
            <p className="text-2xl font-bold leading-tight text-[#09233f]">Gestión Académica</p>
            <p className="mt-1 text-sm text-slate-500">Unicomfacauca</p>
          </div>
        </div>

        <nav className="mt-16 grid gap-3 text-sm font-semibold text-slate-500">
          <SidebarItem icon={<Shield size={20} />} label="Seguridad" />
          <SidebarItem active icon={<BookOpen size={20} />} label="Oferta Académica" />
          <SidebarItem icon={<Users size={20} />} label="Matrículas" />
          <SidebarItem icon={<TrendingUp size={20} />} label="Seguimiento" />
          <SidebarItem icon={<GraduationCap size={20} />} label="Soporte" />
          <SidebarItem icon={<BarChart3 size={20} />} label="Analítica" />
        </nav>

        <div className="absolute bottom-8 left-5 right-5">
          <SidebarItem icon={<LogOut size={20} />} label="Cerrar Sesión" />
        </div>
      </aside>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-[#f7f9fc]/95 px-5 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="hidden w-full max-w-xl md:block"></div>
            <div className="ml-auto flex items-center gap-4 text-slate-700">
              <Bell size={22} />
              <Settings size={24} />
              <div className="h-10 w-10 rounded-full bg-slate-300 shadow-inner" aria-label="Perfil" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-8">
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-normal text-slate-900">Oferta Académica</h1>
              <p className="mt-3 text-lg text-slate-600">
                Gestione programas, asignaturas y configuración de grupos.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f]"
              onClick={() => setIsProgramaModalOpen(true)}
              type="button"
            >
              <Plus size={18} />
              + Nuevo Programa
            </button>
          </header>

          <div className="fixed top-24 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
            {errorMessage ? (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg pointer-events-auto">
                {errorMessage}
              </div>
            ) : null}

            {message ? (
              <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-lg pointer-events-auto">
                {message}
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 px-5 py-5 gap-4">
                <h2 className="text-2xl font-bold text-slate-900">Programas Activos</h2>
                <input
                  className="h-10 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1e3a5f] w-full sm:w-64"
                  placeholder="Filtrar programas..."
                  type="search"
                  value={filtroProgramas}
                  onChange={(e) => setFiltroProgramas(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
                      {['Código', 'Programa', 'Facultad', 'Créditos'].map((header, index) => (
                        <SortableHeader
                          className="px-5 py-4"
                          columnIndex={index}
                          key={header}
                          label={header}
                          onSort={requestProgramSort}
                          sortConfig={programSortConfig}
                        />
                      ))}
                      <th className="px-5 py-4 font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                          Cargando información...
                        </td>
                      </tr>
                    ) : activePrograms.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                          No hay programas registrados.
                        </td>
                      </tr>
                    ) : (
                      activePrograms.map((programa) => (
                        <tr className="border-b border-slate-200 last:border-b-0" key={programa.id_programa}>
                          <td className="px-5 py-5 font-medium text-slate-800">{getProgramCode(programa)}</td>
                          <td className="px-5 py-5 font-semibold text-[#0f2a44]">{programa.nombre}</td>
                          <td className="px-5 py-5 text-slate-600">{programa.facultad}</td>
                          <td className="px-5 py-5 text-slate-700">{totalCreditos || 'N/D'}</td>
                          <td className="px-5 py-5">
                            <button
                              className="rounded p-2 text-slate-300 cursor-not-allowed"
                              title="Editar programa (No disponible)"
                              type="button"
                              disabled
                            >
                              <Pencil size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {programas.length > 5 && (
                <button
                  className="flex w-full items-center justify-center border-t border-slate-200 px-5 py-4 text-sm font-bold text-[#0f2a44] transition hover:bg-slate-50"
                  onClick={() => setShowAllPrograms(!showAllPrograms)}
                  type="button"
                >
                  {showAllPrograms ? 'Ver menos' : 'Ver todos los programas'}
                </button>
              )}
            </section>

            <div className="grid gap-6">
              <section className="rounded-lg bg-[#1e3a5f] p-6 text-white shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full">
                    <p className="text-sm font-bold uppercase tracking-wide text-blue-100 mb-2">Periodo Actual</p>
                    <p className="text-5xl font-black leading-none tracking-normal text-white sm:text-6xl">
                      {PERIODO_ACADEMICO}
                    </p>
                  </div>
                  <CalendarDays className="text-blue-200/40" size={62} />
                </div>
                <div className="mt-7 grid gap-4 text-sm">
                  <StatRow label="Grupos Abiertos" value={grupos.length} />
                  <StatRow label="Asignaturas Ofertadas" value={asignaturas.length} />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900">Acciones Frecuentes</h2>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <ActionButton
                    icon={<ListChecks size={24} />}
                    label="Crear Asignatura"
                    onClick={() => scrollToSection(asignaturasSectionRef)}
                  />
                  <ActionButton
                    icon={<Users size={24} />}
                    label="Crear Grupos"
                    onClick={() => scrollToSection(gruposSectionRef)}
                  />
                  <ActionButton
                    icon={<Clock size={25} />}
                    label="Horarios"
                    onClick={() => scrollToSection(horariosSectionRef)}
                  />
                  <ActionButton
                    icon={<Building2 size={25} />}
                    label="Aulas"
                    onClick={() => scrollToSection(horariosSectionRef)}
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="mt-8 grid gap-6">
            <Section ref={asignaturasSectionRef} icon={<BookOpen size={20} />} title="Asignaturas">
              <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <form className="grid content-start gap-3" onSubmit={handleCreateAsignatura}>
                  <TextInput
                    label="Nombre"
                    value={asignaturaForm.nombre}
                    onChange={(value) => setAsignaturaForm((current) => ({ ...current, nombre: value }))}
                  />
                  <TextInput
                    label="Creditos"
                    type="number"
                    min="1"
                    value={asignaturaForm.creditos}
                    onChange={(value) => setAsignaturaForm((current) => ({ ...current, creditos: value }))}
                  />
                  <SubmitButton disabled={isSubmitting}>Crear asignatura</SubmitButton>
                </form>

                <div className="grid gap-4 content-start">
                  <input
                    className="h-10 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1e3a5f] w-full"
                    placeholder="Filtrar asignaturas..."
                    type="search"
                    value={filtroAsignaturas}
                    onChange={(e) => setFiltroAsignaturas(e.target.value)}
                  />
                  <SimpleTable
                    sortable={true}
                    emptyText="No hay asignaturas registradas."
                    headers={['ID', 'Nombre', 'Créditos']}
                    rows={filteredAsignaturas.map((asignatura) => [
                      asignatura.id_asignatura,
                      asignatura.nombre,
                      asignatura.creditos,
                    ])}
                  />
                </div>
              </div>
            </Section>

            <Section ref={prerrequisitosSectionRef} icon={<ListChecks size={20} />} title="Prerrequisitos">
              <div className="grid gap-5 xl:grid-cols-2">
                <form className="grid content-start gap-3" onSubmit={handleCreatePrerrequisito}>
                  <SearchableSelect
                    label="Asignatura principal"
                    value={prerrequisitoForm.idAsignatura}
                    onChange={(value) =>
                      setPrerrequisitoForm((current) => ({ ...current, idAsignatura: value }))
                    }
                    options={asignaturas.map((asignatura) => ({
                      label: asignatura.nombre,
                      value: String(asignatura.id_asignatura),
                    }))}
                  />
                  <SearchableSelect
                    label="Asignatura prerrequisito"
                    value={prerrequisitoForm.idAsignaturaRequisito}
                    onChange={(value) =>
                      setPrerrequisitoForm((current) => ({ ...current, idAsignaturaRequisito: value }))
                    }
                    options={asignaturas.map((asignatura) => ({
                      label: asignatura.nombre,
                      value: String(asignatura.id_asignatura),
                    }))}
                  />
                  <SubmitButton disabled={isSubmitting}>Asignar prerrequisito</SubmitButton>
                </form>

                <div>
                  <form className="grid gap-3" onSubmit={handleConsultarPrerrequisitos}>
                    <SearchableSelect
                      label="Consultar por asignatura"
                      value={consultaPrerrequisitoId}
                      onChange={setConsultaPrerrequisitoId}
                      options={asignaturas.map((asignatura) => ({
                        label: asignatura.nombre,
                        value: String(asignatura.id_asignatura),
                      }))}
                    />
                    <SubmitButton disabled={isSubmitting}>Consultar prerrequisitos</SubmitButton>
                  </form>

                  <div className="mt-4 grid gap-4">
                    <SimpleTable
                      emptyText="No hay prerrequisitos para la asignatura seleccionada."
                      headers={['Asignatura', 'Prerrequisito', 'Créditos']}
                      rows={prerrequisitos.map((prerrequisito) => [
                        prerrequisito.asignatura,
                        prerrequisito.prerrequisito,
                        prerrequisito.creditos_prerrequisito,
                      ])}
                    />
                  </div>
                </div>
              </div>
            </Section>

            <Section ref={pensumsSectionRef} icon={<GraduationCap size={20} />} title="Pensums">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
                <div className="grid gap-5">
                  <form className="grid gap-3" onSubmit={handleCreatePensum}>
                    <SearchableSelect
                      label="Programa"
                      value={pensumForm.idPrograma}
                      onChange={(value) => setPensumForm((current) => ({ ...current, idPrograma: value }))}
                      options={programas.map((programa) => ({
                        label: `${programa.nombre} (${programa.facultad})`,
                        value: String(programa.id_programa),
                      }))}
                    />
                    <SelectInput
                      label="Estado"
                      value={pensumForm.estado}
                      onChange={(value) => setPensumForm((current) => ({ ...current, estado: value }))}
                      options={[
                        { label: 'Activo', value: 'Activo' },
                        { label: 'Inactivo', value: 'Inactivo' },
                      ]}
                    />
                    <SubmitButton disabled={isSubmitting}>Crear pensum</SubmitButton>
                  </form>

                  <form className="grid gap-3 border-t border-slate-200 pt-5" onSubmit={handleAsociarAsignaturaPensum}>
                    <SearchableSelect
                      label="Pensum"
                      value={pensumAsignaturaForm.idPensum}
                      onChange={(value) =>
                        setPensumAsignaturaForm((current) => ({ ...current, idPensum: value }))
                      }
                      options={pensums.map((pensum) => ({
                        label: `${pensum.programa} - ${pensum.estado} (ID ${pensum.id_pensum})`,
                        value: String(pensum.id_pensum),
                      }))}
                    />
                    <SearchableSelect
                      label="Asignatura"
                      value={pensumAsignaturaForm.idAsignatura}
                      onChange={(value) =>
                        setPensumAsignaturaForm((current) => ({ ...current, idAsignatura: value }))
                      }
                      options={asignaturas.map((asignatura) => ({
                        label: `${asignatura.nombre} (${asignatura.creditos} creditos)`,
                        value: String(asignatura.id_asignatura),
                      }))}
                    />
                    <SubmitButton disabled={isSubmitting}>Asociar asignatura</SubmitButton>
                  </form>
                </div>

                <div className="grid gap-4 content-start">
                  <input
                    className="h-10 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1e3a5f] w-full"
                    placeholder="Filtrar pensums..."
                    type="search"
                    value={filtroPensums}
                    onChange={(e) => setFiltroPensums(e.target.value)}
                  />
                  <SimpleTable
                    sortable={true}
                    emptyText="No hay pensums registrados."
                    headers={['ID', 'Programa', 'Facultad', 'Estado']}
                    rows={filteredPensums.map((pensum) => [
                      pensum.id_pensum,
                      pensum.programa,
                      pensum.facultad,
                      pensum.estado,
                    ])}
                  />
                </div>
              </div>
            </Section>

            <Section ref={gruposSectionRef} icon={<Users size={20} />} title="Grupos">
              <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <form className="grid content-start gap-3" onSubmit={handleCreateGrupo}>
                  <TextInput
                    label="Numero de grupo"
                    type="number"
                    min="1"
                    value={grupoForm.numGrupo}
                    onChange={(value) => setGrupoForm((current) => ({ ...current, numGrupo: value }))}
                  />
                  <TextInput
                    label="Cupo maximo"
                    type="number"
                    min="1"
                    value={grupoForm.cupoMaximo}
                    onChange={(value) => setGrupoForm((current) => ({ ...current, cupoMaximo: value }))}
                  />
                  <SearchableSelect
                    label="Asignatura"
                    value={grupoForm.idAsignatura}
                    onChange={(value) => setGrupoForm((current) => ({ ...current, idAsignatura: value }))}
                    options={asignaturas.map((asignatura) => ({
                      label: asignatura.nombre,
                      value: String(asignatura.id_asignatura),
                    }))}
                  />
                  <SubmitButton disabled={isSubmitting}>Crear grupo</SubmitButton>
                </form>

                <div className="grid gap-4 content-start">
                  <input
                    className="h-10 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1e3a5f] w-full"
                    placeholder="Filtrar grupos..."
                    type="search"
                    value={filtroGrupos}
                    onChange={(e) => setFiltroGrupos(e.target.value)}
                  />
                  <SimpleTable
                    sortable={true}
                    emptyText="No hay grupos registrados."
                    headers={['ID', 'Grupo', 'Asignatura', 'Créditos', 'Cupo']}
                    rows={filteredGrupos.map((grupo) => [
                      grupo.id_grupo,
                      grupo.num_grupo,
                      grupo.asignatura,
                      grupo.creditos,
                      grupo.cupo_maximo,
                    ])}
                  />
                </div>
              </div>
            </Section>

            <Section ref={horariosSectionRef} icon={<Clock size={20} />} title="Horarios y Aulas">
              <div className="grid gap-6">
                <form className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4" onSubmit={handleCreateHorario}>
                  <div className="grid gap-3 lg:grid-cols-4">
                    <SearchableSelect
                      label="Grupo"
                      value={horarioForm.idGrupo}
                      onChange={(value) => setHorarioForm((current) => ({ ...current, idGrupo: value }))}
                      options={grupos.map((grupo) => ({
                        label: `${grupo.asignatura} - Grupo ${grupo.num_grupo}`,
                        value: String(grupo.id_grupo),
                      }))}
                    />
                    <SelectInput
                      label="Dia"
                      value={selectedHorarioDay}
                      onChange={handleSelectHorarioDay}
                      options={weekDays.map((day) => ({
                        label: day.label,
                        value: String(day.dayNumber),
                      }))}
                    />
                    <SelectInput
                      label="Hora inicio"
                      value={horarioForm.horaInicio}
                      onChange={(value) =>
                        setHorarioForm((current) => {
                          const nextEnd = current.horaFin && current.horaFin > value ? current.horaFin : ''
                          return { ...current, horaInicio: value, horaFin: nextEnd }
                        })
                      }
                      options={startHourOptions.map((hour) => ({
                        label: formatDisplayHour(hour),
                        value: formatHourValue(hour),
                      }))}
                    />
                    <SelectInput
                      label="Hora fin"
                      value={horarioForm.horaFin}
                      onChange={(value) => setHorarioForm((current) => ({ ...current, horaFin: value }))}
                      options={endHourOptions
                        .filter((hour) => !horarioForm.horaInicio || formatHourValue(hour) > horarioForm.horaInicio)
                        .map((hour) => ({
                          label: formatDisplayHour(hour),
                          value: formatHourValue(hour),
                        }))}
                    />
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
                    <SelectInput
                      label="Piso"
                      value={horarioForm.piso}
                      onChange={(value) => setHorarioForm((current) => ({ ...current, piso: value }))}
                      options={[
                        { label: '1', value: '1' },
                        { label: '2', value: '2' },
                        { label: '3', value: '3' },
                        { label: '4', value: '4' },
                        { label: '5', value: '5' },
                      ]}
                    />
                    <SelectInput
                      label="Bloque"
                      value={horarioForm.bloque}
                      onChange={(value) => setHorarioForm((current) => ({ ...current, bloque: value }))}
                      options={[
                        { label: 'A', value: 'A' },
                        { label: 'B', value: 'B' },
                        { label: 'C', value: 'C' },
                        { label: 'D', value: 'D' },
                        { label: 'E', value: 'E' },
                        { label: 'F', value: 'F' },
                        { label: 'G', value: 'G' },
                      ]}
                    />
                    <TextInput
                      label="Aula"
                      value={horarioForm.aula}
                      onChange={(value) => setHorarioForm((current) => ({ ...current, aula: value }))}
                    />
                    <div className="flex items-end">
                      <SubmitButton disabled={isSubmitting}>Registrar horario</SubmitButton>
                    </div>
                  </div>
                </form>

                <div className="grid gap-4 content-start">
                  <input
                    className="h-10 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-[#1e3a5f] w-full"
                    placeholder="Filtrar horarios..."
                    type="search"
                    value={filtroHorarios}
                    onChange={(e) => setFiltroHorarios(e.target.value)}
                  />
                  <SimpleTable
                    sortable={true}
                    emptyText="No hay horarios registrados."
                    headers={['ID', 'Asignatura', 'Grupo', 'Dia', 'Hora', 'Aula']}
                    rows={filteredHorarios.map((horario) => [
                      horario.id_horario,
                      horario.asignatura,
                      horario.num_grupo,
                      horario.dia,
                      `${formatTime(horario.hora_inicio)} - ${formatTime(horario.hora_fin)}`,
                      formatAula(horario),
                    ])}
                  />
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {isProgramaModalOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Nuevo Programa</h2>
                <p className="mt-1 text-sm text-slate-600">Registre un programa académico.</p>
              </div>
              <button
                className="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setIsProgramaModalOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <form className="grid gap-3" onSubmit={handleCreatePrograma}>
              <TextInput
                label="Nombre"
                value={programaForm.nombre}
                onChange={(value) => setProgramaForm((current) => ({ ...current, nombre: value }))}
              />
              <SelectInput
                label="Tipo de programa"
                value={programaForm.tipoPrograma}
                onChange={(value) => setProgramaForm((current) => ({ ...current, tipoPrograma: value }))}
                options={[
                  { label: 'Carreras', value: 'Carreras' },
                  { label: 'Especializaciones', value: 'Especializaciones' },
                  { label: 'Maestrías', value: 'Maestrías' },
                  { label: 'Diplomados', value: 'Diplomados' },
                ]}
              />
              <TextInput
                label="Facultad"
                value={programaForm.facultad}
                onChange={(value) => setProgramaForm((current) => ({ ...current, facultad: value }))}
              />
              <SubmitButton disabled={isSubmitting}>Crear programa</SubmitButton>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  )
}

interface SidebarItemProps {
  active?: boolean
  icon: ReactNode
  label: string
}

function SidebarItem({ active = false, icon, label }: SidebarItemProps) {
  return (
    <div
      className={[
        'flex h-12 items-center gap-4 rounded px-4 tracking-wide',
        active ? 'border-l-4 border-[#0b4778] bg-blue-100 text-[#0f2a44]' : 'text-slate-500',
      ].join(' ')}
    >
      {icon}
      <span>{label}</span>
    </div>
  )
}

interface SectionProps {
  title: string
  icon: ReactNode
  children: ReactNode
}

const Section = ({ title, icon, children, ref }: SectionProps & { ref?: React.Ref<HTMLElement> }) => {
  return (
    <section className="scroll-mt-24 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" ref={ref}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-50 text-[#2563eb]">{icon}</div>
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

interface StatRowProps {
  label: string
  value: number
}

function StatRow({ label, value }: StatRowProps) {
  return (
    <div className="flex items-center justify-between border-t border-blue-300/10 pt-2">
      <span className="font-semibold text-blue-100">{label}</span>
      <span className="text-lg font-bold text-white">{value}</span>
    </div>
  )
}

interface ActionButtonProps {
  icon: ReactNode
  label: string
  onClick: () => void
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      className="flex min-h-24 flex-col items-center justify-center gap-3 rounded border border-slate-300 bg-white px-3 py-4 text-center text-sm font-medium text-slate-800 transition hover:border-[#2563eb] hover:bg-blue-50 hover:text-[#1e3a5f]"
      onClick={onClick}
      type="button"
    >
      <span className="text-slate-500">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  min?: string
}

function TextInput({ label, value, onChange, type = 'text', min }: TextInputProps) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700">
      {label}
      <input
        className="h-10 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-blue-100"
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

interface SelectInputProps {
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (value: string) => void
}

function SelectInput({ label, value, options, onChange }: SelectInputProps) {
  return (
    <label className="grid gap-1 text-sm font-semibold text-slate-700 select-none">
      {label}
      <select
        className="h-10 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Seleccione...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

interface SubmitButtonProps {
  children: ReactNode
  disabled: boolean
}

function SubmitButton({ children, disabled }: SubmitButtonProps) {
  return (
    <button
      className="h-10 rounded bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f] disabled:cursor-not-allowed disabled:bg-slate-400"
      disabled={disabled}
      type="submit"
    >
      {disabled ? 'Guardando...' : children}
    </button>
  )
}

interface SimpleTableProps {
  headers: string[]
  rows: Array<Array<string | number | null>>
  emptyText: string
  sortable?: boolean
}

interface SortableHeaderProps {
  label: string
  columnIndex: number
  sortConfig: SortConfig | null
  onSort: (key: number) => void
  className?: string
}

function SortableHeader({ label, columnIndex, sortConfig, onSort, className = 'px-3 py-3' }: SortableHeaderProps) {
  const isActive = sortConfig?.key === columnIndex
  const Icon = !isActive ? ArrowUpDown : sortConfig.direction === 'ascending' ? ArrowUp : ArrowDown
  const orderLabel = isActive && sortConfig.direction === 'ascending' ? 'mayor a menor' : 'menor a mayor'

  return (
    <th
      className={`${className} cursor-pointer select-none font-bold transition hover:bg-slate-100`}
      onClick={() => onSort(columnIndex)}
      title={`Ordenar ${label} de ${orderLabel}`}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <Icon className={isActive ? 'text-[#1e3a5f]' : 'text-slate-300'} size={14} />
      </div>
    </th>
  )
}

function SimpleTable({ headers, rows, emptyText, sortable = false }: SimpleTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null)

  const sortedRows = useMemo(() => {
    if (!sortable || sortConfig === null) return rows
    
    return [...rows].sort((a, b) => {
      return compareTableValues(a[sortConfig.key], b[sortConfig.key], sortConfig.direction)
    })
  }, [rows, sortConfig, sortable])

  const requestSort = (key: number) => {
    if (!sortable) return
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === 'ascending' ? 'descending' : 'ascending',
    }))
  }

  return (
    <div className="overflow-x-auto">
      {rows.length === 0 ? (
        <p className="rounded border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600">{emptyText}</p>
      ) : (
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              {headers.map((header, index) => (
                sortable ? (
                  <SortableHeader
                    className="px-3 py-3 text-xs uppercase text-slate-600"
                    columnIndex={index}
                    key={header}
                    label={header}
                    onSort={requestSort}
                    sortConfig={sortConfig}
                  />
                ) : (
                  <th className="px-3 py-3 text-xs font-bold uppercase text-slate-600" key={header}>
                    {header}
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => (
              <tr className="border-b border-slate-100 last:border-b-0" key={`${rowIndex}-${row.join('-')}`}>
                {row.map((cell, cellIndex) => (
                  <td className="px-3 py-3 text-slate-700" key={`${cellIndex}-${String(cell)}`}>
                    {cell ?? 'Sin dato'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

interface SearchableSelectProps {
  label: string
  value: string
  options: Array<{ label: string; value: string }>
  onChange: (value: string) => void
}

function SearchableSelect({ label, value, options, onChange }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find((opt) => opt.value === value)
  const displayValue = isOpen ? search : (selectedOption ? selectedOption.label : '')

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="grid gap-1 text-sm font-semibold text-slate-700 select-none relative" ref={wrapperRef}>
      <label>{label}</label>
      <input
        className="h-10 rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-blue-100 cursor-pointer"
        style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.7rem top 50%', backgroundSize: '0.65rem auto' }}
        type="text"
        placeholder="Seleccione o busque..."
        value={displayValue}
        onChange={(e) => {
          setSearch(e.target.value)
          if (!isOpen) setIsOpen(true)
        }}
        onClick={() => {
          setSearch('')
          setIsOpen(true)
        }}
      />
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 z-50 max-h-60 overflow-y-auto rounded border border-slate-200 bg-white shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-500">No hay coincidencias</div>
          ) : (
            filteredOptions.map((opt) => (
              <div
                key={opt.value}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-[#1e3a5f] cursor-pointer"
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
