const express = require('express');
const CategoriaController = require('../controllers/categoria.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', CategoriaController.list);
router.post('/', requireAdmin, CategoriaController.create);
router.put('/:id', requireAdmin, CategoriaController.update);
router.delete('/:id', requireAdmin, CategoriaController.remove);

module.exports = router;
