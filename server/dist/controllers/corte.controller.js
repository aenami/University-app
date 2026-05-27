"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCorte = exports.updateCorte = exports.createCorte = exports.getCorteById = exports.getAllCortes = void 0;
const Corte_js_1 = __importDefault(require("../models/Corte.js"));
/**
 * Obtiene todos los cortes académicos.
 */
const getAllCortes = async (req, res) => {
    try {
        const cortes = await Corte_js_1.default.getAll();
        return res.status(200).json({
            error: false,
            message: 'Cortes académicos obtenidos con éxito.',
            data: cortes
        });
    }
    catch (error) {
        console.error('Error en getAllCortes controller:', error);
        return res.status(500).json({
            error: true,
            message: 'Ocurrió un error interno al obtener los cortes académicos.'
        });
    }
};
exports.getAllCortes = getAllCortes;
/**
 * Obtiene un corte específico por ID.
 */
const getCorteById = async (req, res) => {
    const { id_corte } = req.params;
    if (!id_corte || isNaN(Number(id_corte))) {
        return res.status(400).json({
            error: true,
            message: 'El ID del corte proporcionado no es válido.'
        });
    }
    try {
        const corte = await Corte_js_1.default.getById(Number(id_corte));
        if (!corte) {
            return res.status(404).json({
                error: true,
                message: `El corte con ID ${id_corte} no fue encontrado.`
            });
        }
        return res.status(200).json({
            error: false,
            message: 'Corte académico obtenido con éxito.',
            data: corte
        });
    }
    catch (error) {
        console.error('Error en getCorteById controller:', error);
        return res.status(500).json({
            error: true,
            message: 'Ocurrió un error interno al obtener el corte académico.'
        });
    }
};
exports.getCorteById = getCorteById;
/**
 * Crea un nuevo corte académico.
 */
const createCorte = async (req, res) => {
    const { nombre_corte, porcentaje, fecha_inicio, fecha_fin } = req.body;
    if (!nombre_corte || porcentaje === undefined || !fecha_inicio || !fecha_fin) {
        return res.status(400).json({
            error: true,
            message: 'Faltan campos requeridos: nombre_corte, porcentaje, fecha_inicio, fecha_fin.'
        });
    }
    if (isNaN(Number(porcentaje)) || porcentaje < 0 || porcentaje > 100) {
        return res.status(400).json({
            error: true,
            message: 'El porcentaje debe ser un número entre 0 y 100.'
        });
    }
    try {
        const id_corte = await Corte_js_1.default.create(nombre_corte, Number(porcentaje), fecha_inicio, fecha_fin);
        return res.status(201).json({
            error: false,
            message: 'Corte académico creado con éxito.',
            data: { id_corte }
        });
    }
    catch (error) {
        console.error('Error en createCorte controller:', error);
        return res.status(500).json({
            error: true,
            message: 'Ocurrió un error interno al crear el corte académico.'
        });
    }
};
exports.createCorte = createCorte;
/**
 * Actualiza un corte académico.
 */
const updateCorte = async (req, res) => {
    const { id_corte } = req.params;
    const { nombre_corte, porcentaje, fecha_inicio, fecha_fin } = req.body;
    if (!id_corte || isNaN(Number(id_corte))) {
        return res.status(400).json({
            error: true,
            message: 'El ID del corte proporcionado no es válido.'
        });
    }
    if (porcentaje !== undefined && (isNaN(Number(porcentaje)) || porcentaje < 0 || porcentaje > 100)) {
        return res.status(400).json({
            error: true,
            message: 'El porcentaje debe ser un número entre 0 y 100.'
        });
    }
    try {
        const updated = await Corte_js_1.default.update(Number(id_corte), nombre_corte, porcentaje ? Number(porcentaje) : undefined, fecha_inicio, fecha_fin);
        if (!updated) {
            return res.status(404).json({
                error: true,
                message: `El corte con ID ${id_corte} no fue encontrado.`
            });
        }
        return res.status(200).json({
            error: false,
            message: 'Corte académico actualizado con éxito.'
        });
    }
    catch (error) {
        console.error('Error en updateCorte controller:', error);
        return res.status(500).json({
            error: true,
            message: 'Ocurrió un error interno al actualizar el corte académico.'
        });
    }
};
exports.updateCorte = updateCorte;
/**
 * Elimina un corte académico.
 */
const deleteCorte = async (req, res) => {
    const { id_corte } = req.params;
    if (!id_corte || isNaN(Number(id_corte))) {
        return res.status(400).json({
            error: true,
            message: 'El ID del corte proporcionado no es válido.'
        });
    }
    try {
        const deleted = await Corte_js_1.default.delete(Number(id_corte));
        if (!deleted) {
            return res.status(404).json({
                error: true,
                message: `El corte con ID ${id_corte} no fue encontrado.`
            });
        }
        return res.status(200).json({
            error: false,
            message: 'Corte académico eliminado con éxito.'
        });
    }
    catch (error) {
        console.error('Error en deleteCorte controller:', error);
        return res.status(500).json({
            error: true,
            message: 'Ocurrió un error interno al eliminar el corte académico.'
        });
    }
};
exports.deleteCorte = deleteCorte;
