import { createFileRoute } from '@tanstack/react-router'
import { AcademicTrackingPage } from '../pages/AcademicTrackingPage'

export const Route = createFileRoute('/Seguimiento')({
  component: AcademicTrackingPage,
})
