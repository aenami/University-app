import { ResultSetHeader, RowDataPacket } from "mysql2";
import type { PoolConnection } from "mysql2/promise";
import { getConnection } from "../config/db.js";
import type {
    CreatePqrInput,
    CreatePqrResponseInput,
    PqrRequestType,
    PqrResponse,
    PqrStatus,
    PqrTicket,
} from "../types/pqr.types.js";

type PqrExecutor = PoolConnection;

interface PqrRow extends RowDataPacket {
    id_pqr: number;
    titulo_pqr: string;
    descripcion_pqr: string;
    estado_pqr: PqrStatus;
    fecha_creacion_pqr: Date | string;
    id_usuario: number;
    nombres_usuario: string;
    apellidos_usuario: string;
    email_usuario: string;
}

interface PqrResponseRow extends RowDataPacket {
    id_respuesta: number;
    titulo_pqr_respuesta: string;
    descripcion_pqr_respuesta: string;
    fecha_creacion_pqr_respuesta: Date | string;
    id_administrador: number;
    id_pqr: number;
}

interface AdminRow extends RowDataPacket {
    id_administrador: number;
}

const formatDate = (value: Date | string) => {
    if (value instanceof Date) {
        return value.toISOString().split("T")[0];
    }

    return String(value).split("T")[0];
};

const formatTicketCode = (id: number) => `#PQR-${String(id).padStart(4, "0")}`;

const parseStoredSubject = (title: string): { type: PqrRequestType; subject: string } => {
    const match = title.match(/^\[(PETICION|QUEJA|RECLAMO|PREGUNTA|SOPORTE)\]\s*(.*)$/);

    if (!match) {
        return {
            type: "PREGUNTA",
            subject: title,
        };
    }

    return {
        type: match[1] as PqrRequestType,
        subject: match[2],
    };
};

const mapTicket = (pqr: PqrRow, responses: PqrResponse[] = []): PqrTicket => {
    const parsedTitle = parseStoredSubject(pqr.titulo_pqr);

    return {
        id: pqr.id_pqr,
        code: formatTicketCode(pqr.id_pqr),
        type: parsedTitle.type,
        subject: parsedTitle.subject,
        description: pqr.descripcion_pqr,
        status: pqr.estado_pqr,
        createdAt: formatDate(pqr.fecha_creacion_pqr),
        requester: {
            id: pqr.id_usuario,
            names: pqr.nombres_usuario,
            lastNames: pqr.apellidos_usuario,
            email: pqr.email_usuario,
        },
        responses,
    };
};

interface PqrModel {
    create: (input: CreatePqrInput, userId: number, executor?: PqrExecutor) => Promise<number>;
    list: (options: { userId?: number; includeAll?: boolean }) => Promise<PqrTicket[]>;
    getById: (pqrId: number) => Promise<PqrTicket | undefined>;
    getAdminIdByUserId: (userId: number) => Promise<number | undefined>;
    createResponse: (
        pqrId: number,
        input: CreatePqrResponseInput,
        adminId: number,
        executor?: PqrExecutor
    ) => Promise<number>;
    close: (pqrId: number, executor?: PqrExecutor) => Promise<boolean>;
}

const Pqr: PqrModel = {
    async create(input, userId, executor) {
        const db = executor ?? getConnection();
        const storedTitle = `[${input.tipo}] ${input.asunto}`;
        const [result] = await db.query<ResultSetHeader>(
            `
                INSERT INTO pqr (titulo_pqr, descripcion_pqr, estado_pqr, id_usuario)
                VALUES (?, ?, 'pendiente', ?)
            `,
            [storedTitle, input.descripcion, userId]
        );

        return result.insertId;
    },

    async list({ userId, includeAll }) {
        const db = getConnection();
        const values: number[] = [];
        const where = includeAll ? "" : "WHERE p.id_usuario = ?";

        if (!includeAll && userId) {
            values.push(userId);
        }

        const [rows] = await db.query<PqrRow[]>(
            `
                SELECT
                    p.id_pqr,
                    p.titulo_pqr,
                    p.descripcion_pqr,
                    p.estado_pqr,
                    p.fecha_creacion_pqr,
                    u.id_usuario,
                    u.nombres_usuario,
                    u.apellidos_usuario,
                    u.email_usuario
                FROM pqr p
                INNER JOIN usuario u ON u.id_usuario = p.id_usuario
                ${where}
                ORDER BY p.fecha_creacion_pqr DESC, p.id_pqr DESC
            `,
            values
        );

        return rows.map((row) => mapTicket(row));
    },

    async getById(pqrId) {
        const db = getConnection();
        const [rows] = await db.query<PqrRow[]>(
            `
                SELECT
                    p.id_pqr,
                    p.titulo_pqr,
                    p.descripcion_pqr,
                    p.estado_pqr,
                    p.fecha_creacion_pqr,
                    u.id_usuario,
                    u.nombres_usuario,
                    u.apellidos_usuario,
                    u.email_usuario
                FROM pqr p
                INNER JOIN usuario u ON u.id_usuario = p.id_usuario
                WHERE p.id_pqr = ?
                LIMIT 1
            `,
            [pqrId]
        );

        if (rows.length === 0) {
            return undefined;
        }

        const [responseRows] = await db.query<PqrResponseRow[]>(
            `
                SELECT
                    id_respuesta,
                    titulo_pqr_respuesta,
                    descripcion_pqr_respuesta,
                    fecha_creacion_pqr_respuesta,
                    id_administrador,
                    id_pqr
                FROM pqr_respuesta
                WHERE id_pqr = ?
                ORDER BY fecha_creacion_pqr_respuesta ASC, id_respuesta ASC
            `,
            [pqrId]
        );

        const responses = responseRows.map((response) => ({
            id: response.id_respuesta,
            title: response.titulo_pqr_respuesta,
            description: response.descripcion_pqr_respuesta,
            createdAt: formatDate(response.fecha_creacion_pqr_respuesta),
            adminId: response.id_administrador,
        }));

        return mapTicket(rows[0], responses);
    },

    async getAdminIdByUserId(userId) {
        const db = getConnection();
        const [rows] = await db.query<AdminRow[]>(
            "SELECT id_administrador FROM administrador WHERE id_usuario = ? LIMIT 1",
            [userId]
        );

        return rows[0]?.id_administrador;
    },

    async createResponse(pqrId, input, adminId, executor) {
        const db = executor ?? getConnection();
        const [result] = await db.query<ResultSetHeader>(
            `
                INSERT INTO pqr_respuesta (
                    titulo_pqr_respuesta,
                    descripcion_pqr_respuesta,
                    id_administrador,
                    id_pqr
                )
                VALUES (?, ?, ?, ?)
            `,
            [input.titulo, input.descripcion, adminId, pqrId]
        );

        return result.insertId;
    },

    async close(pqrId, executor) {
        const db = executor ?? getConnection();
        const [result] = await db.query<ResultSetHeader>(
            "UPDATE pqr SET estado_pqr = 'cerrada' WHERE id_pqr = ?",
            [pqrId]
        );

        return result.affectedRows > 0;
    },
};

export default Pqr;
