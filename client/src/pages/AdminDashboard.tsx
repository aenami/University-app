import { useState, useEffect, useCallback } from 'react'

// ── Tipos ─────────────────────────────────────────────────────────────
interface UsuarioRow {
  id_usuario: number
  nombres_usuario: string
  apellidos_usuario: string
  estado_usuario: 'ACTIVO' | 'INACTIVO'
  rol_usuario: 'ESTUDIANTE' | 'ADMINISTRADOR' | 'COORDINADOR' | 'DOCENTE'
}
interface GrupoRow {
  id_grupo: number
  num_grupo: number
  cupo_maximo: number
  id_asignatura: number
}
interface MatriculaRow {
  id_matricula: number
  id_usuario: number
  id_grupo: number
  estado_matricula: 'ACTIVA' | 'CANCELADA' | 'PENDIENTE'
  fecha_matricula: string
}
interface PqrRow {
  id_pqr: number
  titulo_pqr: string
  descripcion_pqr: string
  estado_pqr: 'pendiente' | 'cerrada'
  fecha_creacion_pqr: string
  id_usuario: number
}

// ── API ───────────────────────────────────────────────────────────────
const BASE = 'http://localhost:3000'
const h = () => ({
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
  'Content-Type': 'application/json',
})
async function api(url: string, opts?: RequestInit) {
  const res = await fetch(BASE + url, { headers: h(), ...opts })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

// ── Mock data ─────────────────────────────────────────────────────────
const MOCK_USUARIOS: UsuarioRow[] = [
  { id_usuario: 1, nombres_usuario: 'Carlos',  apellidos_usuario: 'Muñoz',   estado_usuario: 'ACTIVO',   rol_usuario: 'ESTUDIANTE'    },
  { id_usuario: 2, nombres_usuario: 'Laura',   apellidos_usuario: 'Torres',  estado_usuario: 'ACTIVO',   rol_usuario: 'DOCENTE'       },
  { id_usuario: 3, nombres_usuario: 'Pedro',   apellidos_usuario: 'Ríos',    estado_usuario: 'INACTIVO', rol_usuario: 'ESTUDIANTE'    },
  { id_usuario: 4, nombres_usuario: 'Ana',     apellidos_usuario: 'López',   estado_usuario: 'ACTIVO',   rol_usuario: 'ADMINISTRADOR' },
]
const MOCK_GRUPOS: GrupoRow[] = [
  { id_grupo: 1, num_grupo: 1, cupo_maximo: 35, id_asignatura: 1 },
  { id_grupo: 2, num_grupo: 2, cupo_maximo: 30, id_asignatura: 2 },
  { id_grupo: 3, num_grupo: 1, cupo_maximo: 40, id_asignatura: 3 },
]
const MOCK_MATRICULAS: MatriculaRow[] = [
  { id_matricula: 1, id_usuario: 1, id_grupo: 1, estado_matricula: 'ACTIVA',    fecha_matricula: new Date().toISOString() },
  { id_matricula: 2, id_usuario: 3, id_grupo: 2, estado_matricula: 'CANCELADA', fecha_matricula: new Date().toISOString() },
  { id_matricula: 3, id_usuario: 1, id_grupo: 3, estado_matricula: 'PENDIENTE', fecha_matricula: new Date().toISOString() },
]
const MOCK_PQR: PqrRow[] = [
  { id_pqr: 88, titulo_pqr: 'Solicitud de cambio de horario grupo 3', descripcion_pqr: 'Necesito cambiar el horario del grupo 3.', estado_pqr: 'pendiente', fecha_creacion_pqr: new Date().toISOString(), id_usuario: 1 },
  { id_pqr: 87, titulo_pqr: 'Error en carga de notas corte 2',        descripcion_pqr: 'Las notas del corte 2 no aparecen.',       estado_pqr: 'pendiente', fecha_creacion_pqr: new Date().toISOString(), id_usuario: 2 },
  { id_pqr: 86, titulo_pqr: 'Reclamo por matrícula duplicada',         descripcion_pqr: 'Aparece matrícula duplicada.',             estado_pqr: 'cerrada',   fecha_creacion_pqr: new Date().toISOString(), id_usuario: 3 },
  { id_pqr: 85, titulo_pqr: 'Petición de certificado de notas',        descripcion_pqr: 'Requiero certificado de notas.',           estado_pqr: 'cerrada',   fecha_creacion_pqr: new Date().toISOString(), id_usuario: 4 },
]

// ── Estilos base ──────────────────────────────────────────────────────
const card: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '20px 24px' }
const TH: React.CSSProperties   = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#708090', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }
const TD: React.CSSProperties   = { padding: '11px 14px', fontSize: 13, color: '#1e293b', borderBottom: '1px solid #f1f5f9' }
const INP: React.CSSProperties  = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }
const LBL: React.CSSProperties  = { display: 'block', fontSize: 12, color: '#708090', marginBottom: 4, fontWeight: 500 }

// ── Iconos SVG ────────────────────────────────────────────────────────
function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}
function IconDelete() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

// ── Badges ────────────────────────────────────────────────────────────
function BadgePqr({ estado }: { estado: 'pendiente' | 'cerrada' }) {
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: estado === 'pendiente' ? '#fef3c7' : '#d1fae5', color: estado === 'pendiente' ? '#92400e' : '#065f46' }}>
      {estado}
    </span>
  )
}
function BadgeEstado({ estado }: { estado: string }) {
  const colors: Record<string, { bg: string; color: string }> = {
    ACTIVO:    { bg: '#d1fae5', color: '#065f46' },
    INACTIVO:  { bg: '#fef2f2', color: '#dc2626' },
    ACTIVA:    { bg: '#d1fae5', color: '#065f46' },
    CANCELADA: { bg: '#fef2f2', color: '#dc2626' },
    PENDIENTE: { bg: '#fef3c7', color: '#92400e' },
  }
  const c = colors[estado] ?? { bg: '#f1f5f9', color: '#708090' }
  return (
    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>
      {estado}
    </span>
  )
}
function BadgeRol({ rol }: { rol: string }) {
  return (
    <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 500 }}>
      {rol}
    </span>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────
function KpiCard({ label, valor, sub, acento }: { label: string; valor: number | string; sub: string; acento: string }) {
  return (
    <div style={{ ...card, borderLeft: `4px solid ${acento}` }}>
      <div style={{ fontSize: 12, color: '#708090', fontWeight: 500, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 600, color: '#001e40', lineHeight: 1, marginBottom: 4 }}>{valor}</div>
      <div style={{ fontSize: 11, color: '#708090' }}>{sub}</div>
    </div>
  )
}

// ── Modal genérico ────────────────────────────────────────────────────
function Modal({ titulo, onCerrar, children }: { titulo: string; onCerrar: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: '#001e40' }}>{titulo}</h3>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#708090', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function BtnGuardar({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#003366', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
      Guardar
    </button>
  )
}
function BtnCancelar({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#374151', fontSize: 13, cursor: 'pointer' }}>
      Cancelar
    </button>
  )
}

// ── Modal Usuario ─────────────────────────────────────────────────────
function ModalUsuario({ usuario, onGuardar, onCerrar }: {
  usuario: Partial<UsuarioRow>
  onGuardar: (u: Partial<UsuarioRow>) => void
  onCerrar: () => void
}) {
  const [form, setForm] = useState<Partial<UsuarioRow>>(usuario)
  const [err, setErr] = useState<Record<string, string>>({})
  const set = (k: keyof UsuarioRow) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setErr(v => ({ ...v, [k]: '' }))
  }
  function validar() {
    const e: Record<string, string> = {}
    if (!form.nombres_usuario?.trim())   e.nombres   = 'Requerido'
    if (!form.apellidos_usuario?.trim()) e.apellidos = 'Requerido'
    if (!form.rol_usuario)               e.rol       = 'Requerido'
    setErr(e)
    return Object.keys(e).length === 0
  }
  return (
    <Modal titulo={form.id_usuario ? 'Editar usuario' : 'Nuevo usuario'} onCerrar={onCerrar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LBL}>Nombres *</label>
          <input style={{ ...INP, borderColor: err.nombres ? '#dc2626' : '#cbd5e1' }} value={form.nombres_usuario ?? ''} onChange={set('nombres_usuario')} placeholder="Nombres" />
          {err.nombres && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.nombres}</p>}
        </div>
        <div>
          <label style={LBL}>Apellidos *</label>
          <input style={{ ...INP, borderColor: err.apellidos ? '#dc2626' : '#cbd5e1' }} value={form.apellidos_usuario ?? ''} onChange={set('apellidos_usuario')} placeholder="Apellidos" />
          {err.apellidos && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.apellidos}</p>}
        </div>
        <div>
          <label style={LBL}>Rol *</label>
          <select style={{ ...INP, borderColor: err.rol ? '#dc2626' : '#cbd5e1' }} value={form.rol_usuario ?? ''} onChange={set('rol_usuario')}>
            <option value="">Seleccionar...</option>
            <option value="ESTUDIANTE">Estudiante</option>
            <option value="DOCENTE">Docente</option>
            <option value="COORDINADOR">Coordinador</option>
            <option value="ADMINISTRADOR">Administrador</option>
          </select>
          {err.rol && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.rol}</p>}
        </div>
        <div>
          <label style={LBL}>Estado</label>
          <select style={INP} value={form.estado_usuario ?? 'ACTIVO'} onChange={set('estado_usuario')}>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <BtnCancelar onClick={onCerrar} />
        <BtnGuardar onClick={() => validar() && onGuardar(form)} />
      </div>
    </Modal>
  )
}

// ── Modal Grupo ───────────────────────────────────────────────────────
function ModalGrupo({ grupo, onGuardar, onCerrar }: {
  grupo: Partial<GrupoRow>
  onGuardar: (g: Partial<GrupoRow>) => void
  onCerrar: () => void
}) {
  const [form, setForm] = useState<Partial<GrupoRow>>(grupo)
  const [err, setErr] = useState<Record<string, string>>({})
  function setN(k: keyof GrupoRow) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [k]: +e.target.value || 0 }))
      setErr(v => ({ ...v, [k]: '' }))
    }
  }
  function validar() {
    const e: Record<string, string> = {}
    if (!form.num_grupo || form.num_grupo < 1)   e.num    = 'Debe ser mayor a 0'
    if (!form.cupo_maximo || form.cupo_maximo < 1) e.cupo  = 'Debe ser mayor a 0'
    if (!form.id_asignatura || form.id_asignatura < 1) e.asig = 'Requerido'
    setErr(e)
    return Object.keys(e).length === 0
  }
  return (
    <Modal titulo={form.id_grupo ? 'Editar grupo' : 'Nuevo grupo'} onCerrar={onCerrar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LBL}>Número de grupo *</label>
          <input style={{ ...INP, borderColor: err.num ? '#dc2626' : '#cbd5e1' }} type="number" min={1} value={form.num_grupo ?? ''} onChange={setN('num_grupo')} placeholder="Ej: 1" />
          {err.num && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.num}</p>}
        </div>
        <div>
          <label style={LBL}>Cupo máximo *</label>
          <input style={{ ...INP, borderColor: err.cupo ? '#dc2626' : '#cbd5e1' }} type="number" min={1} value={form.cupo_maximo ?? ''} onChange={setN('cupo_maximo')} placeholder="Ej: 35" />
          {err.cupo && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.cupo}</p>}
        </div>
        <div>
          <label style={LBL}>ID Asignatura *</label>
          <input style={{ ...INP, borderColor: err.asig ? '#dc2626' : '#cbd5e1' }} type="number" min={1} value={form.id_asignatura ?? ''} onChange={setN('id_asignatura')} placeholder="Ej: 1" />
          {err.asig && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.asig}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <BtnCancelar onClick={onCerrar} />
        <BtnGuardar onClick={() => validar() && onGuardar(form)} />
      </div>
    </Modal>
  )
}

// ── Modal Matrícula ───────────────────────────────────────────────────
function ModalMatricula({ matricula, usuarios, grupos, onGuardar, onCerrar }: {
  matricula: Partial<MatriculaRow>
  usuarios: UsuarioRow[]
  grupos: GrupoRow[]
  onGuardar: (m: Partial<MatriculaRow>) => void
  onCerrar: () => void
}) {
  const [form, setForm] = useState<Partial<MatriculaRow>>(matricula)
  const [err, setErr] = useState<Record<string, string>>({})
  function validar() {
    const e: Record<string, string> = {}
    if (!form.id_usuario) e.usuario = 'Seleccione un usuario'
    if (!form.id_grupo)   e.grupo   = 'Seleccione un grupo'
    setErr(e)
    return Object.keys(e).length === 0
  }
  return (
    <Modal titulo={form.id_matricula ? 'Editar matrícula' : 'Nueva matrícula'} onCerrar={onCerrar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LBL}>Usuario *</label>
          <select style={{ ...INP, borderColor: err.usuario ? '#dc2626' : '#cbd5e1' }} value={form.id_usuario ?? ''} onChange={e => { setForm(f => ({ ...f, id_usuario: +e.target.value })); setErr(v => ({ ...v, usuario: '' })) }}>
            <option value="">Seleccionar usuario...</option>
            {usuarios.map(u => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {u.nombres_usuario} {u.apellidos_usuario} — {u.rol_usuario}
              </option>
            ))}
          </select>
          {err.usuario && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.usuario}</p>}
        </div>
        <div>
          <label style={LBL}>Grupo *</label>
          <select style={{ ...INP, borderColor: err.grupo ? '#dc2626' : '#cbd5e1' }} value={form.id_grupo ?? ''} onChange={e => { setForm(f => ({ ...f, id_grupo: +e.target.value })); setErr(v => ({ ...v, grupo: '' })) }}>
            <option value="">Seleccionar grupo...</option>
            {grupos.map(g => (
              <option key={g.id_grupo} value={g.id_grupo}>
                Grupo {g.num_grupo} — Asignatura {g.id_asignatura} ({g.cupo_maximo} cupos)
              </option>
            ))}
          </select>
          {err.grupo && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.grupo}</p>}
        </div>
        <div>
          <label style={LBL}>Estado</label>
          <select style={INP} value={form.estado_matricula ?? 'PENDIENTE'} onChange={e => setForm(f => ({ ...f, estado_matricula: e.target.value as MatriculaRow['estado_matricula'] }))}>
            <option value="PENDIENTE">Pendiente</option>
            <option value="ACTIVA">Activa</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <BtnCancelar onClick={onCerrar} />
        <BtnGuardar onClick={() => validar() && onGuardar(form)} />
      </div>
    </Modal>
  )
}

// ── Modal PQR ─────────────────────────────────────────────────────────
function ModalPqr({ pqr, usuarios, onGuardar, onCerrar }: {
  pqr: Partial<PqrRow>
  usuarios: UsuarioRow[]
  onGuardar: (p: Partial<PqrRow>) => void
  onCerrar: () => void
}) {
  const [form, setForm] = useState<Partial<PqrRow>>(pqr)
  const [err, setErr] = useState<Record<string, string>>({})
  function validar() {
    const e: Record<string, string> = {}
    if (!form.titulo_pqr?.trim())      e.titulo      = 'El título es obligatorio'
    if (!form.descripcion_pqr?.trim()) e.descripcion = 'La descripción es obligatoria'
    if (!form.id_usuario)              e.usuario     = 'Seleccione un usuario'
    setErr(e)
    return Object.keys(e).length === 0
  }
  return (
    <Modal titulo={form.id_pqr ? 'Editar PQR' : 'Nueva PQR'} onCerrar={onCerrar}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={LBL}>Título *</label>
          <input style={{ ...INP, borderColor: err.titulo ? '#dc2626' : '#cbd5e1' }} value={form.titulo_pqr ?? ''} placeholder="Ej: Solicitud de cambio de horario"
            onChange={e => { setForm(f => ({ ...f, titulo_pqr: e.target.value })); setErr(v => ({ ...v, titulo: '' })) }} />
          {err.titulo && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.titulo}</p>}
        </div>
        <div>
          <label style={LBL}>Descripción *</label>
          <textarea style={{ ...INP, height: 90, resize: 'vertical', borderColor: err.descripcion ? '#dc2626' : '#cbd5e1' }} value={form.descripcion_pqr ?? ''} placeholder="Describe la solicitud..."
            onChange={e => { setForm(f => ({ ...f, descripcion_pqr: e.target.value })); setErr(v => ({ ...v, descripcion: '' })) }} />
          {err.descripcion && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.descripcion}</p>}
        </div>
        <div>
          <label style={LBL}>Usuario *</label>
          <select style={{ ...INP, borderColor: err.usuario ? '#dc2626' : '#cbd5e1' }} value={form.id_usuario ?? ''}
            onChange={e => { setForm(f => ({ ...f, id_usuario: +e.target.value })); setErr(v => ({ ...v, usuario: '' })) }}>
            <option value="">Seleccionar usuario...</option>
            {usuarios.map(u => (
              <option key={u.id_usuario} value={u.id_usuario}>
                {u.nombres_usuario} {u.apellidos_usuario} — {u.rol_usuario}
              </option>
            ))}
          </select>
          {err.usuario && <p style={{ color: '#dc2626', fontSize: 11, margin: '3px 0 0' }}>{err.usuario}</p>}
        </div>
        {form.id_pqr && (
          <div>
            <label style={LBL}>Estado</label>
            <select style={INP} value={form.estado_pqr ?? 'pendiente'} onChange={e => setForm(f => ({ ...f, estado_pqr: e.target.value as 'pendiente' | 'cerrada' }))}>
              <option value="pendiente">Pendiente</option>
              <option value="cerrada">Cerrada</option>
            </select>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
        <BtnCancelar onClick={onCerrar} />
        <BtnGuardar onClick={() => validar() && onGuardar(form)} />
      </div>
    </Modal>
  )
}

// ── Confirmación eliminar ─────────────────────────────────────────────
function ModalConfirmar({ onConfirmar, onCerrar }: { onConfirmar: () => void; onCerrar: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px', color: '#001e40' }}>Confirmar eliminación</h3>
        <p style={{ margin: '0 0 20px', color: '#708090', fontSize: 13 }}>Esta acción no se puede deshacer.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <BtnCancelar onClick={onCerrar} />
          <button onClick={onConfirmar} style={{ padding: '8px 20px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Botones editar / eliminar ─────────────────────────────────────────
function AccionesFila({ onEditar, onEliminar }: { onEditar: () => void; onEliminar: () => void }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={onEditar} title="Editar"
        style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: 5, padding: '5px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconEdit /> Editar
      </button>
      <button onClick={onEliminar} title="Eliminar"
        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: 5, padding: '5px 10px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
        <IconDelete /> Eliminar
      </button>
    </div>
  )
}

// ── Encabezado de tabla con botón nuevo ───────────────────────────────
function TablaHeader({ titulo, subtitulo, onNuevo, label }: { titulo: string; subtitulo: string; onNuevo: () => void; label: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#001e40' }}>
        {titulo}
        <span style={{ marginLeft: 8, fontSize: 12, color: '#708090', fontWeight: 400 }}>{subtitulo}</span>
      </h3>
      <button onClick={onNuevo}
        style={{ background: '#003366', color: '#fff', border: 'none', borderRadius: 6, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        + {label}
      </button>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────
type Filtro = 'todos' | 'usuarios' | 'grupos' | 'matriculas' | 'pqr'
type Modal = 'usuario' | 'grupo' | 'matricula' | 'pqr' | null

export default function AdminDashboard() {
  const [usuarios,   setUsuarios]   = useState<UsuarioRow[]>([])
  const [grupos,     setGrupos]     = useState<GrupoRow[]>([])
  const [matriculas, setMatriculas] = useState<MatriculaRow[]>([])
  const [pqrs,       setPqrs]       = useState<PqrRow[]>([])
  const [esMock,     setEsMock]     = useState(false)
  const [cargando,   setCargando]   = useState(true)
  const [filtro,     setFiltro]     = useState<Filtro>('todos')
  const [ultima,     setUltima]     = useState('')
  const [msg,        setMsg]        = useState<{ texto: string; tipo: 'ok' | 'err' } | null>(null)

  // modales
  const [modalAbierto, setModalAbierto] = useState<Modal>(null)
  const [editUsuario,  setEditUsuario]  = useState<Partial<UsuarioRow>>({})
  const [editGrupo,    setEditGrupo]    = useState<Partial<GrupoRow>>({})
  const [editMatricula,setEditMatricula]= useState<Partial<MatriculaRow>>({})
  const [editPqr,      setEditPqr]      = useState<Partial<PqrRow>>({})
  const [confirmar,    setConfirmar]    = useState<{ tipo: string; id: number } | null>(null)

  function mostrarMsg(texto: string, tipo: 'ok' | 'err') {
    setMsg({ texto, tipo })
    setTimeout(() => setMsg(null), 3000)
  }

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const [u, g, p] = await Promise.all([
        api('/api/users/staff'),
        api('/api/oferta-academica/grupos'),
        api('/api/crud/pqr'),
      ])
      setUsuarios(u.data ?? [])
      setGrupos(g.data ?? [])
      setPqrs(p.data ?? [])
      // Matrículas: intenta endpoint separado
      try {
        const m = await api('/api/crud/matriculas')
        setMatriculas(m.data ?? [])
      } catch {
        setMatriculas(MOCK_MATRICULAS)
      }
      setEsMock(false)
    } catch {
      setUsuarios(MOCK_USUARIOS)
      setGrupos(MOCK_GRUPOS)
      setMatriculas(MOCK_MATRICULAS)
      setPqrs(MOCK_PQR)
      setEsMock(true)
    }
    setUltima(new Date().toLocaleTimeString('es-CO'))
    setCargando(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ── CRUD Usuarios ────────────────────────────────────────────────
  async function guardarUsuario(form: Partial<UsuarioRow>) {
    if (esMock) {
      if (form.id_usuario) {
        setUsuarios(prev => prev.map(u => u.id_usuario === form.id_usuario ? { ...u, ...form } as UsuarioRow : u))
      } else {
        const nuevo: UsuarioRow = { ...form as UsuarioRow, id_usuario: Date.now() }
        setUsuarios(prev => [nuevo, ...prev])
      }
      mostrarMsg(form.id_usuario ? 'Usuario actualizado' : 'Usuario creado', 'ok')
    } else {
      try {
        if (form.id_usuario) {
          await api(`/api/users/${form.id_usuario}`, { method: 'PUT', body: JSON.stringify(form) })
        } else {
          await api('/api/users', { method: 'POST', body: JSON.stringify(form) })
        }
        await cargar()
        mostrarMsg(form.id_usuario ? 'Usuario actualizado' : 'Usuario creado', 'ok')
      } catch { mostrarMsg('Error al guardar el usuario', 'err') }
    }
    setModalAbierto(null)
  }

  async function eliminarUsuario(id: number) {
    if (esMock) {
      setUsuarios(prev => prev.filter(u => u.id_usuario !== id))
      // También eliminar matrículas relacionadas
      setMatriculas(prev => prev.filter(m => m.id_usuario !== id))
      mostrarMsg('Usuario eliminado', 'ok')
    } else {
      try {
        await api(`/api/users/${id}`, { method: 'DELETE' })
        await cargar()
        mostrarMsg('Usuario eliminado', 'ok')
      } catch { mostrarMsg('Error al eliminar el usuario', 'err') }
    }
    setConfirmar(null)
  }

  // ── CRUD Grupos ──────────────────────────────────────────────────
  async function guardarGrupo(form: Partial<GrupoRow>) {
    if (esMock) {
      if (form.id_grupo) {
        setGrupos(prev => prev.map(g => g.id_grupo === form.id_grupo ? { ...g, ...form } as GrupoRow : g))
      } else {
        const nuevo: GrupoRow = { ...form as GrupoRow, id_grupo: Date.now() }
        setGrupos(prev => [nuevo, ...prev])
      }
      mostrarMsg(form.id_grupo ? 'Grupo actualizado' : 'Grupo creado', 'ok')
    } else {
      try {
        if (form.id_grupo) {
          await api(`/api/oferta-academica/grupos/${form.id_grupo}`, { method: 'PUT', body: JSON.stringify(form) })
        } else {
          await api('/api/oferta-academica/grupos', { method: 'POST', body: JSON.stringify(form) })
        }
        await cargar()
        mostrarMsg(form.id_grupo ? 'Grupo actualizado' : 'Grupo creado', 'ok')
      } catch { mostrarMsg('Error al guardar el grupo', 'err') }
    }
    setModalAbierto(null)
  }

  async function eliminarGrupo(id: number) {
    if (esMock) {
      setGrupos(prev => prev.filter(g => g.id_grupo !== id))
      // También eliminar matrículas del grupo
      setMatriculas(prev => prev.filter(m => m.id_grupo !== id))
      mostrarMsg('Grupo eliminado', 'ok')
    } else {
      try {
        await api(`/api/oferta-academica/grupos/${id}`, { method: 'DELETE' })
        await cargar()
        mostrarMsg('Grupo eliminado', 'ok')
      } catch { mostrarMsg('Error al eliminar el grupo', 'err') }
    }
    setConfirmar(null)
  }

  // ── CRUD Matrículas ──────────────────────────────────────────────
  async function guardarMatricula(form: Partial<MatriculaRow>) {
    if (esMock) {
      if (form.id_matricula) {
        setMatriculas(prev => prev.map(m => m.id_matricula === form.id_matricula ? { ...m, ...form } as MatriculaRow : m))
      } else {
        const nuevo: MatriculaRow = { ...form as MatriculaRow, id_matricula: Date.now(), fecha_matricula: new Date().toISOString(), estado_matricula: form.estado_matricula ?? 'PENDIENTE' }
        setMatriculas(prev => [nuevo, ...prev])
      }
      mostrarMsg(form.id_matricula ? 'Matrícula actualizada' : 'Matrícula creada', 'ok')
    } else {
      try {
        if (form.id_matricula) {
          await api(`/api/crud/matriculas/${form.id_matricula}`, { method: 'PUT', body: JSON.stringify(form) })
        } else {
          await api('/api/crud/matriculas', { method: 'POST', body: JSON.stringify(form) })
        }
        await cargar()
        mostrarMsg(form.id_matricula ? 'Matrícula actualizada' : 'Matrícula creada', 'ok')
      } catch { mostrarMsg('Error al guardar la matrícula', 'err') }
    }
    setModalAbierto(null)
  }

  async function eliminarMatricula(id: number) {
    if (esMock) {
      setMatriculas(prev => prev.filter(m => m.id_matricula !== id))
      mostrarMsg('Matrícula eliminada', 'ok')
    } else {
      try {
        await api(`/api/crud/matriculas/${id}`, { method: 'DELETE' })
        await cargar()
        mostrarMsg('Matrícula eliminada', 'ok')
      } catch { mostrarMsg('Error al eliminar la matrícula', 'err') }
    }
    setConfirmar(null)
  }

  // ── CRUD PQR ─────────────────────────────────────────────────────
  async function guardarPqr(form: Partial<PqrRow>) {
    if (esMock) {
      if (form.id_pqr) {
        setPqrs(prev => prev.map(p => p.id_pqr === form.id_pqr ? { ...p, ...form } as PqrRow : p))
      } else {
        const nuevo: PqrRow = { ...form as PqrRow, id_pqr: Date.now(), fecha_creacion_pqr: new Date().toISOString(), estado_pqr: 'pendiente' }
        setPqrs(prev => [nuevo, ...prev])
      }
      mostrarMsg(form.id_pqr ? 'PQR actualizada' : 'PQR creada', 'ok')
    } else {
      try {
        if (form.id_pqr) {
          await api(`/api/crud/pqr/${form.id_pqr}`, { method: 'PUT', body: JSON.stringify(form) })
        } else {
          await api('/api/crud/pqr', { method: 'POST', body: JSON.stringify({ ...form, estado_pqr: 'pendiente' }) })
        }
        await cargar()
        mostrarMsg(form.id_pqr ? 'PQR actualizada' : 'PQR creada', 'ok')
      } catch { mostrarMsg('Error al guardar la PQR', 'err') }
    }
    setModalAbierto(null)
  }

  async function eliminarPqr(id: number) {
    if (esMock) {
      setPqrs(prev => prev.filter(p => p.id_pqr !== id))
      mostrarMsg('PQR eliminada', 'ok')
    } else {
      try {
        await api(`/api/crud/pqr/${id}`, { method: 'DELETE' })
        await cargar()
        mostrarMsg('PQR eliminada', 'ok')
      } catch { mostrarMsg('Error al eliminar la PQR', 'err') }
    }
    setConfirmar(null)
  }

  function manejarConfirmar() {
    if (!confirmar) return
    if (confirmar.tipo === 'usuario')   eliminarUsuario(confirmar.id)
    if (confirmar.tipo === 'grupo')     eliminarGrupo(confirmar.id)
    if (confirmar.tipo === 'matricula') eliminarMatricula(confirmar.id)
    if (confirmar.tipo === 'pqr')       eliminarPqr(confirmar.id)
  }

  // ── Métricas ──────────────────────────────────────────────────────
  const activos    = usuarios.filter(u => u.estado_usuario === 'ACTIVO').length
  const inactivos  = usuarios.filter(u => u.estado_usuario === 'INACTIVO').length
  const cupoTotal  = grupos.reduce((s, g) => s + g.cupo_maximo, 0)
  const matActivas = matriculas.filter(m => m.estado_matricula === 'ACTIVA').length
  const pqrPend    = pqrs.filter(p => p.estado_pqr === 'pendiente').length
  const pqrCerr    = pqrs.filter(p => p.estado_pqr === 'cerrada').length
  const tasa       = (pqrPend + pqrCerr) > 0 ? Math.round(pqrCerr / (pqrPend + pqrCerr) * 100) : 0
  const mostrar    = (m: string) => filtro === 'todos' || filtro === m

  const FILTROS: { id: Filtro; label: string }[] = [
    { id: 'todos',      label: 'Todos'      },
    { id: 'usuarios',   label: 'Usuarios'   },
    { id: 'grupos',     label: 'Grupos'     },
    { id: 'matriculas', label: 'Matriculas' },
    { id: 'pqr',        label: 'PQR'        },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f7f9fb', fontFamily: '"Segoe UI", system-ui, sans-serif', paddingBottom: 48 }}>

      {/* Header */}
      <header style={{ background: '#003366', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Unicomfacauca</div>
            <div style={{ color: '#a3c4e8', fontSize: 11 }}>Panel administrativo</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {esMock && (
            <div style={{ background: '#fff3cd', border: '1px solid #f0c14b', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: '#7a5c00' }}>
              Datos simulados (Mock)
            </div>
          )}
          {ultima && <span style={{ color: '#a3c4e8', fontSize: 11 }}>Actualizado: {ultima}</span>}
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 0' }}>

        <div style={{ marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#001e40' }}>Panel de indicadores</h1>
          <p style={{ margin: '4px 0 0', color: '#708090', fontSize: 13 }}>Semestre 2024-1 · Resumen general del sistema académico</p>
        </div>

        {/* Notificación */}
        {msg && (
          <div style={{ background: msg.tipo === 'ok' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msg.tipo === 'ok' ? '#86efac' : '#fca5a5'}`, color: msg.tipo === 'ok' ? '#15803d' : '#dc2626', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13 }}>
            {msg.texto}
          </div>
        )}

        {/* Cargando */}
        {cargando && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#1d4ed8' }}>
            Cargando datos...
          </div>
        )}

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {FILTROS.map(f => (
            <button key={f.id} onClick={() => setFiltro(f.id)} style={{
              padding: '6px 16px', borderRadius: 999, fontSize: 12, cursor: 'pointer',
              border: `1.5px solid ${filtro === f.id ? '#003366' : '#cbd5e1'}`,
              background: filtro === f.id ? '#003366' : '#fff',
              color: filtro === f.id ? '#fff' : '#708090',
              fontWeight: filtro === f.id ? 600 : 400,
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          {mostrar('usuarios') && <>
            <KpiCard label="Usuarios activos"   valor={activos}        sub={`${activos + inactivos} totales`}           acento="#003366" />
            <KpiCard label="Usuarios inactivos" valor={inactivos}      sub="estado INACTIVO"                             acento="#dc2626" />
          </>}
          {mostrar('grupos') && <>
            <KpiCard label="Grupos"             valor={grupos.length}  sub={`${cupoTotal} cupos totales`}                acento="#185fa5" />
            <KpiCard label="Cupos"              valor={cupoTotal}      sub={`Promedio ${grupos.length ? Math.round(cupoTotal/grupos.length) : 0} por grupo`} acento="#0f6e56" />
          </>}
          {mostrar('matriculas') && <>
            <KpiCard label="Matriculas activas" valor={matActivas}     sub={`${matriculas.length} totales`}              acento="#533ab7" />
            <KpiCard label="Pendientes"         valor={matriculas.filter(m => m.estado_matricula === 'PENDIENTE').length} sub="Por confirmar" acento="#854f0b" />
          </>}
          {mostrar('pqr') && <>
            <KpiCard label="PQR pendientes"     valor={pqrPend}        sub="estado pendiente"                            acento="#d97706" />
            <KpiCard label="PQR cerradas"       valor={pqrCerr}        sub={`Tasa resolución ${tasa}%`}                  acento="#16a34a" />
          </>}
        </div>

        {/* Tabla Usuarios */}
        {mostrar('usuarios') && (
          <div style={{ ...card, marginBottom: 14 }}>
            <TablaHeader
              titulo="Usuarios del sistema"
              subtitulo="tabla usuario"
              onNuevo={() => { setEditUsuario({ estado_usuario: 'ACTIVO' }); setModalAbierto('usuario') }}
              label="Nuevo usuario"
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>ID</th>
                    <th style={TH}>Nombre</th>
                    <th style={TH}>Rol</th>
                    <th style={TH}>Estado</th>
                    <th style={TH}>Matriculas</th>
                    <th style={TH}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 && (
                    <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#9ca3af', padding: 32 }}>No hay usuarios</td></tr>
                  )}
                  {usuarios.map(u => (
                    <tr key={u.id_usuario}>
                      <td style={TD}>#{u.id_usuario}</td>
                      <td style={TD}>{u.nombres_usuario} {u.apellidos_usuario}</td>
                      <td style={TD}><BadgeRol rol={u.rol_usuario} /></td>
                      <td style={TD}><BadgeEstado estado={u.estado_usuario} /></td>
                      <td style={TD}>
                        <span style={{ fontSize: 12, color: '#708090' }}>
                          {matriculas.filter(m => m.id_usuario === u.id_usuario).length} matriculas
                        </span>
                      </td>
                      <td style={TD}>
                        <AccionesFila
                          onEditar={() => { setEditUsuario(u); setModalAbierto('usuario') }}
                          onEliminar={() => setConfirmar({ tipo: 'usuario', id: u.id_usuario })}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#708090' }}>
              Total: <strong style={{ color: '#1e293b' }}>{usuarios.length}</strong>
              <span style={{ marginLeft: 12 }}>Activos: <strong style={{ color: '#065f46' }}>{activos}</strong></span>
              <span style={{ marginLeft: 12 }}>Inactivos: <strong style={{ color: '#dc2626' }}>{inactivos}</strong></span>
            </div>
          </div>
        )}

        {/* Tabla Grupos */}
        {mostrar('grupos') && (
          <div style={{ ...card, marginBottom: 14 }}>
            <TablaHeader
              titulo="Grupos academicos"
              subtitulo="tabla grupo"
              onNuevo={() => { setEditGrupo({}); setModalAbierto('grupo') }}
              label="Nuevo grupo"
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>ID</th>
                    <th style={TH}>Numero</th>
                    <th style={TH}>Cupo maximo</th>
                    <th style={TH}>Asignatura</th>
                    <th style={TH}>Matriculados</th>
                    <th style={TH}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.length === 0 && (
                    <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#9ca3af', padding: 32 }}>No hay grupos</td></tr>
                  )}
                  {grupos.map(g => {
                    const matriculadosEnGrupo = matriculas.filter(m => m.id_grupo === g.id_grupo && m.estado_matricula === 'ACTIVA').length
                    return (
                      <tr key={g.id_grupo}>
                        <td style={TD}>#{g.id_grupo}</td>
                        <td style={TD}>Grupo {g.num_grupo}</td>
                        <td style={TD}>{g.cupo_maximo} cupos</td>
                        <td style={TD}>Asignatura {g.id_asignatura}</td>
                        <td style={TD}>
                          <span style={{ fontSize: 12, color: matriculadosEnGrupo >= g.cupo_maximo ? '#dc2626' : '#708090' }}>
                            {matriculadosEnGrupo}/{g.cupo_maximo}
                          </span>
                        </td>
                        <td style={TD}>
                          <AccionesFila
                            onEditar={() => { setEditGrupo(g); setModalAbierto('grupo') }}
                            onEliminar={() => setConfirmar({ tipo: 'grupo', id: g.id_grupo })}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#708090' }}>
              Total: <strong style={{ color: '#1e293b' }}>{grupos.length}</strong>
              <span style={{ marginLeft: 12 }}>Cupos totales: <strong style={{ color: '#1e293b' }}>{cupoTotal}</strong></span>
            </div>
          </div>
        )}

        {/* Tabla Matriculas */}
        {mostrar('matriculas') && (
          <div style={{ ...card, marginBottom: 14 }}>
            <TablaHeader
              titulo="Matriculas"
              subtitulo="tabla matricula"
              onNuevo={() => { setEditMatricula({ estado_matricula: 'PENDIENTE' }); setModalAbierto('matricula') }}
              label="Nueva matricula"
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>ID</th>
                    <th style={TH}>Usuario</th>
                    <th style={TH}>Grupo</th>
                    <th style={TH}>Estado</th>
                    <th style={TH}>Fecha</th>
                    <th style={TH}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {matriculas.length === 0 && (
                    <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#9ca3af', padding: 32 }}>No hay matriculas</td></tr>
                  )}
                  {matriculas.map(m => {
                    const usuario = usuarios.find(u => u.id_usuario === m.id_usuario)
                    const grupo   = grupos.find(g => g.id_grupo === m.id_grupo)
                    return (
                      <tr key={m.id_matricula}>
                        <td style={TD}>#{m.id_matricula}</td>
                        <td style={TD}>
                          {usuario
                            ? <><div style={{ fontWeight: 500 }}>{usuario.nombres_usuario} {usuario.apellidos_usuario}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{usuario.rol_usuario}</div></>
                            : <span style={{ color: '#9ca3af' }}>id: {m.id_usuario}</span>}
                        </td>
                        <td style={TD}>
                          {grupo
                            ? <><div style={{ fontWeight: 500 }}>Grupo {grupo.num_grupo}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>Asignatura {grupo.id_asignatura}</div></>
                            : <span style={{ color: '#9ca3af' }}>id: {m.id_grupo}</span>}
                        </td>
                        <td style={TD}><BadgeEstado estado={m.estado_matricula} /></td>
                        <td style={TD}>{new Date(m.fecha_matricula).toLocaleDateString('es-CO')}</td>
                        <td style={TD}>
                          <AccionesFila
                            onEditar={() => { setEditMatricula(m); setModalAbierto('matricula') }}
                            onEliminar={() => setConfirmar({ tipo: 'matricula', id: m.id_matricula })}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#708090' }}>
              Total: <strong style={{ color: '#1e293b' }}>{matriculas.length}</strong>
              <span style={{ marginLeft: 12 }}>Activas: <strong style={{ color: '#065f46' }}>{matActivas}</strong></span>
              <span style={{ marginLeft: 12 }}>Canceladas: <strong style={{ color: '#dc2626' }}>{matriculas.filter(m => m.estado_matricula === 'CANCELADA').length}</strong></span>
            </div>
          </div>
        )}

        {/* Tabla PQR */}
        {mostrar('pqr') && (
          <div style={{ ...card, marginBottom: 14 }}>
            <TablaHeader
              titulo="Gestion de PQR"
              subtitulo="tabla pqr"
              onNuevo={() => { setEditPqr({ estado_pqr: 'pendiente' }); setModalAbierto('pqr') }}
              label="Nueva PQR"
            />
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH}>ID</th>
                    <th style={TH}>Titulo</th>
                    <th style={TH}>Usuario</th>
                    <th style={TH}>Estado</th>
                    <th style={TH}>Fecha</th>
                    <th style={TH}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pqrs.length === 0 && (
                    <tr><td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#9ca3af', padding: 32 }}>No hay PQR registradas</td></tr>
                  )}
                  {pqrs.map(p => {
                    const usuario = usuarios.find(u => u.id_usuario === p.id_usuario)
                    return (
                      <tr key={p.id_pqr}>
                        <td style={TD}>#{p.id_pqr}</td>
                        <td style={{ ...TD, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span title={p.titulo_pqr}>{p.titulo_pqr}</span>
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descripcion_pqr}</div>
                        </td>
                        <td style={TD}>
                          {usuario
                            ? <><div style={{ fontWeight: 500 }}>{usuario.nombres_usuario} {usuario.apellidos_usuario}</div><div style={{ fontSize: 11, color: '#9ca3af' }}>{usuario.rol_usuario}</div></>
                            : <span style={{ color: '#9ca3af' }}>id: {p.id_usuario}</span>}
                        </td>
                        <td style={TD}><BadgePqr estado={p.estado_pqr} /></td>
                        <td style={TD}>{new Date(p.fecha_creacion_pqr).toLocaleDateString('es-CO')}</td>
                        <td style={TD}>
                          <AccionesFila
                            onEditar={() => { setEditPqr(p); setModalAbierto('pqr') }}
                            onEliminar={() => setConfirmar({ tipo: 'pqr', id: p.id_pqr })}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#708090' }}>
              Total: <strong style={{ color: '#1e293b' }}>{pqrs.length}</strong>
              <span style={{ marginLeft: 12 }}>Pendientes: <strong style={{ color: '#92400e' }}>{pqrPend}</strong></span>
              <span style={{ marginLeft: 12 }}>Cerradas: <strong style={{ color: '#065f46' }}>{pqrCerr}</strong></span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 8, padding: '10px 16px', background: '#f7f9fb', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 11, color: '#708090', display: 'flex', justifyContent: 'space-between' }}>
          <span>BD: <code>universidad_db</code> · servidor: <code>localhost:3000</code></span>
          <span>{esMock ? 'Modo mock activo' : 'Datos en tiempo real'}</span>
        </div>

      </main>

      {/* Modales */}
      {modalAbierto === 'usuario' && (
        <ModalUsuario usuario={editUsuario} onGuardar={guardarUsuario} onCerrar={() => setModalAbierto(null)} />
      )}
      {modalAbierto === 'grupo' && (
        <ModalGrupo grupo={editGrupo} onGuardar={guardarGrupo} onCerrar={() => setModalAbierto(null)} />
      )}
      {modalAbierto === 'matricula' && (
        <ModalMatricula matricula={editMatricula} usuarios={usuarios} grupos={grupos} onGuardar={guardarMatricula} onCerrar={() => setModalAbierto(null)} />
      )}
      {modalAbierto === 'pqr' && (
        <ModalPqr pqr={editPqr} usuarios={usuarios} onGuardar={guardarPqr} onCerrar={() => setModalAbierto(null)} />
      )}

      {confirmar !== null && (
        <ModalConfirmar onConfirmar={manejarConfirmar} onCerrar={() => setConfirmar(null)} />
      )}
    </div>
  )
}
