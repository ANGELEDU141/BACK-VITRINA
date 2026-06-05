const AuthService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    // Login exclusivo para administradores.
    const result = await AuthService.login(req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
};
