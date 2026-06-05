const express = require('express');
const PerfilController = require('../controllers/perfil.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', PerfilController.list);
router.get('/:id', PerfilController.detail);
router.post('/', requireAdmin, PerfilController.create);
router.put('/:id', requireAdmin, PerfilController.update);
router.patch('/:id', requireAdmin, PerfilController.update);
router.delete('/:id', requireAdmin, PerfilController.remove);

module.exports = router;
