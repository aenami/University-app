import { Request, Response } from "express";
import { getConnection } from "../config/db.js";
import { PoolConnection, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import AuditLog from "../models/AuditLog.js";



interface DetalleInput {
    id_grupo: number;
}

interface MatriculaBody {
    id_estudiante: number;
    id_grupo: number;          
    id_programa: number;
    id_beca?: number | null;
    detalles: DetalleInput[]; 
}

interface GrupoRow extends RowDataPacket {
    id_grupo: number;
    cupo_maximo: number;
    creditos: number;
    precio_credito: number;
    inscritos: number;
}

interface BecaRow extends RowDataPacket {
    descuento: number;
}

// ============================================================
// POST /matriculas
// Guardar matrícula + detalle_matricula desde selección del estudiante
// ============================================================

export const crearMatricula = async (req: Request, res: Response): Promise<void> => {

    const { id_estudiante, id_grupo, id_programa, id_beca, detalles }: MatriculaBody = req.body;

    // ── Validación básica ──────────────────────────────────────
    if (!id_estudiante || !id_grupo || !id_programa || !detalles?.length) {
        res.status(400).json({
            ok: false,
            mensaje: "Faltan campos obligatorios: id_estudiante, id_grupo, id_programa, detalles"
        });
        return;
    }

    const pool = getConnection();
    let connection: PoolConnection | null = null;

    try {

        connection = await pool.getConnection();

        // ── Iniciar transacción ────────────────────────────────
        await connection.beginTransaction();

        // ── 1. Verificar que el estudiante existe ──────────────
        const [estudianteRows] = await connection.query<RowDataPacket[]>(
            `SELECT id_estudiante FROM estudiante WHERE id_estudiante = ?`,
            [id_estudiante]
        );

        if (!estudianteRows.length) {
            await connection.rollback();
            res.status(404).json({ ok: false, mensaje: "Estudiante no encontrado" });
            return;
        }

        // ── 2. Verificar que el estudiante no tenga ya una matrícula activa ──
        const [matriculaExistente] = await connection.query<RowDataPacket[]>(
            `SELECT id_matricula FROM matricula
             WHERE id_estudiante = ? AND id_programa = ?
             LIMIT 1`,
            [id_estudiante, id_programa]
        );

        if (matriculaExistente.length) {
            await connection.rollback();
            res.status(409).json({
                ok: false,
                mensaje: "El estudiante ya tiene una matrícula registrada en este programa"
            });
            return;
        }

        // ── 3. Obtener info de cada grupo seleccionado ─────────
        //       (créditos, cupo disponible, precio por crédito)
        const idsGrupos = detalles.map(d => d.id_grupo);

        const [grupos] = await connection.query<GrupoRow[]>(
            `SELECT
                g.id_grupo,
                g.cupo_maximo,
                a.creditos,
                COUNT(dm.id_detalle) AS inscritos
             FROM grupo g
             INNER JOIN asignatura a ON a.id_asignatura = g.id_asignatura
             LEFT JOIN detalle_matricula dm ON dm.id_grupo = g.id_grupo
             WHERE g.id_grupo IN (?)
             GROUP BY g.id_grupo, g.cupo_maximo, a.creditos`,
            [idsGrupos]
        );

        // Validar que todos los grupos existen
        if (grupos.length !== idsGrupos.length) {
            await connection.rollback();
            res.status(404).json({
                ok: false,
                mensaje: "Uno o más grupos seleccionados no existen"
            });
            return;
        }

        // Validar cupo disponible en cada grupo
        for (const grupo of grupos) {
            if (grupo.inscritos >= grupo.cupo_maximo) {
                await connection.rollback();
                res.status(409).json({
                    ok: false,
                    mensaje: `El grupo ${grupo.id_grupo} no tiene cupo disponible`
                });
                return;
            }
        }

        // ── 4. Calcular total de créditos ──────────────────────
        const totalCreditos = grupos.reduce((sum, g) => sum + g.creditos, 0);

        // ── 5. Calcular precio base (asumimos precio fijo por crédito) ─
        //       Ajusta PRECIO_POR_CREDITO según tu lógica de negocio
        const PRECIO_POR_CREDITO = 150000; // COP por crédito
        let precioTotal = totalCreditos * PRECIO_POR_CREDITO;

        // ── 6. Aplicar descuento de beca si existe ─────────────
        if (id_beca) {
            const [becaRows] = await connection.query<BecaRow[]>(
                `SELECT descuento FROM beca
                 WHERE id_beca = ?
                   AND fecha_inicio <= CURDATE()
                   AND fecha_fin    >= CURDATE()`,
                [id_beca]
            );

            if (!becaRows.length) {
                await connection.rollback();
                res.status(404).json({
                    ok: false,
                    mensaje: "La beca no existe o no está vigente"
                });
                return;
            }

            const descuento = Number(becaRows[0].descuento); // porcentaje: ej. 25.00
            precioTotal = precioTotal * (1 - descuento / 100);
        }

        // ── 7. Insertar en tabla MATRICULA ─────────────────────
        const [resultMatricula] = await connection.query<ResultSetHeader>(
            `INSERT INTO matricula
                (id_estudiante, id_grupo, total_creditos, fecha_matricula, precio_total, id_beca, id_programa)
             VALUES (?, ?, ?, CURDATE(), ?, ?, ?)`,
            [
                id_estudiante,
                id_grupo,
                totalCreditos,
                precioTotal.toFixed(2),
                id_beca ?? null,
                id_programa
            ]
        );

        const idMatriculaCreada = resultMatricula.insertId;

        // ── 8. Insertar cada fila en DETALLE_MATRICULA ─────────
        const valoresDetalle = detalles.map(d => [idMatriculaCreada, d.id_grupo]);

        await connection.query(
            `INSERT INTO detalle_matricula (id_matricula, id_grupo) VALUES ?`,
            [valoresDetalle]
        );

        // ── 8.5 Registrar log de auditoría para la matrícula ──
        if (req.idUser) {
            await AuditLog.createLog(
                `Registro de matricula #${idMatriculaCreada} para el estudiante #${id_estudiante} (Programa: ${id_programa}, Creditos: ${totalCreditos}, Precio: ${precioTotal.toFixed(2)})`,
                req.idUser,
                connection
            );
        }

        // ── 9. Confirmar transacción ───────────────────────────
        await connection.commit();

        res.status(201).json({
            ok: true,
            mensaje: "Matrícula registrada exitosamente",
            data: {
                id_matricula: idMatriculaCreada,
                id_estudiante,
                id_programa,
                total_creditos: totalCreditos,
                precio_total: Number(precioTotal.toFixed(2)),
                grupos_matriculados: idsGrupos,
                fecha_matricula: new Date().toISOString().split("T")[0]
            }
        });

    } catch (error: unknown) {

        // Revertir si algo falló
        if (connection) await connection.rollback();

        if (error instanceof Error) {
            console.error("Error al crear matrícula:", error.message);
            res.status(500).json({
                ok: false,
                mensaje: "Error interno al registrar la matrícula",
                detalle: error.message
            });
        } else {
            res.status(500).json({
                ok: false,
                mensaje: "Error inesperado al registrar la matrícula"
            });
        }

    } finally {

        // Siempre liberar la conexión al pool
        if (connection) connection.release();

    }
};


// ============================================================
// GET /matriculas/:id
// Obtener matrícula con su detalle completo
// ============================================================

export const obtenerMatricula = async (req: Request, res: Response): Promise<void> => {

    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
        res.status(400).json({ ok: false, mensaje: "ID de matrícula inválido" });
        return;
    }

    const pool = getConnection();

    try {

        // Cabecera de la matrícula
        const [matriculas] = await pool.query<RowDataPacket[]>(
            `SELECT
                m.id_matricula,
                m.fecha_matricula,
                m.total_creditos,
                m.precio_total,
                m.id_beca,
                u.nombres_usuario,
                u.apellidos_usuario,
                u.documento_usuario,
                p.nombre AS programa
             FROM matricula m
             INNER JOIN estudiante e  ON e.id_estudiante = m.id_estudiante
             INNER JOIN usuario u     ON u.id_usuario    = e.id_usuario
             INNER JOIN programa p    ON p.id_programa   = m.id_programa
             WHERE m.id_matricula = ?`,
            [id]
        );

        if (!matriculas.length) {
            res.status(404).json({ ok: false, mensaje: "Matrícula no encontrada" });
            return;
        }

        // Detalle: grupos/asignaturas inscritas
        const [detalles] = await pool.query<RowDataPacket[]>(
            `SELECT
                dm.id_detalle,
                dm.id_grupo,
                g.num_grupo,
                a.nombre  AS asignatura,
                a.creditos
             FROM detalle_matricula dm
             INNER JOIN grupo      g ON g.id_grupo     = dm.id_grupo
             INNER JOIN asignatura a ON a.id_asignatura = g.id_asignatura
             WHERE dm.id_matricula = ?`,
            [id]
        );

        res.status(200).json({
            ok: true,
            data: {
                ...matriculas[0],
                detalles
            }
        });

    } catch (error: unknown) {

        if (error instanceof Error) {
            console.error("Error al obtener matrícula:", error.message);
            res.status(500).json({ ok: false, mensaje: error.message });
        } else {
            res.status(500).json({ ok: false, mensaje: "Error inesperado" });
        }

    }
};