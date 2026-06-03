import { createFileRoute, redirect } from '@tanstack/react-router'
import { SubjectGroupSelectionPage } from '../../pages/SubjectGroupSelectionPage'
import { tokenManager } from '../../utils/tokenManager'

export const Route = createFileRoute('/SeleccionAsignaturas/')({
  beforeLoad: () => {
    // 1. Requerir autenticación
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }
  },
  component: SubjectGroupSelectionPage,
})
