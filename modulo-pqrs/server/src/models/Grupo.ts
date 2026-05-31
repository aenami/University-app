
import { getConnection } from '../config/db.js';
import { RowDataPacket } from 'mysql2';

//  Definimos la interfaz para el tipado de los datos que devuelve la base de datos
export interface OfertaAcademicaRow extends RowDataPacket {
    id_grupo: number;
    num_grupo: number;
    cupo_maximo: number;

    nombre_asignatura: string;
    creditos: number;

    cupos_ocupados: number;
    cupos_disponibles: number;
}

//Definimos las operaciones lógicas que se pueden hacer sobre la entidad Grupo
interface typeGrupo {
    obtenerOfertaAcademica: () => Promise<OfertaAcademicaRow[]>;
}

const Grupo: typeGrupo = {
    
    async obtenerOfertaAcademica() {
        try {
          
            const query: string = `
                SELECT 
                    g.id_grupo,
                    g.num_grupo,
                    g.cupo_maximo,

                    a.nombre AS nombre_asignatura,
                    a.creditos,

                COUNT(dm.id_detalle) AS cupos_ocupados,

                (g.cupo_maximo - COUNT(dm.id_detalle))
                AS cupos_disponibles

                    a.id_asignatura,
                    a.nombre,
                    a.creditos
                FROM grupo g

                INNER JOIN asignatura a
                ON g.id_asignatura = a.id_asignatura

                LEFT JOIN detalle_matricula dm
                ON g.id_grupo = dm.id_grupo

                GROUP BY
                g.id_grupo,
                g.num_grupo,
                g.cupo_maximo,
                a.nombre,
                a.creditos

                HAVING cupos_disponibles > 0
            `;

            // Obtenemos la conexión  del proyecto
            const db = getConnection();

            
            const [rows] = await db.query<OfertaAcademicaRow[]>(query);

            return rows;

        } catch (error) {
            console.log("Error al consultar la oferta académica en la entidad Grupo");
            throw error;
        }
    }
};

export default Grupo;