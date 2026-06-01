import { startTransition, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  FileUp,
  Filter,
  Headset,
  MessageSquareReply,
  Send,
  TicketCheck,
  XCircle,
} from 'lucide-react'
import { ManagementSidebar } from '../components/manage-users/ManagementSidebar'
import { ManagementTopbar } from '../components/manage-users/ManagementTopbar'
import { pqrApi } from '../services/pqrApi'
import { tokenManager } from '../utils/tokenManager'
import {
  getPqrUiStatus,
  pqrTypeLabels,
  pqrRequestTypes,
} from '../types/pqr'
import type { CreatePqrPayload, PqrTicket, PqrUiStatus } from '../types/pqr'

type TicketDraft = CreatePqrPayload

const initialTicketDraft: TicketDraft = {
  tipo: 'PREGUNTA',
  asunto: '',
  descripcion: '',
}

const statusClasses: Record<PqrUiStatus, string> = {
  Abierto: 'bg-[#fde7dd] text-[#6f3b21]',
  'En Proceso': 'bg-[#d9e8fb] text-[#21456f]',
  Cerrado: 'bg-slate-200 text-slate-600',
}

const statusDotClasses: Record<PqrUiStatus, string> = {
  Abierto: 'bg-[#b85625]',
  'En Proceso': 'bg-[#2a5f99]',
  Cerrado: 'bg-slate-500',
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrio un error inesperado. Intenta nuevamente.'
}

const formatDisplayDate = (date: string) => {
  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

export function SupportPqrPage() {
  const sessionUser = tokenManager.getUser()
  const [searchValue, setSearchValue] = useState('')
  const [tickets, setTickets] = useState<PqrTicket[]>([])
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [ticketDraft, setTicketDraft] = useState<TicketDraft>(initialTicketDraft)
  const [responseTitle, setResponseTitle] = useState('')
  const [responseDescription, setResponseDescription] = useState('')
  const [evidenceName, setEvidenceName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResponding, setIsResponding] = useState(false)
  const [closingTicketId, setClosingTicketId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const ticketsResponse = await pqrApi.getTickets()

        startTransition(() => {
          setTickets(ticketsResponse)
          setSelectedTicketId((currentTicketId) => {
            if (currentTicketId !== null) {
              return currentTicketId
            }

            return ticketsResponse.length > 0 ? ticketsResponse[0].id : null
          })
        })
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadTickets()
  }, [])

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    if (!normalizedSearch) {
      return tickets
    }

    return tickets.filter((ticket) =>
      [ticket.code, ticket.subject, pqrTypeLabels[ticket.type], getPqrUiStatus(ticket)]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch),
    )
  }, [searchValue, tickets])

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) ?? null
  const openTickets = tickets.filter((ticket) => getPqrUiStatus(ticket) === 'Abierto').length
  const inProgressTickets = tickets.filter((ticket) => getPqrUiStatus(ticket) === 'En Proceso').length
  const closedTickets = tickets.filter((ticket) => getPqrUiStatus(ticket) === 'Cerrado').length

  const updateDraft = (field: keyof TicketDraft, value: string) => {
    setTicketDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  const handleCreateTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const createdTicket = await pqrApi.createTicket({
        tipo: ticketDraft.tipo,
        asunto: ticketDraft.asunto.trim(),
        descripcion: ticketDraft.descripcion.trim(),
      })

      setTickets((currentTickets) => [createdTicket, ...currentTickets])
      setSelectedTicketId(createdTicket.id)
      setTicketDraft(initialTicketDraft)
      setEvidenceName('')
      setSuccessMessage(`Solicitud ${createdTicket.code} registrada correctamente.`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRespondTicket = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedTicket) {
      return
    }

    setIsResponding(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const updatedTicket = await pqrApi.respondTicket(selectedTicket.id, {
        titulo: responseTitle.trim(),
        descripcion: responseDescription.trim(),
      })

      setTickets((currentTickets) =>
        currentTickets.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)),
      )
      setResponseTitle('')
      setResponseDescription('')
      setSuccessMessage(`Respuesta registrada para ${updatedTicket.code}.`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setIsResponding(false)
    }
  }

  const handleCloseTicket = async (ticket: PqrTicket) => {
    setClosingTicketId(ticket.id)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const updatedTicket = await pqrApi.closeTicket(ticket.id)

      setTickets((currentTickets) =>
        currentTickets.map((currentTicket) =>
          currentTicket.id === updatedTicket.id ? updatedTicket : currentTicket,
        ),
      )
      setSuccessMessage(`Solicitud ${updatedTicket.code} cerrada correctamente.`)
    } catch (error) {
      setErrorMessage(getErrorMessage(error))
    } finally {
      setClosingTicketId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)]">
        <ManagementSidebar activeItem="Soporte" />

        <main className="border-l border-slate-200 bg-[#f7f9fc]">
          <ManagementTopbar
            searchValue={searchValue}
            userName={sessionUser?.nombre ?? 'Soporte'}
            searchPlaceholder="Buscar ayuda o tickets..."
            onSearchChange={setSearchValue}
          />

          <div className="px-6 pb-8 pt-7">
            <section className="flex flex-col gap-6 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-[2.35rem] font-extrabold tracking-[-0.03em] text-slate-900">
                  Centro de Soporte y PQR
                </h1>
                <p className="mt-2 max-w-3xl text-[1.02rem] text-slate-600">
                  Gestione sus solicitudes de soporte tecnico y peticiones, quejas o reclamos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MetricCard label="Total" value={tickets.length} />
                <MetricCard label="Abiertos" value={openTickets} />
                <MetricCard label="En proceso" value={inProgressTickets} highlight />
                <MetricCard label="Cerrados" value={closedTickets} muted />
              </div>
            </section>

            {errorMessage ? (
              <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(330px,0.85fr)_minmax(0,1.25fr)]">
              <form
                onSubmit={handleCreateTicket}
                className="rounded-md border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-[var(--brand-navy)] text-white">
                    <Headset className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">Nueva Solicitud</h2>
                </div>

                <div className="mt-6 space-y-5">
                  <FormField label="Tipo de Solicitud">
                    <select
                      value={ticketDraft.tipo}
                      onChange={(event) => {
                        const selectedType = pqrRequestTypes.find(
                          (requestType) => requestType === event.target.value,
                        )

                        if (selectedType) {
                          updateDraft('tipo', selectedType)
                        }
                      }}
                      className={inputClassName}
                    >
                      {pqrRequestTypes.map((requestType) => (
                        <option key={requestType} value={requestType}>
                          {pqrTypeLabels[requestType]}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Asunto">
                    <input
                      value={ticketDraft.asunto}
                      maxLength={150}
                      onChange={(event) => updateDraft('asunto', event.target.value)}
                      placeholder="Breve descripcion del problema"
                      className={inputClassName}
                    />
                  </FormField>

                  <FormField label="Descripcion Detallada">
                    <textarea
                      value={ticketDraft.descripcion}
                      onChange={(event) => updateDraft('descripcion', event.target.value)}
                      placeholder="Proporcione todos los detalles necesarios..."
                      className={`${inputClassName} min-h-[154px] resize-none leading-7`}
                    />
                  </FormField>

                  <FormField label="Evidencias (Opcional)">
                    <label className="flex min-h-[126px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-slate-400 hover:bg-slate-100">
                      <FileUp className="h-7 w-7 text-slate-500" />
                      <span className="mt-3 max-w-xs text-sm text-slate-500">
                        {evidenceName || 'Arrastre archivos aqui o haga clic para subir'}
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(event) => setEvidenceName(event.target.files?.[0]?.name ?? '')}
                      />
                    </label>
                  </FormField>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setTicketDraft(initialTicketDraft)
                      setEvidenceName('')
                    }}
                    className="inline-flex h-[46px] items-center justify-center rounded-[3px] bg-slate-200 px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                  >
                    Limpiar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[3px] bg-[var(--brand-navy)] px-6 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,46,90,0.16)] transition enabled:hover:bg-[#0d264a] disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </form>

              <div className="space-y-6">
                <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-5">
                    <div className="flex items-center gap-3">
                      <TicketCheck className="h-6 w-6 text-[var(--brand-navy)]" />
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        Mis Solicitudes Recientes
                      </h2>
                    </div>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center text-[var(--brand-navy)] transition hover:text-slate-900"
                      aria-label="Filtrar solicitudes"
                    >
                      <Filter className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-[0.75fr_1.45fr_1fr_0.85fr] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    <span>ID</span>
                    <span>Asunto</span>
                    <span>Estado</span>
                    <span>Fecha</span>
                  </div>

                  <div className="min-h-[320px]">
                    {isLoading ? (
                      <LoadingRows />
                    ) : filteredTickets.length ? (
                      filteredTickets.map((ticket) => (
                        <TicketRow
                          key={ticket.id}
                          isSelected={selectedTicketId === ticket.id}
                          ticket={ticket}
                          onSelect={setSelectedTicketId}
                        />
                      ))
                    ) : (
                      <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                        <MessageSquareReply className="h-10 w-10 text-slate-400" />
                        <p className="mt-3 text-sm font-extrabold text-slate-800">
                          Sin solicitudes
                        </p>
                        <p className="mt-1 max-w-sm text-sm text-slate-500">
                          Todavia no hay tickets PQR que coincidan con la busqueda actual.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 border-t border-slate-200 px-5 py-5 text-sm font-extrabold text-[var(--brand-navy)] transition hover:bg-slate-50"
                  >
                    Ver todo el historial
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </section>

                <section className="rounded-md border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  {selectedTicket ? (
                    <>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                            Ticket seleccionado
                          </p>
                          <h3 className="mt-1 text-xl font-extrabold text-slate-900">
                            {selectedTicket.code} · {selectedTicket.subject}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {selectedTicket.description}
                          </p>
                        </div>
                        <StatusBadge ticket={selectedTicket} />
                      </div>

                      <div className="mt-5 rounded-md bg-slate-50 p-4">
                        <p className="text-sm font-extrabold text-slate-900">Respuestas</p>
                        <div className="mt-3 space-y-3">
                          {selectedTicket.responses.length ? (
                            selectedTicket.responses.map((response) => (
                              <div
                                key={response.id}
                                className="rounded-md border border-slate-200 bg-white px-4 py-3"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-extrabold text-slate-900">
                                    {response.title}
                                  </p>
                                  <p className="text-xs font-semibold text-slate-500">
                                    {formatDisplayDate(response.createdAt)}
                                  </p>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {response.description}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">
                              Esta solicitud aun no tiene respuestas registradas.
                            </p>
                          )}
                        </div>
                      </div>

                      <form onSubmit={handleRespondTicket} className="mt-5 grid gap-3">
                        <input
                          value={responseTitle}
                          onChange={(event) => setResponseTitle(event.target.value)}
                          placeholder="Titulo de respuesta"
                          className={inputClassName}
                        />
                        <textarea
                          value={responseDescription}
                          onChange={(event) => setResponseDescription(event.target.value)}
                          placeholder="Respuesta para el solicitante"
                          className={`${inputClassName} min-h-[96px] resize-none leading-6`}
                        />
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button
                            type="button"
                            disabled={
                              selectedTicket.status === 'cerrada' ||
                              closingTicketId === selectedTicket.id
                            }
                            onClick={() => void handleCloseTicket(selectedTicket)}
                            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[3px] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {closingTicketId === selectedTicket.id ? 'Cerrando...' : 'Cerrar PQR'}
                          </button>
                          <button
                            type="submit"
                            disabled={isResponding || selectedTicket.status === 'cerrada'}
                            className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[3px] bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white transition enabled:hover:bg-[#0d264a] disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            <MessageSquareReply className="h-4 w-4" />
                            {isResponding ? 'Respondiendo...' : 'Responder'}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                      <Clock3 className="h-10 w-10 text-slate-400" />
                      <p className="mt-3 text-sm font-extrabold text-slate-800">
                        Selecciona una solicitud
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        El detalle y las acciones apareceran en este panel.
                      </p>
                    </div>
                  )}
                </section>

                <section className="overflow-hidden rounded-md bg-[var(--brand-navy)] p-6 text-white shadow-[0_12px_30px_rgba(7,45,99,0.18)]">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <h2 className="text-2xl font-extrabold">¿Necesitas ayuda inmediata?</h2>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100">
                        Nuestro equipo de soporte tecnico esta disponible de lunes a viernes de
                        8:00 AM a 6:00 PM.
                      </p>
                    </div>
                    <div className="hidden text-[8rem] font-extrabold leading-none text-white/10 md:block">
                      ?
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="h-[42px] rounded-[3px] bg-white px-6 text-sm font-extrabold text-[var(--brand-navy)] transition hover:bg-blue-50"
                    >
                      Chat en Vivo
                    </button>
                    <button
                      type="button"
                      className="h-[42px] rounded-[3px] border border-blue-200/50 px-6 text-sm font-extrabold text-white transition hover:bg-white/10"
                    >
                      Ver FAQs
                    </button>
                  </div>
                </section>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  highlight = false,
  muted = false,
}: {
  label: string
  value: number
  highlight?: boolean
  muted?: boolean
}) {
  return (
    <div className="min-w-[115px] rounded-md border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p
        className={[
          'mt-2 text-3xl font-extrabold',
          highlight ? 'text-[#28527f]' : muted ? 'text-slate-500' : 'text-slate-900',
        ].join(' ')}
      >
        {value}
      </p>
    </div>
  )
}

function TicketRow({
  ticket,
  isSelected,
  onSelect,
}: {
  ticket: PqrTicket
  isSelected: boolean
  onSelect: (ticketId: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(ticket.id)}
      className={[
        'grid w-full grid-cols-[0.75fr_1.45fr_1fr_0.85fr] items-center gap-4 border-b border-slate-200 px-5 py-5 text-left transition',
        isSelected ? 'bg-[#eef6ff]' : 'bg-white hover:bg-slate-50',
      ].join(' ')}
    >
      <span className="text-sm font-extrabold text-[var(--brand-navy)]">{ticket.code}</span>
      <span>
        <span className="block text-sm font-extrabold text-slate-900">{ticket.subject}</span>
        <span className="mt-1 block text-xs text-slate-500">{pqrTypeLabels[ticket.type]}</span>
      </span>
      <StatusBadge ticket={ticket} compact />
      <span className="text-sm text-slate-600">{formatDisplayDate(ticket.createdAt)}</span>
    </button>
  )
}

function StatusBadge({ ticket, compact = false }: { ticket: PqrTicket; compact?: boolean }) {
  const status = getPqrUiStatus(ticket)

  return (
    <span
      className={[
        'inline-flex w-fit items-center gap-2 rounded-full font-semibold',
        compact ? 'px-3 py-2 text-xs' : 'px-4 py-2 text-sm',
        statusClasses[status],
      ].join(' ')}
    >
      {status === 'Cerrado' ? (
        <XCircle className="h-3.5 w-3.5" />
      ) : (
        <Circle className={`h-2 w-2 fill-current ${statusDotClasses[status]}`} />
      )}
      {status}
    </span>
  )
}

function LoadingRows() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[0.75fr_1.45fr_1fr_0.85fr] gap-4 border-b border-slate-200 px-5 py-5"
        >
          <div className="h-5 animate-pulse rounded bg-slate-100" />
          <div className="h-5 animate-pulse rounded bg-slate-100" />
          <div className="h-8 animate-pulse rounded-full bg-slate-100" />
          <div className="h-5 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-extrabold tracking-[0.04em] text-slate-900">{label}</span>
      <span className="mt-2 block">{children}</span>
    </label>
  )
}

const inputClassName =
  'w-full rounded-[3px] border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-500 focus:border-[var(--brand-navy)] focus:bg-white focus:ring-2 focus:ring-blue-100'
