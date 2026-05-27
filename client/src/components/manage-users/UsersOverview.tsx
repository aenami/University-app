import { Shield, Sparkles, UserCheck, UserMinus } from 'lucide-react'
import type { ManagedUsersSummary } from '../../types/userManagement'

type UsersOverviewProps = {
  summary: ManagedUsersSummary
}

const overviewCards = [
  {
    key: 'total',
    label: 'Usuarios visibles',
    icon: Shield,
    accent: 'from-slate-900 to-slate-700',
  },
  {
    key: 'active',
    label: 'Activos',
    icon: UserCheck,
    accent: 'from-emerald-600 to-emerald-500',
  },
  {
    key: 'inactive',
    label: 'Inactivos',
    icon: UserMinus,
    accent: 'from-amber-500 to-orange-400',
  },
] as const

export function UsersOverview({ summary }: UsersOverviewProps) {
  const valueMap = {
    total: summary.total,
    active: summary.active,
    inactive: summary.inactive,
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="grid gap-4 md:grid-cols-3">
        {overviewCards.map((card) => {
          const Icon = card.icon

          return (
            <article
              key={card.key}
              className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_46px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
                    {card.label}
                  </p>
                  <p className="mt-4 font-[var(--font-display)] text-4xl text-slate-900">
                    {valueMap[card.key]}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} text-white shadow-lg`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <article className="overflow-hidden rounded-[26px] border border-[rgba(15,46,90,0.12)] bg-[linear-gradient(140deg,rgba(15,46,90,0.08),rgba(255,255,255,0.96))] p-5 shadow-[0_16px_46px_rgba(15,23,42,0.08)]">
        <div className="flex items-center gap-3 text-[var(--brand-navy)]">
          <Sparkles className="h-5 w-5" />
          <p className="text-xs font-semibold tracking-[0.3em] uppercase">Distribucion</p>
        </div>

        <div className="mt-5 space-y-4">
          {Object.entries(summary.byRole).map(([role, total]) => (
            <div key={role}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-700">{role}</span>
                <span className="text-slate-500">{total}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-navy),var(--brand-sky))]"
                  style={{
                    width:
                      summary.total === 0
                        ? '0%'
                        : `${Math.max((total / summary.total) * 100, total > 0 ? 12 : 0)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
