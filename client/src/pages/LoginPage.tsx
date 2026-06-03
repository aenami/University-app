import { useState } from 'react'
import { GraduationCap, Lock, Mail, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { api } from '../services/Api'
import { tokenManager } from '../utils/tokenManager'

/**
 * Componente LoginPage
 * 
 * Interfaz de inicio de sesión premium para University App.
 * Cuenta con un diseño adaptativo de dos columnas (en pantallas grandes),
 * efectos de difuminado y sombras (glassmorphism), y retroalimentación interactiva
 * para el usuario.
 */
export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Manejador del submit de login utilizando React 19 Form Actions
  const handleLoginAction = async () => {
    // Validación local básica
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios.')
      return
    }

    setIsLoading(true)
    setErrorMsg(null)

    try {
      // Consumimos el endpoint de login de la API como ruta pública (isPublic = true)
      const response = await api.post(
        '/api/auth/login',
        {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        },
        true
      ) as { token: string; user: { id: number; nombre: string } }

      // Guardamos el token y los datos de usuario en localStorage
      tokenManager.saveSession(response.token, response.user)

      // Redireccionamos a la selección de asignaturas
      window.location.href = '/SeleccionAsignaturas'
    } catch (error: unknown) {
      console.error('Error al iniciar sesión:', error)
      setErrorMsg(error instanceof Error ? error.message : 'Error al autenticar. Verifica tus credenciales.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] p-4 sm:p-6 lg:p-8">
      {/* Contenedor principal con efecto glassmorphism */}
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_32px_110px_rgba(15,23,42,0.08)] lg:grid-cols-12">
        
        {/* Banner izquierdo: Branding e información */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-[var(--brand-navy)] via-[#0b3c7e] to-[#0f4e9f] p-12 text-white lg:col-span-5 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_45%)]" />
          
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <GraduationCap className="h-6 w-6 text-[var(--brand-sky)]" />
            </div>
            <span className="font-semibold tracking-wide text-lg">University App</span>
          </div>

          <div className="relative z-10 my-auto space-y-6">
            <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
              Portal Académico & Administrativo
            </h2>
            <p className="text-white/80 leading-relaxed text-sm">
              Accede al panel integral para gestionar usuarios, coordinar la oferta educativa, registrar matrículas y supervisar auditorías del sistema.
            </p>
          </div>

          <div className="relative z-10 text-xs text-white/50">
            &copy; 2026 Unicomfacauca. Todos los derechos reservados.
          </div>
        </div>

        {/* Formulario derecho: Controles de entrada */}
        <div className="flex flex-col justify-center px-6 py-12 sm:px-16 lg:col-span-7 lg:px-20">
          <div className="mx-auto w-full max-w-md">
            
            {/* Cabecera */}
            <div className="text-center lg:text-left">
              <p className="text-xs font-semibold tracking-[0.25em] text-[var(--brand-cyan)] uppercase">
                Bienvenido de nuevo
              </p>
              <h1 className="mt-3 font-[var(--font-display)] text-3xl font-extrabold tracking-tight text-slate-900">
                Iniciar Sesión
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Ingresa tus credenciales institucionales para continuar.
              </p>
            </div>

            {/* Alerta de Error */}
            {errorMsg && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 animate-fadeIn">
                <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Formulario de Login */}
            <form action={handleLoginAction} className="mt-8 space-y-6">
              
              {/* Campo Email */}
              <div className="space-y-2">
<<<<<<< HEAD
                <label htmlFor="login-email" className="block text-xs font-extrabold tracking-wide text-slate-700 uppercase">
=======
                <label className="block text-xs font-extrabold tracking-wide text-slate-700 uppercase">
>>>>>>> bc496a97905cfcd6e0d657178ba63b8ff288bbc5
                  Correo Electrónico
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
<<<<<<< HEAD
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
=======
                    type="email"
                    name="email"
>>>>>>> bc496a97905cfcd6e0d657178ba63b8ff288bbc5
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@universityapp.edu.co"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-navy)] focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
<<<<<<< HEAD
                  <label htmlFor="login-password" className="block text-xs font-extrabold tracking-wide text-slate-700 uppercase">
=======
                  <label className="block text-xs font-extrabold tracking-wide text-slate-700 uppercase">
>>>>>>> bc496a97905cfcd6e0d657178ba63b8ff288bbc5
                    Contraseña
                  </label>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-4 h-5 w-5 text-slate-400" />
                  <input
<<<<<<< HEAD
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
=======
                    type={showPassword ? 'text' : 'password'}
                    name="password"
>>>>>>> bc496a97905cfcd6e0d657178ba63b8ff288bbc5
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-navy)] focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Botón de Ingreso */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-navy)] py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(7,45,99,0.18)] transition hover:bg-[#0b3c7e] hover:-translate-y-0.5 disabled:pointer-events-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >
                {isLoading ? (
                  <span>Iniciando sesión...</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-xs text-slate-400 lg:hidden">
              &copy; 2026 Unicomfacauca. Todos los derechos reservados.
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
