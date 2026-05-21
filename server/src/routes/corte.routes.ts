import express from 'express'
import {
    getAllCortes,
    getCorteById,
    createCorte,
    updateCorte,
    deleteCorte
} from '../controllers/corte.controller.js'

const router = express.Router()

// Obtener todos los cortes
router.get('/', getAllCortes)

// Obtener un corte específico por ID
router.get('/:id_corte', getCorteById)

// Crear un nuevo corte
router.post('/', createCorte)

// Actualizar un corte
router.put('/:id_corte', updateCorte)

// Eliminar un corte
router.delete('/:id_corte', deleteCorte)

export default router
