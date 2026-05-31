import express from 'express';
// Importamos metodos de nuestro controlador
import { consultarOfertaDisponible  } from '../controllers/grupo.controller';

// Importamos el metodo para validar la prematricula
import { validarPrematricula } from '../controllers/matricula.controllers';

const router = express.Router()

// Ruta de consulta-grupo
router.get('/',consultarOfertaDisponible)

// Ruta para validar la prematricula
router.post('/validar-prematricula', validarPrematricula)


export default router

