import { Bell, Search, Settings2 } from 'lucide-react'

type ManagementTopbarProps = {
  searchValue: string
  userName: string
  onSearchChange: (value: string) => void
}

export function ManagementTopbar({
  searchValue,
  userName,
  onSearchChange,
}: ManagementTopbarProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-[#f7f9fc] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex min-w-0 items-center gap-3 rounded-[14px] border border-slate-300 bg-white px-4 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:w-[255px]">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar usuarios..."
          className="w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
        />
      </label>

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-slate-500 transition hover:text-slate-900"
        >
          <Bell className="h-5 w-5" />
        </button>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-slate-500 transition hover:text-slate-900"
        >
          <Settings2 className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-navy)] text-xs font-bold text-white">
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}
