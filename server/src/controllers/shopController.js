const prisma = require('../config/prisma');
const { httpError, serialize } = require('../utils/http');

const shopFields = ['shopName', 'description', 'category', 'address', 'city', 'state', 'pincode', 'latitude', 'longitude', 'phone', 'whatsappNumber'];

function shopData(body) {
  const data = {};
  shopFields.forEach((field) => {
    if (body[field] !== undefined) data[field] = ['latitude', 'longitude'].includes(field) ? Number(body[field]) : body[field];
  });
  if (data.latitude !== undefined && (Number.isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) throw httpError(400, 'Invalid latitude');
  if (data.longitude !== undefined && (Number.isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) throw httpError(400, 'Invalid longitude');
  return data;
}

async function listShops(request, response, next) {
  try {
    const { category, city, q } = request.query;
    const where = {
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
      ...(q ? { OR: [{ shopName: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {})
    };
    const shops = await prisma.shop.findMany({ where, include: { products: true }, orderBy: { createdAt: 'desc' } });
    return response.json({ success: true, data: serialize(shops), meta: { total: shops.length } });
  } catch (error) { return next(error); }
}

async function listOwnShops(request, response, next) {
  try {
    const shops = await prisma.shop.findMany({
      where: { ownerId: request.user.id },
      include: { products: true },
      orderBy: { createdAt: 'desc' }
    });
    return response.json({ success: true, data: serialize(shops), meta: { total: shops.length } });
  } catch (error) {
    return next(error);
  }
}

async function getShop(request, response, next) {
  try {
    const shop = await prisma.shop.findUnique({ where: { id: request.params.id }, include: { products: true } });
    if (!shop) throw httpError(404, 'Shop not found');
    return response.json({ success: true, data: serialize(shop) });
  } catch (error) { return next(error); }
}

async function createShop(request, response, next) {
  try {
    const data = shopData(request.body);
    if (!data.shopName || !data.category || data.latitude === undefined || data.longitude === undefined) throw httpError(400, 'Shop name, category and coordinates are required');
    const shop = await prisma.shop.create({ data: { ...data, ownerId: request.user.id } });
    return response.status(201).json({ success: true, data: serialize(shop) });
  } catch (error) { return next(error); }
}

async function updateShop(request, response, next) {
  try {
    const existing = await prisma.shop.findUnique({ where: { id: request.params.id } });
    if (!existing) throw httpError(404, 'Shop not found');
    if (existing.ownerId !== request.user.id) throw httpError(403, 'You do not own this shop');
    const shop = await prisma.shop.update({ where: { id: existing.id }, data: shopData(request.body) });
    return response.json({ success: true, data: serialize(shop) });
  } catch (error) { return next(error); }
}

async function deleteShop(request, response, next) {
  try {
    const existing = await prisma.shop.findUnique({ where: { id: request.params.id } });
    if (!existing) throw httpError(404, 'Shop not found');
    if (existing.ownerId !== request.user.id) throw httpError(403, 'You do not own this shop');
    await prisma.shop.delete({ where: { id: existing.id } });
    return response.json({ success: true, data: { id: existing.id } });
  } catch (error) { return next(error); }
}

module.exports = { listShops, listOwnShops, getShop, createShop, updateShop, deleteShop };
