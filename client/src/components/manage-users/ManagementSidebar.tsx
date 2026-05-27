import {
  BarChart3,
  BookOpen,
  GraduationCap,
  Headset,
  LogOut,
  ShieldCheck,
  UserRoundSearch,
  UsersRound,
} from 'lucide-react'
import { tokenManager } from '../../utils/tokenManager'

type SidebarItem = {
  label: string
  icon: typeof ShieldCheck
  active?: boolean
}

const sidebarItems: SidebarItem[] = [
  { label: 'Seguridad', icon: ShieldCheck, active: true },
  { label: 'Oferta academica', icon: BookOpen },
  { label: 'Matriculas', icon: GraduationCap },
  { label: 'Seguimiento', icon: UserRoundSearch },
  { label: 'Soporte', icon: Headset },
  { label: 'Analitica', icon: BarChart3 },
]

export function ManagementSidebar() {
  const handleLogout = () => {
    // Limpiamos la sesion y devolvemos al punto de entrada actual.
    tokenManager.clearSession()
    window.location.href = '/'
  }

  return (
    <aside className="flex min-h-screen flex-col bg-white px-5 py-14">
      <div className="flex items-center gap-4 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-navy)] text-white">
          <UsersRound className="h-6 w-6" />
        </div>

        <div>
          <p className="text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-slate-900">
            Gestion
          </p>
          <p className="text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-slate-900">
            Academica
          </p>
          <p className="mt-1 text-sm text-slate-500">Unicomfacauca</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon

          return (
            <button
              key={item.label}
              type="button"
              className={[
                'flex w-full items-center gap-3 rounded-xl px-5 py-4 text-left transition-all',
                item.active
                  ? 'border-l-4 border-[var(--brand-navy)] bg-[#dcebff] pl-4 text-[var(--brand-navy)]'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-sm font-semibold">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex w-full items-center gap-3 px-5 py-4 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
      >
        <LogOut className="h-5 w-5" />
        Cerrar Sesion
      </button>
    </aside>
  )
}
