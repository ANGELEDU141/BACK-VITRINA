const User = require('../models/user.model');
const { verifyPassword } = require('../utils/password');
const jwt = require('../utils/jwt');

// Login exclusivo para administradores del panel.
async function login({ usuario, password }) {
  if (!usuario || !password) {
    return { status: 400, body: { message: 'Usuario y password son obligatorios' } };
  }

  const user = await User.findByUsuario(usuario);

  if (!user || !verifyPassword(password, user.password)) {
    return { status: 401, body: { message: 'Credenciales invalidas' } };
  }

  if (user.role !== 'admin') {
    return { status: 403, body: { message: 'Solo administradores pueden iniciar sesion' } };
  }

  const token = jwt.sign({ id: user.id, role: user.role });

  return {
    status: 200,
    body: {
      token,
      user: {
        id: user.id,
        usuario: user.usuario,
        role: user.role,
      },
    },
  };
}

module.exports = {
  login,
};
