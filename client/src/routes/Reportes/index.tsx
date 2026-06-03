import { createFileRoute, redirect } from '@tanstack/react-router'
import ReportesPage from '../../pages/ReportesPage'
import { tokenManager } from '../../utils/tokenManager'

export const Route = createFileRoute('/Reportes/')({
  beforeLoad: () => {
    if (!tokenManager.isAuthenticated()) {
      throw redirect({ to: '/login' })
    }

    const role = tokenManager.getUserRole()
    if (role !== 'ADMINISTRADOR' && role !== 'COORDINADOR' && role !== 'DOCENTE') {
      throw redirect({ to: '/SeleccionAsignaturas' })
    }
  },
  component: ReportesPage,
})
