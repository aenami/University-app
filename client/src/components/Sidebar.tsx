import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="font-headline-md text-primary">Unicomfacauca</h1>
        <p className="font-label-md text-secondary">Professor Portal</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="#"
          className="nav-link inactive-link"
          onClick={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="font-label-md">Dashboard</span>
        </NavLink>

        <NavLink
          to="#"
          className="nav-link inactive-link"
          onClick={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined">school</span>
          <span className="font-label-md">Classes</span>
        </NavLink>

        <NavLink
          to="/grades"
          className={({ isActive }) =>
            `nav-link ${
              isActive || location.pathname === '/' ? 'active-link' : 'inactive-link'
            }`
          }
        >
          <span className="material-symbols-outlined">grading</span>
          <span className="font-label-md">Grades</span>
        </NavLink>

        <NavLink
          to="#"
          className="nav-link inactive-link"
          onClick={(e) => e.preventDefault()}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="font-label-md">Alerts</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="profile-container">
          <img
            alt="Professor Avatar"
            className="avatar"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdr1j7G5GqSBWYv2AOSZwV2vy0ylRkKRdGeNESJKyyCPOtTNfl5jd6X6B_WxqUkb3WHplijDp75YNvKv9Vx41Lzn8ucPMwxqevAuz_dp041KO1vtJQHN8GkbrNWdOHZFPTvOPmAqO3nxQT5iirMtFiK4GpBZA2SIqZdnlsB6qaVh3KQrq1gTnYC86m0MwZpLa3P_cOC67XR1y9n2TqjGPMb6th2obCGNIX1PC73Gmc5g3Syvmb-ZZ1vSUL3s6gPxzTkjJFJga2mSA"
          />
          <div>
            <p className="font-label-md text-primary">Dr. Ricardo Silva</p>
            <p className="font-label-sm text-secondary uppercase tracking-wider">
              Facultad de Ingeniería
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
