import type { Request, Response } from "express";

import PreMatricula from "../models/PreMatricula.js";

export const obtenerPendientes = async (
    req: Request,
    res: Response
) => {
    try {

        const pendientes = await PreMatricula.obtenerPendientes();

        return res.status(200).json({
            error: false,
            message: "Prematrículas pendientes obtenidas correctamente",
            data: pendientes
        });

    } catch (error: any) {

        console.error("Error en obtenerPendientes:", error);

        return res.status(500).json({
            error: true,
            message: "Error interno del servidor",
            details: error.message
        });
    }
};

export const aprobarPreMatricula = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        const actualizado =
            await PreMatricula.aprobarPreMatricula(Number(id));

        if (!actualizado) {
            return res.status(404).json({
                error: true,
                message: "Prematrícula no encontrada"
            });
        }

        return res.status(200).json({
            error: false,
            message: "Prematrícula aprobada correctamente"
        });

    } catch (error: any) {

        console.error("Error en aprobarPreMatricula:", error);

        return res.status(500).json({
            error: true,
            message: "Error interno del servidor",
            details: error.message
        });
    }
};

export const rechazarPreMatricula = async (
    req: Request,
    res: Response
) => {
    try {

        const { id } = req.params;

        const actualizado =
            await PreMatricula.rechazarPreMatricula(Number(id));

        if (!actualizado) {
            return res.status(404).json({
                error: true,
                message: "Prematrícula no encontrada"
            });
        }

        return res.status(200).json({
            error: false,
            message: "Prematrícula rechazada correctamente"
        });

    } catch (error: any) {

        console.error("Error en rechazarPreMatricula:", error);

        return res.status(500).json({
            error: true,
            message: "Error interno del servidor",
            details: error.message
        });
    }
};