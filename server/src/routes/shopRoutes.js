const express = require('express');
const { listShops, listOwnShops, getShop, createShop, updateShop, deleteShop } = require('../controllers/shopController');
const { createProduct, listShopProducts } = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.get('/', listShops);
router.get('/mine', authenticate, requireRole('SELLER'), listOwnShops);
router.post('/', authenticate, requireRole('SELLER'), createShop);
router.get('/:id', getShop);
router.put('/:id', authenticate, requireRole('SELLER'), updateShop);
router.delete('/:id', authenticate, requireRole('SELLER'), deleteShop);
router.get('/:shopId/products', authenticate, requireRole('SELLER'), listShopProducts);
router.post('/:shopId/products', authenticate, requireRole('SELLER'), upload.single('image'), createProduct);
module.exports = router;
