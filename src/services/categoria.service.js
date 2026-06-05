const Categoria = require('../models/categoria.model');

// Listado publico de categorias.
async function listCategorias() {
  return Categoria.findAll();
}

// Creacion protegida de categorias.
async function createCategoria(nombre) {
  if (!nombre) {
    return { status: 400, body: { message: 'El nombre es obligatorio' } };
  }

  try {
    return { status: 201, body: await Categoria.create(nombre) };
  } catch (error) {
    return { status: 409, body: { message: 'La categoria ya existe' } };
  }
}

// Edicion protegida de categorias.
async function updateCategoria(id, nombre) {
  if (!nombre) {
    return { status: 400, body: { message: 'El nombre es obligatorio' } };
  }

  try {
    const categoria = await Categoria.update(id, nombre);
    if (!categoria) return { status: 404, body: { message: 'Categoria no encontrada' } };
    return { status: 200, body: categoria };
  } catch (error) {
    return { status: 409, body: { message: 'La categoria ya existe' } };
  }
}

// Eliminacion protegida de categorias.
async function deleteCategoria(id) {
  try {
    const result = await Categoria.remove(id);
    if (result.affectedRows === 0) return { status: 404, body: { message: 'Categoria no encontrada' } };
    return { status: 200, body: { message: 'Categoria eliminada correctamente' } };
  } catch (error) {
    return { status: 409, body: { message: 'No se puede eliminar una categoria con perfiles asociados' } };
  }
}

module.exports = {
  listCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
};
