const express = require('express');
const { listSellerReservations } = require('../controllers/reservationController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireRole('SELLER'), listSellerReservations);

module.exports = router;
