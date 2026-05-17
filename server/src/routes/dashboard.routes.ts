import { Router } from 'express'
import { getIndicadores } from '../controllers/dashboard.controller.js'
import { getSummary } from '../controllers/summary.controller.js'

const router = Router()

router.get('/indicadores', getIndicadores)
router.get('/resumen', getSummary)

export default router