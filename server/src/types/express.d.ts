export {};

declare global {
    namespace Express {
        interface Request {
            // idUser queda disponible despues de pasar por el middleware de autenticacion.
            idUser?: number;
        }
    }
}
