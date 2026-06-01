import app from './app.js'
import dotenv from 'dotenv'
import { initializePool } from './config/db.js'

dotenv.config() // Inicializamos variables de entorno en este archivo para todo el proyecto

const PORT = process.env.PORT;

// Funcion principal
const startServer = async () => {
    try {
        await initializePool()

        app.listen(PORT, () => {
            console.log(`Servidor escuchando por peticiones en el puerto ${PORT}`)
        })
    } catch (error) {
        console.log('Ocurrio un error al intentar levantar el servidor: ', error)
    }
}

startServer()