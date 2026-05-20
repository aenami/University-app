import type { Request, Response } from 'express';
// Cuando implementemos la conexión a la base de datos, la usaremos aquí:
// import pool from '../config/db.js'; 

export const consultarOfertaDisponible = async (req: Request, res: Response) => {
    try {
        
        // Esta es la estructura de consulta relacional que pide tu HU:
        // Une asignaturas y grupos para jalar créditos, horarios, cupos máximos, etc.
        const querySQL = `
            SELECT 
                g.id_grupo,
                g.numero_grupo,
                g.horario,
                g.aula,
                g.cupo_maximo,
                a.id_asignatura,
                a.nombre AS nombre_asignatura,
                a.creditos
            FROM grupo g
            INNER JOIN asignatura a ON g.id_asignatura = a.id_asignatura;
        `;

        // Simulación de los datos estructurados que devolverá la base de datos
        // para que el código compile y tu equipo pueda avanzar sin bloquearse.
        const ofertaAcademica: any[] = [
            {
                id_grupo: 1,
                numero_grupo: 101,
                horario: "Lunes y Miércoles 08:00 - 10:00",
                aula: "Lab 3",
                cupo_maximo: 30,
                id_asignatura: 5,
                nombre_asignatura: "Programación Web",
                creditos: 4
            },
            {
                id_grupo: 2,
                numero_grupo: 102,
                horario: "Martes y Jueves 10:00 - 12:00",
                aula: "Aula 204",
                cupo_maximo: 25,
                id_asignatura: 8,
                nombre_asignatura: "Bases de Datos",
                creditos: 3
            }
        ];

        4
        return res.status(200).json({
            error: false,
            message: 'Oferta académica disponible obtenida con éxito (HU-03.1)',
            data: ofertaAcademica
        });

    } catch (error: any) {
        return res.status(500).json({
            error: true,
            message: 'Error interno en el servidor al procesar la oferta académica',
            details: error.message
        });
    }
};