"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareHash = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
// Definimos el tiempo que tardara en devolver el hash la funcion
const SALT_ROUNDS = 12;
const hashPassword = async (password) => {
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        return hashedPassword;
    }
    catch (error) {
        console.log('Error al crear el hash de la contraseña');
        throw error;
    }
};
exports.hashPassword = hashPassword;
const compareHash = async (password, hashedPassword) => {
    try {
        const isMatch = await bcrypt_1.default.compare(password, hashedPassword);
        return isMatch;
    }
    catch (error) {
        console.log('Error al comparar el hash de la contraseña ingresada');
        throw error;
    }
};
exports.compareHash = compareHash;
