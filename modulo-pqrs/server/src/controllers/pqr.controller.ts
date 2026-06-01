import type { Request, Response } from "express";
import { getConnection } from "../config/db.js";
import AuditLog from "../models/AuditLog.js";
import Pqr from "../models/Pqr.js";
import {
    pqrRequestTypes,
    type CreatePqrInput,
    type CreatePqrResponseInput,
    type PqrRequestType,
} from "../types/pqr.types.js";

const hasText = (value: unknown) => typeof value === "string" && value.trim().length > 0;

const isPqrType = (value: unknown): value is PqrRequestType =>
    typeof value === "string" && pqrRequestTypes.includes(value as PqrRequestType);

const getValidationError = (input: Partial<CreatePqrInput>) => {
    if (!isPqrType(input.tipo)) {
        return "El tipo de solicitud no es valido";
    }

    if (!hasText(input.asunto) || input.asunto!.trim().length > 150) {
        return "El asunto es obligatorio y debe tener maximo 150 caracteres";
    }

    if (!hasText(input.descripcion)) {
        return "La descripcion detallada es obligatoria";
    }

    return null;
};

const getResponseValidationError = (input: Partial<CreatePqrResponseInput>) => {
    if (!hasText(input.titulo) || input.titulo!.trim().length > 150) {
        return "El titulo de la respuesta es obligatorio y debe tener maximo 150 caracteres";
    }

    if (!hasText(input.descripcion)) {
        return "La descripcion de la respuesta es obligatoria";
    }

    return null;
};

const canSeeAllPqrs = (role?: string) => role === "ADMINISTRADOR" || role === "COORDINADOR";

export const createPqr = async (req: Request, res: Response) => {
    const input = req.body as Partial<CreatePqrInput>;
    const validationError = getValidationError(input);

    if (validationError) {
        return res.status(400).json({
            error: true,
            message: validationError,
        });
    }

    if (!req.idUser) {
        return res.status(401).json({
            error: true,
            message: "No fue posible identificar al usuario autenticado",
        });
    }

    try {
        const normalizedInput: CreatePqrInput = {
            tipo: input.tipo!,
            asunto: input.asunto!.trim(),
            descripcion: input.descripcion!.trim(),
        };

        const pqrId = await Pqr.create(normalizedInput, req.idUser);
        const ticket = await Pqr.getById(pqrId);

        return res.status(201).json({
            error: false,
            message: "Solicitud PQR registrada con exito",
            data: ticket,
        });
    } catch (error) {
        console.error("Error al registrar PQR:", error);
        return res.status(500).json({
            error: true,
            message: "No fue posible registrar la solicitud PQR",
        });
    }
};

export const listPqrs = async (req: Request, res: Response) => {
    if (!req.idUser) {
        return res.status(401).json({
            error: true,
            message: "No fue posible identificar al usuario autenticado",
        });
    }

    try {
        const tickets = await Pqr.list({
            userId: req.idUser,
            includeAll: canSeeAllPqrs(req.rolUser),
        });

        return res.status(200).json({
            error: false,
            message: "Solicitudes PQR consultadas con exito",
            data: tickets,
        });
    } catch (error) {
        console.error("Error al listar PQR:", error);
        return res.status(500).json({
            error: true,
            message: "No fue posible consultar las solicitudes PQR",
        });
    }
};

export const respondPqr = async (req: Request, res: Response) => {
    const pqrId = Number(req.params.pqrId);
    const input = req.body as Partial<CreatePqrResponseInput>;
    const validationError = getResponseValidationError(input);

    if (!Number.isInteger(pqrId) || pqrId <= 0) {
        return res.status(400).json({
            error: true,
            message: "El ID de la PQR no es valido",
        });
    }

    if (validationError) {
        return res.status(400).json({
            error: true,
            message: validationError,
        });
    }

    if (!req.idUser) {
        return res.status(401).json({
            error: true,
            message: "No fue posible identificar al usuario autenticado",
        });
    }

    try {
        const ticket = await Pqr.getById(pqrId);

        if (!ticket) {
            return res.status(404).json({
                error: true,
                message: "No se encontro la solicitud PQR",
            });
        }

        if (ticket.status === "cerrada") {
            return res.status(409).json({
                error: true,
                message: "No se puede responder una solicitud cerrada",
            });
        }

        const adminId = await Pqr.getAdminIdByUserId(req.idUser);

        if (!adminId) {
            return res.status(403).json({
                error: true,
                message: "El usuario autenticado no esta registrado como administrador",
            });
        }

        const pool = getConnection();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            await Pqr.createResponse(
                pqrId,
                {
                    titulo: input.titulo!.trim(),
                    descripcion: input.descripcion!.trim(),
                },
                adminId,
                connection
            );

            await AuditLog.createLog(`Respuesta registrada para PQR ${pqrId}`, req.idUser, connection);
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const updatedTicket = await Pqr.getById(pqrId);

        return res.status(201).json({
            error: false,
            message: "Respuesta registrada con exito",
            data: updatedTicket,
        });
    } catch (error) {
        console.error("Error al responder PQR:", error);
        return res.status(500).json({
            error: true,
            message: "No fue posible registrar la respuesta de la PQR",
        });
    }
};

export const closePqr = async (req: Request, res: Response) => {
    const pqrId = Number(req.params.pqrId);

    if (!Number.isInteger(pqrId) || pqrId <= 0) {
        return res.status(400).json({
            error: true,
            message: "El ID de la PQR no es valido",
        });
    }

    if (!req.idUser) {
        return res.status(401).json({
            error: true,
            message: "No fue posible identificar al usuario autenticado",
        });
    }

    try {
        const ticket = await Pqr.getById(pqrId);

        if (!ticket) {
            return res.status(404).json({
                error: true,
                message: "No se encontro la solicitud PQR",
            });
        }

        if (ticket.status === "cerrada") {
            return res.status(409).json({
                error: true,
                message: "La solicitud PQR ya se encuentra cerrada",
            });
        }

        const pool = getConnection();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            await Pqr.close(pqrId, connection);
            await AuditLog.createLog(`Cierre de PQR ${pqrId}`, req.idUser, connection);
            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        const updatedTicket = await Pqr.getById(pqrId);

        return res.status(200).json({
            error: false,
            message: "Solicitud PQR cerrada con exito",
            data: updatedTicket,
        });
    } catch (error) {
        console.error("Error al cerrar PQR:", error);
        return res.status(500).json({
            error: true,
            message: "No fue posible cerrar la solicitud PQR",
        });
    }
};
