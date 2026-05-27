"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const corte_controller_js_1 = require("../controllers/corte.controller.js");
const router = express_1.default.Router();
// Obtener todos los cortes
router.get('/', corte_controller_js_1.getAllCortes);
// Obtener un corte específico por ID
router.get('/:id_corte', corte_controller_js_1.getCorteById);
// Crear un nuevo corte
router.post('/', corte_controller_js_1.createCorte);
// Actualizar un corte
router.put('/:id_corte', corte_controller_js_1.updateCorte);
// Eliminar un corte
router.delete('/:id_corte', corte_controller_js_1.deleteCorte);
exports.default = router;
