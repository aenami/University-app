"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Importamos metodos de nuestro controlador
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
// Ruta de login
router.post('/login', auth_controller_1.loginUser);
// Ruta de register
router.post('/register', auth_controller_1.createUser);
exports.default = router;
