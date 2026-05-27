"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_js_1 = require("../config/db.js");
const passwordService_js_1 = require("../services/passwordService.js");
const userManagement_types_js_1 = require("../types/userManagement.types.js");
const formatDate = (value) => {
    // Normalizamos las fechas para entregar siempre la misma forma al frontend.
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }
    return String(value).split("T")[0];
};
const mapManagedUser = (user) => ({
    id: user.id_usuario,
    names: user.nombres_usuario,
    lastNames: user.apellidos_usuario,
    email: user.email_usuario,
    document: user.documento_usuario,
    role: user.rol_usuario,
    status: user.estado_usuario,
    gender: user.genero_usuario,
    birthDate: formatDate(user.fecha_nacimiento_usuario),
    createdAt: formatDate(user.fecha_creacion_usuario),
});
const User = {
    async createUser(name, lname, hashedPassword, email, birthDate, userGender, userRol, userID, executor) {
        try {
            // Insertamos sobre la tabla base, que es la fuente para el modulo de seguridad.
            const query = `
                INSERT INTO usuario (
                    nombres_usuario,
                    apellidos_usuario,
                    password_hash,
                    email_usuario,
                    fecha_creacion_usuario,
                    estado_usuario,
                    fecha_nacimiento_usuario,
                    genero_usuario,
                    rol_usuario,
                    documento_usuario
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [
                name,
                lname,
                hashedPassword,
                email,
                new Date(),
                "ACTIVO",
                birthDate,
                userGender,
                userRol,
                userID,
            ];
            const db = executor ?? (0, db_js_1.getConnection)();
            const [result] = await db.query(query, values);
            return result.insertId;
        }
        catch (error) {
            console.log("Error al insertar consulta de creacion de usuario en la db");
            throw error;
        }
    },
    async existsUser(email) {
        try {
            const query = "SELECT id_usuario FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, values);
            return rows.length > 0;
        }
        catch (error) {
            console.log("Error al verificar el email que el usuario ingreso");
            throw error;
        }
    },
    async existsDocument(document) {
        try {
            const query = "SELECT id_usuario FROM usuario WHERE documento_usuario = ?";
            const values = [document];
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, values);
            return rows.length > 0;
        }
        catch (error) {
            console.log("Error al verificar el documento que el usuario ingreso");
            throw error;
        }
    },
    async verifyLoginUser(email, password) {
        try {
            // Traemos el hash almacenado y lo comparamos con la clave enviada.
            const query = "SELECT password_hash FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, values);
            if (rows.length === 0) {
                return false;
            }
            return (0, passwordService_js_1.compareHash)(password, rows[0].password_hash);
        }
        catch (error) {
            console.log("Error al verificar la contrasena ingresada");
            throw error;
        }
    },
    async getIdUser(email) {
        try {
            const query = "SELECT id_usuario, nombres_usuario, rol_usuario FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, values);
            if (rows.length > 0) {
                return rows[0];
            }
            return undefined;
        }
        catch (error) {
            console.log("Error al obtener la informacion del usuario a partir de su email");
            throw error;
        }
    },
    async isActive(email) {
        try {
            const query = "SELECT estado_usuario FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, values);
            if (rows.length === 0) {
                return undefined;
            }
            return rows[0].estado_usuario;
        }
        catch (error) {
            console.log("Error al verificar el estado del Usuario");
            throw error;
        }
    },
    async getManagedUsers(search, role) {
        try {
            // El listado solo expone usuarios de los roles visibles en la seccion de seguridad.
            const queryParts = [
                `
                    SELECT
                        id_usuario,
                        nombres_usuario,
                        apellidos_usuario,
                        email_usuario,
                        documento_usuario,
                        rol_usuario,
                        estado_usuario,
                        genero_usuario,
                        fecha_nacimiento_usuario,
                        fecha_creacion_usuario
                    FROM usuario
                    WHERE rol_usuario IN (?, ?, ?)
                `,
            ];
            const values = [...userManagement_types_js_1.managedUserRoles];
            if (role) {
                queryParts.push("AND rol_usuario = ?");
                values.push(role);
            }
            if (search?.trim()) {
                queryParts.push(`
                    AND (
                        CONCAT(nombres_usuario, ' ', apellidos_usuario) LIKE ?
                        OR email_usuario LIKE ?
                        OR documento_usuario LIKE ?
                    )
                `);
                const searchTerm = `%${search.trim()}%`;
                values.push(searchTerm, searchTerm, searchTerm);
            }
            queryParts.push("ORDER BY fecha_creacion_usuario DESC, id_usuario DESC");
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(queryParts.join("\n"), values);
            return rows.map(mapManagedUser);
        }
        catch (error) {
            console.log("Error al consultar los usuarios del modulo de seguridad");
            throw error;
        }
    },
    async getManagedUserById(userId) {
        try {
            const query = `
                SELECT
                    id_usuario,
                    nombres_usuario,
                    apellidos_usuario,
                    email_usuario,
                    documento_usuario,
                    rol_usuario,
                    estado_usuario,
                    genero_usuario,
                    fecha_nacimiento_usuario,
                    fecha_creacion_usuario
                FROM usuario
                WHERE id_usuario = ?
                AND rol_usuario IN (?, ?, ?)
            `;
            const values = [userId, ...userManagement_types_js_1.managedUserRoles];
            const db = (0, db_js_1.getConnection)();
            const [rows] = await db.query(query, values);
            if (rows.length === 0) {
                return undefined;
            }
            return mapManagedUser(rows[0]);
        }
        catch (error) {
            console.log("Error al consultar el usuario solicitado");
            throw error;
        }
    },
    async updateManagedUserStatus(userId, status, executor) {
        try {
            const query = `
                UPDATE usuario
                SET estado_usuario = ?
                WHERE id_usuario = ?
                AND rol_usuario IN (?, ?, ?)
            `;
            const values = [status, userId, ...userManagement_types_js_1.managedUserRoles];
            const db = executor ?? (0, db_js_1.getConnection)();
            const [result] = await db.query(query, values);
            return result.affectedRows > 0;
        }
        catch (error) {
            console.log("Error al actualizar el estado del usuario");
            throw error;
        }
    },
};
exports.default = User;
