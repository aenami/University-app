import React, { useState } from 'react';
import './GradesPortal.css';

const MOCK_STUDENTS = [
  { id: '01', name: 'ARBELÁEZ, SANTIAGO', p1: 4.5, q: 3.8, t: 4.0, a: 5.0 },
  { id: '02', name: 'BOLAÑOS, VALENTINA', p1: 3.2, q: 3.5, t: 2.8, a: 4.5 },
  { id: '03', name: 'CASTRILLÓN, ANDRÉS', p1: 2.0, q: 2.5, t: 2.0, a: 3.0 },
  { id: '04', name: 'DIAZ, CAMILO', p1: 3.9, q: 4.1, t: 4.9, a: 0.8 },
  { id: '05', name: 'ESPINOSA, MARIA', p1: 2.6, q: 4.5, t: 2.1, a: 1.5 },
  { id: '06', name: 'FUENTES, JORGE', p1: 2.4, q: 3.9, t: 1.9, a: 0.0 },
];

export default function GradesPortal() {
  const [students, setStudents] = useState(MOCK_STUDENTS);

  const handleGradeChange = (index: number, field: string, value: string) => {
    const newStudents = [...students];
    newStudents[index] = {
      ...newStudents[index],
      [field]: parseFloat(value) || 0,
    };
    setStudents(newStudents);
  };

  const calculateAverage = (student: any) => {
    return (
      student.p1 * 0.35 +
      student.q * 0.20 +
      student.t * 0.30 +
      student.a * 0.15
    ).toFixed(1);
  };

  const getGroupAverage = () => {
    const total = students.reduce((acc, student) => acc + parseFloat(calculateAverage(student)), 0);
    return (total / students.length).toFixed(1);
  };

  return (
    <div className="grades-page">
      {/* Controls Bar */}
      <div className="controls-bar">
        <div className="control-group">
          <label className="font-label-md text-secondary">Grupo Académico</label>
          <select className="control-select font-body-sm">
            <option>ING-SIST-7A (Ingeniería de Sistemas)</option>
            <option>ING-SIST-3B (Programación II)</option>
            <option>ING-SIST-5C (Bases de Datos)</option>
          </select>
        </div>

        <div className="control-group">
          <label className="font-label-md text-secondary">Corte Académico</label>
          <div className="tabs-container">
            <button className="tab-btn active-tab">Corte 1</button>
            <button className="tab-btn">Corte 2</button>
            <button className="tab-btn">Corte 3</button>
          </div>
        </div>

        <div className="status-actions">
          <div className="sync-status">
            <span className="sync-dot"></span>
            <span className="font-label-sm text-primary uppercase">Sincronizado en tiempo real</span>
          </div>
          <button className="btn-primary-container font-label-md">
            <span className="material-symbols-outlined">save</span>
            Publicar Definitivas
          </button>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="spreadsheet-container">
        <div className="table-wrapper">
          <table className="grades-table">
            <thead>
              <tr>
                <th className="text-center w-12">#</th>
                <th className="w-64">Nombre del Estudiante</th>
                <th className="text-center bg-surface-container">Parcial (35%)</th>
                <th className="text-center">Quices (20%)</th>
                <th className="text-center">Talleres (30%)</th>
                <th className="text-center">Asistencia (15%)</th>
                <th className="text-center bg-primary text-on-primary">Promedio</th>
                <th className="text-center w-20">Obs.</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const avg = parseFloat(calculateAverage(s));
                const isError = avg < 3.0;

                return (
                  <tr key={s.id}>
                    <td className="text-center font-body-sm text-secondary">{s.id}</td>
                    <td className="font-body-md font-semibold">{s.name}</td>
                    <td className="bg-surface-container-20">
                      <input
                        type="number"
                        step="0.1"
                        className={`grade-input ${isError ? 'text-error' : ''}`}
                        value={s.p1}
                        onChange={(e) => handleGradeChange(i, 'p1', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        className="grade-input"
                        value={s.q}
                        onChange={(e) => handleGradeChange(i, 'q', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        className="grade-input"
                        value={s.t}
                        onChange={(e) => handleGradeChange(i, 't', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.1"
                        className="grade-input"
                        value={s.a}
                        onChange={(e) => handleGradeChange(i, 'a', e.target.value)}
                      />
                    </td>
                    <td className={`text-center ${isError ? 'bg-error-container-20' : 'bg-primary-container-5'}`}>
                      <span className={`font-headline-md font-bold ${isError ? 'text-error' : 'text-primary'}`}>
                        {avg.toFixed(1)}
                      </span>
                    </td>
                    <td className="text-center">
                      {isError ? (
                        <button className="icon-btn-small text-error">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        </button>
                      ) : (
                        <button className="icon-btn-small">
                          <span className="material-symbols-outlined">chat_bubble</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="grades-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <span className="font-label-sm text-secondary uppercase">Promedio Grupal</span>
            <span className="font-headline-md text-primary font-bold">{getGroupAverage()}</span>
          </div>
          <div className="stat-item">
            <span className="font-label-sm text-secondary uppercase">Estudiantes Cargados</span>
            <span className="font-headline-md font-bold">24 / 24</span>
          </div>
          <div className="stat-item">
            <span className="font-label-sm text-secondary uppercase">Pendientes</span>
            <span className="font-headline-md text-error font-bold">0</span>
          </div>
        </div>
        <div className="footer-actions">
          <button className="btn-outline font-label-md">Exportar a Excel</button>
          <button className="btn-primary font-label-md">Confirmar Calificaciones</button>
        </div>
      </footer>
    </div>
  );
}
