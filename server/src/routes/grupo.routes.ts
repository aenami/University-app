import express from 'express'
// Importamos metodos de nuestro controlador
import { consultarOfertaDisponible  } from '../controllers/grupo.controller';
const router = express.Router()

// Ruta de consulta-grupo
router.get('consultarGrupo',consultarOfertaDisponible)




export default router

