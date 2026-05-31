"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const Corte = {
    /**
     * Obtiene todos los cortes académicos registrados.
     */
    async getAll() {
        try {
            const query = `SELECT * FROM corte ORDER BY fecha_inicio ASC`;
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query);
            return rows;
        }
        catch (error) {
            console.error('Error al obtener cortes:', error);
            throw error;
        }
    },
    /**
     * Obtiene un corte específico por ID.
     * @param id ID del corte
     */
    async getById(id) {
        try {
            const query = `SELECT * FROM corte WHERE id_corte = ?`;
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, [id]);
            return rows.length > 0 ? rows[0] : null;
        }
        catch (error) {
            console.error('Error al obtener corte por ID:', error);
            throw error;
        }
    },
    /**
     * Crea un nuevo corte académico.
     */
    async create(nombre_corte, porcentaje, fecha_inicio, fecha_fin) {
        try {
            const query = `
                INSERT INTO corte (nombre_corte, porcentaje, fecha_inicio, fecha_fin)
                VALUES (?, ?, ?, ?)
            `;
            const db = (0, db_js_1.getConnection)();
            const [result] = await db.query(query, [nombre_corte, porcentaje, fecha_inicio, fecha_fin]);
            return result.insertId;
        }
        catch (error) {
            console.error('Error al crear corte:', error);
            throw error;
        }
    },
    /**
     * Actualiza un corte académico.
     */
    async update(id, nombre_corte, porcentaje, fecha_inicio, fecha_fin) {
        try {
            const updates = [];
            const values = [];
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
            if (updates.length === 0)
                return false;
            values.push(id);
            const query = `UPDATE corte SET ${updates.join(', ')} WHERE id_corte = ?`;
            const db = (0, db_js_1.getConnection)();
            const [result] = await db.query(query, values);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error('Error al actualizar corte:', error);
            throw error;
        }
    },
    /**
     * Elimina un corte académico.
     */
    async delete(id) {
        try {
            const query = `DELETE FROM corte WHERE id_corte = ?`;
            const db = (0, db_js_1.getConnection)();
            const [result] = await db.query(query, [id]);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.error('Error al eliminar corte:', error);
            throw error;
        }
    }
};
exports.default = Corte;
