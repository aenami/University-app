import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '../../pages/LoginPage'
import { tokenManager } from '../../utils/tokenManager'

export const Route = createFileRoute('/login/')({
  beforeLoad: () => {
    // Si el usuario ya está autenticado y tiene sesión válida, lo enviamos a SeleccionAsignaturas directamente
    if (tokenManager.isAuthenticated()) {
      throw redirect({ to: '/SeleccionAsignaturas' })
    }
  },
  component: LoginPage,
})
