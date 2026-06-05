const User = require('../models/user.model');
const { hashPassword } = require('../utils/password');

const validRoles = ['admin', 'user'];

// Listado administrativo de usuarios.
async function listUsers(adminId) {
  const users = await User.findAll();
  console.log(`[USERS] Admin ${adminId} listo ${users.length} usuario(s)`);
  return users;
}

// Creacion administrativa de usuarios con rol controlado.
async function createUser(adminId, data) {
  const { usuario, password, role = 'user' } = data;

  if (!usuario || !password) {
    return { status: 400, body: { message: 'Usuario y password son obligatorios' } };
  }

  if (!validRoles.includes(role)) {
    return { status: 400, body: { message: 'Role invalido' } };
  }

  try {
    const user = await User.create({
      usuario,
      password: hashPassword(password),
      role,
    });

    console.log(`[USERS] Admin ${adminId} creo usuario ${user.id} (${user.role})`);
    return { status: 201, body: user };
  } catch (error) {
    console.warn(`[USERS] No se pudo crear usuario "${usuario}": ${error.message}`);
    return { status: 409, body: { message: 'El usuario ya existe' } };
  }
}

// Edicion administrativa de usuario, password o rol.
async function updateUser(adminId, id, data) {
  const { usuario, password, role } = data;

  if (role && !validRoles.includes(role)) {
    return { status: 400, body: { message: 'Role invalido' } };
  }

  try {
    const user = await User.update(id, {
      usuario,
      password: password ? hashPassword(password) : undefined,
      role,
    });

    if (!user) {
      console.warn(`[USERS] Admin ${adminId} intento editar usuario inexistente ${id}`);
      return { status: 404, body: { message: 'Usuario no encontrado' } };
    }

    console.log(`[USERS] Admin ${adminId} edito usuario ${user.id} (${user.role})`);
    return { status: 200, body: user };
  } catch (error) {
    console.warn(`[USERS] No se pudo editar usuario ${id}: ${error.message}`);
    return { status: 409, body: { message: 'El usuario ya existe' } };
  }
}

// Eliminacion administrativa de usuarios.
async function deleteUser(adminId, id) {
  if (Number(id) === adminId) {
    console.warn(`[USERS] Admin ${adminId} intento eliminar su propio usuario`);
    return { status: 400, body: { message: 'No puedes eliminar tu propio usuario' } };
  }

  try {
    const result = await User.remove(id);

    if (result.affectedRows === 0) {
      console.warn(`[USERS] Admin ${adminId} intento eliminar usuario inexistente ${id}`);
      return { status: 404, body: { message: 'Usuario no encontrado' } };
    }

    console.log(`[USERS] Admin ${adminId} elimino usuario ${id}`);
    return { status: 200, body: { message: 'Usuario eliminado correctamente' } };
  } catch (error) {
    console.warn(`[USERS] No se pudo eliminar usuario ${id}: ${error.message}`);
    return {
      status: 409,
      body: { message: 'No se puede eliminar un usuario con perfiles asociados' },
    };
  }
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
