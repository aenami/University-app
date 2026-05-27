import { LoaderCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import type {
  CreateManagedUserPayload,
  ManagedUserRole,
  UserGender,
} from '../../types/userManagement'
import { roleLabels, userGenders } from '../../types/userManagement'

type CreateUserModalProps = {
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: CreateManagedUserPayload) => Promise<void>
}

type FormDraft = CreateManagedUserPayload

const initialDraft: FormDraft = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  birthDate: '',
  userGender: 'MASCULINO',
  userRole: 'ADMINISTRADOR',
  userID: '',
}

const roleOptions: ManagedUserRole[] = ['ADMINISTRADOR', 'COORDINADOR', 'DOCENTE']

export function CreateUserModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateUserModalProps) {
  const [draft, setDraft] = useState<FormDraft>(initialDraft)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    // Cada vez que el modal se abre, reiniciamos el formulario para una captura limpia.
    if (isOpen) {
      setDraft(initialDraft)
      setFormError(null)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  const updateField = <Field extends keyof FormDraft>(field: Field, value: FormDraft[Field]) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: value,
    }))
  }

  const validateDraft = () => {
    // Validamos lo basico antes de invocar el backend.
    if (
      !draft.name.trim() ||
      !draft.lastName.trim() ||
      !draft.email.trim() ||
      !draft.password.trim() ||
      !draft.birthDate.trim() ||
      !draft.userID.trim()
    ) {
      return 'Completa todos los campos obligatorios antes de guardar.'
    }

    if (draft.password.trim().length < 8) {
      return 'La contrasena debe tener al menos 8 caracteres.'
    }

    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationError = validateDraft()
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)

    await onSubmit({
      ...draft,
      email: draft.email.trim().toLowerCase(),
      name: draft.name.trim(),
      lastName: draft.lastName.trim(),
      password: draft.password.trim(),
      userID: draft.userID.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[30px] border border-white/20 bg-white shadow-[0_32px_110px_rgba(15,23,42,0.32)]">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-slate-400 uppercase">
              Nuevo usuario
            </p>
            <h2 className="mt-2 font-[var(--font-display)] text-4xl text-slate-900">
              Crear acceso academico
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Registra administradores, coordinadores o docentes desde una sola ficha.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="Nombres">
              <input
                value={draft.name}
                onChange={(event) => updateField('name', event.target.value)}
                className={inputClassName}
                placeholder="Carlos"
              />
            </FormField>

            <FormField label="Apellidos">
              <input
                value={draft.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                className={inputClassName}
                placeholder="Martinez"
              />
            </FormField>

            <FormField label="Correo institucional">
              <input
                type="email"
                value={draft.email}
                onChange={(event) => updateField('email', event.target.value)}
                className={inputClassName}
                placeholder="usuario@unicomfacauca.edu.co"
              />
            </FormField>

            <FormField label="Contrasena temporal">
              <input
                type="password"
                value={draft.password}
                onChange={(event) => updateField('password', event.target.value)}
                className={inputClassName}
                placeholder="Minimo 8 caracteres"
              />
            </FormField>

            <FormField label="Documento">
              <input
                value={draft.userID}
                onChange={(event) => updateField('userID', event.target.value)}
                className={inputClassName}
                placeholder="1234567890"
              />
            </FormField>

            <FormField label="Fecha de nacimiento">
              <input
                type="date"
                value={draft.birthDate}
                onChange={(event) => updateField('birthDate', event.target.value)}
                className={inputClassName}
              />
            </FormField>
          </div>

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <FormField label="Rol">
              <div className="grid gap-2 sm:grid-cols-3">
                {roleOptions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => updateField('userRole', role)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                      draft.userRole === role
                        ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                    ].join(' ')}
                  >
                    {roleLabels[role]}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Genero">
              <div className="grid gap-2 sm:grid-cols-2">
                {userGenders.map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => updateField('userGender', gender as UserGender)}
                    className={[
                      'rounded-2xl border px-4 py-3 text-sm font-semibold transition',
                      draft.userGender === gender
                        ? 'border-[var(--brand-cyan)] bg-[rgba(11,122,143,0.1)] text-[var(--brand-cyan)]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900',
                    ].join(' ')}
                  >
                    {gender === 'MASCULINO' ? 'Masculino' : 'Femenino'}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          {formError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--brand-navy)] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(15,46,90,0.28)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:cursor-wait disabled:opacity-75"
            >
              {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Guardar usuario
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

type FormFieldProps = {
  label: string
  children: ReactNode
}

function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold tracking-[0.24em] text-slate-400 uppercase">
        {label}
      </span>
      {children}
    </label>
  )
}

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-sky)] focus:ring-4 focus:ring-[rgba(76,145,255,0.14)]'
