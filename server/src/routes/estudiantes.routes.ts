import express from 'express'
import { getStudentsByGroup } from '../controllers/group.controller.js'

const router = express.Router()

/**
 * Ruta para obtener todos los estudiantes inscritos en un grupo mediante matrícula
 * GET /api/groups/:id_grupo/students
 */
router.get('/:id_grupo/students', getStudentsByGroup)

export default router
