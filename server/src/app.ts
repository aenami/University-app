import express from "express"
import dotenv from "dotenv"
import cors from 'cors'
import dashboardRoutes from './routes/dashboard.routes.js'
import summaryRoutes from './routes/summary.routes.js'
import matriculaRoutes from './routes/matricula.routes.js'

dotenv.config();
const app = express()

app.set('case sensitive Routing', true)
app.set('appName', 'Express app')
app.set('port', process.env.PORT)

app.use(cors({
    origin: "http://localhost:5173"
}))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/dashboard', dashboardRoutes)
app.use('/api/summary', summaryRoutes)
app.use('/api/matricula', matriculaRoutes)

export default app