const express = require('express');
const { listProducts, getProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authenticate, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();
router.get('/', listProducts);
router.get('/:id', getProduct);
router.put('/:id', authenticate, requireRole('SELLER'), upload.single('image'), updateProduct);
router.delete('/:id', authenticate, requireRole('SELLER'), deleteProduct);
module.exports = router;
