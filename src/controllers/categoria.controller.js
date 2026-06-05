const Categoria = require('../models/categoria.model');

function list(req, res) {
  res.json(Categoria.findAll());
}


//CREAR CATEGORIA

function create(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }

  try {
    return res.status(201).json(Categoria.create(nombre));
  } catch (error) {
    return res.status(409).json({ message: 'La categoria ya existe' });
  }
}

//EDITAR CATEGORIA

function update(req, res) {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es obligatorio' });
  }

  try {
    const categoria = Categoria.update(req.params.id, nombre);
    if (!categoria) return res.status(404).json({ message: 'Categoria no encontrada' });
    return res.json(categoria);
  } catch (error) {
    return res.status(409).json({ message: 'La categoria ya existe' });
  }
}

//ELIMINAR CATEGORIA

function remove(req, res) {
  const result = Categoria.remove(req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Categoria no encontrada' });
  }

  return res.status(204).send();
}

module.exports = {
  list,
  create,
  update,
  remove,
};
