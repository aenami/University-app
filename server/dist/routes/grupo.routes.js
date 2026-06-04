"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Importamos metodos de nuestro controlador
const grupo_controller_1 = require("../controllers/grupo.controller");
// Importamos el metodo para validar la prematricula
const matricula_controllers_1 = require("../controllers/matricula.controllers");
const router = express_1.default.Router();
// Ruta de consulta-grupo
router.get('/', grupo_controller_1.consultarOfertaDisponible);
// Ruta para validar la prematricula
router.post('/validar-prematricula', matricula_controllers_1.validarPrematricula);
exports.default = router;
