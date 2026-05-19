import express from 'express'
// Importamos metodos de nuestro controlador
import { createUser, loginUser } from '../controllers/auth.controller';
const router = express.Router()

// Ruta de login
router.post('/login', loginUser)

// Ruta de register
router.post('/register', createUser)

export default router

