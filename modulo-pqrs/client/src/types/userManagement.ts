// Roles que gestiona la pantalla de seguridad.
export const managedUserRoles = [
  'ADMINISTRADOR',
  'COORDINADOR',
  'DOCENTE',
] as const

// Estados disponibles para los usuarios administrativos.
export const managedUserStatuses = ['ACTIVO', 'INACTIVO'] as const

// Opciones de genero soportadas por el backend.
export const userGenders = ['MASCULINO', 'FEMENINO'] as const

export type ManagedUserRole = (typeof managedUserRoles)[number]
export type ManagedUserStatus = (typeof managedUserStatuses)[number]
export type UserGender = (typeof userGenders)[number]
export type ManagedUserRoleFilter = ManagedUserRole | 'TODOS'

// Estructura principal con la que renderizamos cada fila de la tabla.
export interface ManagedUser {
  id: number
  names: string
  lastNames: string
  email: string
  document: string
  role: ManagedUserRole
  status: ManagedUserStatus
  gender: UserGender
  birthDate: string
  createdAt: string
}

// Payload que viaja al backend cuando el administrador crea un nuevo usuario.
export interface CreateManagedUserPayload {
  name: string
  lastName: string
  email: string
  password: string
  birthDate: string
  userGender: UserGender
  userRole: ManagedUserRole
  userID: string
}

// Resumen rapido para las tarjetas de la parte superior.
export interface ManagedUsersSummary {
  total: number
  active: number
  inactive: number
  byRole: Record<ManagedUserRole, number>
}

export const roleLabels: Record<ManagedUserRole, string> = {
  ADMINISTRADOR: 'Administrador',
  COORDINADOR: 'Coordinador',
  DOCENTE: 'Docente',
}

export const statusLabels: Record<ManagedUserStatus, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
}

export const genderLabels: Record<UserGender, string> = {
  MASCULINO: 'Masculino',
  FEMENINO: 'Femenino',
}
