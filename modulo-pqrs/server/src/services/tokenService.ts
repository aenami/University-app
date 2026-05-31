import jwt from "jsonwebtoken"

export type AuthTokenPayload = {
    id: number;
    rol: string;
    iat?: number;
    exp?: number;
}

export const generateToken = (idUser: number, rolUser: string) => {
    // Payload base que viaja dentro del JWT para identificar al usuario autenticado.
    const payload: AuthTokenPayload = {
        id: idUser,
        rol: rolUser,
    };

    const token = jwt.sign(
        payload,
        process.env.JWT_SECRET!, // Le decimos a TypeScript que esta variable siempre debe existir.
        { expiresIn: '1h' }
    )
    return token
}

export const verifyToken = (token: string) => {
    // Verificamos firma y expiracion del token antes de permitir acceso a rutas privadas.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload

    if (typeof decodedToken !== "object" || typeof decodedToken.id !== "number") {
        throw new Error("Token invalido")
    }

    return decodedToken
}
