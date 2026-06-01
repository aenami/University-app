export type Modulo = 'todos' | 'usuarios' | 'oferta' | 'matricula' | 'pqr'

interface Props {
  moduloActivo: Modulo
  onCambioModulo: (modulo: Modulo) => void
}

const modulos: { id: Modulo; label: string }[] = [
  { id: 'todos',     label: 'Todos'     },
  { id: 'usuarios',  label: 'Usuarios'  },
  { id: 'oferta',    label: 'Oferta'    },
  { id: 'matricula', label: 'Matricula' },
  { id: 'pqr',       label: 'PQR'       },
]

export default function FiltrosDashboard({ moduloActivo, onCambioModulo }: Props) {
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '28px',
    }}>
      {modulos.map((m) => {
        const activo = moduloActivo === m.id
        return (
          <button
            key={m.id}
            onClick={() => onCambioModulo(m.id)}
            style={{
              padding: '7px 16px',
              borderRadius: '999px',
              border: activo ? '1.5px solid #6366f1' : '1.5px solid #e5e7eb',
              background: activo ? '#6366f1' : '#fff',
              color: activo ? '#fff' : '#374151',
              fontWeight: activo ? '600' : '400',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {m.label}
          </button>
        )
      })}
    </div>
  )
}
