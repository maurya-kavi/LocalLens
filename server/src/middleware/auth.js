const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const { httpError } = require('../utils/http');

function authenticate(request, response, next) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(httpError(401, 'Authentication required'));
  try {
    request.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return next(httpError(401, 'Invalid or expired token'));
  }
}

function optionalAuthenticate(request, response, next) {
  const header = request.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      request.user = jwt.verify(token, jwtSecret);
    } catch (error) {
      return next(httpError(401, 'Invalid or expired token'));
    }
  }
  return next();
}

function requireRole(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) return next(httpError(403, 'Insufficient permissions'));
    return next();
  };
}

module.exports = { authenticate, optionalAuthenticate, requireRole };
