import React, { useState } from 'react';
import './AttendanceControl.css';

const MOCK_ATTENDANCE = [
  {
    id: '2021115042',
    name: 'Andrés Felipe Morales',
    email: 'andres.morales@unicomfacauca.edu.co',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8XOMRb3vSGEb_iQoWo-dej3ypQVtQmhvLGvvF0KGmwwYUvpJjRhd4DtTL_gwvp0wdzHWWV5nickN8M8nCUPm2xBYnJeaUAjiAdHUdX70hklvxnuP-qw7GnFVita7arieASTJn5W1JhHRGGDJsoRmUT4oMmPPKBFpGfSuqdhZpfRHgI1QWx8XVuIn40rNbM8yNfbxSBP7im6517Hi3GFNeC9uzd0DeTX819XKiJsYDjtViOlrL1hDMQDAbvrCHosN6zY6GZ-jDyGQ',
    status: 'presente'
  },
  {
    id: '2021115018',
    name: 'Isabella Martínez Vega',
    email: 'isabella.vega@unicomfacauca.edu.co',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoZ3VBP-SrNcIZTAl25G6sM7uImiNVmdkCZj1Sl1UA2as9coabXr-QiJhjoNtzS5OaQ-7lkzTnkUgUCCNwclIxtftF5wL_y9XOpkfHM83ZhoHs_0aa_jnFZ7XKK4G1jl7uAEvVPLjWbnfElGOw-Q6-qNGwWZ-oC4ZQ1Lf6S4a7jt3M2SlBwh0_vNsPm-mqD0p-S-_PqJkutyetivuoNWhCdJrpWrs1kB3c7QyiwrM2MDSUqs8kwbsrFQV0Yr3TfQv03_k5wtyq_k4',
    status: 'presente'
  },
  {
    id: '2021115089',
    name: 'Juan Camilo Perea',
    email: 'juan.perea@unicomfacauca.edu.co',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4K1VI82sSdV55VK2AZzfdYNOPZdTSPVsoF8JvzfuMl5R7Ewkj8LhgnTiiieqH5See1Mt6Tnoy8OaD-mJJ-ZnAFkM6MIgj2CSS-mD21_JYswFzu027rCnranwJ9h-le2LhfRqa5DWS8qDLjZo_S64UlLZ3vtDauGYbt-QbevKCecqTy5SQSRpcouk3rZaYZDFIlr9KRgvXoS2x3bym9I5Nec_qJguDPHz2_4Mjz54LiOmnDf9BYxhuhnIsmkIY-NtA4JeJ5mn9cLo',
    status: 'ausente'
  },
  {
    id: '2021115055',
    name: 'Valentina Castro',
    email: 'v.castro@unicomfacauca.edu.co',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjn4cbvZTOzt79_y25pXe2XZY6fG8lmqR_mGDpvB1xpSqoxDCUUF5V5Sh6hjOuEVqBhqxJqJjXEAgAlt1-_bQqNCZAVuRm8FxbpwXs-bxJjPMyczVmmARkj4IJA3GKp_1dpKMu4RmKnqH_wBi9BbxogSgXhysryOTSKc4CTcaVowFDRd3v8EzAYW1yo6W6JHAJs45jJjjUtI6ZFwaLpg8S9VYCF86RjmTM6GuOAKXHONUcLqZWMGQELakCnDIBXE6O_py3Cri-iCQ',
    status: 'excusa'
  },
  {
    id: '2021115102',
    name: 'Santiago Gómez',
    email: 's.gomez@unicomfacauca.edu.co',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX5PRDUnxqDd5joqZiye-sJzVbjnP6QthltOWzaNXu_8F5H5P1mzJpBJnEmhqjd7Fc2yyTJNt_oCOa1lGzPCzKrrZH-oz8rxX9IuELExEpyBLgdo_8aoXY3hCmJQ5c4UI3kxdfRqbBa4jjXyANavFIwFiwmnVbTQWflXEkxe9aRqxLyYE5ao1cVN1-RazRMSdaNxYHdSOxguLsDp-oGbIKxlP3hoeYex_r2Uhn4c2owIlio_fU5vzUm2c0lTVQu5XSTwxBFjdT_RA',
    status: 'presente'
  }
];

export default function AttendanceControl() {
  const [students, setStudents] = useState(MOCK_ATTENDANCE);

  const handleStatusChange = (index: number, newStatus: string) => {
    const newStudents = [...students];
    newStudents[index].status = newStatus;
    setStudents(newStudents);
  };

  const presentCount = students.filter(s => s.status === 'presente').length;
  const absentCount = students.filter(s => s.status === 'ausente').length;
  const excusedCount = students.filter(s => s.status === 'excusa').length;

  return (
    <div className="attendance-page p-lg">
      <div className="attendance-content">
        
        {/* Header Actions */}
        <div className="attendance-header">
          <div>
            <h2 className="font-headline-lg text-primary mb-xs">Control de Asistencia</h2>
            <p className="font-body-md text-on-surface-variant">Ingeniería de Software II - Grupo 401B</p>
          </div>
          
          <div className="header-actions">
            <div className="date-picker-group">
              <label className="font-label-sm text-on-surface-variant">Fecha de Clase</label>
              <input type="date" className="date-input font-body-sm" defaultValue="2024-05-24" />
            </div>
            
            <button className="btn-save font-label-md">
              <span className="material-symbols-outlined">save</span>
              Guardar Asistencia
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined">group</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Estudiantes</p>
              <p className="font-headline-md text-on-surface">{students.length}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-positive-container text-positive">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Presentes</p>
              <p className="font-headline-md text-on-surface">{presentCount}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-error-container text-error">
              <span className="material-symbols-outlined">cancel</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Ausentes</p>
              <p className="font-headline-md text-on-surface">{absentCount}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon-wrapper bg-tertiary-fixed text-tertiary">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <p className="font-label-sm text-on-surface-variant">Excusas</p>
              <p className="font-headline-md text-on-surface">{excusedCount}</p>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th className="w-400">Estudiante</th>
                <th>ID Institucional</th>
                <th className="text-center">Control de Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => (
                <tr key={student.id}>
                  <td>
                    <div className="student-profile">
                      <img src={student.avatar} alt="Student" className="student-avatar" />
                      <div>
                        <p className="font-body-md font-semibold text-on-surface">{student.name}</p>
                        <p className="font-label-sm text-on-surface-variant">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-label-md text-secondary">{student.id}</span>
                  </td>
                  <td>
                    <div className="toggle-group-wrapper">
                      <div className="toggle-group">
                        <button
                          className={`toggle-btn ${student.status === 'presente' ? 'btn-present' : ''}`}
                          onClick={() => handleStatusChange(idx, 'presente')}
                        >
                          Presente
                        </button>
                        <button
                          className={`toggle-btn ${student.status === 'ausente' ? 'btn-absent' : ''}`}
                          onClick={() => handleStatusChange(idx, 'ausente')}
                        >
                          Ausente
                        </button>
                        <button
                          className={`toggle-btn ${student.status === 'excusa' ? 'btn-excused' : ''}`}
                          onClick={() => handleStatusChange(idx, 'excusa')}
                        >
                          Excusa
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="pagination-footer">
            <p className="font-label-sm text-on-surface-variant">Mostrando {students.length} de 32 estudiantes</p>
            <div className="pagination-controls">
              <button className="page-btn disabled"><span className="material-symbols-outlined">chevron_left</span></button>
              <button className="page-btn active">1</button>
              <button className="page-btn">2</button>
              <button className="page-btn">3</button>
              <button className="page-btn"><span className="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
