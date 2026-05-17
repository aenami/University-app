import { Request, Response } from 'express'
import { getConnection } from '../config/db.js'
import { getSummaryData } from '../services/dashboard.service.js'

export const getIndicadores = async (req: Request, res: Response) => {
    const db = getConnection()

    try {
        const [[usuariosActivos]] = await db.query(
            `SELECT COUNT(*) as total FROM usuario WHERE estado = 'ACTIVO'`
        ) as any

        const [[usuariosInactivos]] = await db.query(
            `SELECT COUNT(*) as total FROM usuario WHERE estado = 'INACTIVO'`
        ) as any

        const [[grupos]] = await db.query(
            `SELECT COUNT(*) as total, COALESCE(SUM(cupo_maximo), 0) as cupos_totales FROM grupo`
        ) as any

        const [[matriculas]] = await db.query(
            `SELECT COUNT(*) as total FROM matricula`
        ) as any

        const [[pqrPendientes]] = await db.query(
            `SELECT COUNT(*) as total FROM pqr WHERE estado_pqr = 'pendiente'`
        ) as any

        const [[pqrCerradas]] = await db.query(
            `SELECT COUNT(*) as total FROM pqr WHERE estado_pqr = 'cerrada'`
        ) as any

        const detalle = await getSummaryData()

        res.json({
            usuarios_activos: usuariosActivos.total,
            usuarios_inactivos: usuariosInactivos.total,
            grupos_creados: grupos.total,
            cupos_totales: grupos.cupos_totales,
            matriculas_registradas: matriculas.total,
            pqr_pendientes: pqrPendientes.total,
            pqr_cerradas: pqrCerradas.total,
            detalle_usuarios: detalle.usuarios,
            detalle_grupos: detalle.grupos
        })

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener indicadores' })
    }
}