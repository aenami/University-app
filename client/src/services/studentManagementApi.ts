import { api } from './Api'
import type {
  CreateManagedUserPayload,
  ManagedUser,
  ManagedUserStatus,
} from '../types/userManagement'

type StudentsResponse = {
  error: boolean
  message?: string
  data: ManagedUser[]
}

type StudentResponse = {
  error: boolean
  message?: string
  data: ManagedUser
}

const buildStudentsQuery = (search?: string) => {
  const params = new URLSearchParams()

  if (search?.trim()) {
    params.set('search', search.trim())
  }

  const queryString = params.toString()
  return queryString ? `/api/users/students?${queryString}` : '/api/users/students'
}

export const studentManagementApi = {
  async getStudents(search?: string) {
    const response = (await api.get(buildStudentsQuery(search))) as StudentsResponse
    return response.data
  },

  async createStudent(payload: Omit<CreateManagedUserPayload, 'userRole'>) {
    const response = (await api.post('/api/users/students', payload)) as StudentResponse
    return response.data
  },

  async updateStudentStatus(userId: number, status: ManagedUserStatus) {
    const response = (await api.patch(`/api/users/students/${userId}/status`, { status })) as StudentResponse
    return response.data
  },
}
