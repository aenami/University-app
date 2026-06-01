import { useEffect, useState, useMemo } from 'react'
import {
  Activity,
  Calendar,
  ClipboardList,
  Filter,
  GraduationCap,
  ShieldAlert,
  UserCheck,
  UserCog,
  RefreshCw,
} from 'lucide-react'
import { ManagementSidebar } from '../components/manage-users/ManagementSidebar'
import { ManagementTopbar } from '../components/manage-users/ManagementTopbar'
import { auditApi, type AuditLogItem } from '../services/auditApi'
import { tokenManager } from '../utils/tokenManager'

/**
 * Componente SeguimientoPage
 * 
 * Interfaz interactiva para el seguimiento de la auditoría en el sistema de gestión.
 * Solo accesible por administradores. Muestra un log completo de acciones clave realizadas
 * por los usuarios en el sistema.
 */
export function SeguimientoPage() {
  const sessionUser = tokenManager.getUser()
  const [logs, setLogs] = useState<AuditLogItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  // Estados para los filtros
  const [searchValue, setSearchValue] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('TODOS')
  const [selectedActionType, setSelectedActionType] = useState<string>('TODOS')

  // Carga de logs desde el backend
  const loadLogs = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    try {
      const data = await auditApi.getLogs()
      setLogs(data)
    } catch (error) {
      console.error('Error al cargar logs:', error)
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible cargar los logs de auditoría')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadLogs()
  }, [])

  // Filtrado de logs en memoria
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Filtro por búsqueda libre
      const matchesSearch =
        [
          log.accion_usuario,
          log.nombres_usuario,
          log.apellidos_usuario,
          log.email_usuario,
          String(log.id_log),
        ]
          .join(' ')
          .toLowerCase()
          .includes(searchValue.toLowerCase().trim())

      // 2. Filtro por Rol del Usuario
      const matchesRole =
        selectedRole === 'TODOS' || log.rol_usuario === selectedRole

      // 3. Filtro por Tipo de Acción
      let matchesActionType = true
      if (selectedActionType !== 'TODOS') {
        const action = log.accion_usuario.toLowerCase()
        if (selectedActionType === 'MATRICULAS') {
          matchesActionType = action.includes('matricula')
        } else if (selectedActionType === 'NOTAS') {
          matchesActionType = action.includes('nota')
        } else if (selectedActionType === 'USUARIOS') {
          matchesActionType = action.includes('usuario') || action.includes('estado')
        } else if (selectedActionType === 'OTROS') {
          matchesActionType =
            !action.includes('matricula') &&
            !action.includes('nota') &&
            !action.includes('usuario') &&
            !action.includes('estado')
        }
      }

      return matchesSearch && matchesRole && matchesActionType
    })
  }, [logs, searchValue, selectedRole, selectedActionType])

  // KPIs calculados
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    
    return {
      total: logs.length,
      today: logs.filter((log) => String(log.fecha_hora).startsWith(today)).length,
      matriculas: logs.filter((log) => log.accion_usuario.toLowerCase().includes('matricula')).length,
      notas: logs.filter((log) => log.accion_usuario.toLowerCase().includes('nota')).length,
      usuarios: logs.filter((log) => log.accion_usuario.toLowerCase().includes('usuario')).length,
    }
  }, [logs])

  // Formato para mostrar fecha y hora
  const formatDateTime = (dateStr: string) => {
    const parsedDate = new Date(dateStr)
    if (Number.isNaN(parsedDate.getTime())) {
      return dateStr
    }
    
    // Formato amigable en Español Colombiano
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(parsedDate)
  }

  // Helper para asignar colores a los badges de roles
  const getRoleBadgeClasses = (role: string) => {
    switch (role) {
      case 'ADMINISTRADOR':
        return 'bg-rose-50 border border-rose-200 text-rose-700'
      case 'COORDINADOR':
        return 'bg-amber-50 border border-amber-200 text-amber-700'
      case 'DOCENTE':
        return 'bg-blue-50 border border-blue-200 text-blue-700'
      case 'ESTUDIANTE':
        return 'bg-emerald-50 border border-emerald-200 text-emerald-700'
      default:
        return 'bg-slate-50 border border-slate-200 text-slate-700'
    }
  }

  // Helper para asignar colores e ícono según el tipo de acción
  const getActionStyles = (action: string) => {
    const lowerAction = action.toLowerCase()
    if (lowerAction.includes('matricula')) {
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        bg: 'bg-purple-100/50 text-purple-600',
        icon: GraduationCap,
      }
    } else if (lowerAction.includes('nota')) {
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bg: 'bg-indigo-100/50 text-indigo-600',
        icon: ClipboardList,
      }
    } else if (lowerAction.includes('creacion') || lowerAction.includes('crear')) {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bg: 'bg-emerald-100/50 text-emerald-600',
        icon: UserCheck,
      }
    } else if (lowerAction.includes('estado') || lowerAction.includes('actualizacion')) {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        bg: 'bg-amber-100/50 text-amber-600',
        icon: UserCog,
      }
    } else {
      return {
        badge: 'bg-slate-50 text-slate-700 border-slate-200',
        bg: 'bg-slate-100/50 text-slate-600',
        icon: Activity,
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)]">
        {/* Barra Lateral Navegación */}
        <ManagementSidebar activeItem="Seguimiento" />

        <main className="border-l border-slate-200 bg-[#f7f9fc]">
          {/* Barra Superior con barra de búsqueda integrada */}
          <ManagementTopbar
            searchValue={searchValue}
            userName={sessionUser?.nombre ?? 'Administrador'}
            searchPlaceholder="Buscar en logs por acción, ID o usuario..."
            onSearchChange={setSearchValue}
          />

          <div className="px-6 pb-8 pt-7">
            {/* Cabecera del Panel */}
            <section className="flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[2.35rem] font-extrabold tracking-[-0.03em] text-slate-900">
                  Seguimiento y Auditoría
                </h1>
                <p className="mt-2 max-w-2xl text-[1.02rem] text-slate-600">
                  Panel administrativo de seguridad. Registra las operaciones críticas realizadas en la plataforma de manera secuencial.
                </p>
              </div>

              {/* Botón de Refrescar */}
              <button
                onClick={() => void loadLogs()}
                disabled={isLoading}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </section>

            {/* Mensajes de Error */}
            {errorMessage ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
                {errorMessage}
              </div>
            ) : null}

            {/* KPIs en Tarjetas Premium */}
            <section className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
              <KpiCard
                label="Registros Totales"
                value={stats.total}
                icon={ClipboardList}
                colorClass="text-[#102a52] bg-blue-50"
              />
              <KpiCard
                label="Operaciones de Hoy"
                value={stats.today}
                icon={Calendar}
                colorClass="text-amber-600 bg-amber-50"
              />
              <KpiCard
                label="Calificaciones (Notas)"
                value={stats.notas}
                icon={ShieldAlert}
                colorClass="text-indigo-600 bg-indigo-50"
              />
              <KpiCard
                label="Matrículas Registradas"
                value={stats.matriculas}
                icon={GraduationCap}
                colorClass="text-purple-600 bg-purple-50"
              />
            </section>

            {/* Filtros e Historial */}
            <section className="mt-8 rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_12px_45px_rgba(15,23,42,0.04)]">
              
              {/* Barra de Herramientas de Filtros */}
              <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="h-5 w-5 text-slate-400" />
                  <h2 className="text-xl font-bold text-slate-800">Historial de Operaciones</h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  {/* Filtro por Rol */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Rol:</span>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[var(--brand-navy)] focus:bg-white"
                    >
                      <option value="TODOS">Todos los roles</option>
                      <option value="ADMINISTRADOR">Administradores</option>
                      <option value="COORDINADOR">Coordinadores</option>
                      <option value="DOCENTE">Docentes</option>
                      <option value="ESTUDIANTE">Estudiantes</option>
                    </select>
                  </label>

                  {/* Filtro por Módulo/Acción */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span>Módulo:</span>
                    <select
                      value={selectedActionType}
                      onChange={(e) => setSelectedActionType(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[var(--brand-navy)] focus:bg-white"
                    >
                      <option value="TODOS">Todos los módulos</option>
                      <option value="USUARIOS">Gestión de Usuarios</option>
                      <option value="MATRICULAS">Matrículas</option>
                      <option value="NOTAS">Notas</option>
                      <option value="OTROS">Otros</option>
                    </select>
                  </label>
                </div>
              </div>

              {/* Contenedor de la Tabla */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pt-2">ID Log</th>
                      <th className="pb-3 pt-2">Operación / Acción</th>
                      <th className="pb-3 pt-2">Usuario Ejecutor</th>
                      <th className="pb-3 pt-2">Rol</th>
                      <th className="pb-3 pt-2 text-right">Fecha y Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      <SkeletonRows />
                    ) : filteredLogs.length ? (
                      filteredLogs.map((log) => {
                        const actionStyle = getActionStyles(log.accion_usuario)
                        const IconComponent = actionStyle.icon

                        return (
                          <tr key={log.id_log} className="hover:bg-slate-50/50 transition">
                            {/* ID Log */}
                            <td className="py-4 text-sm font-semibold text-slate-500">
                              #{String(log.id_log).padStart(5, '0')}
                            </td>

                            {/* Acción con Icono */}
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${actionStyle.bg}`}>
                                  <IconComponent className="h-5 w-5" />
                                </div>
                                <span className="text-[0.93rem] font-medium leading-relaxed text-slate-900">
                                  {log.accion_usuario}
                                </span>
                              </div>
                            </td>

                            {/* Usuario Ejecutor */}
                            <td className="py-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {log.nombres_usuario} {log.apellidos_usuario}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">{log.email_usuario}</p>
                              </div>
                            </td>

                            {/* Rol Badge */}
                            <td className="py-4">
                              <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${getRoleBadgeClasses(log.rol_usuario)}`}>
                                {log.rol_usuario}
                              </span>
                            </td>

                            {/* Fecha y Hora */}
                            <td className="py-4 text-right text-sm text-slate-500 font-medium">
                              {formatDateTime(log.fecha_hora)}
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-16 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center">
                            <ClipboardList className="h-12 w-12 text-slate-300" />
                            <p className="mt-3 text-sm font-bold text-slate-800">
                              Sin registros de auditoría
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              No hay logs que coincidan con la búsqueda o criterios seleccionados.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Conteo total filtrados */}
              {!isLoading && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Mostrando {filteredLogs.length} de {logs.length} registros</span>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * Componente KpiCard para métricas rápidas
 */
function KpiCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string
  value: number
  icon: typeof ClipboardList
  colorClass: string
}) {
  return (
    <div className="rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.02)] flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-wider text-slate-400 leading-none">
          {label}
        </p>
        <p className="mt-2 text-2xl font-black text-slate-800 leading-none">
          {value}
        </p>
      </div>
    </div>
  )
}

/**
 * Componente Skeleton de carga
 */
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <tr key={index}>
          <td className="py-4"><div className="h-4 w-12 animate-pulse rounded bg-slate-100" /></td>
          <td className="py-4"><div className="h-5 w-48 animate-pulse rounded bg-slate-100" /></td>
          <td className="py-4">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-40 animate-pulse rounded bg-slate-100 mt-1" />
          </td>
          <td className="py-4"><div className="h-5 w-24 animate-pulse rounded bg-slate-100" /></td>
          <td className="py-4 text-right"><div className="h-4 w-36 animate-pulse rounded bg-slate-100 inline-block" /></td>
        </tr>
      ))}
    </>
  )
}
