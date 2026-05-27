// Roles que puede administrar el modulo de seguridad.
export const managedUserRoles = [
    "ADMINISTRADOR",
    "COORDINADOR",
    "DOCENTE",
] as const;

// Estados visibles dentro de la pantalla de gestion.
export const managedUserStatuses = [
    "ACTIVO",
    "INACTIVO",
] as const;

// Generos soportados actualmente por la base de datos.
export const userGenders = [
    "MASCULINO",
    "FEMENINO",
] as const;

export type ManagedUserRole = typeof managedUserRoles[number];
export type ManagedUserStatus = typeof managedUserStatuses[number];
export type UserGender = typeof userGenders[number];

// Informacion necesaria para crear un usuario administrativo desde el frontend.
export interface CreateManagedUserInput {
    name: string;
    lastName: string;
    email: string;
    password: string;
    birthDate: string;
    userGender: UserGender;
    userRole: ManagedUserRole;
    userID: string;
}

// Forma normalizada que devolvera la API para la pantalla de usuarios.
export interface ManagedUser {
    id: number;
    names: string;
    lastNames: string;
    email: string;
    document: string;
    role: ManagedUserRole;
    status: ManagedUserStatus;
    gender: UserGender;
    birthDate: string;
    createdAt: string;
}
