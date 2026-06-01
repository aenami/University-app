import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import type { ManagedUser, ManagedUserRole, ManagedUserStatus } from '../../types/userManagement'
import { roleLabels, statusLabels } from '../../types/userManagement'

type UsersTableProps = {
  currentPage: number
  isLoading: boolean
  totalPages: number
  updatingUserId: number | null
  users: ManagedUser[]
  onPageChange: (page: number) => void
  onToggleStatus: (user: ManagedUser) => void
}

const rolePillClasses: Record<ManagedUserRole, string> = {
  ADMINISTRADOR: 'bg-[rgba(15,46,90,0.12)] text-[var(--brand-navy)]',
  COORDINADOR: 'bg-[rgba(11,122,143,0.14)] text-[var(--brand-cyan)]',
  DOCENTE: 'bg-[rgba(194,120,3,0.14)] text-[var(--brand-gold)]',
}

const statusCopy: Record<ManagedUserStatus, { label: string; srLabel: string }> = {
  ACTIVO: {
    label: 'Activo',
    srLabel: 'Cambiar a inactivo',
  },
  INACTIVO: {
    label: 'Inactivo',
    srLabel: 'Cambiar a activo',
  },
}

const getInitials = (user: ManagedUser) => {
  return `${user.names.slice(0, 1)}${user.lastNames.slice(0, 1)}`.toUpperCase()
}

export function UsersTable({
  currentPage,
  isLoading,
  totalPages,
  updatingUserId,
  users,
  onPageChange,
  onToggleStatus,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-18 animate-pulse rounded-md border border-slate-200 bg-slate-100/80"
          />
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-3xl font-bold text-slate-900">No hay usuarios para mostrar</p>
        <p className="mt-3 text-sm text-slate-500">
          Ajusta la busqueda o crea el primer usuario del equipo academico.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-[#f4f6f9] text-left text-[12px] font-bold text-slate-500 uppercase">
            <th className="px-4 py-4">Nombre y correo</th>
            <th className="px-4 py-4">Rol</th>
            <th className="px-4 py-4">Estado</th>
            <th className="px-4 py-4 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const roleClassName = rolePillClasses[user.role]
            const isUpdating = updatingUserId === user.id

            return (
              <tr key={user.id} className="border-b border-slate-200">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#e8eff9] text-[1.05rem] font-bold text-[#5b6d86]">
                      {getInitials(user)}
                    </div>

                    <div>
                      <p className="text-[1.02rem] font-semibold text-slate-900">
                        {user.names} {user.lastNames}
                      </p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${roleClassName}`}
                  >
                    {roleLabels[user.role]}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isUpdating}
                      aria-label={statusCopy[user.status].srLabel}
                      onClick={() => onToggleStatus(user)}
                      className={[
                        'relative inline-flex h-8 w-14 items-center rounded-full transition',
                        user.status === 'ACTIVO' ? 'bg-[var(--brand-navy)]' : 'bg-slate-300',
                        isUpdating ? 'cursor-wait opacity-70' : 'cursor-pointer',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'inline-block h-6 w-6 rounded-full bg-white shadow-md transition',
                          user.status === 'ACTIVO' ? 'translate-x-7' : 'translate-x-1',
                        ].join(' ')}
                      />
                    </button>

                    <span className="text-sm font-semibold text-slate-700">
                      {statusLabels[user.status]}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-4 text-slate-400">
                    <button
                      type="button"
                      className="transition hover:text-slate-700"
                      aria-label={`Editar usuario ${user.names}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="transition hover:text-rose-600"
                      aria-label={`Eliminar usuario ${user.names}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Pagina {currentPage} de {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-slate-200 bg-white text-slate-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, index) => {
            const page = index + 1

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-[4px] border text-sm font-semibold transition',
                  currentPage === page
                    ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                ].join(' ')}
              >
                {page}
              </button>
            )
          })}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-[4px] border border-slate-200 bg-white text-slate-500"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
