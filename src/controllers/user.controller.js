const User = require('../models/user.model');
const { hashPassword } = require('../utils/password');

const validRoles = ['admin', 'user'];

// Listado de usuarios para el panel administrador.
function list(req, res) {
  res.json(User.findAll());
}

// Creacion de usuarios con rol admin o user.
function create(req, res) {
  const { usuario, password, role = 'user' } = req.body;

  // Validaciones basicas antes de guardar.
  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y password son obligatorios' });
  }

  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Role invalido' });
  }

  try {
    const user = User.create({
      usuario,
      password: hashPassword(password),
      role,
    });

    return res.status(201).json(user);
  } catch (error) {
    return res.status(409).json({ message: 'El usuario ya existe' });
  }
}

// Actualizacion parcial de usuario, password y rol.
function update(req, res) {
  const { usuario, password, role } = req.body;

  // Validacion del rol cuando se envia en la peticion.
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ message: 'Role invalido' });
  }

  try {
    const user = User.update(req.params.id, {
      usuario,
      password: password ? hashPassword(password) : undefined,
      role,
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(409).json({ message: 'El usuario ya existe' });
  }
}

// Eliminacion de usuarios administrados.
function remove(req, res) {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
  }

  try {
    const result = User.remove(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(409).json({ message: 'No se puede eliminar un usuario con perfiles asociados' });
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
};
