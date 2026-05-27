"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (idUser, rolUser) => {
    // Payload base que viaja dentro del JWT para identificar al usuario autenticado.
    const payload = {
        id: idUser,
        rol: rolUser,
    };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, // Le decimos a TypeScript que esta variable siempre debe existir.
    { expiresIn: '1h' });
    return token;
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    // Verificamos firma y expiracion del token antes de permitir acceso a rutas privadas.
    const decodedToken = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    if (typeof decodedToken !== "object" || typeof decodedToken.id !== "number") {
        throw new Error("Token invalido");
    }
    return decodedToken;
};
exports.verifyToken = verifyToken;
