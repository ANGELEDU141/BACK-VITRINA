const { getDb } = require('../config/database');

// Consultas de lectura para usuarios del sistema.
function findAll() {
  return getDb()
    .prepare('SELECT id, usuario, role FROM users ORDER BY id ASC')
    .all();
}

function findById(id) {
  return getDb().prepare('SELECT id, usuario, role FROM users WHERE id = ?').get(id);
}

function findByUsuario(usuario) {
  return getDb().prepare('SELECT * FROM users WHERE usuario = ?').get(usuario);
}

// Operaciones de escritura administradas desde el panel.
function create({ usuario, password, role }) {
  const result = getDb()
    .prepare('INSERT INTO users (usuario, password, role) VALUES (?, ?, ?)')
    .run(usuario, password, role);

  return findById(result.lastInsertRowid);
}

function update(id, { usuario, password, role }) {
  const current = getDb().prepare('SELECT * FROM users WHERE id = ?').get(id);

  if (!current) return null;

  getDb()
    .prepare('UPDATE users SET usuario = ?, password = ?, role = ? WHERE id = ?')
    .run(usuario ?? current.usuario, password ?? current.password, role ?? current.role, id);

  return findById(id);
}

function remove(id) {
  return getDb().prepare('DELETE FROM users WHERE id = ?').run(id);
}

module.exports = {
  findAll,
  findById,
  findByUsuario,
  create,
  update,
  remove,
};
