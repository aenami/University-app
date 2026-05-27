import { Router } from 'express'
import attendanceController from '../controllers/attendance.controller.js'

const router = Router();

/**
 * Registrar asistencia
 */
router.post(
    '/',
    attendanceController.createAttendance
);

export default router;
