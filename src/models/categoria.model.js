const { getDb } = require('../config/database');

function findAll() {
  return getDb().prepare('SELECT id, nombre FROM categorias ORDER BY nombre ASC').all();
}

function findById(id) {
  return getDb().prepare('SELECT id, nombre FROM categorias WHERE id = ?').get(id);
}

function create(nombre) {
  const result = getDb().prepare('INSERT INTO categorias (nombre) VALUES (?)').run(nombre);
  return findById(result.lastInsertRowid);
}

function update(id, nombre) {
  getDb().prepare('UPDATE categorias SET nombre = ? WHERE id = ?').run(nombre, id);
  return findById(id);
}

function remove(id) {
  return getDb().prepare('DELETE FROM categorias WHERE id = ?').run(id);
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
