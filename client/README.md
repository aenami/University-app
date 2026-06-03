# University App - Cliente

Aplicativo web institucional para la gestion academica de Unicomfacauca.

## Instalacion y ejecucion

```bash
npm install
npm run dev
```

El cliente se ejecuta por defecto en:

```text
http://localhost:5173
```

El backend esperado para los reportes finales es:

```text
http://localhost:3000/api
```

## HU-18 - Reportes finales y evidencias

La pantalla de reportes finales esta disponible en:

```text
/Reportes
```

La HU-18 consolida reportes por modulo sin corregir el alcance pendiente de otras historias de usuario.

Reportes incluidos:

- Usuarios: reporte general con filtro por rol.
- Oferta academica: grupos, cupos, asignaturas y programa, con filtro por programa.
- Matriculas: registros de matricula con filtro por programa.
- Notas: reporte parcial con filtro por corte.
- Asistencia: reporte parcial con filtro por estado de asistencia.
- PQR: solicitudes con filtro por estado.
- Panel general: indicadores globales del sistema.

## Datos reales, parciales y mocks

Cada respuesta de reportes incluye el campo `origen`.

- `real`: datos consultados directamente desde la base de datos.
- `real_parcial`: datos reales, pero con alcance limitado por relaciones faltantes de HU previas.

Notas y asistencia se marcan como `real_parcial` porque las tablas actuales no relacionan directamente estudiante o detalle de matricula. HU-18 solo expone y documenta esa limitacion; no modifica el modelo de esas historias.

## Roles de acceso

Los endpoints de reportes requieren autenticacion y permiten acceso a:

- `ADMINISTRADOR`
- `COORDINADOR`
- `DOCENTE`

El acceso debe hacerse con login real y token JWT. El bypass de administrador por variable de entorno fue retirado para cumplir la revision del Master.

## Evidencias finales

Para cerrar HU-18 se deben anexar las siguientes evidencias en Jira o en el repositorio:

- Captura o video corto de la pantalla `/Reportes`.
- Evidencia de filtros por modulo.
- Evidencia de reportes parciales de notas y asistencia con su aviso visible.
- Estado de Jira de las HU finalizadas en `Done`.
- Justificacion de cualquier HU o modulo pendiente.
- Enlace al repositorio o Pull Request usado para la entrega.

## Usuarios de prueba

Registrar aqui los usuarios usados en la presentacion final:

| Rol | Correo | Contrasena | Observacion |
| --- | --- | --- | --- |
| ADMINISTRADOR | laura.martinez@universityapp.edu.co | 123456 | Acceso total a reportes finales |
| COORDINADOR | pedro.lopez@universityapp.edu.co | 123456 | Acceso a reportes finales |
| DOCENTE | carlos.ruiz@universityapp.edu.co | 123456 | Acceso a reportes finales |

Las contrasenas de la semilla no se guardan en texto plano: `server/src/db/dbinserts.sql` inserta el hash bcrypt correspondiente.

## Funcionalidades implementadas relacionadas con HU-18

- Consolidacion de reportes por modulo.
- Filtros basicos por modulo.
- Reporte de asistencia agregado como alcance propio de HU-18.
- Identificacion de datos reales y datos reales parciales.
- Documentacion de limitaciones que dependen de HU previas.
