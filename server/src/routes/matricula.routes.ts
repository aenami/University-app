import { Router } from 'express'
import { getResumenMatriculaPQR } from '../controllers/matricula.controller.js'

const router = Router()

router.get('/resumen', getResumenMatriculaPQR)

export default router