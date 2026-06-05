const { getPool } = require('../config/database');

// Consultas de lectura para categorias publicas.
async function findAll() {
  const [rows] = await getPool().query('SELECT id, nombre FROM categorias ORDER BY nombre ASC');
  return rows;
}

async function findById(id) {
  const [rows] = await getPool().query('SELECT id, nombre FROM categorias WHERE id = ?', [id]);
  return rows[0] || null;
}

// Operaciones de escritura protegidas para administradores.
async function create(nombre) {
  const [result] = await getPool().query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
  return findById(result.insertId);
}

async function update(id, nombre) {
  const [result] = await getPool().query('UPDATE categorias SET nombre = ? WHERE id = ?', [
    nombre,
    id,
  ]);

  if (result.affectedRows === 0) return null;
  return findById(id);
}

async function remove(id) {
  const [result] = await getPool().query('DELETE FROM categorias WHERE id = ?', [id]);
  return result;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
