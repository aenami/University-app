import { getConnection } from '../config/db.js'
import { compareHash } from '../services/passwordService.js'
import { RowDataPacket } from 'mysql2';
import { type DataUserToken } from '../types/dataTypes.js';

interface PasswordUser extends RowDataPacket {
    password_hash: string;
}

interface userDataToken extends RowDataPacket {
    id_usuario: number;
    nombres_usuario: string;
    rol_usuario: string;
}

interface userState extends RowDataPacket {
    estado_usuario: string;
}


// Definimos todas las operaciones que se pueden realizar sobre nuestro modelo de usuarios
interface typeUser {
    createUser: (name: string, lname: string, hashedPassword: string, email: string, birthDate: Date, userGender: "MASCULINO" | "FEMENINO", 
    userRol: "ESTUDIANTE" | "ADMINISTRADOR" | "COORDINADOR" | "DOCENTE", 
    userID: string) => Promise<void>;

    existsUser: (email: string) => Promise<boolean>;
    verifyLoginUser: (email: string, password: string) => Promise<boolean>;
    getIdUser: (email: string) => Promise<DataUserToken | undefined>;
    isActive: (email: string) => Promise<string>;
}

const User:typeUser = {

     async createUser(name, lname, hashedPassword, email, birthDate, userGender, userRol, userID) {
        try {
            // Creando la consulta
            const query: string = `INSERT INTO USUARIO (nombres_usuario, apellidos_usuario, password_hash,email_usuario, fecha_creacion_usuario, estado_usuario, fecha_nacimiento_usuario, genero_usuario, rol_usuario, documento_usuario) VALUES (?, ?, ? , ?, ?, ?, ?, ?, ?, ?)`

            // Defininimos que los valores de la consulta s
            const values = [name, lname, hashedPassword, email, new Date(), "ACTIVO", birthDate, userGender, userRol, userID]
            
            // Traemos el pool de conexiones
            const pool = getConnection();

            // Ejecutamos la query
            await pool.query(query, values)

        } catch (error) {
            // Enviamos error
            console.log("Error al insertar consulta de creacion de usuario en la db")
            throw(error)
        } 
    },

    async existsUser(email) {
        try {
            // Crando consulta
            const query = `SELECT id_usuario FROM USUARIO WHERE email_usuario = ?`

            const values = [ email ]

            // Creando una conexion
            const db = getConnection()

            // Realizando consulta
            const [rows] = await db.query(query, values)

            // Verificamos si la consulta devolvio algo
            if(rows){
                return true
            }return false
        } catch (error) {
            console.log('Error al verificar el email que el usuario ingreso')
            throw error
        } 
    },

     async verifyLoginUser(email, password) {
        // Funcion que se encarga de verificar que la contraseña ingresada coincida con la que se tiene almacenada
        try {
            // Consulta a la db
            const query = `SELECT password_hash FROM USUARIO WHERE email_usuario = ?`
            const values = [ email ]

            // Creando conexion
            const db = getConnection()
            
            // Ejecutamos la consulta
            const [rows] = await db.query<PasswordUser[]>(query, values)

            // Verificamos si se nos fue devuelto algo
            if(rows){
                // Verificamos la password ingresada
                const isMatch = await compareHash(password, rows[0].password_hash) 
                return isMatch
            } return false
        } catch (error) {
            console.log('Error al verificar la contraseña ingresada')
            throw error
        }
    },

    async getIdUser(email: string) {
        try {
            // Creamos la consulta a la db
            const query = `SELECT id_usuario, nombres_usuario, rol_usuario FROM USUARIO WHERE email_usuario = ?`
            const values = [ email ]

            // Creando conexion
            const db = getConnection()
            
            // Ejecutamos la consulta
            const [rows] = await db.query<userDataToken[]>(query, values)
            
            if(rows){
                return rows[0]
            }return undefined

        } catch (error) {
            console.log('Error al obtener la informacion del usuario a partir de su email')
            throw error
        }
    },
    
    async isActive(email: string) {
        try {
            // Consulta db
            const query = `SELECT estado_usuario FROM USUARIO WHERE email_usuario = ?`
            const values = [email]

            const db = getConnection()

            const [rows] = await db.query<userState[]>(query, values)

            // Verificamos que devolvio
            return rows[0].estado_usuario;
        } catch (error) {
            console.log('Error al verificar el estado del Usuario')
            throw error
        }
    },
}

export default User