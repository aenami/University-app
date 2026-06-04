"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ofertaAcademica_controller_js_1 = require("../controllers/ofertaAcademica.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const roleAuth_middleware_js_1 = require("../middleware/roleAuth.middleware.js");
const router = express_1.default.Router();
/**
 * Rutas de Consulta de Oferta Académica (Públicas/Autenticados)
 *
 * Los estudiantes pueden acceder a estas rutas para ver la oferta disponible
 * al momento de realizar su selección académica.
 */
router.get("/programas", ofertaAcademica_controller_js_1.consultarProgramas);
router.get("/asignaturas", ofertaAcademica_controller_js_1.consultarAsignaturas);
router.get("/grupos", ofertaAcademica_controller_js_1.consultarGrupos);
router.get("/grupos/:idGrupo/horarios", ofertaAcademica_controller_js_1.consultarHorariosAulas);
router.get("/horarios", ofertaAcademica_controller_js_1.consultarHorariosAulas);
/**
 * Rutas de Creación e Infraestructura Académica (Protegidas)
 *
 * Solo accesibles por ADMINISTRADORES o COORDINADORES para evitar modificaciones
 * no autorizadas por parte de estudiantes.
 */
router.use(auth_middleware_js_1.authenticateUser);
router.use((0, roleAuth_middleware_js_1.authenticateRole)("ADMINISTRADOR", "COORDINADOR"));
router.post("/programas", ofertaAcademica_controller_js_1.crearPrograma);
router.post("/asignaturas", ofertaAcademica_controller_js_1.crearAsignatura);
router.post("/pensums", ofertaAcademica_controller_js_1.crearPensum);
router.post("/pensums/:idPensum/asignaturas", ofertaAcademica_controller_js_1.asociarAsignaturaPensum);
router.post("/grupos", ofertaAcademica_controller_js_1.crearGrupo);
router.post("/grupos/:idGrupo/horarios", ofertaAcademica_controller_js_1.crearHorarioAula);
exports.default = router;
