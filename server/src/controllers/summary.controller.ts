import { Request, Response } from "express";
import { getSummaryData } from "../services/summaryService";

export const getSummary = async (req: Request, res: Response) => {
  try {
    const data = await getSummaryData();
    res.status(200).json({
      ok: true,
      data
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({
      ok: false,
      message: "Error interno al obtener el resumen"
    });
  }
};