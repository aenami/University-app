"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGenders = exports.managedUserStatuses = exports.managedUserRoles = void 0;
// Roles que puede administrar el modulo de seguridad.
exports.managedUserRoles = [
    "ADMINISTRADOR",
    "COORDINADOR",
    "DOCENTE",
];
// Estados visibles dentro de la pantalla de gestion.
exports.managedUserStatuses = [
    "ACTIVO",
    "INACTIVO",
];
// Generos soportados actualmente por la base de datos.
exports.userGenders = [
    "MASCULINO",
    "FEMENINO",
];
