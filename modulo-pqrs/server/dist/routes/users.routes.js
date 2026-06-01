"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const users_controller_js_1 = require("../controllers/users.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const roleAuth_middleware_js_1 = require("../middleware/roleAuth.middleware.js");
const router = express_1.default.Router();
// Todo el modulo queda protegido para que solo el administrador pueda gestionarlo.
router.use(auth_middleware_js_1.authenticateUser);
router.use((0, roleAuth_middleware_js_1.authenticateRole)("ADMINISTRADOR"));
router.get("/staff", users_controller_js_1.getManagedUsers);
router.post("/staff", users_controller_js_1.createManagedUser);
router.patch("/staff/:userId/status", users_controller_js_1.updateManagedUserStatus);
exports.default = router;
