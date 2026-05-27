"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// -------Impotando modulos y librearias
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// -------Importando rutas
const ofertaAcademica_routes_js_1 = __importDefault(require("./routes/ofertaAcademica.routes.js"));
const auth_routes_js_1 = __importDefault(require("./routes/auth.routes.js"));
const grupo_routes_js_1 = __importDefault(require("./routes/grupo.routes.js"));
const corte_routes_js_1 = __importDefault(require("./routes/corte.routes.js"));
const estudiantes_routes_js_1 = __importDefault(require("./routes/estudiantes.routes.js"));
const users_routes_js_1 = __importDefault(require("./routes/users.routes.js"));
// ------- Settings de nuestro backend
app.set('case sensitive Routing', true);
app.set('appName', 'Express app');
app.set('port', process.env.PORT); // -----TRAER EL PUERTO CON UNA VARIBALE DE ENTORNO
// ------- MIDDLEWARES ------
app.use((0, cors_1.default)({
    origin: "http://localhost:5173"
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
// ------- RUTAS CREADAS -----
app.use('/api/oferta-academica', ofertaAcademica_routes_js_1.default);
app.use('/api/auth', auth_routes_js_1.default);
app.use('/api/groups', grupo_routes_js_1.default);
app.use('/api/cortes', corte_routes_js_1.default);
app.use('/api/grupos', estudiantes_routes_js_1.default);
app.use('/api/users', users_routes_js_1.default);
exports.default = app;
