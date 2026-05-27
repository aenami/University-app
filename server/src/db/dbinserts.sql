USE universidad_db;

-- ============================================================
-- DATOS SEMILLA PARA EL SISTEMA UNIVERSITARIO
-- Este script asume una base vacia y IDs autoincrementales
-- iniciando desde 1 en cada tabla.
-- ============================================================

-- ============================================================
-- INSERTS TABLA EVENTO
-- ============================================================
INSERT INTO evento (nombre_evento, fecha_inicio_evento, fecha_fin_evento, estado) VALUES
('Semana Cultural', '2026-01-10', '2026-01-15', 'Activo'),
('Feria Empresarial', '2026-02-01', '2026-02-03', 'Activo'),
('Congreso Ingenieria', '2026-03-12', '2026-03-15', 'Activo'),
('Hackathon Universitario', '2026-04-20', '2026-04-21', 'Activo'),
('Seminario Contable', '2026-05-10', '2026-05-12', 'Activo'),
('Festival Deportivo', '2026-06-01', '2026-06-05', 'Inactivo'),
('Encuentro Docente', '2026-07-02', '2026-07-03', 'Activo'),
('Foro Academico', '2026-08-11', '2026-08-13', 'Activo'),
('Expo Tecnologia', '2026-09-05', '2026-09-08', 'Activo'),
('Graduacion Institucional', '2026-11-20', '2026-11-20', 'Activo');

-- ============================================================
-- INSERTS TABLA USUARIO
-- ============================================================
INSERT INTO usuario (
  nombres_usuario,
  apellidos_usuario,
  password_hash,
  email_usuario,
  telefono_usuario,
  fecha_creacion_usuario,
  estado_usuario,
  fecha_nacimiento_usuario,
  genero_usuario,
  rol_usuario,
  documento_usuario
) VALUES
('Juan', 'Perez', 'hash1', 'juan.perez@universityapp.edu.co', '3000000001', '2026-01-01', 'ACTIVO', '2000-01-01', 'MASCULINO', 'ESTUDIANTE', '1001'),
('Ana', 'Gomez', 'hash2', 'ana.gomez@universityapp.edu.co', '3000000002', '2026-01-02', 'ACTIVO', '2001-02-02', 'FEMENINO', 'ESTUDIANTE', '1002'),
('Carlos', 'Ruiz', 'hash3', 'carlos.ruiz@universityapp.edu.co', '3000000003', '2026-01-03', 'ACTIVO', '1998-03-03', 'MASCULINO', 'DOCENTE', '1003'),
('Laura', 'Martinez', 'hash4', 'laura.martinez@universityapp.edu.co', '3000000004', '2026-01-04', 'ACTIVO', '1995-04-04', 'FEMENINO', 'ADMINISTRADOR', '1004'),
('Pedro', 'Lopez', 'hash5', 'pedro.lopez@universityapp.edu.co', '3000000005', '2026-01-05', 'ACTIVO', '1990-05-05', 'MASCULINO', 'COORDINADOR', '1005'),
('Luisa', 'Fernandez', 'hash6', 'luisa.fernandez@universityapp.edu.co', '3000000006', '2026-01-06', 'ACTIVO', '2002-06-06', 'FEMENINO', 'ESTUDIANTE', '1006'),
('Mario', 'Torres', 'hash7', 'mario.torres@universityapp.edu.co', '3000000007', '2026-01-07', 'ACTIVO', '1999-07-07', 'MASCULINO', 'DOCENTE', '1007'),
('Sofia', 'Ramirez', 'hash8', 'sofia.ramirez@universityapp.edu.co', '3000000008', '2026-01-08', 'ACTIVO', '1997-08-08', 'FEMENINO', 'ADMINISTRADOR', '1008'),
('Andres', 'Castro', 'hash9', 'andres.castro@universityapp.edu.co', '3000000009', '2026-01-09', 'ACTIVO', '2001-09-09', 'MASCULINO', 'ESTUDIANTE', '1009'),
('Camila', 'Moreno', 'hash10', 'camila.moreno@universityapp.edu.co', '3000000010', '2026-01-10', 'ACTIVO', '2000-10-10', 'FEMENINO', 'COORDINADOR', '1010');

-- ============================================================
-- INSERTS TABLA LOG_AUDITORIA
-- ============================================================
INSERT INTO log_auditoria (accion_usuario, id_usuario) VALUES
('Inicio de sesion', 1),
('Registro de matricula', 2),
('Actualizacion de nota', 3),
('Creacion de evento', 4),
('Consulta de horario', 5),
('Cambio de contrasena', 6),
('Registro de asistencia', 7),
('Actualizacion de perfil', 8),
('Creacion de PQR', 9),
('Respuesta de PQR', 10);

-- ============================================================
-- INSERTS TABLA ESTUDIANTE
-- ============================================================
INSERT INTO estudiante (id_usuario) VALUES
(1),
(2),
(6),
(9);

-- ============================================================
-- INSERTS TABLA ADMINISTRADOR
-- ============================================================
INSERT INTO administrador (fecha_contratacion, id_usuario) VALUES
('2024-01-15', 4),
('2024-03-01', 8);

-- ============================================================
-- INSERTS TABLA PROGRAMA
-- ============================================================
INSERT INTO programa (nombre, tipo_programa, facultad) VALUES
('Ingenieria de Sistemas', 'Carreras', 'Ingenieria'),
('Contaduria Publica', 'Carreras', 'Ciencias Empresariales'),
('Administracion de Empresas', 'Carreras', 'Ciencias Empresariales');

-- ============================================================
-- INSERTS TABLA FACULTAD
-- ============================================================
INSERT INTO facultad (nombre, id_programa) VALUES
('Ingenieria', 1),
('Empresariales', 2),
('Administracion', 3);

-- ============================================================
-- INSERTS TABLA DOCENTE
-- ============================================================
INSERT INTO docente (especialidad, fecha_contratacion, tipo_contrato, id_usuario, id_facultad) VALUES
('Desarrollo de Software', '2023-07-10', 'Tiempo Completo', 3, 1),
('Analitica Financiera', '2023-08-20', 'Catedra', 7, 2);

-- ============================================================
-- INSERTS TABLA COORDINADOR_PROGRAMA
-- ============================================================
INSERT INTO coordinador_programa (id_programa, id_usuario, fecha_contratacion, id_facultad) VALUES
(1, 5, '2023-02-01', 1),
(3, 10, '2023-04-15', 3);

-- ============================================================
-- INSERTS TABLA BECA
-- ============================================================
INSERT INTO beca (nombre, descuento, fecha_inicio, fecha_fin) VALUES
('Beca Excelencia', 50.00, '2026-01-01', '2026-12-31'),
('Beca Deportiva', 30.00, '2026-01-01', '2026-12-31'),
('Beca Social', 40.00, '2026-01-01', '2026-12-31');

-- ============================================================
-- INSERTS TABLA ASIGNATURA
-- ============================================================
INSERT INTO asignatura (nombre, creditos) VALUES
('Programacion I', 4),
('Bases de Datos', 4),
('Estructuras de Datos', 4),
('Contabilidad General', 3),
('Matematicas Financieras', 3),
('Administracion I', 3);

-- ============================================================
-- INSERTS TABLA PRERREQUISITO
-- ============================================================
INSERT INTO prerrequisito (id_asignatura_requisito, id_asignatura) VALUES
(1, 2),
(1, 3),
(4, 5);

-- ============================================================
-- INSERTS TABLA PENSUM
-- ============================================================
INSERT INTO pensum (id_programa, estado) VALUES
(1, 'Activo'),
(2, 'Activo'),
(3, 'Activo');

-- ============================================================
-- INSERTS TABLA PENSUM_ASIGNATURA
-- ============================================================
INSERT INTO pensum_asignatura (id_asignatura, id_pensum) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 2),
(5, 2),
(6, 3);

-- ============================================================
-- INSERTS TABLA HORARIO
-- ============================================================
INSERT INTO horario (dia, hora_inicio, hora_fin) VALUES
('2026-02-02', '07:00:00', '09:00:00'),
('2026-02-03', '09:00:00', '11:00:00'),
('2026-02-04', '11:00:00', '13:00:00'),
('2026-02-05', '14:00:00', '16:00:00'),
('2026-02-06', '16:00:00', '18:00:00');

-- ============================================================
-- INSERTS TABLA GRUPO
-- ============================================================
INSERT INTO grupo (num_grupo, cupo_maximo, id_asignatura) VALUES
(101, 35, 1),
(102, 30, 2),
(103, 28, 3),
(201, 40, 4),
(301, 32, 6);

-- ============================================================
-- INSERTS TABLA AULA
-- ============================================================
INSERT INTO aula (piso, bloque, horario, id_horario, id_grupo) VALUES
(1, 'A', 'Lunes 7-9', 1, 1),
(2, 'A', 'Martes 9-11', 2, 2),
(3, 'B', 'Miercoles 11-13', 3, 3),
(1, 'C', 'Jueves 14-16', 4, 4),
(2, 'C', 'Viernes 16-18', 5, 5);

-- ============================================================
-- INSERTS TABLA MATRICULA
-- ============================================================
INSERT INTO matricula (
  id_estudiante,
  id_grupo,
  total_creditos,
  fecha_matricula,
  precio_total,
  id_beca,
  id_programa
) VALUES
(1, 1, 4, '2026-01-20', 1800000.00, 1, 1),
(2, 2, 4, '2026-01-21', 2200000.00, 3, 1),
(3, 4, 3, '2026-01-22', 1500000.00, NULL, 2),
(4, 5, 3, '2026-01-23', 1700000.00, 2, 3);

-- ============================================================
-- INSERTS TABLA DETALLE_MATRICULA
-- ============================================================
INSERT INTO detalle_matricula (id_matricula, id_grupo) VALUES
(1, 1),
(2, 2),
(3, 4),
(4, 5);

-- ============================================================
-- INSERTS TABLA CORTE
-- ============================================================
INSERT INTO corte (nombre_corte, porcentaje, fecha_inicio, fecha_fin) VALUES
('Primer Corte', 30, '2026-02-01', '2026-03-01'),
('Segundo Corte', 30, '2026-03-02', '2026-04-01'),
('Tercer Corte', 40, '2026-04-02', '2026-05-15');

-- ============================================================
-- INSERTS TABLA NOTA
-- ============================================================
INSERT INTO nota (
  valor,
  fecha_registro,
  version_numero,
  id_asignatura,
  id_corte,
  id_docente
) VALUES
(4.20, '2026-02-28', 1, 1, 1, 1),
(3.90, '2026-03-28', 1, 2, 2, 1),
(4.50, '2026-04-30', 1, 4, 1, 2),
(4.00, '2026-05-10', 1, 5, 3, 2);

-- ============================================================
-- INSERTS TABLA AUDITORIA_NOTA
-- ============================================================
INSERT INTO auditoria_nota (valor_anterior, valor_nuevo, id_administrador, id_nota) VALUES
(4.00, 4.20, 1, 1),
(3.70, 3.90, 1, 2),
(4.30, 4.50, 2, 3),
(3.80, 4.00, 2, 4);

-- ============================================================
-- INSERTS TABLA ASISTENCIA
-- ============================================================
INSERT INTO asistencia (fecha_asistencia, estado_asistencia, observaciones, id_docente, id_asignatura) VALUES
('2026-02-10', 'PRESENTE', 'Clase desarrollada con normalidad', 1, 1),
('2026-02-12', 'AUSENTE', 'Docente en comision academica', 1, 2),
('2026-02-14', 'PRESENTE', 'Sesion con taller practico', 2, 4),
('2026-02-16', 'EXCUSA', 'Cambio de horario institucional', 2, 5);

-- ============================================================
-- INSERTS TABLA PQR
-- ============================================================
INSERT INTO pqr (titulo_pqr, descripcion_pqr, estado_pqr, id_usuario) VALUES
('Inconveniente con matricula', 'No se refleja el grupo asignado en el portal.', 'pendiente', 1),
('Correccion de nota', 'La nota del segundo corte no coincide con el acta.', 'cerrada', 2),
('Problema de acceso', 'No puedo ingresar al sistema desde anoche.', 'pendiente', 6),
('Solicitud de certificado', 'Necesito certificado de notas actualizado.', 'cerrada', 9);

-- ============================================================
-- INSERTS TABLA PQR_RESPUESTA
-- ============================================================
INSERT INTO pqr_respuesta (
  titulo_pqr_respuesta,
  descripcion_pqr_respuesta,
  id_administrador,
  id_pqr
) VALUES
('Revision en curso', 'Se esta validando la relacion entre matricula y grupo.', 1, 1),
('Nota corregida', 'Se actualizo la nota en el sistema y se notifico al estudiante.', 1, 2),
('Credenciales restablecidas', 'Se realizo un reinicio preventivo de credenciales.', 2, 3),
('Certificado enviado', 'El certificado fue generado y enviado al correo institucional.', 2, 4);
