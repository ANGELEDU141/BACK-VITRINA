const app = require('./src/app');
const { initDatabase } = require('./src/config/database');

const port = process.env.PORT || 3000;

// Arranque principal: primero prepara MySQL y luego levanta Express.
async function startServer() {
  try {
    await initDatabase();

    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('[SERVER] No se pudo iniciar el backend:', error.message);
    process.exit(1);
  }
}

startServer();
