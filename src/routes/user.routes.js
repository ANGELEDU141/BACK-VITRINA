const express = require('express');
const UserController = require('../controllers/user.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

// CRUD de usuarios protegido por JWT de administrador.
router.get('/', requireAdmin, UserController.list);
router.post('/', requireAdmin, UserController.create);
router.put('/:id', requireAdmin, UserController.update);
router.patch('/:id', requireAdmin, UserController.update);
router.delete('/:id', requireAdmin, UserController.remove);

module.exports = router;
