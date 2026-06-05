const { getPool, runInTransaction } = require('../config/database');

// Normalizacion de filas para entregar una estructura estable al frontend.
function mapPerfil(row) {
  if (!row) return null;

  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    logo_base64: row.logo_base64,
    categoria_id: row.categoria_id,
    categoria_nombre: row.categoria_nombre,
    creado_por: row.creado_por,
    created_at: row.created_at,
  };
}

// Listado publico para grilla con busqueda por perfil, descripcion o categoria.
async function findPublic({ search, categoriaId }) {
  const filters = [];
  const params = [];

  if (search) {
    filters.push('(p.nombre LIKE ? OR p.descripcion LIKE ? OR c.nombre LIKE ?)');
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (categoriaId) {
    filters.push('p.categoria_id = ?');
    params.push(categoriaId);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const [rows] = await getPool().query(
    `
      SELECT
        p.id,
        p.nombre,
        p.descripcion,
        p.logo_base64,
        p.categoria_id,
        c.nombre AS categoria_nombre,
        p.created_at
      FROM perfiles_grilla p
      INNER JOIN categorias c ON c.id = p.categoria_id
      ${where}
      ORDER BY p.created_at DESC, p.id DESC
    `,
    params
  );

  return rows;
}

async function findById(id) {
  const [rows] = await getPool().query(
    `
      SELECT
        p.*,
        c.nombre AS categoria_nombre
      FROM perfiles_grilla p
      INNER JOIN categorias c ON c.id = p.categoria_id
      WHERE p.id = ?
    `,
    [id]
  );

  return mapPerfil(rows[0]);
}

// Detalle publico para modal con galeria completa.
async function findDetail(id) {
  const perfil = await findById(id);

  if (!perfil) return null;

  const [galeria] = await getPool().query(
    'SELECT id, imagen_base64 FROM galeria_modales WHERE perfil_id = ? ORDER BY id ASC',
    [id]
  );

  return {
    ...perfil,
    galeria,
  };
}

async function replaceGallery(connection, perfilId, galeria = []) {
  await connection.query('DELETE FROM galeria_modales WHERE perfil_id = ?', [perfilId]);

  if (!Array.isArray(galeria) || galeria.length === 0) {
    return;
  }

  const values = galeria
    .map((imagen) => (typeof imagen === 'string' ? imagen : imagen.imagen_base64))
    .filter(Boolean)
    .map((imagenBase64) => [perfilId, imagenBase64]);

  if (values.length > 0) {
    await connection.query(
      'INSERT INTO galeria_modales (perfil_id, imagen_base64) VALUES ?',
      [values]
    );
  }
}

// Creacion protegida de perfil con galeria en una sola transaccion.
async function create(data) {
  return runInTransaction(async (connection) => {
    const [result] = await connection.query(
      `
        INSERT INTO perfiles_grilla (nombre, descripcion, logo_base64, categoria_id, creado_por)
        VALUES (?, ?, ?, ?, ?)
      `,
      [data.nombre, data.descripcion || null, data.logo_base64 || null, data.categoria_id, data.creado_por]
    );

    await replaceGallery(connection, result.insertId, data.galeria);

    return findDetail(result.insertId);
  });
}

// Edicion protegida de perfil y reemplazo opcional de galeria.
async function update(id, data) {
  return runInTransaction(async (connection) => {
    const current = await findById(id);
    if (!current) return null;

    await connection.query(
      `
        UPDATE perfiles_grilla
        SET nombre = ?, descripcion = ?, logo_base64 = ?, categoria_id = ?
        WHERE id = ?
      `,
      [
        data.nombre ?? current.nombre,
        data.descripcion ?? current.descripcion,
        data.logo_base64 ?? current.logo_base64,
        data.categoria_id ?? current.categoria_id,
        id,
      ]
    );

    if (Object.prototype.hasOwnProperty.call(data, 'galeria')) {
      await replaceGallery(connection, id, data.galeria);
    }

    return findDetail(id);
  });
}

async function remove(id) {
  const [result] = await getPool().query('DELETE FROM perfiles_grilla WHERE id = ?', [id]);
  return result;
}

module.exports = {
  findPublic,
  findById,
  findDetail,
  create,
  update,
  remove,
};
