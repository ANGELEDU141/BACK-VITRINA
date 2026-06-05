const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const perfilRoutes = require('./routes/perfil.routes');

const app = express();

// Middlewares generales de la API.
app.use(cors());

app.use(express.json({ limit: '25mb' }));

// Ruta tecnica para comprobar que el backend esta activo.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Rutas de autenticacion exclusiva para administradores.
app.use('/api/auth', authRoutes);

// Rutas protegidas para administracion interna.
app.use('/api/users', userRoutes);

// Rutas publicas y protegidas segun el metodo HTTP.
app.use('/api/categorias', categoriaRoutes);
app.use('/api/perfiles', perfilRoutes);

// Manejador central de errores.
app.use((error, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, error);
  res.status(500).json({ message: 'Error interno del servidor' });
});

// Respuesta para rutas no registradas.
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

module.exports = app;
