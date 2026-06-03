"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const corte_controller_js_1 = require("../controllers/corte.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const roleAuth_middleware_js_1 = require("../middleware/roleAuth.middleware.js");
const router = express_1.default.Router();
/**
 * Rutas de Cortes Evaluativos
 *
 * Los GET para ver cortes pueden ser consultados libremente por alumnos o docentes.
 * Los métodos que alteran el corte evaluativo quedan estrictamente protegidos para ADMINISTRADOR.
 */
router.get('/', corte_controller_js_1.getAllCortes);
router.get('/:id_corte', corte_controller_js_1.getCorteById);
// Proteger operaciones de escritura
router.use(auth_middleware_js_1.authenticateUser);
router.use((0, roleAuth_middleware_js_1.authenticateRole)("ADMINISTRADOR"));
router.post('/', corte_controller_js_1.createCorte);
router.put('/:id_corte', corte_controller_js_1.updateCorte);
router.delete('/:id_corte', corte_controller_js_1.deleteCorte);
exports.default = router;
