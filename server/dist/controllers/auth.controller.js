"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.createUser = void 0;
const User_js_1 = __importDefault(require("../models/User.js"));
const db_js_1 = require("../config/db.js");
const passwordService_js_1 = require("../services/passwordService.js");
const tokenService_js_1 = require("../services/tokenService.js");
const createUser = async (req, res) => {
    // Extrameos la informacion del formulario
    const { name, lastName, password, email, birthDate, userGender, userID } = req.body;
    try {
        //-------------- Validaciones previas a la insercion
        const validationInfo = await User_js_1.default.existsUser(email);
        if (validationInfo) {
            return res.status(409).json({
                error: true,
                message: 'El email ya esta siendo utilizado por otro usuario'
            });
        }
        const documentExists = await User_js_1.default.existsDocument(userID);
        if (documentExists) {
            return res.status(409).json({
                error: true,
                message: 'El documento ya esta siendo utilizado por otro usuario'
            });
        }
        //------------- Logica para la insercion del usuario de forma transaccional
        //1. Hasheamos la contraseña
        const hashedPassword = await (0, passwordService_js_1.hashPassword)(password);
        const pool = (0, db_js_1.getConnection)();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // 1. Crear usuario en tabla usuario
            const createdUserId = await User_js_1.default.createUser(name, lastName, hashedPassword, email, birthDate, userGender, "ESTUDIANTE", userID, connection);
            // 2. Crear relación en tabla estudiante
            await User_js_1.default.createStudentRelation(createdUserId, connection);
            await connection.commit();
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
        res.status(201).json({
            error: false,
            message: 'Usuario creado con exito'
        });
    }
    catch (error) {
        // Devolvemos la respuesta del error de nuestro modelo al frontend
        console.log('Error al crear el usuario: ', error);
        res.status(500).json({
            error: true,
            message: error instanceof Error ? error.message : 'Error al registrar el estudiante'
        });
    }
};
exports.createUser = createUser;
const loginUser = async (req, res) => {
    try {
        // Extraemos la informacion del formulario
        const { email, password } = req.body;
        // Verificamos que el usuario exista en la db
        const userExists = await User_js_1.default.existsUser(email);
        if (!userExists) {
            return res.status(409).json({
                error: false,
                message: 'El email ingresado no coincide con el de ningun usuario registrado'
            });
        }
        // Verificamos el estado del usuario
        const userIsActive = await User_js_1.default.isActive(email);
        if (userIsActive !== "ACTIVO") {
            return res.status(409).json({
                error: true,
                message: 'Usuario con estado Inactivo'
            });
        }
        // Verificar la informacion ingresada por el usuario
        const validateData = await User_js_1.default.verifyLoginUser(email, password);
        if (!validateData) {
            return res.status(409).json({
                error: true,
                message: 'Contraseña o email incorrectos. Verifica la informacion'
            });
        }
        // Luego de validar que si se ingreso la contraseña corecta, hacemos una consulta que traera el id del usuario el cual incluiremos en el body de nuestro token. Tambien informacion extra
        const usuarioData = await User_js_1.default.getIdUser(email);
        if (!usuarioData) {
            return res.status(500).json({
                error: true,
                message: 'No se encontro un usuario con el email especificado',
            });
        }
        const token = (0, tokenService_js_1.generateToken)(usuarioData.id_usuario, usuarioData.rol_usuario);
        //-------Devolvemos la respuesta correcta al frontend con el token y la informacion del user logeado
        return res.status(200).json({
            error: false,
            message: 'Login exitoso..',
            token: token,
            user: {
                id: usuarioData.id_usuario,
                nombre: usuarioData.nombres_usuario,
            }
        });
    }
    catch (error) {
        console.log('Error al logear el usuario', error);
        return res.status(500).json({
            error: true,
            message: error
        });
    }
};
exports.loginUser = loginUser;
