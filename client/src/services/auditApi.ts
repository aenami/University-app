import { api } from './Api'

// Interfaz para mapear los registros de log de auditoría en el frontend
export interface AuditLogItem {
  id_log: number
  accion_usuario: string
  fecha_hora: string
  id_usuario: number
  nombres_usuario: string
  apellidos_usuario: string
  email_usuario: string
  rol_usuario: string
}

// Tipo para la respuesta de la API de logs
type AuditListResponse = {
  error: boolean
  message?: string
  data: AuditLogItem[]
}

export const auditApi = {
  /**
   * Obtiene todos los registros de auditoría del backend.
   * Requiere rol de administrador.
   */
  async getLogs() {
    const response = (await api.get('/api/logs')) as AuditListResponse
    return response.data
  },
}
