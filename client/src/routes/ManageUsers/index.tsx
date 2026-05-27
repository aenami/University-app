import { createFileRoute } from '@tanstack/react-router'
import { ManageUsersPage } from '../../pages/ManageUsersPage'

export const Route = createFileRoute('/ManageUsers/')({
  component: ManageUsersPage,
})
