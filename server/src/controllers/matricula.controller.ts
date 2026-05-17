import { Request, Response } from 'express'
import { getConnection } from '../config/db.js'

export const getResumenMatriculaPQR = async (req: Request, res: Response) => {
    const db = getConnection()

    try {
        const [[matriculas]] = await db.query(`
            SELECT COUNT(*) as total FROM matricula
        `) as any

        const [[pqrPendientes]] = await db.query(`
            SELECT COUNT(*) as total FROM pqr WHERE estado_pqr = 'pendiente'
        `) as any

        const [[pqrCerradas]] = await db.query(`
            SELECT COUNT(*) as total FROM pqr WHERE estado_pqr = 'cerrada'
        `) as any

        res.status(200).json({
            ok: true,
            data: {
                matriculas_registradas: matriculas.total,
                pqr_pendientes: pqrPendientes.total,
                pqr_cerradas: pqrCerradas.total
            }
        })

    } catch (error) {
        console.error('Error al obtener resumen:', error)
        res.status(500).json({
            ok: false,
            message: 'Error interno al obtener el resumen'
        })
    }
}