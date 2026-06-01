// -------Impotando modulos y librearias
import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
dotenv.config();
const app = express()

// -------Importando rutas
import ofertaAcademicaRoutes from './routes/ofertaAcademica.routes.js'
import authRoutes from './routes/auth.routes.js'
import groupRoutes from './routes/grupo.routes.js'
import corteRoutes from './routes/corte.routes.js'
import studentsRoutes from './routes/estudiantes.routes.js'
import usersRoutes from './routes/users.routes.js'
import notaRoutes from './routes/nota.routes.js'


// ------- Settings de nuestro backend
app.set('case sensitive Routing', true)
app.set('appName', 'Express app')
app.set('port', process.env.PORT) // -----TRAER EL PUERTO CON UNA VARIBALE DE ENTORNO


// ------- MIDDLEWARES ------
app.use(cors( {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"]
} ))
app.use(express.json())
app.use(express.urlencoded( {extended: false} ))


// ------- RUTAS CREADAS -----
app.use('/api/oferta-academica', ofertaAcademicaRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/cortes', corteRoutes)
app.use('/api/matriculas', matriculaRoutes)

app.use('/api/grupos', studentsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/notas', notaRoutes)

export default app
