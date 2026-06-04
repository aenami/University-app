import type { Request, Response } from "express";
import OfertaAcademica from "../models/OfertaAcademica.js";

const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === "string" && value.trim().length > 0;
};

const isPositiveInteger = (value: unknown): value is number => {
    return Number.isInteger(value) && Number(value) > 0;
};

const parsePositiveInteger = (value: unknown) => {
    const parsedValue = Number(value);
    return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const sendValidationError = (res: Response, message: string) => {
    return res.status(400).json({
        error: true,
        message,
    });
};

const isEndTimeAfterStartTime = (horaInicio: string, horaFin: string) => {
    return horaFin > horaInicio;
};

export const crearPrograma = async (req: Request, res: Response) => {
    try {
        const { nombre, tipoPrograma = "Carreras", facultad } = req.body;

        if (!isNonEmptyString(nombre) || !isNonEmptyString(tipoPrograma) || !isNonEmptyString(facultad)) {
            return sendValidationError(res, "Nombre, tipoPrograma y facultad son obligatorios");
        }

        const nombrePrograma = nombre.trim();
        const tipoProgramaNormalizado = tipoPrograma.trim();
        const facultadPrograma = facultad.trim();
        const programaDuplicado = await OfertaAcademica.existeProgramaPorNombre(nombrePrograma);

        if (programaDuplicado) {
            return res.status(409).json({
                error: true,
                message: "Ya existe un programa academico con ese nombre",
            });
        }

        const idPrograma = await OfertaAcademica.crearPrograma({
            nombre: nombrePrograma,
            tipoPrograma: tipoProgramaNormalizado,
            facultad: facultadPrograma,
        });

        return res.status(201).json({
            error: false,
            message: "Programa academico creado con exito",
            data: { idPrograma },
        });
    } catch (error) {
        console.error("Error al crear programa academico:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el programa academico",
        });
    }
};

export const consultarProgramas = async (_req: Request, res: Response) => {
    try {
        const programas = await OfertaAcademica.consultarProgramas();

        return res.status(200).json({
            error: false,
            message: "Programas academicos consultados con exito",
            data: programas,
        });
    } catch (error) {
        console.error("Error al consultar programas academicos:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar programas academicos",
        });
    }
};

export const crearAsignatura = async (req: Request, res: Response) => {
    try {
        const { nombre, creditos } = req.body;

        if (!isNonEmptyString(nombre)) {
            return sendValidationError(res, "El nombre de la asignatura es obligatorio");
        }

        if (!isPositiveInteger(creditos)) {
            return sendValidationError(res, "Los creditos de la asignatura deben ser un numero entero mayor que cero");
        }

        const nombreAsignatura = nombre.trim();
        const asignaturaDuplicada = await OfertaAcademica.existeAsignaturaPorNombre(nombreAsignatura);

        if (asignaturaDuplicada) {
            return res.status(409).json({
                error: true,
                message: "Ya existe una asignatura con ese nombre",
            });
        }

        const idAsignatura = await OfertaAcademica.crearAsignatura({
            nombre: nombreAsignatura,
            creditos,
        });

        return res.status(201).json({
            error: false,
            message: "Asignatura creada con exito",
            data: { idAsignatura },
        });
    } catch (error) {
        console.error("Error al crear asignatura:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear la asignatura",
        });
    }
};

export const consultarAsignaturas = async (_req: Request, res: Response) => {
    try {
        const asignaturas = await OfertaAcademica.consultarAsignaturas();

        return res.status(200).json({
            error: false,
            message: "Asignaturas consultadas con exito",
            data: asignaturas,
        });
    } catch (error) {
        console.error("Error al consultar asignaturas:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar asignaturas",
        });
    }
};

export const crearPrerrequisito = async (req: Request, res: Response) => {
    try {
        const idAsignatura = parsePositiveInteger(req.params.idAsignatura);
        const { idAsignaturaRequisito } = req.body;

        if (!idAsignatura) {
            return sendValidationError(res, "idAsignatura debe ser un numero entero mayor que cero");
        }

        if (!isPositiveInteger(idAsignaturaRequisito)) {
            return sendValidationError(res, "idAsignaturaRequisito debe ser un numero entero mayor que cero");
        }

        if (idAsignatura === idAsignaturaRequisito) {
            return sendValidationError(res, "Una asignatura no puede ser prerrequisito de si misma");
        }

        const [asignaturaExiste, requisitoExiste, prerrequisitoDuplicado, generaCiclo] = await Promise.all([
            OfertaAcademica.existeAsignatura(idAsignatura),
            OfertaAcademica.existeAsignatura(idAsignaturaRequisito),
            OfertaAcademica.existePrerrequisito(idAsignatura, idAsignaturaRequisito),
            OfertaAcademica.existeCicloPrerrequisito(idAsignatura, idAsignaturaRequisito),
        ]);

        if (!asignaturaExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe la asignatura principal indicada",
            });
        }

        if (!requisitoExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe la asignatura prerrequisito indicada",
            });
        }

        if (prerrequisitoDuplicado) {
            return res.status(409).json({
                error: true,
                message: "La asignatura ya tiene asociado ese prerrequisito",
            });
        }

        if (generaCiclo) {
            return res.status(409).json({
                error: true,
                message: "No se puede asociar el prerrequisito porque genera un ciclo academico",
            });
        }

        const idPrerrequisito = await OfertaAcademica.crearPrerrequisito(idAsignatura, idAsignaturaRequisito);

        return res.status(201).json({
            error: false,
            message: "Prerrequisito asociado con exito",
            data: { idPrerrequisito },
        });
    } catch (error: any) {
        if (error?.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                error: true,
                message: "La asignatura ya tiene asociado ese prerrequisito",
            });
        }

        console.error("Error al crear prerrequisito:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el prerrequisito",
        });
    }
};

export const consultarPrerrequisitos = async (req: Request, res: Response) => {
    try {
        const idAsignatura = parsePositiveInteger(req.params.idAsignatura);

        if (!idAsignatura) {
            return sendValidationError(res, "idAsignatura debe ser un numero entero mayor que cero");
        }

        const asignaturaExiste = await OfertaAcademica.existeAsignatura(idAsignatura);

        if (!asignaturaExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe la asignatura indicada",
            });
        }

        const [prerrequisitos, nombreAsignatura] = await Promise.all([
            OfertaAcademica.consultarPrerrequisitosPorAsignatura(idAsignatura),
            OfertaAcademica.consultarNombreAsignatura(idAsignatura),
        ]);

        return res.status(200).json({
            error: false,
            message: "Prerrequisitos consultados con exito",
            data: {
                asignatura: nombreAsignatura ?? prerrequisitos[0]?.asignatura ?? "",
                prerrequisitos: prerrequisitos.map((item) => item.prerrequisito),
                detalle: prerrequisitos,
            },
        });
    } catch (error) {
        console.error("Error al consultar prerrequisitos:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar prerrequisitos",
        });
    }
};

export const crearPensum = async (req: Request, res: Response) => {
    try {
        const { idPrograma, estado } = req.body;

        if (!isPositiveInteger(idPrograma)) {
            return sendValidationError(res, "idPrograma debe ser un numero entero mayor que cero");
        }

        if (estado !== undefined && !isNonEmptyString(estado)) {
            return sendValidationError(res, "estado no puede estar vacio");
        }

        const estadoPensum = isNonEmptyString(estado) ? estado.trim() : "Activo";
        const [programaExiste, pensumDuplicado] = await Promise.all([
            OfertaAcademica.existePrograma(idPrograma),
            OfertaAcademica.existePensumPorProgramaYEstado(idPrograma, estadoPensum),
        ]);

        if (!programaExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe un programa academico con el id indicado",
            });
        }

        if (pensumDuplicado) {
            return res.status(409).json({
                error: true,
                message: "Ya existe un pensum con ese estado para el programa indicado",
            });
        }

        const idPensum = await OfertaAcademica.crearPensum({
            idPrograma,
            estado: estadoPensum,
        });

        return res.status(201).json({
            error: false,
            message: "Pensum creado con exito",
            data: { idPensum },
        });
    } catch (error) {
        console.error("Error al crear pensum:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el pensum",
        });
    }
};

export const consultarPensums = async (_req: Request, res: Response) => {
    try {
        const pensums = await OfertaAcademica.consultarPensums();

        return res.status(200).json({
            error: false,
            message: "Pensums consultados con exito",
            data: pensums,
        });
    } catch (error) {
        console.error("Error al consultar pensums:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar pensums",
        });
    }
};

export const asociarAsignaturaPensum = async (req: Request, res: Response) => {
    try {
        const idPensum = parsePositiveInteger(req.params.idPensum);
        const { idAsignatura } = req.body;

        if (!idPensum) {
            return sendValidationError(res, "idPensum debe ser un numero entero mayor que cero");
        }

        if (!isPositiveInteger(idAsignatura)) {
            return sendValidationError(res, "idAsignatura debe ser un numero entero mayor que cero");
        }

        const [pensumExiste, asignaturaExiste, prerrequisitosFueraPensum] = await Promise.all([
            OfertaAcademica.existePensum(idPensum),
            OfertaAcademica.existeAsignatura(idAsignatura),
            OfertaAcademica.consultarPrerrequisitosFueraDePensum(idPensum, idAsignatura),
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

        if (prerrequisitosFueraPensum.length > 0) {
            return res.status(409).json({
                error: true,
                message: `La asignatura no es coherente con el pensum. Faltan prerrequisitos en el pensum: ${prerrequisitosFueraPensum.map((item) => item.nombre).join(", ")}`,
            });
        }

        await OfertaAcademica.asociarAsignaturaPensum(idPensum, idAsignatura);

        return res.status(201).json({
            error: false,
            message: "Asignatura asociada al pensum con exito",
        });
    } catch (error: any) {
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

export const crearGrupo = async (req: Request, res: Response) => {
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

        const [asignaturaExiste, asignaturaEnPensumActivo, prerrequisitosFueraPensumActivo, grupoDuplicado] =
            await Promise.all([
                OfertaAcademica.existeAsignatura(idAsignatura),
                OfertaAcademica.existeAsignaturaEnPensumActivo(idAsignatura),
                OfertaAcademica.consultarPrerrequisitosFueraDePensumActivo(idAsignatura),
                OfertaAcademica.existeGrupoPorAsignaturaYNumero(idAsignatura, numGrupo),
            ]);

        if (!asignaturaExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe una asignatura con el id indicado",
            });
        }

        if (!asignaturaEnPensumActivo) {
            return res.status(409).json({
                error: true,
                message: "La asignatura no puede ofertarse porque no pertenece a ningun pensum activo",
            });
        }

        if (prerrequisitosFueraPensumActivo.length > 0) {
            return res.status(409).json({
                error: true,
                message: `Oferta invalida. Faltan prerrequisitos en pensum activo: ${prerrequisitosFueraPensumActivo.map((item) => item.nombre).join(", ")}`,
            });
        }

        if (grupoDuplicado) {
            return res.status(409).json({
                error: true,
                message: "Ya existe un grupo con ese numero para la asignatura indicada",
            });
        }

        const idGrupo = await OfertaAcademica.crearGrupo({
            numGrupo,
            cupoMaximo,
            idAsignatura,
        });

        return res.status(201).json({
            error: false,
            message: "Grupo creado con exito",
            data: { idGrupo },
        });
    } catch (error) {
        console.error("Error al crear grupo:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el grupo",
        });
    }
};

export const consultarGrupos = async (_req: Request, res: Response) => {
    try {
        const grupos = await OfertaAcademica.consultarGrupos();

        return res.status(200).json({
            error: false,
            message: "Grupos consultados con exito",
            data: grupos,
        });
    } catch (error) {
        console.error("Error al consultar grupos:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar grupos",
        });
    }
};

export const crearHorarioAula = async (req: Request, res: Response) => {
    try {
        const idGrupo = parsePositiveInteger(req.params.idGrupo);
        const { dia, horaInicio, horaFin, piso, bloque, aula } = req.body;

        if (!idGrupo) {
            return sendValidationError(res, "idGrupo debe ser un numero entero mayor que cero");
        }

        if (!isNonEmptyString(dia) || !isNonEmptyString(horaInicio) || !isNonEmptyString(horaFin)) {
            return sendValidationError(res, "dia, horaInicio y horaFin son obligatorios");
        }

        if (!isEndTimeAfterStartTime(horaInicio.trim(), horaFin.trim())) {
            return sendValidationError(res, "horaFin debe ser mayor que horaInicio");
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

        const [grupoExiste, horarioDuplicado] = await Promise.all([
            OfertaAcademica.existeGrupo(idGrupo),
            OfertaAcademica.existeHorarioDuplicado({
                idGrupo,
                dia: dia.trim(),
                horaInicio: horaInicio.trim(),
                horaFin: horaFin.trim(),
                bloque: bloque.trim(),
                aula: isNonEmptyString(aula) ? aula.trim() : undefined,
            }),
        ]);

        if (!grupoExiste) {
            return res.status(404).json({
                error: true,
                message: "No existe un grupo con el id indicado",
            });
        }

        if (horarioDuplicado) {
            return res.status(409).json({
                error: true,
                message: "Ya existe un horario igual para el grupo indicado",
            });
        }

        const idHorario = await OfertaAcademica.crearHorarioAula({
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
    } catch (error) {
        console.error("Error al crear horario y aula:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al crear el horario y aula",
        });
    }
};

export const consultarHorariosAulas = async (req: Request, res: Response) => {
    try {
        const idGrupoParam = req.params.idGrupo ? parsePositiveInteger(req.params.idGrupo) : undefined;

        if (req.params.idGrupo && !idGrupoParam) {
            return sendValidationError(res, "idGrupo debe ser un numero entero mayor que cero");
        }

        const idGrupo = idGrupoParam ?? undefined;
        const horarios = await OfertaAcademica.consultarHorariosAulasPorGrupo(idGrupo);

        return res.status(200).json({
            error: false,
            message: "Horarios y aulas consultados con exito",
            data: horarios,
        });
    } catch (error) {
        console.error("Error al consultar horarios y aulas:", error);
        return res.status(500).json({
            error: true,
            message: "Error interno al consultar horarios y aulas",
        });
    }
};
