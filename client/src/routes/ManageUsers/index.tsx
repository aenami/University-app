import { createFileRoute, redirect } from '@tanstack/react-router'
import { ManageUsersPage } from '../../pages/ManageUsersPage'
import { tokenManager } from '../../utils/tokenManager'

export const Route = createFileRoute('/ManageUsers/')({
  beforeLoad: () => {
    // 1. Requerir autenticación
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }

    // 2. Requerir rol adecuado
    const role = tokenManager.getUserRole()
    if (role !== 'ADMINISTRADOR' && role !== 'COORDINADOR') {
      throw redirect({ to: '/SeleccionAsignaturas' })
    }
  },
  component: ManageUsersPage,
})
