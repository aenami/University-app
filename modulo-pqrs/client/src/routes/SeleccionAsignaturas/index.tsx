import { createFileRoute } from '@tanstack/react-router'
import { SubjectGroupSelectionPage } from '../../pages/SubjectGroupSelectionPage'

export const Route = createFileRoute('/SeleccionAsignaturas/')({
  component: SubjectGroupSelectionPage,
})
