import { api } from './Api';
import type { AsistenciaPayload, NotaPayload } from '../types/academic';

export const academicApi = {
  async getGrupos() {
    // Usamos el endpoint configurado en grupo.routes.ts
    const response = await api.get('/api/grupo');
    return response;
  },

  async getCortes() {
    // Usamos el endpoint configurado en corte.routes.ts
    const response = await api.get('/api/corte');
    return response;
  },

  async getNotasPorGrupo(id_grupo: number) {
    // Usamos el endpoint de notas
    const response = await api.get(`/api/notas/grupo/${id_grupo}`);
    return response;
  },

  async registrarNota(payload: NotaPayload) {
    if (payload.id_nota) {
      // Actualizar
      const response = await api.put(`/api/notas/${payload.id_nota}`, payload as unknown as Record<string, unknown>);
      return response;
    } else {
      // Crear nueva
      const response = await api.post('/api/notas', payload as unknown as Record<string, unknown>);
      return response;
    }
  },

  async registrarAsistencia(payload: AsistenciaPayload) {
    const response = await api.post('/api/attendance', payload as unknown as Record<string, unknown>);
    return response;
  },
};
