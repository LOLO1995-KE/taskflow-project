require('dotenv').config();

const port = process.env.PORT;

if (!port) {
  throw new Error('La variable de entorno PORT no está definida. Asegúrate de tener un archivo .env con PORT=3000');
}

module.exports = {
  port,
};
