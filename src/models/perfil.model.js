const { getDb } = require('../config/database');

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

function findPublic({ search, categoriaId }) {
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

  return getDb()
    .prepare(`
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
    `)
    .all(...params);
}

function findById(id) {
  return mapPerfil(
    getDb()
      .prepare(`
        SELECT
          p.*,
          c.nombre AS categoria_nombre
        FROM perfiles_grilla p
        INNER JOIN categorias c ON c.id = p.categoria_id
        WHERE p.id = ?
      `)
      .get(id)
  );
}

function findDetail(id) {
  const perfil = findById(id);

  if (!perfil) return null;

  const galeria = getDb()
    .prepare('SELECT id, imagen_base64 FROM galeria_modales WHERE perfil_id = ? ORDER BY id ASC')
    .all(id);

  return {
    ...perfil,
    galeria,
  };
}

function replaceGallery(database, perfilId, galeria = []) {
  database.prepare('DELETE FROM galeria_modales WHERE perfil_id = ?').run(perfilId);

  if (!Array.isArray(galeria) || galeria.length === 0) {
    return;
  }

  const insertImage = database.prepare(
    'INSERT INTO galeria_modales (perfil_id, imagen_base64) VALUES (?, ?)'
  );

  galeria.forEach((imagen) => {
    const imagenBase64 = typeof imagen === 'string' ? imagen : imagen.imagen_base64;
    if (imagenBase64) insertImage.run(perfilId, imagenBase64);
  });
}

function runInTransaction(database, callback) {
  database.exec('BEGIN');

  try {
    const result = callback();
    database.exec('COMMIT');
    return result;
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function create(data) {
  const database = getDb();

  return runInTransaction(database, () => {
    const result = database
      .prepare(`
        INSERT INTO perfiles_grilla (nombre, descripcion, logo_base64, categoria_id, creado_por)
        VALUES (?, ?, ?, ?, ?)
      `)
      .run(data.nombre, data.descripcion || null, data.logo_base64 || null, data.categoria_id, data.creado_por);

    replaceGallery(database, result.lastInsertRowid, data.galeria);

    return findDetail(result.lastInsertRowid);
  });
}

function update(id, data) {
  const database = getDb();

  return runInTransaction(database, () => {
    const current = findById(id);
    if (!current) return null;

    database
      .prepare(`
        UPDATE perfiles_grilla
        SET nombre = ?, descripcion = ?, logo_base64 = ?, categoria_id = ?
        WHERE id = ?
      `)
      .run(
        data.nombre ?? current.nombre,
        data.descripcion ?? current.descripcion,
        data.logo_base64 ?? current.logo_base64,
        data.categoria_id ?? current.categoria_id,
        id
      );

    if (Object.prototype.hasOwnProperty.call(data, 'galeria')) {
      replaceGallery(database, id, data.galeria);
    }

    return findDetail(id);
  });
}

function remove(id) {
  return getDb().prepare('DELETE FROM perfiles_grilla WHERE id = ?').run(id);
}

module.exports = {
  findPublic,
  findById,
  findDetail,
  create,
  update,
  remove,
};
