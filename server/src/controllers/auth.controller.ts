import type { Request, Response } from 'express'
import User from "../models/User.js"
import { getConnection } from "../config/db.js"
import { hashPassword } from "../services/passwordService.js"
import { generateToken } from "../services/tokenService.js"

export const createUser = async (req: Request, res: Response) => {
    // Extrameos la informacion del formulario
    const {name, lastName, password, email, birthDate, userGender, userID} = req.body

    try {
        //-------------- Validaciones previas a la insercion
        const validationInfo = await User.existsUser(email)

        if(validationInfo){
            return res.status(409).json({
                error: true,
                message: 'El email ya esta siendo utilizado por otro usuario'
            })
        }

        const documentExists = await User.existsDocument(userID)
        if(documentExists){
            return res.status(409).json({
                error: true,
                message: 'El documento ya esta siendo utilizado por otro usuario'
            })
        }

        //------------- Logica para la insercion del usuario de forma transaccional
        //1. Hasheamos la contraseña
        const hashedPassword = await hashPassword(password);

        const pool = getConnection();
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Crear usuario en tabla usuario
            const createdUserId = await User.createUser(
                name, 
                lastName, 
                hashedPassword, 
                email, 
                birthDate, 
                userGender, 
                "ESTUDIANTE", 
                userID,
                connection
            );

            // 2. Crear relación en tabla estudiante
            await User.createStudentRelation(createdUserId, connection);

            await connection.commit();
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }

        res.status(201).json({
            error: false,
            message: 'Usuario creado con exito'
        })
        
    } catch (error) {
        // Devolvemos la respuesta del error de nuestro modelo al frontend
        console.log('Error al crear el usuario: ', error)
        res.status(500).json({
            error: true,
            message: error instanceof Error ? error.message : 'Error al registrar el estudiante'
        })
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        // Extraemos la informacion del formulario
        const {email, password} = req.body

        // Verificamos que el usuario exista en la db
        const userExists = await User.existsUser(email)

        if(!userExists){
            return res.status(409).json({
                error: false,
                message: 'El email ingresado no coincide con el de ningun usuario registrado'
            })
        }

        // Verificamos el estado del usuario
        const userIsActive = await User.isActive(email)
        
        if(userIsActive !== "ACTIVO"){
            return res.status(409).json({
                error: true,
                message: 'Usuario con estado Inactivo'
            })
        }

        // Verificar la informacion ingresada por el usuario
        const validateData = await User.verifyLoginUser(email, password)

        if(!validateData) {
            return res.status(409).json({
                error: true,
                message: 'Contraseña o email incorrectos. Verifica la informacion'
            })
        }

        // Luego de validar que si se ingreso la contraseña corecta, hacemos una consulta que traera el id del usuario el cual incluiremos en el body de nuestro token. Tambien informacion extra
        const usuarioData = await User.getIdUser(email)
        if(!usuarioData) {
            return res.status(500).json({
            error: true,
            message: 'No se encontro un usuario con el email especificado',
        })
        }

        const token = generateToken(usuarioData.id_usuario, usuarioData.rol_usuario)
        
        //-------Devolvemos la respuesta correcta al frontend con el token y la informacion del user logeado
        return res.status(200).json({
            error: false,
            message: 'Login exitoso..',
            token: token,
            user: {
                id: usuarioData.id_usuario,
                nombre: usuarioData.nombres_usuario,
            }

        })

    } catch (error) {
        console.log('Error al logear el usuario', error)
        return res.status(500).json({
            error: true,
            message: error
        })
    }
}
