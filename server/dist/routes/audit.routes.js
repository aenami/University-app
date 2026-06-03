"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const audit_controller_js_1 = require("../controllers/audit.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const roleAuth_middleware_js_1 = require("../middleware/roleAuth.middleware.js");
const router = express_1.default.Router();
/**
 * Rutas de Auditoría
 *
 * Este módulo contiene las rutas para consultar el registro de logs de auditoría.
 * Queda protegido de modo que solo usuarios autenticados con rol ADMINISTRADOR puedan ingresar.
 */
router.get("/", auth_middleware_js_1.authenticateUser, (0, roleAuth_middleware_js_1.authenticateRole)("ADMINISTRADOR"), audit_controller_js_1.getAuditLogs);
exports.default = router;
