import { createFileRoute, redirect } from '@tanstack/react-router'
import { SeguimientoPage } from '../../pages/SeguimientoPage'
import { tokenManager } from '../../utils/tokenManager'

export const Route = createFileRoute('/Seguimiento/')({
  beforeLoad: () => {
    // 1. Requerir autenticación
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }

    // 2. Requerir rol ADMINISTRADOR
    const role = tokenManager.getUserRole()
    if (role !== 'ADMINISTRADOR') {
      throw redirect({ to: '/SeleccionAsignaturas' })
    }
  },
  component: SeguimientoPage,
})
