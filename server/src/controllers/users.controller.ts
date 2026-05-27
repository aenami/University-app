import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { getConnection } from "../config/db.js";
import { hashPassword } from "../services/passwordService.js";
import {
    managedUserRoles,
    managedUserStatuses,
    userGenders,
    type CreateManagedUserInput,
    type ManagedUserRole,
    type ManagedUserStatus,
} from "../types/userManagement.types.js";

const isManagedRole = (value: unknown): value is ManagedUserRole =>
    typeof value === "string" && managedUserRoles.includes(value as ManagedUserRole);

const isManagedStatus = (value: unknown): value is ManagedUserStatus =>
    typeof value === "string" && managedUserStatuses.includes(value as ManagedUserStatus);

const isValidGender = (value: unknown): value is (typeof userGenders)[number] =>
    typeof value === "string" && userGenders.includes(value as typeof userGenders[number]);

const hasText = (value: unknown) =>
    typeof value === "string" && value.trim().length > 0;

type MysqlError = Error & {
    code?: string;
    errno?: number;
    sqlMessage?: string;
    message: string;
};

const fieldLabels: Record<string, string> = {
    nombres_usuario: "nombre",
    apellidos_usuario: "apellido",
    email_usuario: "correo",
    documento_usuario: "documento",
    fecha_nacimiento_usuario: "fecha de nacimiento",
    rol_usuario: "rol",
    genero_usuario: "genero",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildValidationError = (message: string) => ({
    status: 400,
    error: true,
    message,
});

const validateManagedUserInput = (input: CreateManagedUserInput) => {
    // Validamos el payload contra las restricciones reales de la tabla usuario.
    if (input.name.length > 50) {
        return buildValidationError("El nombre no es valido: debe tener maximo 50 caracteres");
    }

    if (input.lastName.length > 50) {
        return buildValidationError("El apellido no es valido: debe tener maximo 50 caracteres");
    }

    if (!emailRegex.test(input.email)) {
        return buildValidationError("El correo no es valido: debe tener un formato correcto");
    }

    if (input.email.length > 60) {
        return buildValidationError("El correo no es valido: debe tener maximo 60 caracteres");
    }

    if (input.password.length < 8) {
        return buildValidationError("La contrasena no es valida: debe tener minimo 8 caracteres");
    }

    if (input.password.length > 72) {
        return buildValidationError("La contrasena no es valida: debe tener maximo 72 caracteres");
    }

    if (input.userID.length > 20) {
        return buildValidationError("El documento no es valido: debe tener maximo 20 caracteres");
    }

    if (!/^[0-9A-Za-z-]+$/.test(input.userID)) {
        return buildValidationError("El documento no es valido: solo puede contener letras, numeros o guiones");
    }

    return null;
};

const getMysqlFriendlyMessage = (error: unknown, fallbackMessage: string) => {
    const dbError = error as MysqlError;

    if (dbError.code === "ER_DATA_TOO_LONG") {
        const fieldName = Object.keys(fieldLabels).find((key) =>
            dbError.message.includes(`'${key}'`)
        );

        if (fieldName) {
            return `El ${fieldLabels[fieldName]} enviado supera el tamano permitido`;
        }

        return "Uno de los datos enviados supera el tamano permitido";
    }

    if (dbError.code === "ER_DUP_ENTRY") {
        if (dbError.message.includes("email_usuario")) {
            return "El correo ingresado ya pertenece a otro usuario";
        }

        if (dbError.message.includes("documento_usuario")) {
            return "El documento ingresado ya pertenece a otro usuario";
        }

        return "Se intento guardar un valor duplicado que ya existe en la base de datos";
    }

    if (dbError.code === "ER_TRUNCATED_WRONG_VALUE" || dbError.code === "ER_WRONG_VALUE_FOR_TYPE") {
        return "Uno de los valores enviados no tiene un formato valido para la base de datos";
    }

    return fallbackMessage;
};

export const getManagedUsers = async (req: Request, res: Response) => {
    try {
        // Permitimos filtrar desde el frontend por busqueda libre y rol puntual.
        const rawSearch = typeof req.query.search === "string" ? req.query.search : undefined;
        const rawRole = typeof req.query.role === "string" ? req.query.role : undefined;
        const roleFilter = isManagedRole(rawRole) ? rawRole : undefined;

        const users = await User.getManagedUsers(rawSearch, roleFilter);

        return res.status(200).json({
            error: false,
            data: users,
        });
    } catch (error) {
        console.log("Error al obtener los usuarios administrativos", error);
        return res.status(500).json({
            error: true,
            message: "No fue posible consultar los usuarios administrativos",
        });
    }
};

export const createManagedUser = async (req: Request, res: Response) => {
    const {
        name,
        lastName,
        email,
        password,
        birthDate,
        userGender,
        userRole,
        userID,
    } = req.body as Partial<CreateManagedUserInput>;

    // Validamos lo minimo para no insertar usuarios incompletos.
    if (
        !hasText(name) ||
        !hasText(lastName) ||
        !hasText(email) ||
        !hasText(password) ||
        !hasText(birthDate) ||
        !hasText(userID) ||
        !isValidGender(userGender) ||
        !isManagedRole(userRole)
    ) {
        return res.status(400).json({
            error: true,
            message: "La informacion enviada no es valida para crear el usuario",
        });
    }

    // A partir de este punto ya tenemos strings y enums validos para operar sin ambiguedad.
    const normalizedName = name!.trim();
    const normalizedLastName = lastName!.trim();
    const normalizedEmail = email!.trim().toLowerCase();
    const normalizedPassword = password!.trim();
    const normalizedBirthDate = birthDate!;
    const normalizedUserId = userID!.trim();
    const normalizedGender = userGender!;
    const normalizedRole = userRole!;

    const validationError = validateManagedUserInput({
        name: normalizedName,
        lastName: normalizedLastName,
        email: normalizedEmail,
        password: normalizedPassword,
        birthDate: normalizedBirthDate,
        userGender: normalizedGender,
        userRole: normalizedRole,
        userID: normalizedUserId,
    });

    if (validationError) {
        return res.status(validationError.status).json(validationError);
    }

    const parsedBirthDate = new Date(normalizedBirthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
        return res.status(400).json({
            error: true,
            message: "La fecha de nacimiento no tiene un formato valido",
        });
    }

    try {
        if (!req.idUser) {
            return res.status(401).json({
                error: true,
                message: "No fue posible identificar al administrador que ejecuta la accion",
            });
        }

        const emailExists = await User.existsUser(normalizedEmail);
        if (emailExists) {
            return res.status(409).json({
                error: true,
                message: "El correo ingresado ya pertenece a otro usuario",
            });
        }

        const documentExists = await User.existsDocument(normalizedUserId);
        if (documentExists) {
            return res.status(409).json({
                error: true,
                message: "El documento ingresado ya pertenece a otro usuario",
            });
        }

        const hashedPassword = await hashPassword(normalizedPassword);
        const pool = getConnection();
        const connection = await pool.getConnection();
        let createdUserId = 0;

        try {
            await connection.beginTransaction();

            createdUserId = await User.createUser(
                normalizedName,
                normalizedLastName,
                hashedPassword,
                normalizedEmail,
                normalizedBirthDate,
                normalizedGender,
                normalizedRole,
                normalizedUserId,
                connection
            );

            await AuditLog.createLog(
                `Creacion de usuario ${createdUserId} con rol ${normalizedRole}`,
                req.idUser,
                connection
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const createdUser = await User.getManagedUserById(createdUserId);

        return res.status(201).json({
            error: false,
            message: "Usuario creado con exito",
            data: createdUser,
        });
    } catch (error) {
        console.log("Error al crear el usuario administrativo", error);
        return res.status(500).json({
            error: true,
            message: getMysqlFriendlyMessage(
                error,
                "No fue posible crear el usuario administrativo"
            ),
        });
    }
};

export const updateManagedUserStatus = async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const { status } = req.body as { status?: ManagedUserStatus };

    if (!Number.isInteger(userId) || userId <= 0 || !isManagedStatus(status)) {
        return res.status(400).json({
            error: true,
            message: "Los datos enviados para actualizar el estado no son validos",
        });
    }

    try {
        if (!req.idUser) {
            return res.status(401).json({
                error: true,
                message: "No fue posible identificar al administrador que ejecuta la accion",
            });
        }

        const currentUser = await User.getManagedUserById(userId);

        if (!currentUser) {
            return res.status(404).json({
                error: true,
                message: "No se encontro el usuario solicitado",
            });
        }

        if (currentUser.status === status) {
            return res.status(409).json({
                error: true,
                message: `El usuario ya se encuentra en estado ${status.toLowerCase()}`,
            });
        }

        const pool = getConnection();
        const connection = await pool.getConnection();
        let wasUpdated = false;

        try {
            await connection.beginTransaction();

            wasUpdated = await User.updateManagedUserStatus(userId, status, connection);

            if (!wasUpdated) {
                await connection.rollback();
                return res.status(404).json({
                    error: true,
                    message: "No se encontro el usuario solicitado",
                });
            }

            await AuditLog.createLog(
                `Cambio de estado del usuario ${userId}: ${currentUser.status} a ${status}`,
                req.idUser,
                connection
            );

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const updatedUser = await User.getManagedUserById(userId);

        return res.status(200).json({
            error: false,
            message: "Estado del usuario actualizado con exito",
            data: updatedUser,
        });
    } catch (error) {
        console.log("Error al actualizar el estado del usuario", error);
        return res.status(500).json({
            error: true,
            message: getMysqlFriendlyMessage(
                error,
                "No fue posible actualizar el estado del usuario"
            ),
        });
    }
};
