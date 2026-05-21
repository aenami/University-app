import { getConnection } from '../config/db.js'
import { RowDataPacket } from 'mysql2'

export interface CorteRow extends RowDataPacket {
    id_corte: number;
    nombre_corte: string;
    porcentaje: number;
    fecha_inicio: Date;
    fecha_fin: Date;
}

const Corte = {
    /**
     * Obtiene todos los cortes académicos registrados.
     */
    async getAll(): Promise<CorteRow[]> {
        try {
            const query = `SELECT * FROM corte ORDER BY fecha_inicio ASC`;

            const db = getConnection();
            const [rows] = await db.query<CorteRow[]>(query);
            return rows;
        } catch (error) {
            console.error('Error al obtener cortes:', error);
            throw error;
        }
    },

    /**
     * Obtiene un corte específico por ID.
     * @param id ID del corte
     */
    async getById(id: number): Promise<CorteRow | null> {
        try {
            const query = `SELECT * FROM corte WHERE id_corte = ?`;

            const db = getConnection();
            const [rows] = await db.query<CorteRow[]>(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Error al obtener corte por ID:', error);
            throw error;
        }
    },

    /**
     * Crea un nuevo corte académico.
     */
    async create(nombre_corte: string, porcentaje: number, fecha_inicio: string, fecha_fin: string): Promise<number> {
        try {
            const query = `
                INSERT INTO corte (nombre_corte, porcentaje, fecha_inicio, fecha_fin)
                VALUES (?, ?, ?, ?)
            `;

            const db = getConnection();
            const [result] = await db.query(query, [nombre_corte, porcentaje, fecha_inicio, fecha_fin]);
            return (result as any).insertId;
        } catch (error) {
            console.error('Error al crear corte:', error);
            throw error;
        }
    },

    /**
     * Actualiza un corte académico.
     */
    async update(id: number, nombre_corte?: string, porcentaje?: number, fecha_inicio?: string, fecha_fin?: string): Promise<boolean> {
        try {
            const updates: string[] = [];
            const values: any[] = [];

            if (nombre_corte !== undefined) {
                updates.push('nombre_corte = ?');
                values.push(nombre_corte);
            }
            if (porcentaje !== undefined) {
                updates.push('porcentaje = ?');
                values.push(porcentaje);
            }
            if (fecha_inicio !== undefined) {
                updates.push('fecha_inicio = ?');
                values.push(fecha_inicio);
            }
            if (fecha_fin !== undefined) {
                updates.push('fecha_fin = ?');
                values.push(fecha_fin);
            }

            if (updates.length === 0) return false;

            values.push(id);
            const query = `UPDATE corte SET ${updates.join(', ')} WHERE id_corte = ?`;

            const db = getConnection();
            const [result] = await db.query(query, values);
            return (result as any).affectedRows > 0;
        } catch (error) {
            console.error('Error al actualizar corte:', error);
            throw error;
        }
    },

    /**
     * Elimina un corte académico.
     */
    async delete(id: number): Promise<boolean> {
        try {
            const query = `DELETE FROM corte WHERE id_corte = ?`;

            const db = getConnection();
            const [result] = await db.query(query, [id]);
            return (result as any).affectedRows > 0;
        } catch (error) {
            console.error('Error al eliminar corte:', error);
            throw error;
        }
    }
}

export default Corte;
