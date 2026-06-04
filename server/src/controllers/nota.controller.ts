import type { Request, Response } from "express";
import Nota from "../models/Nota.js";
import AuditLog from "../models/AuditLog.js";

// ============================================================
// POST /api/notas
// Registrar nota por estudiante (solo docente)
// ============================================================
export const registrarNota = async (req: Request, res: Response) => {
    const { id_grupo, id_estudiante, id_corte, valor } = req.body;

    if (!id_grupo || !id_estudiante || !id_corte || valor === undefined) {
        return res.status(400).json({
            error: true,
            message: "Faltan campos obligatorios: id_grupo, id_estudiante, id_corte, valor",
        });
    }

    if (typeof valor !== "number" || valor < 0 || valor > 5) {
        return res.status(400).json({
            error: true,
            message: "El valor de la nota debe ser un número entre 0 y 5",
        });
    }

    try {
        // 1. Obtener id_docente
        const id_docente = await Nota.getDocenteByUsuario(req.idUser!);
        if (!id_docente) {
            return res.status(403).json({ error: true, message: "El usuario no es un docente registrado" });
        }

        // 2. Verificar que el estudiante está matriculado en el grupo
        const matricula = await Nota.getMatriculaByEstudianteYGrupo(id_estudiante, id_grupo);
        if (!matricula) {
            return res.status(404).json({ error: true, message: "El estudiante no está matriculado en este grupo" });
        }

        const id_asignatura = matricula.id_asignatura;

        // 3. Verificar que el corte existe
        const corteExiste = await Nota.existeCorte(id_corte);
        if (!corteExiste) {
            return res.status(404).json({ error: true, message: "Corte no encontrado" });
        }

        // 4. Verificar que no exista nota duplicada
        const notaDuplicada = await Nota.existeNota(id_estudiante, id_asignatura, id_corte);
        if (notaDuplicada) {
            return res.status(409).json({
                error: true,
                message: "Ya existe una nota para este estudiante en esta asignatura y corte. Use PUT para editarla.",
            });
        }

        // 5. Crear nota
        const id_nota = await Nota.crearNota(valor, id_asignatura, id_corte, id_docente);

        // 5.5 Registrar log de auditoría para la creación de nota
        if (req.idUser) {
            await AuditLog.createLog(
                `Registro de nota ID: ${id_nota} con valor ${valor} para el estudiante #${id_estudiante} (Asignatura: ${id_asignatura}, Corte: ${id_corte})`,
                req.idUser
            );
        }

        return res.status(201).json({
            error: false,
            message: "Nota registrada exitosamente",
            data: {
                id_nota,
                id_estudiante,
                id_grupo,
                id_asignatura,
                id_corte,
                id_docente,
                valor,
                fecha_registro: new Date().toISOString().split("T")[0],
            },
        });
    } catch (error) {
        console.error("Error al registrar nota:", error);
        return res.status(500).json({ error: true, message: "Error interno al registrar la nota" });
    }
};

// ============================================================
// GET /api/notas/grupo/:id_grupo
// Obtener notas de todos los estudiantes de un grupo
// ============================================================
export const obtenerNotasPorGrupo = async (req: Request, res: Response) => {
    const idGrupo = Number(req.params.id_grupo);

    if (!idGrupo || isNaN(idGrupo)) {
        return res.status(400).json({ error: true, message: "ID de grupo inválido" });
    }

    try {
        const grupoExiste = await Nota.existeGrupo(idGrupo);
        if (!grupoExiste) {
            return res.status(404).json({ error: true, message: "Grupo no encontrado" });
        }

        const notas = await Nota.getNotasByGrupo(idGrupo);

        return res.status(200).json({
            error: false,
            message: "Notas consultadas exitosamente",
            data: notas,
        });
    } catch (error) {
        console.error("Error al obtener notas:", error);
        return res.status(500).json({ error: true, message: "Error interno al obtener las notas" });
    }
};

// ============================================================
// PUT /api/notas/:id_nota
// Editar nota (solo docente) + genera auditoria_nota
// ============================================================
export const editarNota = async (req: Request, res: Response) => {
    const idNota = Number(req.params.id_nota);
    const { valor } = req.body;

    if (!idNota || isNaN(idNota)) {
        return res.status(400).json({ error: true, message: "ID de nota inválido" });
    }

    if (valor === undefined || typeof valor !== "number" || valor < 0 || valor > 5) {
        return res.status(400).json({ error: true, message: "El valor de la nota debe ser un número entre 0 y 5" });
    }

    try {
        // 1. Verificar que es docente
        const id_docente = await Nota.getDocenteByUsuario(req.idUser!);
        if (!id_docente) {
            return res.status(403).json({ error: true, message: "El usuario no es un docente registrado" });
        }

        // 2. Obtener nota actual
        const nota = await Nota.getNotaById(idNota);
        if (!nota) {
            return res.status(404).json({ error: true, message: "Nota no encontrada" });
        }

        const valorAnterior = Number(nota.valor);
        if (valorAnterior === valor) {
            return res.status(400).json({ error: true, message: "El nuevo valor es igual al actual" });
        }

        // 3. Actualizar nota
        await Nota.actualizarNota(idNota, valor);

        // 4. Registrar auditoría si es admin
        const id_administrador = await Nota.getAdminByUsuario(req.idUser!);
        if (id_administrador) {
            await Nota.crearAuditoriaNote(valorAnterior, valor, id_administrador, idNota);
        }

        // 4.5 Registrar log de auditoría general para la edición de nota
        if (req.idUser) {
            await AuditLog.createLog(
                `Modificacion de nota ID: ${idNota} - Valor anterior: ${valorAnterior} a Nuevo valor: ${valor}`,
                req.idUser
            );
        }

        return res.status(200).json({
            error: false,
            message: "Nota actualizada exitosamente",
            data: {
                id_nota: idNota,
                valor_anterior: valorAnterior,
                valor_nuevo: valor,
                version_numero: nota.version_numero + 1,
            },
        });
    } catch (error) {
        console.error("Error al editar nota:", error);
        return res.status(500).json({ error: true, message: "Error interno al editar la nota" });
    }
};