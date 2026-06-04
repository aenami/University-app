import express from 'express'
import { getStudentsByGroup } from '../controllers/estudiantes.controller.js'
import { authenticateUser } from '../middleware/auth.middleware.js'
import { authenticateRole } from '../middleware/roleAuth.middleware.js'

const router = express.Router()

/**
 * Rutas de Consulta de Estudiantes por Grupo (Protegida)
 * 
 * Esta ruta permite listar los estudiantes matriculados en un grupo específico.
 * Queda protegida de modo que los alumnos no puedan listar compañeros sin autorización.
 * Únicamente permitido para DOCENTE, COORDINADOR y ADMINISTRADOR.
 */
router.get('/:id_grupo/students', authenticateUser, authenticateRole("DOCENTE", "COORDINADOR", "ADMINISTRADOR"), getStudentsByGroup)

export default router
