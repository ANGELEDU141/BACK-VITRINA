const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { hashPassword } = require('../utils/password');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'ipeys.sqlite');

let db;

// Recalcula la secuencia interna de SQLite segun el mayor ID actual.
function syncUserSequence(database) {
  database
    .prepare(`
      UPDATE sqlite_sequence
      SET seq = (SELECT COALESCE(MAX(id), 0) FROM users)
      WHERE name = 'users'
    `)
    .run();
}

// Normaliza IDs de usuarios para mantener una numeracion continua desde 1.
function compactUserIds(database) {
  const users = database.prepare('SELECT id FROM users ORDER BY CAST(id AS INTEGER) ASC').all();
  const changes = users
    .map((user, index) => ({
      oldId: user.id,
      newId: index + 1,
      tempId: -100000 - index,
    }))
    .filter((user) => user.oldId !== user.newId);

  if (changes.length === 0) {
    syncUserSequence(database);
    return;
  }

  console.log(`[DB] Normalizando ${changes.length} ID(s) de usuarios`);

  database.exec('PRAGMA foreign_keys = OFF');
  database.exec('BEGIN');

  try {
    // Primero se mueven los usuarios a IDs temporales para evitar colisiones.
    changes.forEach((user) => {
      database.prepare('UPDATE users SET id = ? WHERE id = ?').run(user.tempId, user.oldId);
    });

    // Luego se actualizan las referencias de perfiles creados por cada usuario.
    changes.forEach((user) => {
      database
        .prepare('UPDATE perfiles_grilla SET creado_por = ? WHERE creado_por = ?')
        .run(user.newId, user.oldId);
    });

    // Finalmente se asignan los IDs definitivos continuos.
    changes.forEach((user) => {
      database.prepare('UPDATE users SET id = ? WHERE id = ?').run(user.newId, user.tempId);
    });

    syncUserSequence(database);
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  } finally {
    database.exec('PRAGMA foreign_keys = ON');
  }
}

// Conexion unica a la base SQLite local.
function getDb() {
  if (!db) {
    fs.mkdirSync(dataDir, { recursive: true });
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON');
  }

  return db;
}

function initDatabase() {
  const database = getDb();

  // Creacion de tablas principales segun el modelo MVC del proyecto.
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS perfiles_grilla (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      logo_base64 TEXT,
      categoria_id INTEGER NOT NULL,
      creado_por INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      FOREIGN KEY (creado_por) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS galeria_modales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      perfil_id INTEGER NOT NULL,
      imagen_base64 TEXT NOT NULL,
      FOREIGN KEY (perfil_id) REFERENCES perfiles_grilla(id) ON DELETE CASCADE
    );
  `);

  // Usuarios iniciales: admin con login y user como rol operativo sin login publico.
  const adminPassword = hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
  const userPassword = hashPassword(process.env.USER_PASSWORD || 'user123');

  database
    .prepare('INSERT OR IGNORE INTO users (usuario, password, role) VALUES (?, ?, ?)')
    .run(process.env.ADMIN_USER || 'admin', adminPassword, 'admin');

  database
    .prepare('INSERT OR IGNORE INTO users (usuario, password, role) VALUES (?, ?, ?)')
    .run(process.env.NORMAL_USER || 'user', userPassword, 'user');

  // Ordenamiento numerico de usuarios despues de crear los seeds.
  compactUserIds(database);

  // Categorias iniciales para clasificar perfiles de la grilla.
  const categorias = ['Abogados', 'Contadores', 'Arquitectos', 'Ingenieros'];
  const insertCategoria = database.prepare('INSERT OR IGNORE INTO categorias (nombre) VALUES (?)');

  categorias.forEach((nombre) => insertCategoria.run(nombre));
}

module.exports = {
  getDb,
  initDatabase,
};
