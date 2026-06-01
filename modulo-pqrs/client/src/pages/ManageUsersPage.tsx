import { startTransition, useDeferredValue, useEffect, useEffectEvent, useState } from 'react'
import { Plus } from 'lucide-react'
import { ManagementSidebar } from '../components/manage-users/ManagementSidebar'
import { ManagementTopbar } from '../components/manage-users/ManagementTopbar'
import { UsersTable } from '../components/manage-users/UsersTable'
import { UsersToolbar } from '../components/manage-users/UsersToolbar'
import { CreateUserModal } from '../components/manage-users/CreateUserModal'
import { userManagementApi } from '../services/userManagementApi'
import { tokenManager } from '../utils/tokenManager'
import type {
  CreateManagedUserPayload,
  ManagedUser,
  ManagedUserRoleFilter,
} from '../types/userManagement'

const PAGE_SIZE = 5

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrio un error inesperado. Intenta nuevamente.'
}

export function ManageUsersPage() {
  const sessionUser = tokenManager.getUser()
  const [searchValue, setSearchValue] = useState('')
  const [selectedRole, setSelectedRole] = useState<ManagedUserRoleFilter>('TODOS')
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null)
  const deferredSearchValue = useDeferredValue(searchValue)

  const loadUsers = useEffectEvent(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const roleFilter = selectedRole === 'TODOS' ? undefined : selectedRole
      const usersResponse = await userManagementApi.getManagedUsers(deferredSearchValue, roleFilter)

      // Agrupamos los cambios de render para que el refresco de la tabla se sienta mas estable.
      startTransition(() => {
        setUsers(usersResponse)
        setCurrentPage(1)
      })
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  })

  useEffect(() => {
    void loadUsers()
  }, [deferredSearchValue, selectedRole])

  const handleCreateUser = async (payload: CreateManagedUserPayload) => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await userManagementApi.createManagedUser(payload)
      setSuccessMessage('Usuario creado correctamente.')
      setIsModalOpen(false)
      await loadUsers()
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async (user: ManagedUser) => {
    setUpdatingUserId(user.id)
    setErrorMessage(null)

    try {
      const nextStatus = user.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
      const updatedUser = await userManagementApi.updateManagedUserStatus(user.id, nextStatus)

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      )

      setSuccessMessage(`Estado actualizado para ${updatedUser.names} ${updatedUser.lastNames}.`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setUpdatingUserId(null)
    }
  }

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const currentUsers = users.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const handleExport = () => {
    // Exportamos la lista filtrada actual para conservar el contexto visible en pantalla.
    const headers = ['Nombre', 'Apellido', 'Correo', 'Rol', 'Estado', 'Documento']
    const rows = users.map((user) =>
      [
        user.names,
        user.lastNames,
        user.email,
        user.role,
        user.status,
        user.document,
      ].join(','),
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'usuarios-gestion.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)]">
        <ManagementSidebar />

        <main className="border-l border-slate-200 bg-[#f7f9fc]">
          <ManagementTopbar
            searchValue={searchValue}
            userName={sessionUser?.nombre ?? 'Administrador'}
            onSearchChange={setSearchValue}
          />

          <div className="px-6 pb-6 pt-5">
            <section className="flex flex-col gap-5 border-b border-slate-200 pb-8 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-[2.6rem] font-extrabold tracking-[-0.04em] text-slate-900">
                  Gestion de Usuarios
                </h1>
                <p className="mt-2 text-[1.02rem] text-slate-600">
                  Administre el acceso y roles del personal academico.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccessMessage(null)
                  setIsModalOpen(true)
                }}
                className="inline-flex h-[46px] items-center justify-center gap-2 self-start rounded-[3px] bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,46,90,0.16)] transition hover:bg-[#0d264a]"
              >
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </button>
            </section>

            <section className="mt-8 overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <UsersToolbar
                selectedRole={selectedRole}
                totalUsers={users.length}
                onExport={handleExport}
                onRoleChange={(role) => {
                  setSelectedRole(role)
                  setCurrentPage(1)
                }}
              />

              {errorMessage ? (
                <div className="mx-5 mt-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}

              {successMessage ? (
                <div className="mx-5 mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <UsersTable
                currentPage={currentPage}
                isLoading={isLoading}
                totalPages={totalPages}
                updatingUserId={updatingUserId}
                users={currentUsers}
                onPageChange={setCurrentPage}
                onToggleStatus={handleToggleStatus}
              />
            </section>
          </div>
        </main>
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  )
}
