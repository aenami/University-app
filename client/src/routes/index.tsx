import { createFileRoute, redirect } from '@tanstack/react-router'
import { tokenManager } from '../utils/tokenManager'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Si no está autenticado, lo enviamos al login
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
    // Si está autenticado, redirigimos a la Selección de Asignaturas por el momento
    throw redirect({ to: '/SeleccionAsignaturas' })
  },
})

