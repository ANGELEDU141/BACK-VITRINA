const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { hashPassword } = require('../utils/password');

const dataDir = path.join(__dirname, '..', '..', 'data');
const dbPath = path.join(dataDir, 'ipeys.sqlite');

let db;

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

  // Categorias iniciales para clasificar perfiles de la grilla.
  const categorias = ['Abogados', 'Contadores', 'Arquitectos', 'Ingenieros'];
  const insertCategoria = database.prepare('INSERT OR IGNORE INTO categorias (nombre) VALUES (?)');

  categorias.forEach((nombre) => insertCategoria.run(nombre));
}

module.exports = {
  getDb,
  initDatabase,
};
