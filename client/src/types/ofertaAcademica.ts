export interface Programa {
  id_programa: number
  nombre: string
  tipo_programa: string
  facultad: string
}

export interface Asignatura {
  id_asignatura: number
  nombre: string
  creditos: number
}

export interface Pensum {
  id_pensum: number
  id_programa: number
  estado: string
  programa: string
  facultad: string
}

export interface Grupo {
  id_grupo: number
  num_grupo: number
  cupo_maximo: number
  id_asignatura: number
  asignatura: string
  creditos: number
}

export interface HorarioAula {
  id_horario: number
  dia: string
  hora_inicio: string
  hora_fin: string
  id_aula: number
  piso: number
  bloque: string
  aula: string | null
  id_grupo: number
  num_grupo: number
  asignatura: string
}

export interface Prerrequisito {
  id_prerrequisito: number
  id_asignatura: number
  asignatura: string
  id_asignatura_requisito: number
  prerrequisito: string
  creditos_prerrequisito: number
}

export interface PrerrequisitosConsulta {
  asignatura: string
  prerrequisitos: string[]
  detalle: Prerrequisito[]
}

export interface CrearProgramaPayload {
  nombre: string
  tipoPrograma: string
  facultad: string
}

export interface CrearAsignaturaPayload {
  nombre: string
  creditos: number
}

export interface CrearPrerrequisitoPayload {
  idAsignaturaRequisito: number
}

export interface CrearPensumPayload {
  idPrograma: number
  estado?: string
}

export interface AsociarAsignaturaPensumPayload {
  idAsignatura: number
}

export interface CrearGrupoPayload {
  numGrupo: number
  cupoMaximo: number
  idAsignatura: number
}

export interface CrearHorarioAulaPayload {
  dia: string
  horaInicio: string
  horaFin: string
  piso: number
  bloque: string
  aula?: string
}
