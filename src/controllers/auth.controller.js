const User = require('../models/user.model');
const { verifyPassword } = require('../utils/password');
const jwt = require('../utils/jwt');

function login(req, res) {
  // Datos recibidos desde el formulario de login del panel administrador.
  const { usuario, password } = req.body;

  // Validacion basica de credenciales obligatorias.
  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y password son obligatorios' });
  }

  // Busqueda del usuario y comparacion segura del password.
  const user = User.findByUsuario(usuario);

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).json({ message: 'Credenciales invalidas' });
  }

  // Solo los administradores pueden iniciar sesion y recibir JWT.
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Solo administradores pueden iniciar sesion' });
  }

  // Token firmado para acceder al panel y a las rutas protegidas.
  const token = jwt.sign({ id: user.id, role: user.role });

  return res.json({
    token,
    user: {
      id: user.id,
      usuario: user.usuario,
      role: user.role,
    },
  });
}

module.exports = {
  login,
};
