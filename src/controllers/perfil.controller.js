const Perfil = require('../models/perfil.model');
const Categoria = require('../models/categoria.model');

function list(req, res) {
  const perfiles = Perfil.findPublic({
    search: req.query.search,
    categoriaId: req.query.categoria_id,
  });

  res.json(perfiles);
}

function detail(req, res) {
  const perfil = Perfil.findDetail(req.params.id);

  if (!perfil) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }

  return res.json(perfil);
}

function validatePerfil(data, partial = false) {
  if (!partial && !data.nombre) return 'El nombre es obligatorio';
  if (!partial && !data.categoria_id) return 'La categoria_id es obligatoria';
  if (data.categoria_id && !Categoria.findById(data.categoria_id)) return 'La categoria no existe';
  return null;
}

// CREAR PERFIL
function create(req, res) {
  const error = validatePerfil(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const perfil = Perfil.create({
    ...req.body,
    creado_por: req.user.id,
  });

  return res.status(201).json(perfil);
}

// EDITAR PERFIL

function update(req, res) {
  const error = validatePerfil(req.body, true);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const perfil = Perfil.update(req.params.id, req.body);

  if (!perfil) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }

  return res.json(perfil);
}

// ELIMINAR PERFIL

function remove(req, res) {
  const result = Perfil.remove(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Perfil no encontrado' });
  }

  return res.status(204).send();
}

module.exports = {
  list,
  detail,
  create,
  update,
  remove,
};
