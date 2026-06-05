const { getPool } = require('../config/database');

// Consultas de lectura para usuarios del sistema.
async function findAll() {
  const [rows] = await getPool().query(
    'SELECT id, usuario, role FROM users ORDER BY id ASC'
  );
  return rows;
}

async function findById(id) {
  const [rows] = await getPool().query(
    'SELECT id, usuario, role FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function findByUsuario(usuario) {
  const [rows] = await getPool().query('SELECT * FROM users WHERE usuario = ?', [usuario]);
  return rows[0] || null;
}

// Calcula el menor ID positivo disponible para mantener usuarios 1, 2, 3...
async function getNextUserId() {
  const [rows] = await getPool().query('SELECT id FROM users ORDER BY id ASC');
  let nextId = 1;

  for (const user of rows) {
    if (user.id === nextId) {
      nextId += 1;
    } else if (user.id > nextId) {
      break;
    }
  }

  return nextId;
}

// Operaciones de escritura administradas desde el panel.
async function create({ usuario, password, role }) {
  const nextId = await getNextUserId();

  await getPool().query(
    'INSERT INTO users (id, usuario, password, role) VALUES (?, ?, ?, ?)',
    [nextId, usuario, password, role]
  );

  return findById(nextId);
}

async function update(id, { usuario, password, role }) {
  const current = await findByUsuarioOrId(id);

  if (!current) return null;

  await getPool().query(
    'UPDATE users SET usuario = ?, password = ?, role = ? WHERE id = ?',
    [usuario ?? current.usuario, password ?? current.password, role ?? current.role, id]
  );

  return findById(id);
}

async function findByUsuarioOrId(id) {
  const [rows] = await getPool().query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

async function remove(id) {
  const [result] = await getPool().query('DELETE FROM users WHERE id = ?', [id]);
  return result;
}

module.exports = {
  findAll,
  findById,
  findByUsuario,
  create,
  update,
  remove,
};
