const app = require('./src/app');
const { initDatabase } = require('./src/config/database');

const port = process.env.PORT || 3000;

initDatabase();

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
