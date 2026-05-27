import { Request, Response } from 'express'
import Attendance from '../models/Attendance.js'

const attendanceController = {

    async createAttendance(req: Request, res: Response) {

        try {

            const {
                id_estudiante,
                id_grupo,
                estado,
                observacion
            } = req.body;

            const result = await Attendance.createAttendance(
                id_estudiante,
                id_grupo,
                estado,
                observacion
            );

            res.status(201).json({
                message: 'Asistencia registrada correctamente',
                result
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                message: 'Error al registrar asistencia'
            });
        }
    }
}

export default attendanceController;
