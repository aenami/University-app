import { useEffect, useState } from 'react'
import { useDashboardStore } from '../store/dashboardStore'
import TarjetaIndicador from '../components/TarjetaIndicador'
import DashboardLayout from '../components/DashboardLayout'
import FiltrosDashboard, { type Modulo } from '../components/FiltrosDashboard'

const INTERVALO_MS = 30_000 // refresca cada 30 segundos automáticamente

export default function Dashboard() {
  const { indicadores, loading, error, lastUpdated, cargarIndicadores } = useDashboardStore()
  const [filtro, setFiltro] = useState<Modulo>('todos')

  useEffect(() => {
    // Carga inicial
    cargarIndicadores()

    // Auto-refresh cada 30 s
    const id = setInterval(() => {
      cargarIndicadores()
    }, INTERVALO_MS)

    return () => clearInterval(id)
  }, [cargarIndicadores])

  const formatHora = (d: Date) =>
    d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  const mostrar = (modulo: Modulo) => filtro === 'todos' || filtro === modulo

  return (
    <DashboardLayout>
      {/* Barra de estado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
          {lastUpdated
            ? `Ultima actualizacion: ${formatHora(lastUpdated)} · refresca cada ${INTERVALO_MS / 1000}s`
            : 'Sin datos aun'}
        </div>
        {loading && (
          <div style={{ fontSize: 12, color: '#6366f1', fontWeight: 500 }}>
            Actualizando...
          </div>
        )}
      </div>

      {/* Aviso mock */}
      {error && (
        <div style={{
          background: '#fffbeb',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '10px 16px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#92400e',
        }}>
          <strong>[MOCK]</strong> {error}
        </div>
      )}

      {/* Filtros */}
      <FiltrosDashboard moduloActivo={filtro} onCambioModulo={setFiltro} />

      {/* Indicadores */}
      {indicadores && (
        <>
          {mostrar('usuarios') && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={estiloSeccion}>Usuarios</h2>
              <div style={estiloGrid}>
                <TarjetaIndicador titulo="Usuarios activos"   valor={indicadores.usuarios_activos}   subtitulo="Con acceso al sistema"     color="verde"   icono="✅" />
                <TarjetaIndicador titulo="Usuarios inactivos" valor={indicadores.usuarios_inactivos} subtitulo="Sin acceso activo"          color="rojo"    icono="🚫" />
                <TarjetaIndicador titulo="Total usuarios"     valor={indicadores.usuarios_activos + indicadores.usuarios_inactivos} subtitulo="Registrados en el sistema" color="azul" icono="👤" />
              </div>
            </section>
          )}

          {mostrar('oferta') && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={estiloSeccion}>Oferta Academica</h2>
              <div style={estiloGrid}>
                <TarjetaIndicador titulo="Grupos creados"  valor={indicadores.grupos_creados} subtitulo="Grupos activos este periodo"        color="morado" icono="📚" />
                <TarjetaIndicador titulo="Cupos totales"   valor={indicadores.cupos_totales}  subtitulo="Disponibles en todos los grupos"    color="azul"   icono="🪑" />
              </div>
            </section>
          )}

          {mostrar('matricula') && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={estiloSeccion}>Matricula</h2>
              <div style={estiloGrid}>
                <TarjetaIndicador titulo="Matriculas registradas" valor={indicadores.matriculas_registradas} subtitulo="Prematriculas o matriculas activas" color="verde" icono="📋" />
              </div>
            </section>
          )}

          {mostrar('pqr') && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={estiloSeccion}>PQR / Soporte</h2>
              <div style={estiloGrid}>
                <TarjetaIndicador titulo="PQR pendientes" valor={indicadores.pqr_pendientes} subtitulo="Sin resolver"   color="naranja" icono="⏳" />
                <TarjetaIndicador titulo="PQR cerradas"   valor={indicadores.pqr_cerradas}   subtitulo="Atendidas"      color="verde"   icono="✔️" />
                <TarjetaIndicador titulo="Total PQR"      valor={indicadores.pqr_pendientes + indicadores.pqr_cerradas} subtitulo="Registradas" color="azul" icono="📨" />
              </div>
            </section>
          )}
        </>
      )}

      {loading && !indicadores && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          Cargando indicadores...
        </div>
      )}
    </DashboardLayout>
  )
}

const estiloSeccion: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '12px',
  marginTop: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
}

const estiloGrid: React.CSSProperties = {
  display: 'flex',
  gap: '16px',
  flexWrap: 'wrap',
}
