import { useState, useEffect, useCallback } from "react";
import type { CSSProperties } from "react";
import { ManagementSidebar } from "../components/manage-users/ManagementSidebar";
import { ManagementTopbar } from "../components/manage-users/ManagementTopbar";
import { api } from "../services/Api";
import { tokenManager } from "../utils/tokenManager";

type ModuloKey =
  | "resumen"
  | "usuarios"
  | "oferta"
  | "matriculas"
  | "notas"
  | "asistencia"
  | "pqr";

interface Resumen {
  total_usuarios: number;
  total_estudiantes: number;
  total_matriculas: number;
  total_grupos: number;
  total_pqr_pendientes: number;
  total_programas: number;
  total_asistencias: number;
}

const MODULOS: { key: ModuloKey; label: string }[] = [
  { key: "resumen", label: "Panel general" },
  { key: "usuarios", label: "Usuarios" },
  { key: "oferta", label: "Oferta academica" },
  { key: "matriculas", label: "Matriculas" },
  { key: "notas", label: "Notas" },
  { key: "asistencia", label: "Asistencia" },
  { key: "pqr", label: "PQR" },
];

async function fetchReporte(modulo: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  const endpoint = `/api/reportes/${modulo}${qs ? "?" + qs : ""}`;
  return api.get(endpoint);
}

export default function ReportesPage() {
  const sessionUser = tokenManager.getUser();
  const [modulo, setModulo] = useState<ModuloKey>("resumen");
  const [datos, setDatos] = useState<any[]>([]);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [aviso, setAviso] = useState("");
  const [origen, setOrigen] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [filtroRol, setFiltroRol] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPrograma, setFiltroPrograma] = useState("");
  const [filtroCorte, setFiltroCorte] = useState("");
  const [filtroAsistencia, setFiltroAsistencia] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    setAviso("");
    setOrigen("");
    try {
      if (modulo === "resumen") {
        const json = await fetchReporte("resumen");
        setResumen(json.data);
        setOrigen(json.origen ?? "");
        setDatos([]);
      } else {
        const params: Record<string, string> = {};
        if (modulo === "usuarios" && filtroRol) params.rol = filtroRol;
        if (modulo === "pqr" && filtroEstado) params.estado = filtroEstado;
        if (modulo === "oferta" && filtroPrograma) params.id_programa = filtroPrograma;
        if (modulo === "matriculas" && filtroPrograma) params.id_programa = filtroPrograma;
        if (modulo === "notas" && filtroCorte) params.id_corte = filtroCorte;
        if (modulo === "asistencia" && filtroAsistencia) params.estado = filtroAsistencia;

        const json = await fetchReporte(modulo, params);
        setDatos(json.data ?? []);
        setOrigen(json.origen ?? "");
        if (json.aviso) setAviso(json.aviso);
      }
    } catch {
      setError("No se pudo obtener el reporte. Verifica tu sesion o la conexion.");
    } finally {
      setCargando(false);
    }
  }, [modulo, filtroRol, filtroEstado, filtroPrograma, filtroCorte, filtroAsistencia]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const visibleDatos = searchValue.trim()
    ? datos.filter((fila) =>
        Object.values(fila).some((value) =>
          String(value ?? "").toLowerCase().includes(searchValue.trim().toLowerCase())
        )
      )
    : datos;
  const columnas = visibleDatos.length > 0 ? Object.keys(visibleDatos[0]) : [];

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)]">
        <ManagementSidebar activeItem="Reportes" />

        <main className="border-l border-slate-200 bg-[#f7f9fc]">
          <ManagementTopbar
            searchValue={searchValue}
            userName={sessionUser?.nombre ?? "Usuario"}
            searchPlaceholder="Buscar en reporte..."
            onSearchChange={setSearchValue}
          />

          <div style={{ fontFamily: "Manrope, sans-serif", padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
            <h1 style={{ color: "#072d63", marginBottom: "0.25rem" }}>Reportes finales del sistema</h1>
            <p style={{ color: "#5f738f", marginBottom: "1.5rem" }}>
              HU-18 - EP-06 Reportes y panel administrativo - Sprint 3
            </p>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        {MODULOS.map((m) => (
          <button
            key={m.key}
            onClick={() => setModulo(m.key)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: modulo === m.key ? "#072d63" : "#cfe1fb",
              color: modulo === m.key ? "#fff" : "#072d63",
              fontWeight: 600,
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {modulo === "usuarios" && (
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} style={selectStyle}>
            <option value="">Todos los roles</option>
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="ADMINISTRADOR">Administrador</option>
            <option value="COORDINADOR">Coordinador</option>
            <option value="DOCENTE">Docente</option>
          </select>
        )}

        {modulo === "pqr" && (
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} style={selectStyle}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="cerrada">Cerrada</option>
          </select>
        )}

        {(modulo === "oferta" || modulo === "matriculas") && (
          <input
            type="number"
            placeholder="ID de programa (opcional)"
            value={filtroPrograma}
            onChange={(e) => setFiltroPrograma(e.target.value)}
            style={inputStyle}
          />
        )}

        {modulo === "notas" && (
          <input
            type="number"
            placeholder="ID de corte (opcional)"
            value={filtroCorte}
            onChange={(e) => setFiltroCorte(e.target.value)}
            style={inputStyle}
          />
        )}

        {modulo === "asistencia" && (
          <select value={filtroAsistencia} onChange={(e) => setFiltroAsistencia(e.target.value)} style={selectStyle}>
            <option value="">Todos los estados</option>
            <option value="PRESENTE">Presente</option>
            <option value="AUSENTE">Ausente</option>
            <option value="EXCUSA">Excusa</option>
          </select>
        )}
      </div>

      {origen && (
        <div style={origen === "real_parcial" ? warningStyle : originStyle}>
          Origen de datos: {origen === "real_parcial" ? "real parcial" : "real"}
        </div>
      )}

      {aviso && <div style={warningStyle}>{aviso}</div>}

      {error && <div style={errorStyle}>{error}</div>}

      {cargando && <p style={{ color: "#5f738f" }}>Cargando reporte...</p>}

      {!cargando && modulo === "resumen" && resumen && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
          {(
            [
              ["Usuarios del sistema", resumen.total_usuarios],
              ["Estudiantes", resumen.total_estudiantes],
              ["Matriculas", resumen.total_matriculas],
              ["Grupos activos", resumen.total_grupos],
              ["PQR pendientes", resumen.total_pqr_pendientes],
              ["Programas", resumen.total_programas],
              ["Registros asistencia", resumen.total_asistencias],
            ] as [string, number][]
          ).map(([label, valor]) => (
            <div key={label} style={cardStyle}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#072d63" }}>{valor}</div>
              <div style={{ color: "#5f738f", fontSize: "0.85rem", marginTop: "0.25rem" }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {!cargando && modulo !== "resumen" && datos.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <p style={{ color: "#5f738f", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            {datos.length} registro(s) encontrado(s)
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#072d63", color: "#fff" }}>
                {columnas.map((col) => (
                  <th key={col} style={thStyle}>
                    {col.replace(/_/g, " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleDatos.map((fila, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#f8fafd" : "#fff" }}>
                  {columnas.map((col) => (
                    <td key={col} style={tdStyle}>
                      {String(fila[col] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!cargando && modulo !== "resumen" && visibleDatos.length === 0 && !error && (
        <p style={{ color: "#5f738f" }}>No hay registros para mostrar con los filtros actuales.</p>
      )}
          </div>
        </main>
      </div>
    </div>
  );
}

const selectStyle: CSSProperties = {
  padding: "0.4rem 0.75rem",
  borderRadius: 8,
  border: "1px solid #cfe1fb",
  background: "#fff",
  color: "#072d63",
  fontWeight: 600,
};

const inputStyle: CSSProperties = {
  padding: "0.4rem 0.75rem",
  borderRadius: 8,
  border: "1px solid #cfe1fb",
  color: "#072d63",
  width: 220,
};

const cardStyle: CSSProperties = {
  background: "#f0f6ff",
  border: "1px solid #cfe1fb",
  borderRadius: 12,
  padding: "1.25rem",
  textAlign: "center",
};

const thStyle: CSSProperties = {
  padding: "0.6rem 0.75rem",
  textAlign: "left",
  fontWeight: 700,
  textTransform: "capitalize",
};

const tdStyle: CSSProperties = {
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid #e2eaf5",
};

const originStyle: CSSProperties = {
  background: "#e7f5ec",
  border: "1px solid #9dd8b3",
  borderRadius: 8,
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  color: "#1f6f3d",
  fontWeight: 600,
};

const warningStyle: CSSProperties = {
  background: "#fff3cd",
  border: "1px solid #ffc107",
  borderRadius: 8,
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  color: "#856404",
};

const errorStyle: CSSProperties = {
  background: "#f8d7da",
  border: "1px solid #f5c2c7",
  borderRadius: 8,
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  color: "#842029",
};
