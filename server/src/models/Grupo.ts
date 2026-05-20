
import { getConnection } from '../config/db.js';
import { RowDataPacket } from 'mysql2';

//  Definimos la interfaz para el tipado de los datos que devuelve la base de datos
export interface OfertaAcademicaRow extends RowDataPacket {
    id_grupo: number;
    numero_grupo: number;
    horario: string;
    aula: string;
    cupo_maximo: number;
    id_asignatura: number;
    nombre_asignatura: string;
    creditos: number;
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
                    g.numero_grupo,
                    g.horario,
                    g.aula,
                    g.cupo_maximo,
                    a.id_asignatura,
                    a.nombre_asignatura,
                    a.creditos_asignatura AS creditos
                FROM grupo g
                INNER JOIN asignatura a ON g.id_asignatura = a.id_asignatura
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