export interface GrupoAcademico {
  id_grupo: number;
  nombre: string;
  asignatura: string;
}

export interface Estudiante {
  id_estudiante: number;
  nombres: string;
  apellidos: string;
  documento: string;
}

export interface NotaPayload {
  id_nota?: number;
  id_estudiante: number;
  id_grupo: number;
  id_corte: number;
  valor: number;
}

export interface AsistenciaPayload {
  id_estudiante: number;
  id_grupo: number;
  estado: 'PRESENTE' | 'AUSENTE' | 'EXCUSA';
  observacion?: string;
  fecha?: string;
}

export interface TrackingRowData {
  estudiante: Estudiante;
  corte1: number | null;
  corte2: number | null;
  corte3: number | null;
  definitiva: number | null;
  fallas: number;
  estado: 'Aprobado' | 'En Riesgo' | 'Reprobado' | 'En Curso';
  id_nota_corte1?: number;
  id_nota_corte2?: number;
  id_nota_corte3?: number;
}
