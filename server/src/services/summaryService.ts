import { getConnection } from "../config/db.js";

export const getSummaryData = async () => {
  const db = getConnection();

  const [usuarios] = await db.query(`
    SELECT
      rol_enum  AS rol,
      estado,
      COUNT(*)  AS total
    FROM usuario
    GROUP BY rol_enum, estado
    ORDER BY rol_enum, estado
  `);

  const [grupos] = await db.query(`
    SELECT
      g.id_grupo,
      g.num_grupo,
      g.cupo_maximo,
      a.nombre              AS asignatura,
      COUNT(m.id_matricula) AS inscritos
    FROM grupo g
    JOIN asignatura a ON a.id_asignatura = g.id_asignatura
    LEFT JOIN matricula m ON m.id_grupo = g.id_grupo
    GROUP BY g.id_grupo, g.num_grupo, g.cupo_maximo, a.nombre
    ORDER BY a.nombre, g.num_grupo
  `);

  return { usuarios, grupos };
};