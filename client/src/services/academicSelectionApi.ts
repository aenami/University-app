import { api } from './Api'
import type { Subject, SubjectGroup } from '../types/academicSelection'

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

export const academicSelectionApi = {
  async getSubjects() {
    const response = (await api.get('/api/oferta-academica/asignaturas')) as SubjectsResponse
    return response.data
  },

  async getGroups() {
    const response = (await api.get('/api/oferta-academica/grupos')) as GroupsResponse
    return response.data
  },
}
