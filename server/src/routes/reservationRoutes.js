const express = require('express');
const {
  createReservation,
  listMyReservations,
  getReservation,
  listSellerReservations,
  updateReservationStatus
} = require('../controllers/reservationController');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, requireRole('CUSTOMER'), createReservation);
router.get('/my', authenticate, requireRole('CUSTOMER'), listMyReservations);
router.get('/seller', authenticate, requireRole('SELLER'), listSellerReservations);
router.get('/:id', authenticate, getReservation);
router.patch('/:id/status', authenticate, updateReservationStatus);

module.exports = router;
