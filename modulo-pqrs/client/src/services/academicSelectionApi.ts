import { api } from './Api'
import type { EnrollmentStatus, Subject, SubjectGroup } from '../types/academicSelection'

type SubjectsResponse = {
  error: boolean
  message?: string
  data: Subject[]
}

type GroupsResponse = {
  error: boolean
  message?: string
  data: SubjectGroup[]
}

type EnrollmentStatusResponse = {
  ok: boolean
  mensaje?: string
  data: EnrollmentStatus
}

export const academicSelectionApi = {
  async getSubjects() {
    const response = (await api.get('/api/oferta-academica/asignaturas')) as SubjectsResponse
    return response.data
  },

  async getGroups() {
    const response = (await api.get('/api/oferta-academica/grupos')) as GroupsResponse
    return response.data
  },

  async getEnrollmentStatus() {
    const response = (await api.get('/api/matriculas/mi-estado')) as EnrollmentStatusResponse
    return response.data
  },
}
