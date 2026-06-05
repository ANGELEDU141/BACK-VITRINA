const mysql = require('mysql2/promise');
const { hashPassword } = require('../utils/password');

// Configuracion principal para conectar con MySQL Server.
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ipeys_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
};

let pool;

// Pool reutilizable para todas las consultas del backend.
function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }

  return pool;
}

// Crea la base si no existe antes de abrir el pool con database fija.
async function ensureDatabaseExists() {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
  await connection.end();
}

// Ejecuta una operacion dentro de transaccion MySQL.
async function runInTransaction(callback) {
  const connection = await getPool().getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Crea las tablas principales siguiendo el diagrama entidad-relacion.
async function createTables() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL
    )
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL UNIQUE
    )
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS perfiles_grilla (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(150) NOT NULL,
      descripcion TEXT,
      logo_base64 LONGTEXT,
      categoria_id INT NOT NULL,
      creado_por INT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_perfiles_categoria
        FOREIGN KEY (categoria_id) REFERENCES categorias(id),
      CONSTRAINT fk_perfiles_user
        FOREIGN KEY (creado_por) REFERENCES users(id)
    )
  `);

  await getPool().query(`
    CREATE TABLE IF NOT EXISTS galeria_modales (
      id INT AUTO_INCREMENT PRIMARY KEY,
      perfil_id INT NOT NULL,
      imagen_base64 LONGTEXT NOT NULL,
      CONSTRAINT fk_galeria_perfil
        FOREIGN KEY (perfil_id) REFERENCES perfiles_grilla(id)
        ON DELETE CASCADE
    )
  `);
}

// Seeds iniciales para que el sistema arranque sin duplicar datos.
async function seedInitialData() {
  const adminPassword = hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
  const userPassword = hashPassword(process.env.USER_PASSWORD || 'user123');

  await getPool().query(
    'INSERT IGNORE INTO users (usuario, password, role) VALUES (?, ?, ?)',
    [process.env.ADMIN_USER || 'admin', adminPassword, 'admin']
  );

  await getPool().query(
    'INSERT IGNORE INTO users (usuario, password, role) VALUES (?, ?, ?)',
    [process.env.NORMAL_USER || 'user', userPassword, 'user']
  );

  const categorias = ['Abogados', 'Contadores', 'Arquitectos', 'Ingenieros'];

  for (const nombre of categorias) {
    await getPool().query('INSERT IGNORE INTO categorias (nombre) VALUES (?)', [nombre]);
  }
}

// Inicializacion completa al hacer npm start.
async function initDatabase() {
  await ensureDatabaseExists();
  await createTables();
  await seedInitialData();
  console.log(`[DB] MySQL conectado y listo: ${dbConfig.database}`);
}

module.exports = {
  getPool,
  runInTransaction,
  initDatabase,
};
