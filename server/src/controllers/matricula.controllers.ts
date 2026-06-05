import type { Request, Response } from 'express';
import { getConnection } from '../config/db.js';
import { validarCoherenciaPrematricula } from '../services/validacionAcademica.service.js';

export const validarPrematricula = async (req: Request, res: Response) => {

    try {

        const { grupos, idEstudiante, id_estudiante } = req.body;
        const idEstudianteValidacion = Number(idEstudiante ?? id_estudiante);

        const db = getConnection();

        if (!Array.isArray(grupos) || grupos.length === 0) {
            return res.status(400).json({
                error: true,
                message: 'Debes seleccionar al menos un grupo'
            });
        }

        // =========================================
        // VALIDAR DUPLICIDAD DE ASIGNATURAS
        // =========================================

        const asignaturas = new Set();

        for (const idGrupo of grupos) {

            const [rows]: any = await db.query(`
                SELECT id_asignatura
                FROM grupo
                WHERE id_grupo = ?
            `, [idGrupo]);

            if (!rows.length) {
                return res.status(404).json({
                    error: true,
                    message: `El grupo ${idGrupo} no existe`
                });
            }

            const idAsignatura = rows[0].id_asignatura;

            if (asignaturas.has(idAsignatura)) {

                return res.status(400).json({
                    error: true,
                    message: 'No puedes seleccionar dos grupos de la misma asignatura'
                });
            }

            asignaturas.add(idAsignatura);
        }

        if (Number.isInteger(idEstudianteValidacion) && idEstudianteValidacion > 0) {
            const validacionAcademica = await validarCoherenciaPrematricula(idEstudianteValidacion, grupos);

            if (!validacionAcademica.valido) {
                return res.status(400).json({
                    error: true,
                    message: validacionAcademica.mensaje,
                    faltantes: validacionAcademica.faltantes ?? []
                });
            }
        }

        // =========================================
        // VALIDAR CUPOS
        // =========================================

        for (const idGrupo of grupos) {

            const [rows]: any = await db.query(`
                SELECT 
                    g.cupo_maximo,
                    COUNT(dm.id_detalle) AS ocupados
                FROM grupo g
                LEFT JOIN detalle_matricula dm
                    ON g.id_grupo = dm.id_grupo
                WHERE g.id_grupo = ?
                GROUP BY g.id_grupo
            `, [idGrupo]);

            const grupo = rows[0];

            if (!grupo) {
                return res.status(404).json({
                    error: true,
                    message: `El grupo ${idGrupo} no existe`
                });
            }

            if (grupo.ocupados >= grupo.cupo_maximo) {

                return res.status(400).json({
                    error: true,
                    message: `El grupo ${idGrupo} no tiene cupos disponibles`
                });
            }
        }

        return res.status(200).json({
            error: false,
            message: 'Validaciones de prematrícula correctas'
        });

    } catch (error: any) {

        console.error(error);

        return res.status(500).json({
            error: true,
            message: 'Error interno del servidor'
        });
    }
};
