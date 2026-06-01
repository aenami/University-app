"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = __importDefault(require("./app.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = require("./config/db.js");
dotenv_1.default.config(); // Inicializamos variables de entorno en este archivo para todo el proyecto
const PORT = process.env.PORT;
// Funcion principal
const startServer = async () => {
    try {
        await (0, db_js_1.initializePool)();
        app_js_1.default.listen(PORT, () => {
            console.log(`Servidor escuchando por peticiones en el puerto ${PORT}`);
        });
    }
    catch (error) {
        console.log('Ocurrio un error al intentar levantar el servidor: ', error);
    }
};
startServer();
