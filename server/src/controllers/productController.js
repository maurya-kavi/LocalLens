const prisma = require('../config/prisma');
const { httpError, serialize } = require('../utils/http');
const { distanceKm } = require('../utils/geo');
const { uploadImage, deleteImage } = require('../services/cloudinary');

const productFields = ['name', 'description', 'category', 'price'];

function productData(body) {
  const data = {};
  productFields.forEach((field) => {
    if (body[field] !== undefined) data[field] = field === 'price' ? Number(body[field]) : body[field];
  });
  if (data.price !== undefined && (!Number.isFinite(data.price) || data.price < 0)) throw httpError(400, 'Invalid price');
  return data;
}

async function ownerShop(shopId, userId) {
  const shop = await prisma.shop.findUnique({ where: { id: shopId } });
  if (!shop) throw httpError(404, 'Shop not found');
  if (shop.ownerId !== userId) throw httpError(403, 'You do not own this shop');
  return shop;
}

async function imageUpdate(file, oldUrl) {
  if (!file) return {};
  const result = await uploadImage(file);
  if (oldUrl) {
    const match = oldUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./?]+$/);
    if (match) await deleteImage(match[1]);
  }
  return { imageUrl: result.secure_url };
}

async function createProduct(request, response, next) {
  try {
    await ownerShop(request.params.shopId, request.user.id);
    const data = productData(request.body);
    if (!data.name || !data.category || data.price === undefined) throw httpError(400, 'Name, category and price are required');
    Object.assign(data, await imageUpdate(request.file));
    const product = await prisma.product.create({ data: { ...data, shopId: request.params.shopId } });
    return response.status(201).json({ success: true, data: serialize(product) });
  } catch (error) { return next(error); }
}

async function listShopProducts(request, response, next) {
  try {
    await ownerShop(request.params.shopId, request.user.id);
    const products = await prisma.product.findMany({ where: { shopId: request.params.shopId }, orderBy: { createdAt: 'desc' } });
    return response.json({ success: true, data: serialize(products), meta: { total: products.length } });
  } catch (error) { return next(error); }
}

async function updateProduct(request, response, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: request.params.id } });
    if (!product) throw httpError(404, 'Product not found');
    await ownerShop(product.shopId, request.user.id);
    const data = productData(request.body);
    Object.assign(data, await imageUpdate(request.file, product.imageUrl));
    const updated = await prisma.product.update({ where: { id: product.id }, data });
    return response.json({ success: true, data: serialize(updated) });
  } catch (error) { return next(error); }
}

async function deleteProduct(request, response, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: request.params.id } });
    if (!product) throw httpError(404, 'Product not found');
    await ownerShop(product.shopId, request.user.id);
    if (product.imageUrl) {
      const match = product.imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./?]+$/);
      if (match) await deleteImage(match[1]);
    }
    await prisma.product.delete({ where: { id: product.id } });
    return response.json({ success: true, data: { id: product.id } });
  } catch (error) { return next(error); }
}

async function listProducts(request, response, next) {
  try {
    const { q, search, category, sort = 'newest', lat, lng, radius } = request.query;
    const page = Math.max(1, Number(request.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.query.limit) || 20));
    const query = String(q || search || '').trim().replace(/\s+/g, ' ');
    const searchTerms = [...new Set(query.toLocaleLowerCase().split(' ').filter((term) => term.length >= 2))].slice(0, 8);
    const where = {
      ...(category ? { category: { equals: category, mode: 'insensitive' } } : {}),
      ...(searchTerms.length ? {
        AND: searchTerms.map((term) => ({
          OR: [
            { name: { contains: term, mode: 'insensitive' } },
            { description: { contains: term, mode: 'insensitive' } },
            { category: { contains: term, mode: 'insensitive' } },
            { shop: { shopName: { contains: term, mode: 'insensitive' } } },
            { shop: { city: { contains: term, mode: 'insensitive' } } },
            { shop: { locationName: { contains: term, mode: 'insensitive' } } }
          ]
        }))
      } : {})
    };
    let products = await prisma.product.findMany({ where, include: { shop: true } });
    const hasLatitude = lat !== undefined && lat !== '';
    const hasLongitude = lng !== undefined && lng !== '';
    if (hasLatitude !== hasLongitude) throw httpError(400, 'Latitude and longitude must be provided together');
    const hasLocation = hasLatitude && hasLongitude;
    const latitude = Number(lat); const longitude = Number(lng); const maxRadius = Number(radius);
    if (hasLocation && (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(maxRadius) || maxRadius < 0)) throw httpError(400, 'Invalid location or radius');
    if (hasLocation) {
      products = products.filter((product) => {
        if (product.shop.latitude === null || product.shop.longitude === null) return false;
        const shopLatitude = Number(product.shop.latitude);
        const shopLongitude = Number(product.shop.longitude);
        return Number.isFinite(shopLatitude) && shopLatitude >= -90 && shopLatitude <= 90
          && Number.isFinite(shopLongitude) && shopLongitude >= -180 && shopLongitude <= 180;
      });
    }
    products = products.map((product) => ({ ...product, distanceKm: hasLocation ? distanceKm(latitude, longitude, Number(product.shop.latitude), Number(product.shop.longitude)) : null }));
    if (hasLocation) products = products.filter((product) => product.distanceKm <= maxRadius);
    if (sort === 'price_asc') products.sort((a, b) => Number(a.price) - Number(b.price));
    else if (sort === 'price_desc') products.sort((a, b) => Number(b.price) - Number(a.price));
    else if (sort === 'distance' && hasLocation) products.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (searchTerms.length) {
      products.sort((a, b) => searchRelevance(b, searchTerms) - searchRelevance(a, searchTerms)
        || new Date(b.createdAt) - new Date(a.createdAt));
    } else products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = products.length;
    products = products.slice((page - 1) * limit, page * limit);
    return response.json({ success: true, data: serialize(products), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
}

function searchRelevance(product, terms) {
  const name = product.name.toLocaleLowerCase();
  const description = (product.description || '').toLocaleLowerCase();
  const category = product.category.toLocaleLowerCase();
  const shopName = (product.shop?.shopName || '').toLocaleLowerCase();
  const shopLocation = `${product.shop?.city || ''} ${product.shop?.locationName || ''}`.toLocaleLowerCase();
  return terms.reduce((score, term) => {
    if (name === term) return score + 100;
    if (name.startsWith(term)) return score + 60;
    if (name.includes(term)) return score + 40;
    if (description.includes(term)) return score + 20;
    if (category.includes(term)) return score + 15;
    if (shopName.includes(term)) return score + 10;
    if (shopLocation.includes(term)) return score + 5;
    return score;
  }, 0);
}

async function getProduct(request, response, next) {
  try {
    const product = await prisma.product.findUnique({ where: { id: request.params.id }, include: { shop: true } });
    if (!product) throw httpError(404, 'Product not found');
    return response.json({ success: true, data: serialize(product) });
  } catch (error) { return next(error); }
}

module.exports = { createProduct, listShopProducts, updateProduct, deleteProduct, listProducts, getProduct };
