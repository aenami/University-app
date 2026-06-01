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
import { Link } from '@tanstack/react-router'
import { tokenManager } from '../../utils/tokenManager'

type SidebarItem = {
  label: string
  icon: typeof ShieldCheck
  active?: boolean
  to?: string
}

const sidebarItems: SidebarItem[] = [
  { label: 'Seguridad', icon: ShieldCheck, active: true, to: '/ManageUsers' },
  { label: 'Oferta academica', icon: BookOpen },
  { label: 'Matriculas', icon: GraduationCap, to: '/SeleccionAsignaturas' },
  { label: 'Seguimiento', icon: UserRoundSearch, to: '/Seguimiento' },
  { label: 'Soporte', icon: Headset, to: '/Soporte' },
  { label: 'Analitica', icon: BarChart3 },
]

type ManagementSidebarProps = {
  activeItem?: string
}

export function ManagementSidebar({ activeItem }: ManagementSidebarProps) {
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
          const isActive = activeItem ? item.label === activeItem : item.active
          const itemClassName = [
            'flex w-full items-center gap-3 rounded-xl px-5 py-4 text-left transition-all',
            isActive
              ? 'border-l-4 border-[var(--brand-navy)] bg-[#dcebff] pl-4 text-[var(--brand-navy)]'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
          ].join(' ')
          const itemContent = (
            <>
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-sm font-semibold">{item.label}</span>
            </>
          )

          if (item.to) {
            return (
              <Link key={item.label} to={item.to} className={itemClassName}>
                {itemContent}
              </Link>
            )
          }

          return (
            <button
              key={item.label}
              type="button"
              className={itemClassName}
            >
              {itemContent}
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
