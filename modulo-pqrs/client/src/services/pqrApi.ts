import { api } from './Api'
import type {
  CreatePqrPayload,
  CreatePqrResponsePayload,
  PqrTicket,
} from '../types/pqr'

type PqrListResponse = {
  error: boolean
  message?: string
  data: PqrTicket[]
}

type PqrResponse = {
  error: boolean
  message?: string
  data: PqrTicket
}

export const pqrApi = {
  async getTickets() {
    const response = (await api.get('/api/pqr')) as PqrListResponse
    return response.data
  },

  async createTicket(payload: CreatePqrPayload) {
    const response = (await api.post('/api/pqr', payload)) as PqrResponse
    return response.data
  },

  async respondTicket(ticketId: number, payload: CreatePqrResponsePayload) {
    const response = (await api.post(`/api/pqr/${ticketId}/respuestas`, payload)) as PqrResponse
    return response.data
  },

  async closeTicket(ticketId: number) {
    const response = (await api.patch(`/api/pqr/${ticketId}/cerrar`, {})) as PqrResponse
    return response.data
  },
}
