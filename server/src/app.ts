// -------Impotando modulos y librearias
import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
dotenv.config();
const app = express()

// -------Importando rutas
import authRoutes from './routes/auth.routes.js'
import groupRoutes from './routes/grupo.routes.js'
import corteRoutes from './routes/corte.routes.js'
import studentsRoutes from './routes/estudiantes.routes.js'


// ------- Settings de nuestro backend
app.set('case sensitive Routing', true)
app.set('appName', 'Express app')
app.set('port', process.env.PORT) // -----TRAER EL PUERTO CON UNA VARIBALE DE ENTORNO


// ------- MIDDLEWARES ------
app.use(cors( {
    origin: "http://localhost:5173"
} ))
app.use(express.json())
app.use(express.urlencoded( {extended: false} ))


// ------- RUTAS CREADAS -----
app.use('/api/auth', authRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/cortes', corteRoutes)

app.use('/api/grupos', studentsRoutes)

export default app