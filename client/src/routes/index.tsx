import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200/80 bg-white/90 p-10 text-center shadow-[0_32px_110px_rgba(15,23,42,0.10)]">
        <p className="text-xs font-semibold tracking-[0.32em] text-[var(--brand-cyan)] uppercase">
          University App
        </p>
        <h1 className="mt-4 font-[var(--font-display)] text-5xl text-slate-900">
          Modulo de gestion administrativa
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
          Ingresa al panel de seguridad para consultar, crear y controlar usuarios con rol
          academico.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/ManageUsers/"
            className="inline-flex rounded-2xl bg-[var(--brand-navy)] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,46,90,0.28)] transition hover:-translate-y-0.5"
          >
            Ir a gestion de usuarios
          </Link>
          <Link
            to="/Seguimiento"
            className="inline-flex rounded-2xl bg-white border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
          >
            Panel Docente (Notas)
          </Link>
        </div>
      </div>
    </div>
  )
}
