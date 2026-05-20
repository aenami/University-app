import type { Request, Response } from 'express'
import Student from '../models/Student.js'

/**
 * Controlador para manejar peticiones relacionadas con Grupos.
 */
export const getStudentsByGroup = async (req: Request, res: Response) => {
    const { id_grupo } = req.params;

    // Validación del ID de grupo
    if (!id_grupo || isNaN(Number(id_grupo))) {
        return res.status(400).json({
            error: true,
            message: 'El ID del grupo proporcionado no es válido.'
        });
    }

    try {
        const students = await Student.getStudentsByGroupId(Number(id_grupo));
        
        return res.status(200).json({
            error: false,
            message: `Estudiantes del grupo ${id_grupo} obtenidos con éxito.`,
            data: students
        });
    } catch (error) {
        console.error('Error en getStudentsByGroup controller:', error);
        return res.status(500).json({
            error: true,
            message: 'Ocurrió un error interno en el servidor al intentar obtener la lista de estudiantes.'
        });
    }
}
