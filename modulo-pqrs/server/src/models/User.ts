import { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { getConnection } from "../config/db.js";
import { compareHash } from "../services/passwordService.js";
import { type DataUserToken } from "../types/dataTypes.js";
import {
    managedUserRoles,
    type ManagedUser,
    type ManagedUserRole,
    type ManagedUserStatus,
    type UserGender,
} from "../types/userManagement.types.js";

interface PasswordUser extends RowDataPacket {
    password_hash: string;
}

interface UserDataTokenRow extends RowDataPacket {
    id_usuario: number;
    nombres_usuario: string;
    rol_usuario: string;
}

interface UserStateRow extends RowDataPacket {
    estado_usuario: string;
}

interface ManagedUserRow extends RowDataPacket {
    id_usuario: number;
    nombres_usuario: string;
    apellidos_usuario: string;
    email_usuario: string;
    documento_usuario: string;
    rol_usuario: ManagedUserRole;
    estado_usuario: ManagedUserStatus;
    genero_usuario: UserGender;
    fecha_nacimiento_usuario: Date | string;
    fecha_creacion_usuario: Date | string;
}

const formatDate = (value: Date | string) => {
    // Normalizamos las fechas para entregar siempre la misma forma al frontend.
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }

    return String(value).split("T")[0];
};

const mapManagedUser = (user: ManagedUserRow): ManagedUser => ({
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

type UserExecutor = PoolConnection;

// Definimos las operaciones que se reutilizan entre autenticacion y seguridad.
interface TypeUser {
    createUser: (
        name: string,
        lname: string,
        hashedPassword: string,
        email: string,
        birthDate: string,
        userGender: UserGender,
        userRol: "ESTUDIANTE" | ManagedUserRole,
        userID: string,
        executor?: UserExecutor
    ) => Promise<number>;
    existsUser: (email: string) => Promise<boolean>;
    existsDocument: (document: string) => Promise<boolean>;
    verifyLoginUser: (email: string, password: string) => Promise<boolean>;
    getIdUser: (email: string) => Promise<DataUserToken | undefined>;
    isActive: (email: string) => Promise<string | undefined>;
    getManagedUsers: (search?: string, role?: ManagedUserRole) => Promise<ManagedUser[]>;
    getManagedUserById: (userId: number) => Promise<ManagedUser | undefined>;
    updateManagedUserStatus: (
        userId: number,
        status: ManagedUserStatus,
        executor?: UserExecutor
    ) => Promise<boolean>;
}

const User: TypeUser = {
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

            const db = executor ?? getConnection();
            const [result] = await db.query<ResultSetHeader>(query, values);

            return result.insertId;
        } catch (error) {
            console.log("Error al insertar consulta de creacion de usuario en la db");
            throw error;
        }
    },

    async existsUser(email) {
        try {
            const query = "SELECT id_usuario FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = getConnection();
            const [rows] = await db.query<RowDataPacket[]>(query, values);

            return rows.length > 0;
        } catch (error) {
            console.log("Error al verificar el email que el usuario ingreso");
            throw error;
        }
    },

    async existsDocument(document) {
        try {
            const query = "SELECT id_usuario FROM usuario WHERE documento_usuario = ?";
            const values = [document];
            const db = getConnection();
            const [rows] = await db.query<RowDataPacket[]>(query, values);

            return rows.length > 0;
        } catch (error) {
            console.log("Error al verificar el documento que el usuario ingreso");
            throw error;
        }
    },

    async verifyLoginUser(email, password) {
        try {
            // Traemos el hash almacenado y lo comparamos con la clave enviada.
            const query = "SELECT password_hash FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = getConnection();
            const [rows] = await db.query<PasswordUser[]>(query, values);

            if (rows.length === 0) {
                return false;
            }

            return compareHash(password, rows[0].password_hash);
        } catch (error) {
            console.log("Error al verificar la contrasena ingresada");
            throw error;
        }
    },

    async getIdUser(email: string) {
        try {
            const query = "SELECT id_usuario, nombres_usuario, rol_usuario FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = getConnection();
            const [rows] = await db.query<UserDataTokenRow[]>(query, values);

            if (rows.length > 0) {
                return rows[0] as DataUserToken;
            }

            return undefined;
        } catch (error) {
            console.log("Error al obtener la informacion del usuario a partir de su email");
            throw error;
        }
    },

    async isActive(email: string) {
        try {
            const query = "SELECT estado_usuario FROM usuario WHERE email_usuario = ?";
            const values = [email];
            const db = getConnection();
            const [rows] = await db.query<UserStateRow[]>(query, values);

            if (rows.length === 0) {
                return undefined;
            }

            return rows[0].estado_usuario;
        } catch (error) {
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

            const values: Array<string> = [...managedUserRoles];

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

            const db = getConnection();
            const [rows] = await db.query<ManagedUserRow[]>(queryParts.join("\n"), values);

            return rows.map(mapManagedUser);
        } catch (error) {
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

            const values = [userId, ...managedUserRoles];
            const db = getConnection();
            const [rows] = await db.query<ManagedUserRow[]>(query, values);

            if (rows.length === 0) {
                return undefined;
            }

            return mapManagedUser(rows[0]);
        } catch (error) {
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

            const values = [status, userId, ...managedUserRoles];
            const db = executor ?? getConnection();
            const [result] = await db.query<ResultSetHeader>(query, values);

            return result.affectedRows > 0;
        } catch (error) {
            console.log("Error al actualizar el estado del usuario");
            throw error;
        }
    },
};

export default User;
