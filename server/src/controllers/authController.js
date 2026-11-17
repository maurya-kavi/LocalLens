const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { httpError, publicUser } = require('../utils/http');

function tokenFor(user) {
  return jwt.sign({ id: user.id, role: user.role, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function register(request, response, next) {
  try {
    const { name, email, password, role } = request.body;
    if (!name || !email || !password) throw httpError(400, 'Name, email and password are required');
    if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
    const normalizedEmail = email.trim().toLowerCase();
    const requestedRole = role ? String(role).toUpperCase() : 'CUSTOMER';
    if (!['CUSTOMER', 'SELLER'].includes(requestedRole)) throw httpError(400, 'Invalid role');
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw httpError(409, 'Email is already registered');
    const user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail, password: await bcrypt.hash(password, 12), role: requestedRole }
    });
    return response.status(201).json({ success: true, data: { user: publicUser(user), token: tokenFor(user) } });
  } catch (error) { return next(error); }
}

async function login(request, response, next) {
  try {
    const { email, password } = request.body;
    if (!email || !password) throw httpError(400, 'Email and password are required');
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password))) throw httpError(401, 'Invalid email or password');
    return response.json({ success: true, data: { user: publicUser(user), token: tokenFor(user) } });
  } catch (error) { return next(error); }
}

async function me(request, response, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: request.user.id } });
    if (!user) throw httpError(404, 'User not found');
    return response.json({ success: true, data: publicUser(user) });
  } catch (error) { return next(error); }
}

module.exports = { register, login, me };
