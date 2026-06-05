const User = require('../models/user.model');
const { hashPassword } = require('../utils/password');

const validRoles = ['admin', 'user'];

// Listado de usuarios para el panel administrador.
function list(req, res) {
  const users = User.findAll();

  console.log(`[USERS] Admin ${req.user.id} listo ${users.length} usuario(s)`);
  res.json(users);
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

    console.log(`[USERS] Admin ${req.user.id} creo usuario ${user.id} (${user.role})`);
    return res.status(201).json(user);
  } catch (error) {
    console.warn(`[USERS] No se pudo crear usuario "${usuario}": ${error.message}`);
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
      console.warn(`[USERS] Admin ${req.user.id} intento editar usuario inexistente ${req.params.id}`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log(`[USERS] Admin ${req.user.id} edito usuario ${user.id} (${user.role})`);
    return res.json(user);
  } catch (error) {
    console.warn(`[USERS] No se pudo editar usuario ${req.params.id}: ${error.message}`);
    return res.status(409).json({ message: 'El usuario ya existe' });
  }
}

// Eliminacion de usuarios administrados.
function remove(req, res) {
  if (Number(req.params.id) === req.user.id) {
    console.warn(`[USERS] Admin ${req.user.id} intento eliminar su propio usuario`);
    return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
  }

  try {
    const result = User.remove(req.params.id);

    if (result.changes === 0) {
      console.warn(`[USERS] Admin ${req.user.id} intento eliminar usuario inexistente ${req.params.id}`);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log(`[USERS] Admin ${req.user.id} elimino usuario ${req.params.id}`);
    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.warn(`[USERS] No se pudo eliminar usuario ${req.params.id}: ${error.message}`);
    return res.status(409).json({ message: 'No se puede eliminar un usuario con perfiles asociados' });
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
};
