// -------Impotando modulos y librearias
import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
dotenv.config();
const app = express()

// -------Importando rutas
import ofertaAcademicaRoutes from './routes/ofertaAcademica.routes.js'


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
app.use('/api/oferta-academica', ofertaAcademicaRoutes)



export default app
