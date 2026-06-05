const CategoriaService = require('../services/categoria.service');

// Listado publico de categorias.
async function list(req, res, next) {
  try {
    return res.json(await CategoriaService.listCategorias());
  } catch (error) {
    return next(error);
  }
}

// Crear categoria desde el panel administrador.
async function create(req, res, next) {
  try {
    const result = await CategoriaService.createCategoria(req.body.nombre);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

// Editar categoria desde el panel administrador.
async function update(req, res, next) {
  try {
    const result = await CategoriaService.updateCategoria(req.params.id, req.body.nombre);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

// Eliminar categoria desde el panel administrador.
async function remove(req, res, next) {
  try {
    const result = await CategoriaService.deleteCategoria(req.params.id);
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
