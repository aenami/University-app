export type Subject = {
  id_asignatura: number
  nombre: string
  creditos: number
}

export type SubjectGroup = {
  id_grupo: number
  num_grupo: number
  cupo_maximo: number
  id_asignatura: number
  asignatura: string
  creditos: number
}

export type EnrollmentStatusDetail = {
  id_detalle: number
  id_grupo: number
  num_grupo: number
  id_asignatura: number
  asignatura: string
  creditos: number
}

export type EnrollmentStatus = {
  estado: 'MATRICULADO' | 'SIN_MATRICULA'
  id_estudiante: number
  id_matricula?: number
  fecha_matricula?: string
  total_creditos?: number
  precio_total?: number
  id_programa?: number
  programa?: string
  detalles: EnrollmentStatusDetail[]
}
