const jwt = require('../utils/jwt');

function requireAdmin(req, res, next) {
  // Lectura del token enviado por el panel administrador.
  const authorization = req.headers.authorization || '';
  const [type, token] = authorization.split(' ');

  // Validacion del formato Bearer.
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    // Verificacion del JWT y del rol autorizado.
    const payload = jwt.verify(token);

    if (payload.role !== 'admin') {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }

    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
}

module.exports = {
  requireAdmin,
};
