"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConnection = exports.initializePool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
// Variable que contendrá el pool de conexiones
let pool;
// Función que se ejecutará al levantar el servidor
const initializePool = async () => {
    // Creamos el pool de conexiones
    pool = promise_1.default.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    // Verificamos la conexión
    try {
        // Obtenemos una conexión del pool
        const connection = await pool.getConnection();
        console.log("Conexión realizada con éxito");
        // Liberamos la conexión
        connection.release();
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error al intentar crear una conexión:", error.message);
            process.exit(1);
        }
        else {
            console.log("Ocurrió un error inesperado al crear el pool hacia la DB");
        }
    }
};
exports.initializePool = initializePool;
const getConnection = () => {
    if (!pool) {
        throw new Error("El pool de conexiones no ha sido inicializado");
    }
    return pool;
};
exports.getConnection = getConnection;
