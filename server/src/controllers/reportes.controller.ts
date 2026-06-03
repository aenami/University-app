import { Request, Response } from "express";
import { getConnection } from "../config/db.js";

const ORIGEN_REAL = "real";
const ORIGEN_PARCIAL = "real_parcial";

// GET /api/reportes/usuarios
export const reporteUsuarios = async (req: Request, res: Response) => {
  const pool = getConnection();
  try {
    const { rol } = req.query;
    let query = `
      SELECT
        id_usuario,
        nombres_usuario,
        apellidos_usuario,
        email_usuario,
        rol_usuario AS rol,
        estado_usuario AS estado,
        fecha_nacimiento_usuario AS fecha_nacimiento
      FROM usuario
      WHERE 1 = 1
    `;
    const params: string[] = [];
    if (rol && typeof rol === "string") {
      query += " AND rol_usuario = ?";
      params.push(rol);
    }
    query += " ORDER BY rol_usuario, apellidos_usuario";
    const [rows] = await pool.query(query, params);
    res.status(200).json({ ok: true, origen: ORIGEN_REAL, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al generar reporte de usuarios" });
  }
};

// GET /api/reportes/oferta
export const reporteOferta = async (req: Request, res: Response) => {
  const pool = getConnection();
  try {
    const { id_programa } = req.query;
    let query = `
      SELECT
        p.nombre AS programa,
        a.nombre AS asignatura,
        a.creditos,
        g.num_grupo,
        g.cupo_maximo,
        COUNT(dm.id_detalle) AS inscritos
      FROM grupo g
      INNER JOIN asignatura a ON a.id_asignatura = g.id_asignatura
      INNER JOIN pensum_asignatura pa ON pa.id_asignatura = a.id_asignatura
      INNER JOIN pensum pen ON pen.id_pensum = pa.id_pensum
      INNER JOIN programa p ON p.id_programa = pen.id_programa
      LEFT JOIN detalle_matricula dm ON dm.id_grupo = g.id_grupo
    `;
    const params: (string | number)[] = [];
    if (id_programa && !isNaN(Number(id_programa))) {
      query += " WHERE p.id_programa = ?";
      params.push(Number(id_programa));
    }
    query += `
      GROUP BY g.id_grupo, p.nombre, a.nombre, a.creditos, g.num_grupo, g.cupo_maximo
      ORDER BY p.nombre, a.nombre
    `;
    const [rows] = await pool.query(query, params);
    res.status(200).json({ ok: true, origen: ORIGEN_REAL, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al generar reporte de oferta" });
  }
};

// GET /api/reportes/matriculas
export const reporteMatriculas = async (req: Request, res: Response) => {
  const pool = getConnection();
  try {
    const { id_programa } = req.query;
    let query = `
      SELECT
        m.id_matricula,
        m.fecha_matricula,
        m.total_creditos,
        m.precio_total,
        u.nombres_usuario,
        u.apellidos_usuario,
        u.documento_usuario,
        p.nombre AS programa
      FROM matricula m
      INNER JOIN estudiante e ON e.id_estudiante = m.id_estudiante
      INNER JOIN usuario u ON u.id_usuario = e.id_usuario
      INNER JOIN programa p ON p.id_programa = m.id_programa
    `;
    const params: (string | number)[] = [];
    if (id_programa && !isNaN(Number(id_programa))) {
      query += " WHERE m.id_programa = ?";
      params.push(Number(id_programa));
    }
    query += " ORDER BY m.fecha_matricula DESC";
    const [rows] = await pool.query(query, params);
    res.status(200).json({ ok: true, origen: ORIGEN_REAL, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al generar reporte de matriculas" });
  }
};

// GET /api/reportes/notas
// HU-18 reporta el alcance disponible sin corregir la HU previa del modelo de notas.
export const reporteNotas = async (req: Request, res: Response) => {
  const pool = getConnection();
  try {
    const { id_corte } = req.query;
    let query = `
      SELECT
        n.id_nota,
        n.valor AS calificacion,
        n.fecha_registro,
        n.version_numero,
        a.nombre AS asignatura,
        c.nombre_corte AS corte,
        c.porcentaje
      FROM nota n
      INNER JOIN corte c ON c.id_corte = n.id_corte
      INNER JOIN asignatura a ON a.id_asignatura = n.id_asignatura
    `;
    const params: (string | number)[] = [];
    if (id_corte && !isNaN(Number(id_corte))) {
      query += " WHERE n.id_corte = ?";
      params.push(Number(id_corte));
    }
    query += " ORDER BY c.nombre_corte, a.nombre";
    const [rows] = await pool.query(query, params);
    res.status(200).json({
      ok: true,
      origen: ORIGEN_PARCIAL,
      data: rows,
      aviso: "Reporte parcial: nota no relaciona estudiante ni detalle_matricula; no se modifica porque pertenece a HU previas.",
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al generar reporte de notas" });
  }
};

// GET /api/reportes/asistencia
// HU-18 reporta el alcance disponible sin corregir la HU previa del modelo de asistencia.
export const reporteAsistencia = async (req: Request, res: Response) => {
  const pool = getConnection();
  try {
    const { estado } = req.query;
    let query = `
      SELECT
        asi.id_asistencia,
        asi.fecha_asistencia,
        asi.estado_asistencia AS estado,
        asi.observaciones,
        a.nombre AS asignatura,
        u.nombres_usuario AS docente_nombres,
        u.apellidos_usuario AS docente_apellidos
      FROM asistencia asi
      INNER JOIN asignatura a ON a.id_asignatura = asi.id_asignatura
      INNER JOIN docente d ON d.id_docente = asi.id_docente
      INNER JOIN usuario u ON u.id_usuario = d.id_usuario
      WHERE 1 = 1
    `;
    const params: string[] = [];
    if (estado && typeof estado === "string") {
      query += " AND asi.estado_asistencia = ?";
      params.push(estado);
    }
    query += " ORDER BY asi.fecha_asistencia DESC, a.nombre";
    const [rows] = await pool.query(query, params);
    res.status(200).json({
      ok: true,
      origen: ORIGEN_PARCIAL,
      data: rows,
      aviso: "Reporte parcial: asistencia no relaciona estudiante ni grupo; no se modifica porque pertenece a HU previas.",
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al generar reporte de asistencia" });
  }
};

// GET /api/reportes/pqr
export const reportePqr = async (req: Request, res: Response) => {
  const pool = getConnection();
  try {
    const { estado } = req.query;
    let query = `
      SELECT
        p.id_pqr,
        p.titulo_pqr AS asunto,
        p.descripcion_pqr AS descripcion,
        p.estado_pqr AS estado,
        p.fecha_creacion_pqr AS fecha_creacion,
        u.nombres_usuario,
        u.apellidos_usuario
      FROM pqr p
      INNER JOIN usuario u ON u.id_usuario = p.id_usuario
    `;
    const params: string[] = [];
    if (estado && typeof estado === "string") {
      query += " WHERE p.estado_pqr = ?";
      params.push(estado);
    }
    query += " ORDER BY p.fecha_creacion_pqr DESC";
    const [rows] = await pool.query(query, params);
    res.status(200).json({ ok: true, origen: ORIGEN_REAL, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al generar reporte de PQR" });
  }
};

// GET /api/reportes/resumen
export const reporteResumen = async (req: Request, res: Response) => {
  const pool = getConnection();
  try {
    const [[{ total_usuarios }]] = await pool.query(
      `SELECT COUNT(*) AS total_usuarios FROM usuario`
    ) as any;
    const [[{ total_estudiantes }]] = await pool.query(
      `SELECT COUNT(*) AS total_estudiantes FROM estudiante`
    ) as any;
    const [[{ total_matriculas }]] = await pool.query(
      `SELECT COUNT(*) AS total_matriculas FROM matricula`
    ) as any;
    const [[{ total_grupos }]] = await pool.query(
      `SELECT COUNT(*) AS total_grupos FROM grupo`
    ) as any;
    const [[{ total_pqr_pendientes }]] = await pool.query(
      `SELECT COUNT(*) AS total_pqr_pendientes FROM pqr WHERE estado_pqr = 'pendiente'`
    ) as any;
    const [[{ total_programas }]] = await pool.query(
      `SELECT COUNT(*) AS total_programas FROM programa`
    ) as any;
    const [[{ total_asistencias }]] = await pool.query(
      `SELECT COUNT(*) AS total_asistencias FROM asistencia`
    ) as any;

    res.status(200).json({
      ok: true,
      origen: ORIGEN_REAL,
      data: {
        total_usuarios,
        total_estudiantes,
        total_matriculas,
        total_grupos,
        total_pqr_pendientes,
        total_programas,
        total_asistencias,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: "Error al generar resumen del sistema" });
  }
};
