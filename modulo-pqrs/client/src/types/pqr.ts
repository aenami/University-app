export const pqrRequestTypes = ['PETICION', 'QUEJA', 'RECLAMO', 'PREGUNTA', 'SOPORTE'] as const

export type PqrRequestType = (typeof pqrRequestTypes)[number]
export type PqrStatus = 'pendiente' | 'cerrada'
export type PqrUiStatus = 'Abierto' | 'En Proceso' | 'Cerrado'

export interface CreatePqrPayload {
  tipo: PqrRequestType
  asunto: string
  descripcion: string
}

export interface CreatePqrResponsePayload {
  titulo: string
  descripcion: string
}

export interface PqrResponse {
  id: number
  title: string
  description: string
  createdAt: string
  adminId: number
}

export interface PqrTicket {
  id: number
  code: string
  type: PqrRequestType
  subject: string
  description: string
  status: PqrStatus
  createdAt: string
  requester: {
    id: number
    names: string
    lastNames: string
    email: string
  }
  responses: PqrResponse[]
}

export const pqrTypeLabels: Record<PqrRequestType, string> = {
  PETICION: 'Peticion',
  QUEJA: 'Queja',
  RECLAMO: 'Reclamo',
  PREGUNTA: 'Pregunta',
  SOPORTE: 'Soporte Tecnico',
}

export const getPqrUiStatus = (ticket: PqrTicket): PqrUiStatus => {
  if (ticket.status === 'cerrada') {
    return 'Cerrado'
  }

  return ticket.responses.length > 0 ? 'En Proceso' : 'Abierto'
}
