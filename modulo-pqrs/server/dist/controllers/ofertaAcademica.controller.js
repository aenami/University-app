"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consultarHorariosAulas = exports.crearHorarioAula = exports.consultarGrupos = exports.crearGrupo = exports.asociarAsignaturaPensum = exports.crearPensum = exports.consultarAsignaturas = exports.crearAsignatura = exports.consultarProgramas = exports.crearPrograma = void 0;
const OfertaAcademica_js_1 = __importDefault(require("../models/OfertaAcademica.js"));
const isNonEmptyString = (value) => {
    return typeof value === "string" && value.trim().length > 0;
};
const isPositiveInteger = (value) => {
    return Number.isInteger(value) && Number(value) > 0;
};
const parsePositiveInteger = (value) => {
    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
};
const sendValidationError = (res, message) => {
    return res.status(400).json({
        error: true,
        message,
    });
};
const crearPrograma = async (req, res) => {
    try {
        const { nombre, tipoPrograma = "Carreras", facultad } = req.body;
        if (!isNonEmptyString(nombre) || !isNonEmptyString(tipoPrograma) || !isNonEmptyString(facultad)) {
            return sendValidationError(res, "Nombre, tipoPrograma y facultad son obligatorios");
        }
        const idPrograma = await OfertaAcademica_js_1.default.crearPrograma({
            nombre: nombre.trim(),
            tipoPrograma: tipoPrograma.trim(),
            facultad: facultad.trim(),
        });
        return res.status(201).json({
            error: false,
            message: "Programa academico creado con exito",
            data: { idPrograma },
        });
    }
    catch (error) {
        console.error("Error al crear programa academico:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el programa academico",
        });
    }
};
exports.crearPrograma = crearPrograma;
const consultarProgramas = async (_req, res) => {
    try {
        const programas = await OfertaAcademica_js_1.default.consultarProgramas();
        return res.status(200).json({
            error: false,
            message: "Programas academicos consultados con exito",
            data: programas,
        });
    }
    catch (error) {
        console.error("Error al consultar programas academicos:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar programas academicos",
        });
    }
};
exports.consultarProgramas = consultarProgramas;
const crearAsignatura = async (req, res) => {
    try {
        const { nombre, creditos } = req.body;
        if (!isNonEmptyString(nombre)) {
            return sendValidationError(res, "El nombre de la asignatura es obligatorio");
        }
        if (!isPositiveInteger(creditos)) {
            return sendValidationError(res, "Los creditos de la asignatura deben ser un numero entero mayor que cero");
        }
        const idAsignatura = await OfertaAcademica_js_1.default.crearAsignatura({
            nombre: nombre.trim(),
            creditos,
        });
        return res.status(201).json({
            error: false,
            message: "Asignatura creada con exito",
            data: { idAsignatura },
        });
    }
    catch (error) {
        console.error("Error al crear asignatura:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear la asignatura",
        });
    }
};
exports.crearAsignatura = crearAsignatura;
const consultarAsignaturas = async (_req, res) => {
    try {
        const asignaturas = await OfertaAcademica_js_1.default.consultarAsignaturas();
        return res.status(200).json({
            error: false,
            message: "Asignaturas consultadas con exito",
            data: asignaturas,
        });
    }
    catch (error) {
        console.error("Error al consultar asignaturas:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar asignaturas",
        });
    }
};
exports.consultarAsignaturas = consultarAsignaturas;
const crearPensum = async (req, res) => {
    try {
        const { idPrograma, estado } = req.body;
        if (!isPositiveInteger(idPrograma)) {
            return sendValidationError(res, "idPrograma debe ser un numero entero mayor que cero");
        }
        if (estado !== undefined && !isNonEmptyString(estado)) {
            return sendValidationError(res, "estado no puede estar vacio");
        }
        const programaExiste = await OfertaAcademica_js_1.default.existePrograma(idPrograma);
        if (!programaExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe un programa academico con el id indicado",
            });
        }
        const idPensum = await OfertaAcademica_js_1.default.crearPensum({
            idPrograma,
            estado: isNonEmptyString(estado) ? estado.trim() : undefined,
        });
        return res.status(201).json({
            error: false,
            message: "Pensum creado con exito",
            data: { idPensum },
        });
    }
    catch (error) {
        console.error("Error al crear pensum:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el pensum",
        });
    }
};
exports.crearPensum = crearPensum;
const asociarAsignaturaPensum = async (req, res) => {
    try {
        const idPensum = parsePositiveInteger(req.params.idPensum);
        const { idAsignatura } = req.body;
        if (!idPensum) {
            return sendValidationError(res, "idPensum debe ser un numero entero mayor que cero");
        }
        if (!isPositiveInteger(idAsignatura)) {
            return sendValidationError(res, "idAsignatura debe ser un numero entero mayor que cero");
        }
        const [pensumExiste, asignaturaExiste] = await Promise.all([
            OfertaAcademica_js_1.default.existePensum(idPensum),
            OfertaAcademica_js_1.default.existeAsignatura(idAsignatura),
        ]);
        if (!pensumExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe un pensum con el id indicado",
            });
        }
        if (!asignaturaExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe una asignatura con el id indicado",
            });
        }
        await OfertaAcademica_js_1.default.asociarAsignaturaPensum(idPensum, idAsignatura);
        return res.status(201).json({
            error: false,
            message: "Asignatura asociada al pensum con exito",
        });
    }
    catch (error) {
        if (error?.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: true,
                message: "La asignatura ya esta asociada a este pensum",
            });
        }
        console.error("Error al asociar asignatura al pensum:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al asociar la asignatura al pensum",
        });
    }
};
exports.asociarAsignaturaPensum = asociarAsignaturaPensum;
const crearGrupo = async (req, res) => {
    try {
        const { numGrupo, cupoMaximo, idAsignatura } = req.body;
        if (!isPositiveInteger(numGrupo)) {
            return sendValidationError(res, "numGrupo debe ser un numero entero mayor que cero");
        }
        if (!isPositiveInteger(cupoMaximo)) {
            return sendValidationError(res, "cupoMaximo debe ser un numero entero mayor que cero");
        }
        if (!isPositiveInteger(idAsignatura)) {
            return sendValidationError(res, "idAsignatura debe ser un numero entero mayor que cero");
        }
        const asignaturaExiste = await OfertaAcademica_js_1.default.existeAsignatura(idAsignatura);
        if (!asignaturaExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe una asignatura con el id indicado",
            });
        }
        const idGrupo = await OfertaAcademica_js_1.default.crearGrupo({
            numGrupo,
            cupoMaximo,
            idAsignatura,
        });
        return res.status(201).json({
            error: false,
            message: "Grupo creado con exito",
            data: { idGrupo },
        });
    }
    catch (error) {
        console.error("Error al crear grupo:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el grupo",
        });
    }
};
exports.crearGrupo = crearGrupo;
const consultarGrupos = async (_req, res) => {
    try {
        const grupos = await OfertaAcademica_js_1.default.consultarGrupos();
        return res.status(200).json({
            error: false,
            message: "Grupos consultados con exito",
            data: grupos,
        });
    }
    catch (error) {
        console.error("Error al consultar grupos:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar grupos",
        });
    }
};
exports.consultarGrupos = consultarGrupos;
const crearHorarioAula = async (req, res) => {
    try {
        const idGrupo = parsePositiveInteger(req.params.idGrupo);
        const { dia, horaInicio, horaFin, piso, bloque, aula } = req.body;
        if (!idGrupo) {
            return sendValidationError(res, "idGrupo debe ser un numero entero mayor que cero");
        }
        if (!isNonEmptyString(dia) || !isNonEmptyString(horaInicio) || !isNonEmptyString(horaFin)) {
            return sendValidationError(res, "dia, horaInicio y horaFin son obligatorios");
        }
        if (!isPositiveInteger(piso)) {
            return sendValidationError(res, "piso debe ser un numero entero mayor que cero");
        }
        if (!isNonEmptyString(bloque)) {
            return sendValidationError(res, "bloque es obligatorio");
        }
        if (aula !== undefined && !isNonEmptyString(aula)) {
            return sendValidationError(res, "aula no puede estar vacia");
        }
        const grupoExiste = await OfertaAcademica_js_1.default.existeGrupo(idGrupo);
        if (!grupoExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe un grupo con el id indicado",
            });
        }
        const idHorario = await OfertaAcademica_js_1.default.crearHorarioAula({
            idGrupo,
            dia: dia.trim(),
            horaInicio: horaInicio.trim(),
            horaFin: horaFin.trim(),
            piso,
            bloque: bloque.trim(),
            aula: isNonEmptyString(aula) ? aula.trim() : undefined,
        });
        return res.status(201).json({
            error: false,
            message: "Horario y aula asociados al grupo con exito",
            data: { idHorario },
        });
    }
    catch (error) {
        console.error("Error al crear horario y aula:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el horario y aula",
        });
    }
};
exports.crearHorarioAula = crearHorarioAula;
const consultarHorariosAulas = async (req, res) => {
    try {
        const idGrupoParam = req.params.idGrupo ? parsePositiveInteger(req.params.idGrupo) : undefined;
        if (req.params.idGrupo && !idGrupoParam) {
            return sendValidationError(res, "idGrupo debe ser un numero entero mayor que cero");
        }
        const idGrupo = idGrupoParam ?? undefined;
        const horarios = await OfertaAcademica_js_1.default.consultarHorariosAulasPorGrupo(idGrupo);
        return res.status(200).json({
            error: false,
            message: "Horarios y aulas consultados con exito",
            data: horarios,
        });
    }
    catch (error) {
        console.error("Error al consultar horarios y aulas:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar horarios y aulas",
        });
    }
};
exports.consultarHorariosAulas = consultarHorariosAulas;
