import { Router } from 'express'
import { getSummary } from '../controllers/summary.controller.js'

const router = Router()

router.get('/resumen', getSummary)

export default router