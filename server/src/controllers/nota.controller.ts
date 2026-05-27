import { Request, Response } from "express";
import { getConnection } from "../config/db";
import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";

// ============================================================
// POST /api/notas
// Registrar nota por estudiante (solo docente)
// ============================================================
export const registrarNota = async (req: Request, res: Response): Promise<void> => {
    const { id_grupo, id_estudiante, id_corte, valor } = req.body;

    if (!id_grupo || !id_estudiante || !id_corte || valor === undefined) {
        res.status(400).json({
            error: true,
            message: "Faltan campos obligatorios: id_grupo, id_estudiante, id_corte, valor",
        });
        return;
    }

    if (typeof valor !== "number" || valor < 0 || valor > 5) {
        res.status(400).json({
            error: true,
            message: "El valor de la nota debe ser un número entre 0 y 5",
        });
        return;
    }

    const pool = getConnection();
    let connection: PoolConnection | null = null;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Obtener id_docente a partir del id_usuario del token
        const [docenteRows] = await connection.query<RowDataPacket[]>(
            `SELECT id_docente FROM docente WHERE id_usuario = ?`,
            [req.idUser]
        );

        if (!docenteRows.length) {
            await connection.rollback();
            res.status(403).json({ error: true, message: "El usuario no es un docente registrado" });
            return;
        }

        const id_docente = docenteRows[0].id_docente;

        // 2. Verificar que el estudiante está matriculado en el grupo usando joins
        const [matriculaRows] = await connection.query<RowDataPacket[]>(
            `SELECT m.id_estudiante, g.id_asignatura
             FROM matricula m
             INNER JOIN detalle_matricula dm ON dm.id_matricula = m.id_matricula
             INNER JOIN grupo g ON g.id_grupo = dm.id_grupo
             WHERE m.id_estudiante = ? AND dm.id_grupo = ?`,
            [id_estudiante, id_grupo]
        );

        if (!matriculaRows.length) {
            await connection.rollback();
            res.status(404).json({ error: true, message: "El estudiante no está matriculado en este grupo" });
            return;
        }

        const id_asignatura = matriculaRows[0].id_asignatura;

        // 3. Verificar que el corte existe
        const [corteRows] = await connection.query<RowDataPacket[]>(
            `SELECT id_corte FROM corte WHERE id_corte = ?`,
            [id_corte]
        );

        if (!corteRows.length) {
            await connection.rollback();
            res.status(404).json({ error: true, message: "Corte no encontrado" });
            return;
        }

        // 4. Verificar que no exista ya una nota para ese estudiante/asignatura/corte usando joins
        const [notaExistente] = await connection.query<RowDataPacket[]>(
            `SELECT n.id_nota
             FROM nota n
             INNER JOIN grupo g ON g.id_asignatura = n.id_asignatura
             INNER JOIN detalle_matricula dm ON dm.id_grupo = g.id_grupo
             INNER JOIN matricula m ON m.id_matricula = dm.id_matricula
             WHERE m.id_estudiante = ? AND n.id_asignatura = ? AND n.id_corte = ?`,
            [id_estudiante, id_asignatura, id_corte]
        );

        if (notaExistente.length) {
            await connection.rollback();
            res.status(409).json({
                error: true,
                message: "Ya existe una nota para este estudiante en esta asignatura y corte. Use PUT para editarla.",
            });
            return;
        }

        // 5. Insertar nota sin id_estudiante
        const [result] = await connection.query<ResultSetHeader>(
            `INSERT INTO nota (valor, fecha_registro, version_numero, id_asignatura, id_corte, id_docente)
             VALUES (?, CURDATE(), 1, ?, ?, ?)`,
            [valor, id_asignatura, id_corte, id_docente]
        );

        await connection.commit();

        res.status(201).json({
            error: false,
            message: "Nota registrada exitosamente",
            data: {
                id_nota: result.insertId,
                id_estudiante,
                id_grupo,
                id_asignatura,
                id_corte,
                id_docente,
                valor,
                fecha_registro: new Date().toISOString().split("T")[0],
            },
        });
    } catch (error: unknown) {
        if (connection) await connection.rollback();
        if (error instanceof Error) {
            console.error("Error al registrar nota:", error.message);
            res.status(500).json({ error: true, message: "Error interno al registrar la nota", detalle: error.message });
        } else {
            res.status(500).json({ error: true, message: "Error inesperado al registrar la nota" });
        }
    } finally {
        if (connection) connection.release();
    }
};

// ============================================================
// GET /api/notas/grupo/:id_grupo
// Obtener notas de todos los estudiantes de un grupo
// ============================================================
export const obtenerNotasPorGrupo = async (req: Request, res: Response): Promise<void> => {
    const { id_grupo } = req.params;

    if (!id_grupo || isNaN(Number(id_grupo))) {
        res.status(400).json({ error: true, message: "ID de grupo inválido" });
        return;
    }

    const pool = getConnection();

    try {
        const [grupoRows] = await pool.query<RowDataPacket[]>(
            `SELECT id_grupo FROM grupo WHERE id_grupo = ?`,
            [id_grupo]
        );

        if (!grupoRows.length) {
            res.status(404).json({ error: true, message: "Grupo no encontrado" });
            return;
        }

        const [notas] = await pool.query<RowDataPacket[]>(
            `SELECT
                n.id_nota,
                n.valor,
                n.fecha_registro,
                n.version_numero,
                e.id_estudiante,
                u.nombres_usuario,
                u.apellidos_usuario,
                u.documento_usuario,
                a.id_asignatura,
                a.nombre AS asignatura,
                c.id_corte,
                c.nombre_corte,
                c.porcentaje
             FROM nota n
             INNER JOIN asignatura a       ON a.id_asignatura = n.id_asignatura
             INNER JOIN grupo g            ON g.id_asignatura = n.id_asignatura
             INNER JOIN detalle_matricula dm ON dm.id_grupo   = g.id_grupo
             INNER JOIN matricula m        ON m.id_matricula  = dm.id_matricula
             INNER JOIN estudiante e       ON e.id_estudiante = m.id_estudiante
             INNER JOIN usuario u          ON u.id_usuario    = e.id_usuario
             INNER JOIN corte c            ON c.id_corte      = n.id_corte
             WHERE g.id_grupo = ?
             ORDER BY u.apellidos_usuario, u.nombres_usuario, c.porcentaje`,
            [id_grupo]
        );

        res.status(200).json({
            error: false,
            message: "Notas consultadas exitosamente",
            data: notas,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error al obtener notas:", error.message);
            res.status(500).json({ error: true, message: "Error interno al obtener las notas" });
        } else {
            res.status(500).json({ error: true, message: "Error inesperado al obtener las notas" });
        }
    }
};

// ============================================================
// PUT /api/notas/:id_nota
// Editar nota (solo docente) + genera auditoria_nota automática
// ============================================================
export const editarNota = async (req: Request, res: Response): Promise<void> => {
    const { id_nota } = req.params;
    const { valor } = req.body;

    if (!id_nota || isNaN(Number(id_nota))) {
        res.status(400).json({ error: true, message: "ID de nota inválido" });
        return;
    }

    if (valor === undefined || typeof valor !== "number" || valor < 0 || valor > 5) {
        res.status(400).json({ error: true, message: "El valor de la nota debe ser un número entre 0 y 5" });
        return;
    }

    const pool = getConnection();
    let connection: PoolConnection | null = null;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [docenteRows] = await connection.query<RowDataPacket[]>(
            `SELECT id_docente FROM docente WHERE id_usuario = ?`,
            [req.idUser]
        );

        if (!docenteRows.length) {
            await connection.rollback();
            res.status(403).json({ error: true, message: "El usuario no es un docente registrado" });
            return;
        }

        const [notaRows] = await connection.query<RowDataPacket[]>(
            `SELECT id_nota, valor, version_numero FROM nota WHERE id_nota = ?`,
            [id_nota]
        );

        if (!notaRows.length) {
            await connection.rollback();
            res.status(404).json({ error: true, message: "Nota no encontrada" });
            return;
        }

        const notaActual = notaRows[0];
        const valorAnterior = notaActual.valor;

        if (Number(valorAnterior) === valor) {
            await connection.rollback();
            res.status(400).json({ error: true, message: "El nuevo valor es igual al actual" });
            return;
        }

        await connection.query(
            `UPDATE nota SET valor = ?, fecha_registro = CURDATE(), version_numero = version_numero + 1 WHERE id_nota = ?`,
            [valor, id_nota]
        );

        const [adminRows] = await connection.query<RowDataPacket[]>(
            `SELECT id_administrador FROM administrador WHERE id_usuario = ?`,
            [req.idUser]
        );

        if (adminRows.length) {
            await connection.query(
                `INSERT INTO auditoria_nota (valor_anterior, valor_nuevo, id_administrador, id_nota)
                 VALUES (?, ?, ?, ?)`,
                [valorAnterior, valor, adminRows[0].id_administrador, id_nota]
            );
        }

        await connection.commit();

        res.status(200).json({
            error: false,
            message: "Nota actualizada exitosamente",
            data: {
                id_nota: Number(id_nota),
                valor_anterior: Number(valorAnterior),
                valor_nuevo: valor,
                version_numero: notaActual.version_numero + 1,
            },
        });
    } catch (error: unknown) {
        if (connection) await connection.rollback();
        if (error instanceof Error) {
            console.error("Error al editar nota:", error.message);
            res.status(500).json({ error: true, message: "Error interno al editar la nota", detalle: error.message });
        } else {
            res.status(500).json({ error: true, message: "Error inesperado al editar la nota" });
        }
    } finally {
        if (connection) connection.release();
    }
};