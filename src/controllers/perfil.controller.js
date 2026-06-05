const PerfilService = require('../services/perfil.service');

// Listado publico para grilla con busqueda por nombre, descripcion o categoria.
async function list(req, res, next) {
  try {
    return res.json(await PerfilService.listPerfiles(req.query));
  } catch (error) {
    return next(error);
  }
}

// Detalle publico para modal.
async function detail(req, res, next) {
  try {
    const result = await PerfilService.getPerfilDetail(req.params.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

// Crear perfil desde el panel administrador.
async function create(req, res, next) {
  try {
    const result = await PerfilService.createPerfil(req.user.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

// Editar perfil desde el panel administrador.
async function update(req, res, next) {
  try {
    const result = await PerfilService.updatePerfil(req.params.id, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

// Eliminar perfil desde el panel administrador.
async function remove(req, res, next) {
  try {
    const result = await PerfilService.deletePerfil(req.params.id);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  list,
  detail,
  create,
  update,
  remove,
};
