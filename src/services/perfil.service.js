const Perfil = require('../models/perfil.model');
const Categoria = require('../models/categoria.model');

// Listado publico de perfiles para la grilla y su busqueda.
async function listPerfiles(query) {
  return Perfil.findPublic({
    search: query.search,
    categoriaId: query.categoria_id,
  });
}

// Detalle publico de perfil para el modal.
async function getPerfilDetail(id) {
  const perfil = await Perfil.findDetail(id);

  if (!perfil) {
    return { status: 404, body: { message: 'Perfil no encontrado' } };
  }

  return { status: 200, body: perfil };
}

async function validatePerfil(data, partial = false) {
  if (!partial && !data.nombre) return 'El nombre es obligatorio';
  if (!partial && !data.categoria_id) return 'La categoria_id es obligatoria';
  if (data.categoria_id && !(await Categoria.findById(data.categoria_id))) return 'La categoria no existe';
  return null;
}

// Creacion protegida de perfiles.
async function createPerfil(adminId, data) {
  const error = await validatePerfil(data);

  if (error) {
    return { status: 400, body: { message: error } };
  }

  const perfil = await Perfil.create({
    ...data,
    creado_por: adminId,
  });

  return { status: 201, body: perfil };
}

// Edicion protegida de perfiles.
async function updatePerfil(id, data) {
  const error = await validatePerfil(data, true);

  if (error) {
    return { status: 400, body: { message: error } };
  }

  const perfil = await Perfil.update(id, data);

  if (!perfil) {
    return { status: 404, body: { message: 'Perfil no encontrado' } };
  }

  return { status: 200, body: perfil };
}

// Eliminacion protegida de perfiles.
async function deletePerfil(id) {
  const result = await Perfil.remove(id);

  if (result.affectedRows === 0) {
    return { status: 404, body: { message: 'Perfil no encontrado' } };
  }

  return { status: 200, body: { message: 'Perfil eliminado correctamente' } };
}

module.exports = {
  listPerfiles,
  getPerfilDetail,
  createPerfil,
  updatePerfil,
  deletePerfil,
};
