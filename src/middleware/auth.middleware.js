const jwt = require('../utils/jwt');

function requireAdmin(req, res, next) {
  // Lectura del token enviado por el panel administrador.
  const authorization = req.headers.authorization || '';
  const [type, token] = authorization.split(' ');

  // Validacion del formato Bearer.
  if (type !== 'Bearer' || !token) {
    console.warn(`[AUTH] ${req.method} ${req.originalUrl} - token requerido`);
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    // Verificacion del JWT y del rol autorizado.
    const payload = jwt.verify(token);

    if (payload.role !== 'admin') {
      console.warn(`[AUTH] ${req.method} ${req.originalUrl} - permisos insuficientes`);
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }

    req.user = payload;
    return next();
  } catch (error) {
    console.warn(`[AUTH] ${req.method} ${req.originalUrl} - ${error.message}`);
    return res.status(401).json({ message: error.message });
  }
}

module.exports = {
  requireAdmin,
};
