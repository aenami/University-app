-- Restricciones para evitar duplicados en oferta academica.
-- Ejecutar solo despues de revisar o limpiar datos duplicados existentes.

ALTER TABLE programa
  ADD CONSTRAINT uq_programa_nombre UNIQUE (nombre);

ALTER TABLE asignatura
  ADD CONSTRAINT uq_asignatura_nombre UNIQUE (nombre);

ALTER TABLE grupo
  ADD CONSTRAINT uq_grupo_asignatura_numero UNIQUE (id_asignatura, num_grupo);

ALTER TABLE pensum
  ADD CONSTRAINT uq_pensum_programa_estado UNIQUE (id_programa, estado);

ALTER TABLE prerrequisito
  ADD CONSTRAINT uq_prerrequisito_asignatura UNIQUE (id_asignatura, id_asignatura_requisito);
