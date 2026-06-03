import express from 'express'
import {
    getAllCortes,
    getCorteById,
    createCorte,
    updateCorte,
    deleteCorte
} from '../controllers/corte.controller.js'
import { authenticateUser } from '../middleware/auth.middleware.js'
import { authenticateRole } from '../middleware/roleAuth.middleware.js'

const router = express.Router()

/**
 * Rutas de Cortes Evaluativos
 * 
 * Los GET para ver cortes pueden ser consultados libremente por alumnos o docentes.
 * Los métodos que alteran el corte evaluativo quedan estrictamente protegidos para ADMINISTRADOR.
 */
router.get('/', getAllCortes)
router.get('/:id_corte', getCorteById)

// Proteger operaciones de escritura
router.use(authenticateUser);
router.use(authenticateRole("ADMINISTRADOR"));

router.post('/', createCorte)
router.put('/:id_corte', updateCorte)
router.delete('/:id_corte', deleteCorte)

export default router
