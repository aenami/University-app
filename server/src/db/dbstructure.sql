-- ============================================================
--  SISTEMA UNIVERSITARIO - Base de Datos MySQL
--  Generado desde modelo relacional
-- ============================================================

CREATE DATABASE IF NOT EXISTS universidad_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE universidad_db;

-- ============================================================
-- 1. EVENTO
-- ============================================================
CREATE TABLE evento (
  id_evento          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_evento      VARCHAR(100) NOT NULL,
  fecha_inicio_evento DATE         NOT NULL,
  fecha_fin_evento    DATE         NOT NULL,
  estado             ENUM('Activo','Inactivo') NOT NULL DEFAULT 'Activo'
);

-- ============================================================
-- 2. USUARIO  (tabla base de personas)
-- ============================================================
CREATE TABLE usuario (
  id_usuario       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombres          VARCHAR(50)  NOT NULL,
  apellidos        VARCHAR(50)  NOT NULL,
  password_hash    VARCHAR(100) NOT NULL,
  correo           VARCHAR(60)  NOT NULL UNIQUE,
  telefono         VARCHAR(15)           UNIQUE,
  fecha_creacion   DATE         NOT NULL,
  estado           ENUM('ACTIVO','INACTIVO') NOT NULL DEFAULT 'ACTIVO',
  fecha_nacimiento DATE         NOT NULL,
  genero           ENUM('MASCULINO','FEMENINO') NOT NULL,
  rol_enum         ENUM('ESTUDIANTE','ADMINISTRADOR','COORDINADOR','DOCENTE') NOT NULL,
  documento        VARCHAR(20)  NOT NULL UNIQUE
);

-- ============================================================
-- 3. LOG_AUDITORIA
-- ============================================================
CREATE TABLE log_auditoria (
  id_log         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  accion_usuario VARCHAR(255) NOT NULL,
  fecha_hora     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_usuario     INT UNSIGNED NOT NULL,
  CONSTRAINT fk_log_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================================
-- 4. ESTUDIANTE
-- ============================================================
CREATE TABLE estudiante (
  id_estudiante INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_usuario    INT UNSIGNED NOT NULL UNIQUE,
  CONSTRAINT fk_estudiante_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================================
-- 5. ADMINISTRADOR
-- ============================================================
CREATE TABLE administrador (
  id_administrador   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha_contratacion DATE         NOT NULL,
  id_usuario         INT UNSIGNED NOT NULL UNIQUE,
  CONSTRAINT fk_admin_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================================
-- 6. DOCENTE
-- ============================================================
CREATE TABLE docente (
  id_docente         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  especialidad       VARCHAR(100) NOT NULL,
  fecha_contratacion DATE         NOT NULL,
  tipo_contrato      VARCHAR(50)  NOT NULL,
  id_usuario         INT UNSIGNED NOT NULL UNIQUE,
  id_facultad        INT UNSIGNED,           -- se actualiza después de crear facultad
  CONSTRAINT fk_docente_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

-- ============================================================
-- 7. PROGRAMA
-- ============================================================
CREATE TABLE programa (
  id_programa    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(50)  NOT NULL,
  tipo_programa  ENUM('Carreras') NOT NULL,
  facultad       VARCHAR(50)  NOT NULL       -- desnormalizado intencionalmente
                                             -- (ver punto alternativo abajo)
);

-- ============================================================
-- 8. FACULTAD
-- ============================================================
CREATE TABLE facultad (
  id_facultad   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(20)  NOT NULL,
  id_programa   INT UNSIGNED NOT NULL,
  CONSTRAINT fk_facultad_programa FOREIGN KEY (id_programa) REFERENCES programa(id_programa)
);

-- Ahora se puede agregar la FK de docente → facultad
ALTER TABLE docente
  ADD CONSTRAINT fk_docente_facultad
  FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad);

-- ============================================================
-- 9. COORDINADOR_PROGRAMA
-- ============================================================
CREATE TABLE coordinador_programa (
  id_coordinador     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_programa        INT UNSIGNED NOT NULL,
  id_usuario         INT UNSIGNED NOT NULL,
  fecha_contratacion DATE         NOT NULL,
  id_facultad        INT UNSIGNED NOT NULL,
  CONSTRAINT fk_coord_programa  FOREIGN KEY (id_programa)  REFERENCES programa(id_programa),
  CONSTRAINT fk_coord_usuario   FOREIGN KEY (id_usuario)   REFERENCES usuario(id_usuario),
  CONSTRAINT fk_coord_facultad  FOREIGN KEY (id_facultad)  REFERENCES facultad(id_facultad)
);

-- ============================================================
-- 10. BECA
-- ============================================================
CREATE TABLE beca (
  id_beca      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(50)    NOT NULL,
  descuento    DECIMAL(5,2)   NOT NULL COMMENT 'Porcentaje de descuento (0-100)',
  fecha_inicio DATE           NOT NULL,
  fecha_fin    DATE           NOT NULL
);

-- ============================================================
-- 11. ASIGNATURA
-- ============================================================
CREATE TABLE asignatura (
  id_asignatura INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(50) NOT NULL,
  creditos      INT         NOT NULL
);

-- ============================================================
-- 12. PRERREQUISITO
-- ============================================================
CREATE TABLE prerrequisito (
  id_prerrequisito       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_asignatura_requisito INT UNSIGNED NOT NULL  COMMENT 'Asignatura que se debe tener aprobada',
  id_asignatura           INT UNSIGNED NOT NULL  COMMENT 'Asignatura que exige el prerrequisito',
  CONSTRAINT fk_pre_requisito  FOREIGN KEY (id_asignatura_requisito) REFERENCES asignatura(id_asignatura),
  CONSTRAINT fk_pre_asignatura FOREIGN KEY (id_asignatura)           REFERENCES asignatura(id_asignatura),
  CONSTRAINT chk_no_self_pre   CHECK (id_asignatura != id_asignatura_requisito)
);

-- ============================================================
-- 13. PENSUM
-- ============================================================
CREATE TABLE pensum (
  id_pensum   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_programa INT UNSIGNED NOT NULL,
  estado      VARCHAR(20)  NOT NULL DEFAULT 'Activo',
  CONSTRAINT fk_pensum_programa FOREIGN KEY (id_programa) REFERENCES programa(id_programa)
);

-- ============================================================
-- 14. PENSUM_ASIGNATURA  (relación N:M entre pensum y asignatura)
-- ============================================================
CREATE TABLE pensum_asignatura (
  id_asignatura INT UNSIGNED NOT NULL,
  id_pensum     INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_asignatura, id_pensum),
  CONSTRAINT fk_pa_asignatura FOREIGN KEY (id_asignatura) REFERENCES asignatura(id_asignatura),
  CONSTRAINT fk_pa_pensum     FOREIGN KEY (id_pensum)     REFERENCES pensum(id_pensum)
);

-- ============================================================
-- 15. HORARIO
-- ============================================================
CREATE TABLE horario (
  id_horario   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dia          DATE         NOT NULL,
  hora_inicio  TIME         NOT NULL,
  hora_fin     TIME         NOT NULL
);

-- ============================================================
-- 16. AULA
-- ============================================================
CREATE TABLE aula (
  id_aula    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  piso       INT          NOT NULL,
  bloque     VARCHAR(10)  NOT NULL,
  horario    VARCHAR(50),
  id_horario INT UNSIGNED NOT NULL,
  id_grupo   INT UNSIGNED,                  -- FK diferida (se agrega después de grupo)
  CONSTRAINT fk_aula_horario FOREIGN KEY (id_horario) REFERENCES horario(id_horario)
);

-- ============================================================
-- 17. GRUPO
-- ============================================================
CREATE TABLE grupo (
  id_grupo    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  num_grupo   INT          NOT NULL,
  cupo_maximo INT          NOT NULL,
  id_asignatura INT UNSIGNED NOT NULL,
  CONSTRAINT fk_grupo_asignatura FOREIGN KEY (id_asignatura) REFERENCES asignatura(id_asignatura)
);

-- Ahora se puede cerrar la FK de aula → grupo
ALTER TABLE aula
  ADD CONSTRAINT fk_aula_grupo
  FOREIGN KEY (id_grupo) REFERENCES grupo(id_grupo);

-- ============================================================
-- 18. MATRICULA
-- ============================================================
CREATE TABLE matricula (
  id_matricula    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_estudiante   INT UNSIGNED   NOT NULL,
  id_grupo        INT UNSIGNED   NOT NULL,
  total_creditos  INT            NOT NULL,
  fecha_matricula DATE           NOT NULL,
  precio_total    DECIMAL(10,2)  NOT NULL,
  id_beca         INT UNSIGNED,
  id_programa     INT UNSIGNED   NOT NULL,
  CONSTRAINT fk_mat_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiante(id_estudiante),
  CONSTRAINT fk_mat_grupo      FOREIGN KEY (id_grupo)      REFERENCES grupo(id_grupo),
  CONSTRAINT fk_mat_beca       FOREIGN KEY (id_beca)       REFERENCES beca(id_beca),
  CONSTRAINT fk_mat_programa   FOREIGN KEY (id_programa)   REFERENCES programa(id_programa)
);

-- ============================================================
-- 19. DETALLE_MATRICULA
-- ============================================================
CREATE TABLE detalle_matricula (
  id_detalle   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  id_matricula INT UNSIGNED NOT NULL,
  id_grupo     INT UNSIGNED NOT NULL,
  CONSTRAINT fk_det_matricula FOREIGN KEY (id_matricula) REFERENCES matricula(id_matricula),
  CONSTRAINT fk_det_grupo     FOREIGN KEY (id_grupo)     REFERENCES grupo(id_grupo)
);

-- ============================================================
-- 20. CORTE
-- ============================================================
CREATE TABLE corte (
  id_corte     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre_corte VARCHAR(50)   NOT NULL,
  porcentaje   INT           NOT NULL COMMENT 'Porcentaje que representa este corte (ej: 30)',
  fecha_inicio DATE          NOT NULL,
  fecha_fin    DATE          NOT NULL
);

-- ============================================================
-- 21. NOTA
-- ============================================================
CREATE TABLE nota (
  id_nota         INT UNSIGNED   AUTO_INCREMENT PRIMARY KEY,
  valor           DECIMAL(4,2)   NOT NULL,
  fecha_registro  DATE           NOT NULL,
  version_numero  INT            NOT NULL DEFAULT 1,
  id_asignatura   INT UNSIGNED   NOT NULL,
  id_corte        INT UNSIGNED   NOT NULL,
  id_docente      INT UNSIGNED   NOT NULL,
  CONSTRAINT fk_nota_asignatura FOREIGN KEY (id_asignatura) REFERENCES asignatura(id_asignatura),
  CONSTRAINT fk_nota_corte      FOREIGN KEY (id_corte)      REFERENCES corte(id_corte),
  CONSTRAINT fk_nota_docente    FOREIGN KEY (id_docente)    REFERENCES docente(id_docente)
);

-- ============================================================
-- 22. AUDITORIA_NOTA
-- ============================================================
CREATE TABLE auditoria_nota (
  id_auditoria_nota INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  valor_anterior    DECIMAL(4,2)  NOT NULL,
  valor_nuevo       DECIMAL(4,2)  NOT NULL,
  fecha_cambio      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  id_administrador  INT UNSIGNED  NOT NULL,
  id_nota           INT UNSIGNED  NOT NULL,
  CONSTRAINT fk_audn_admin FOREIGN KEY (id_administrador) REFERENCES administrador(id_administrador),
  CONSTRAINT fk_audn_nota  FOREIGN KEY (id_nota)          REFERENCES nota(id_nota)
);

-- ============================================================
-- 23. ASISTENCIA
-- ============================================================
CREATE TABLE asistencia (
  id_asistencia    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  fecha_asistencia DATE         NOT NULL,
  estado_asistencia ENUM('PRESENTE','AUSENTE','EXCUSA') NOT NULL,
  observaciones    TEXT,
  id_docente       INT UNSIGNED NOT NULL,
  id_asignatura    INT UNSIGNED NOT NULL,
  CONSTRAINT fk_asi_docente    FOREIGN KEY (id_docente)    REFERENCES docente(id_docente),
  CONSTRAINT fk_asi_asignatura FOREIGN KEY (id_asignatura) REFERENCES asignatura(id_asignatura)
);

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================