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
