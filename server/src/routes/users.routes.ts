import express from "express";
import {
    createManagedUser,
    getManagedUsers,
    updateManagedUserStatus,
    getStudents,
    createStudent,
    updateStudentStatus,
} from "../controllers/users.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";
import { authenticateRole } from "../middleware/roleAuth.middleware.js";

const router = express.Router();

// Todo el modulo queda protegido para que solo el administrador pueda gestionarlo.
router.use(authenticateUser);
router.use(authenticateRole("ADMINISTRADOR"));

router.get("/staff", getManagedUsers);
router.post("/staff", createManagedUser);
router.patch("/staff/:userId/status", updateManagedUserStatus);

// Rutas de administración de estudiantes
router.get("/students", getStudents);
router.post("/students", createStudent);
router.patch("/students/:userId/status", updateStudentStatus);

export default router;
