"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultarOfertaDisponible = void 0;
const Grupo_1 = __importDefault(require("../models/Grupo"));
const consultarOfertaDisponible = async (req, res) => {
    try {
        const ofertaAcademica = await Grupo_1.default.obtenerOfertaAcademica();
        return res.status(200).json({
            error: false,
            message: 'Oferta académica disponible obtenida con éxito ',
            data: ofertaAcademica
        });
    }
    catch (error) {
        // Si la consulta SQL o la conexión a la base de datos falla, se captura aquí
        console.error("Error en consultarOfertaDisponible:", error);
        return res.status(500).json({
            error: true,
            message: 'Error interno en el servidor al procesar la oferta académica',
            details: error.message
        });
    }
};
exports.consultarOfertaDisponible = consultarOfertaDisponible;
