import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './TopNav.css';

export default function TopNav() {
  const location = useLocation();
  const isAttendance = location.pathname === '/attendance';

  return (
    <header className="topnav">
      <div className="topnav-left">
        <h2 className="font-headline-md text-primary">
          {isAttendance ? 'Professor Portal' : 'Portal de Calificaciones'}
        </h2>

        {isAttendance ? (
          <>
            <div className="topnav-divider"></div>
            <nav className="topnav-nav">
              <NavLink
                to="#"
                className="topnav-link inactive-link"
                onClick={(e) => e.preventDefault()}
              >
                Mis Cursos
              </NavLink>
              <NavLink to="/attendance" className="topnav-link active-link">
                Asistencia
              </NavLink>
              <NavLink
                to="#"
                className="topnav-link inactive-link"
                onClick={(e) => e.preventDefault()}
              >
                Reportes
              </NavLink>
            </nav>
          </>
        ) : (
          <div className="search-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              className="search-input font-body-sm"
              placeholder="Buscar estudiante..."
            />
          </div>
        )}
      </div>

      <div className="topnav-right">
        <button className="icon-btn">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="icon-btn">
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>
    </header>
  );
}
