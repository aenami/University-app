export const pqrRequestTypes = ["PETICION", "QUEJA", "RECLAMO", "PREGUNTA", "SOPORTE"] as const;

export const pqrStatuses = ["pendiente", "cerrada"] as const;

export type PqrRequestType = typeof pqrRequestTypes[number];
export type PqrStatus = typeof pqrStatuses[number];

export interface CreatePqrInput {
    tipo: PqrRequestType;
    asunto: string;
    descripcion: string;
}

export interface CreatePqrResponseInput {
    titulo: string;
    descripcion: string;
}

export interface PqrResponse {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    adminId: number;
}

export interface PqrTicket {
    id: number;
    code: string;
    type: PqrRequestType;
    subject: string;
    description: string;
    status: PqrStatus;
    createdAt: string;
    requester: {
        id: number;
        names: string;
        lastNames: string;
        email: string;
    };
    responses: PqrResponse[];
}
