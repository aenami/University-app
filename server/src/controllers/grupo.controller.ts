import type { Request, Response } from 'express';

import Grupo from '../models/Grupo'; 

export const consultarOfertaDisponible = async (req: Request, res: Response) => {
    try {
    
        const ofertaAcademica = await Grupo.obtenerOfertaAcademica();

     
        return res.status(200).json({
            error: false,
            message: 'Oferta académica disponible obtenida con éxito ',
            data: ofertaAcademica
        });

    } catch (error: any) {
        // Si la consulta SQL o la conexión a la base de datos falla, se captura aquí
        console.error("Error en consultarOfertaDisponible:", error);
        return res.status(500).json({
            error: true,
            message: 'Error interno en el servidor al procesar la oferta académica',
            details: error.message
        });
    }
};