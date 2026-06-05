const { getDb } = require('../config/database');

// Consultas de lectura para usuarios del sistema.
function findAll() {
  return getDb()
    .prepare('SELECT id, usuario, role FROM users ORDER BY CAST(id AS INTEGER) ASC')
    .all();
}

function findById(id) {
  return getDb().prepare('SELECT id, usuario, role FROM users WHERE id = ?').get(id);
}

function findByUsuario(usuario) {
  return getDb().prepare('SELECT * FROM users WHERE usuario = ?').get(usuario);
}

// Calcula el menor ID positivo disponible para mantener usuarios 1, 2, 3...
function getNextUserId(database) {
  const users = database.prepare('SELECT id FROM users ORDER BY CAST(id AS INTEGER) ASC').all();
  let nextId = 1;

  for (const user of users) {
    if (user.id === nextId) {
      nextId += 1;
    } else if (user.id > nextId) {
      break;
    }
  }

  return nextId;
}

// Operaciones de escritura administradas desde el panel.
function create({ usuario, password, role }) {
  const database = getDb();
  const nextId = getNextUserId(database);

  database
    .prepare('INSERT INTO users (id, usuario, password, role) VALUES (?, ?, ?, ?)')
    .run(nextId, usuario, password, role);

  return findById(nextId);
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
