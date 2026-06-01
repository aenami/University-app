import { api } from './Api'
import type {
  CreateManagedUserPayload,
  ManagedUser,
  ManagedUserRole,
  ManagedUserStatus,
} from '../types/userManagement'

type UsersResponse = {
  error: boolean
  message?: string
  data: ManagedUser[]
}

type UserResponse = {
  error: boolean
  message?: string
  data: ManagedUser
}

const buildUsersQuery = (search?: string, role?: ManagedUserRole) => {
  // Armamos la URL de filtros solo con los parametros realmente usados.
  const params = new URLSearchParams()

  if (search?.trim()) {
    params.set('search', search.trim())
  }

  if (role) {
    params.set('role', role)
  }

  const queryString = params.toString()
  return queryString ? `/api/users/staff?${queryString}` : '/api/users/staff'
}

export const userManagementApi = {
  async getManagedUsers(search?: string, role?: ManagedUserRole) {
    const response = (await api.get(buildUsersQuery(search, role))) as UsersResponse
    return response.data
  },

  async createManagedUser(payload: CreateManagedUserPayload) {
    const response = (await api.post('/api/users/staff', payload)) as UserResponse
    return response.data
  },

  async updateManagedUserStatus(userId: number, status: ManagedUserStatus) {
    const response = (await api.patch(`/api/users/staff/${userId}/status`, { status })) as UserResponse
    return response.data
  },
}
