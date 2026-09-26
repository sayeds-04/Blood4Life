const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Expect role to be provided via a custom header 'x-role'
    const role = req.headers['x-role'];
    if (!role) {
      return res.status(401).json({ error: 'Missing role header' });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    // Role is authorized, proceed
    next();
  };
};

module.exports = { requireRole };
