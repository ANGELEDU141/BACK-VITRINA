const UserService = require('../services/user.service');

// Listado de usuarios para el panel administrador.
async function list(req, res, next) {
  try {
    const users = await UserService.listUsers(req.user.id);
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

// Creacion de usuarios con rol admin o user.
async function create(req, res, next) {
  try {
    const result = await UserService.createUser(req.user.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

// Actualizacion parcial de usuario, password y rol.
async function update(req, res, next) {
  try {
    const result = await UserService.updateUser(req.user.id, req.params.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

// Eliminacion de usuarios administrados.
async function remove(req, res, next) {
  try {
    const result = await UserService.deleteUser(req.user.id, req.params.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  create,
  update,
  remove,
};
