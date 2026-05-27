import { Download, Filter } from 'lucide-react'
import type { ManagedUserRoleFilter } from '../../types/userManagement'

type UsersToolbarProps = {
  selectedRole: ManagedUserRoleFilter
  totalUsers: number
  onExport: () => void
  onRoleChange: (role: ManagedUserRoleFilter) => void
}

const roleOptions: Array<{ value: ManagedUserRoleFilter; label: string }> = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'ADMINISTRADOR', label: 'Administradores' },
  { value: 'COORDINADOR', label: 'Coordinadores' },
  { value: 'DOCENTE', label: 'Docentes' },
]

export function UsersToolbar({
  selectedRole,
  totalUsers,
  onExport,
  onRoleChange,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="text-xs font-bold tracking-[0.1em] text-slate-500 uppercase">
        Mostrando {totalUsers} de {totalUsers}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 rounded-[4px] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
          <Filter className="h-4 w-4" />
          <select
            value={selectedRole}
            onChange={(event) => onRoleChange(event.target.value as ManagedUserRoleFilter)}
            className="border-none bg-transparent font-semibold outline-none"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

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
