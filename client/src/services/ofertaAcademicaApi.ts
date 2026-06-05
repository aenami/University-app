import { api } from './Api'
import type {
  Asignatura,
  AsociarAsignaturaPensumPayload,
  CrearAsignaturaPayload,
  CrearGrupoPayload,
  CrearHorarioAulaPayload,
  CrearPensumPayload,
  CrearProgramaPayload,
  CrearPrerrequisitoPayload,
  Grupo,
  HorarioAula,
  Pensum,
  Prerrequisito,
  PrerrequisitosConsulta,
  Programa,
} from '../types/ofertaAcademica'

type ApiListResponse<T> = {
  error: boolean
  message?: string
  data: T[]
}

type ApiItemResponse<T> = {
  error: boolean
  message?: string
  data: T
}

const BASE_PATH = '/api/oferta-academica'

export const ofertaAcademicaApi = {
  async getProgramas() {
    const response = (await api.get(`${BASE_PATH}/programas`)) as ApiListResponse<Programa>
    return response.data
  },

  async crearPrograma(payload: CrearProgramaPayload) {
    return api.post(`${BASE_PATH}/programas`, payload) as Promise<ApiItemResponse<{ idPrograma: number }>>
  },

  async getAsignaturas() {
    const response = (await api.get(`${BASE_PATH}/asignaturas`)) as ApiListResponse<Asignatura>
    return response.data
  },

  async crearAsignatura(payload: CrearAsignaturaPayload) {
    return api.post(
      `${BASE_PATH}/asignaturas`,
      payload,
    ) as Promise<ApiItemResponse<{ idAsignatura: number }>>
  },

  async crearPrerrequisito(idAsignatura: number, payload: CrearPrerrequisitoPayload) {
    return api.post(
      `${BASE_PATH}/asignaturas/${idAsignatura}/prerrequisitos`,
      payload,
    ) as Promise<ApiItemResponse<{ idPrerrequisito: number }>>
  },

  async getPrerrequisitos(idAsignatura: number) {
    const response = (await api.get(
      `${BASE_PATH}/asignaturas/${idAsignatura}/prerrequisitos`,
    )) as ApiItemResponse<PrerrequisitosConsulta>
    return response.data
  },

  async crearPensum(payload: CrearPensumPayload) {
    return api.post(`${BASE_PATH}/pensums`, payload) as Promise<ApiItemResponse<{ idPensum: number }>>
  },

  async getPensums() {
    const response = (await api.get(`${BASE_PATH}/pensums`)) as ApiListResponse<Pensum>
    return response.data
  },

  async asociarAsignaturaPensum(idPensum: number, payload: AsociarAsignaturaPensumPayload) {
    return api.post(`${BASE_PATH}/pensums/${idPensum}/asignaturas`, payload)
  },

  async getGrupos() {
    const response = (await api.get(`${BASE_PATH}/grupos`)) as ApiListResponse<Grupo>
    return response.data
  },

  async crearGrupo(payload: CrearGrupoPayload) {
    return api.post(`${BASE_PATH}/grupos`, payload) as Promise<ApiItemResponse<{ idGrupo: number }>>
  },

  async getHorarios() {
    const response = (await api.get(`${BASE_PATH}/horarios`)) as ApiListResponse<HorarioAula>
    return response.data
  },

  async getHorariosPorGrupo(idGrupo: number) {
    const response = (await api.get(`${BASE_PATH}/grupos/${idGrupo}/horarios`)) as ApiListResponse<HorarioAula>
    return response.data
  },

  async crearHorarioAula(idGrupo: number, payload: CrearHorarioAulaPayload) {
    return api.post(
      `${BASE_PATH}/grupos/${idGrupo}/horarios`,
      payload,
    ) as Promise<ApiItemResponse<{ idHorario: number }>>
  },
}
