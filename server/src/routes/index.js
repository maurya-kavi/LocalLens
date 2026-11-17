const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const shopRoutes = require('./shopRoutes');
const productRoutes = require('./productRoutes');
const reservationRoutes = require('./reservationRoutes');
const sellerReservationRoutes = require('./sellerReservationRoutes');
const activityRoutes = require('./activityRoutes');

const router = express.Router();

router.use(healthRoutes);
router.use('/auth', authRoutes);
router.use('/shops', shopRoutes);
router.use('/products', productRoutes);
router.use('/reservations', reservationRoutes);
router.use('/seller/reservations', sellerReservationRoutes);
router.use('/activities', activityRoutes);

module.exports = router;
