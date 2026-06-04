import { startTransition, useEffect, useMemo, useState } from 'react'
import {
  BookMarked,
  Check,
  Clock3,
  GraduationCap,
  Layers3,
  Search,
  UsersRound,
} from 'lucide-react'
import { ManagementSidebar } from '../components/manage-users/ManagementSidebar'
import { ManagementTopbar } from '../components/manage-users/ManagementTopbar'
import { academicSelectionApi } from '../services/academicSelectionApi'
import { tokenManager } from '../utils/tokenManager'
import type { Subject, SubjectGroup } from '../types/academicSelection'

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return 'Ocurrio un error inesperado. Intenta nuevamente.'
}

export function SubjectGroupSelectionPage() {
  const sessionUser = tokenManager.getUser()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [groups, setGroups] = useState<SubjectGroup[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadAcademicOffer = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const [subjectsResponse, groupsResponse] = await Promise.all([
          academicSelectionApi.getSubjects(),
          academicSelectionApi.getGroups(),
        ])

        startTransition(() => {
          setSubjects(subjectsResponse)
          setGroups(groupsResponse)
          setSelectedSubjectId(subjectsResponse[0]?.id_asignatura ?? null)
        })
      } catch (error) {
        setErrorMessage(getErrorMessage(error))
      } finally {
        setIsLoading(false)
      }
    }

    void loadAcademicOffer()
  }, [])

  const filteredSubjects = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase()

    if (!normalizedSearch) {
      return subjects
    }

    return subjects.filter((subject) => subject.nombre.toLowerCase().includes(normalizedSearch))
  }, [searchValue, subjects])

  const selectedSubject = subjects.find((subject) => subject.id_asignatura === selectedSubjectId)
  const availableGroups = groups.filter((group) => group.id_asignatura === selectedSubjectId)
  const selectedGroup = groups.find((group) => group.id_grupo === selectedGroupId)
  const totalCredits = selectedSubject?.creditos ?? 0

  const handleSubjectSelect = (subjectId: number) => {
    setSelectedSubjectId(subjectId)
    setSelectedGroupId(null)
    setConfirmationMessage(null)
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1280px] grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)]">
        <ManagementSidebar activeItem="Matriculas" />

        <main className="border-l border-slate-200 bg-[#f7f9fc]">
          <ManagementTopbar
            searchValue={searchValue}
            userName={sessionUser?.nombre ?? 'Estudiante'}
            searchPlaceholder="Buscar asignaturas..."
            onSearchChange={setSearchValue}
          />

          <div className="px-6 pb-6 pt-5">
            <section className="flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-[2.35rem] font-extrabold tracking-[-0.03em] text-slate-900">
                  Seleccion de Asignaturas y Grupos
                </h1>
                <p className="mt-2 max-w-2xl text-[1.02rem] text-slate-600">
                  Elige una asignatura, revisa los grupos disponibles y confirma el grupo que
                  quieres tomar.
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:grid-cols-3">
                <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">Asignaturas</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{subjects.length}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">Grupos</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{groups.length}</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">Creditos</p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">{totalCredits}</p>
                </div>
              </div>
            </section>

            {errorMessage ? (
              <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <section className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
              <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e6f1ff] text-[var(--brand-navy)]">
                      <BookMarked className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Asignaturas</h2>
                      <p className="text-sm text-slate-500">Selecciona una materia para ver grupos.</p>
                    </div>
                  </div>
                </div>

                <div className="max-h-[560px] space-y-3 overflow-y-auto p-4">
                  {isLoading ? (
                    <LoadingRows />
                  ) : filteredSubjects.length ? (
                    filteredSubjects.map((subject) => {
                      const isSelected = subject.id_asignatura === selectedSubjectId
                      const subjectGroupsCount = groups.filter(
                        (group) => group.id_asignatura === subject.id_asignatura,
                      ).length

                      return (
                        <button
                          key={subject.id_asignatura}
                          type="button"
                          onClick={() => handleSubjectSelect(subject.id_asignatura)}
                          className={[
                            'flex w-full items-center justify-between gap-4 rounded-md border px-4 py-4 text-left transition',
                            isSelected
                              ? 'border-[var(--brand-navy)] bg-[#eaf3ff] shadow-[0_8px_20px_rgba(7,45,99,0.10)]'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                          ].join(' ')}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-extrabold text-slate-900">
                              {subject.nombre}
                            </span>
                            <span className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                              <span>{subject.creditos} creditos</span>
                              <span>{subjectGroupsCount} grupos</span>
                            </span>
                          </span>
                          {isSelected ? (
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--brand-navy)] text-white">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : null}
                        </button>
                      )
                    })
                  ) : (
                    <EmptyState
                      icon={Search}
                      title="Sin resultados"
                      description="No encontramos asignaturas con ese nombre."
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#fff3d8] text-[var(--brand-gold)]">
                        <UsersRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-extrabold text-slate-900">Grupos disponibles</h2>
                        <p className="text-sm text-slate-500">
                          {selectedSubject?.nombre ?? 'Selecciona una asignatura'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 p-5 md:grid-cols-2">
                    {isLoading ? (
                      <LoadingRows />
                    ) : availableGroups.length ? (
                      availableGroups.map((group) => {
                        const isSelected = selectedGroupId === group.id_grupo

                        return (
                          <button
                            key={group.id_grupo}
                            type="button"
                            onClick={() => {
                              setSelectedGroupId(group.id_grupo)
                              setConfirmationMessage(null)
                            }}
                            className={[
                              'min-h-[170px] rounded-md border p-4 text-left transition',
                              isSelected
                                ? 'border-[var(--brand-navy)] bg-[#eef6ff] shadow-[0_10px_28px_rgba(7,45,99,0.12)]'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                            ].join(' ')}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs font-semibold uppercase text-slate-500">
                                  Grupo
                                </p>
                                <p className="mt-1 text-3xl font-extrabold text-slate-900">
                                  {group.num_grupo}
                                </p>
                              </div>
                              <span
                                className={[
                                  'flex h-8 w-8 items-center justify-center rounded-full border',
                                  isSelected
                                    ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white'
                                    : 'border-slate-300 text-slate-400',
                                ].join(' ')}
                              >
                                <Check className="h-4 w-4" />
                              </span>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                              <GroupMetric
                                icon={GraduationCap}
                                label="Creditos"
                                value={String(group.creditos)}
                              />
                              <GroupMetric
                                icon={Layers3}
                                label="Cupo maximo"
                                value={String(group.cupo_maximo)}
                              />
                            </div>
                          </button>
                        )
                      })
                    ) : (
                      <div className="md:col-span-2">
                        <EmptyState
                          icon={Clock3}
                          title="Sin grupos disponibles"
                          description="Esta asignatura aun no tiene grupos registrados."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[12px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                  <h2 className="text-lg font-extrabold text-slate-900">Resumen de seleccion</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <SummaryItem label="Asignatura" value={selectedSubject?.nombre ?? 'Pendiente'} />
                    <SummaryItem
                      label="Grupo"
                      value={selectedGroup ? `Grupo ${selectedGroup.num_grupo}` : 'Pendiente'}
                    />
                    <SummaryItem label="Creditos" value={String(totalCredits)} />
                  </div>

                  {confirmationMessage ? (
                    <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                      {confirmationMessage}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    disabled={!selectedSubject || !selectedGroup}
                    onClick={() => {
                      if (!selectedSubject || !selectedGroup) {
                        return
                      }

                      setConfirmationMessage(
                        `${selectedSubject.nombre} quedo seleccionada en el grupo ${selectedGroup.num_grupo}.`,
                      )
                    }}
                    className="mt-5 inline-flex h-[46px] w-full items-center justify-center gap-2 rounded-[3px] bg-[var(--brand-navy)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,46,90,0.16)] transition enabled:hover:bg-[#0d264a] disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
                  >
                    <Check className="h-4 w-4" />
                    Confirmar seleccion
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  )
}

type IconComponent = typeof BookMarked

function GroupMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent
  label: string
  value: string
}) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <p className="mt-2 text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-slate-900">{value}</p>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: IconComponent
  title: string
  description: string
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
      <Icon className="h-9 w-9 text-slate-400" />
      <p className="mt-3 text-sm font-extrabold text-slate-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
    </div>
  )
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-[88px] animate-pulse rounded-md border border-slate-200 bg-slate-100"
        />
      ))}
    </>
  )
}
