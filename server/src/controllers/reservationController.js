const prisma = require('../config/prisma');
const { httpError, serialize } = require('../utils/http');

const reservationInclude = {
  product: true,
  shop: true,
  customer: { select: { id: true, name: true, email: true } }
};

async function createReservation(request, response, next) {
  try {
    const { productId, message } = request.body;
    if (!productId) throw httpError(400, 'Product is required');

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true }
    });
    if (!product) throw httpError(404, 'Product not found');

    const reservation = await prisma.reservation.create({
      data: {
        customerId: request.user.id,
        productId: product.id,
        shopId: product.shopId,
        message: typeof message === 'string' && message.trim() ? message.trim() : null,
        status: 'PENDING'
      },
      include: reservationInclude
    });

    await prisma.activity.create({
      data: {
        userId: request.user.id,
        eventType: 'RESERVATION',
        productId: product.id,
        shopId: product.shopId,
        metadata: { reservationId: reservation.id, status: 'PENDING' }
      }
    });

    return response.status(201).json({ success: true, data: serialize(reservation) });
  } catch (error) {
    return next(error);
  }
}

async function listMyReservations(request, response, next) {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { customerId: request.user.id },
      include: reservationInclude,
      orderBy: { createdAt: 'desc' }
    });
    return response.json({ success: true, data: serialize(reservations), meta: { total: reservations.length } });
  } catch (error) {
    return next(error);
  }
}

async function getReservation(request, response, next) {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: request.params.id },
      include: reservationInclude
    });
    if (!reservation) throw httpError(404, 'Reservation not found');

    const canView = reservation.customerId === request.user.id
      || (request.user.role === 'SELLER' && reservation.shop.ownerId === request.user.id);
    if (!canView) throw httpError(403, 'You do not have access to this reservation');

    return response.json({ success: true, data: serialize(reservation) });
  } catch (error) {
    return next(error);
  }
}

async function listSellerReservations(request, response, next) {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { shop: { ownerId: request.user.id } },
      include: reservationInclude,
      orderBy: { createdAt: 'desc' }
    });
    return response.json({ success: true, data: serialize(reservations), meta: { total: reservations.length } });
  } catch (error) {
    return next(error);
  }
}

async function updateReservationStatus(request, response, next) {
  try {
    const { status } = request.body;
    const allowedStatuses = ['CONFIRMED', 'REJECTED', 'CANCELLED'];
    if (!allowedStatuses.includes(status)) throw httpError(400, 'Invalid reservation status');

    const reservation = await prisma.reservation.findUnique({
      where: { id: request.params.id },
      include: { shop: true }
    });
    if (!reservation) throw httpError(404, 'Reservation not found');
    if (reservation.status !== 'PENDING') throw httpError(409, 'Only pending reservations can be updated');

    if (request.user.role === 'SELLER') {
      if (reservation.shop.ownerId !== request.user.id) throw httpError(403, 'You do not manage this reservation');
      if (!['CONFIRMED', 'REJECTED'].includes(status)) throw httpError(400, 'Sellers can only confirm or reject reservations');
    } else if (request.user.role === 'CUSTOMER') {
      if (reservation.customerId !== request.user.id) throw httpError(403, 'You do not own this reservation');
      if (status !== 'CANCELLED') throw httpError(400, 'Customers can only cancel pending reservations');
    } else {
      throw httpError(403, 'Insufficient permissions');
    }

    const updated = await prisma.reservation.update({
      where: { id: reservation.id },
      data: { status },
      include: reservationInclude
    });
    return response.json({ success: true, data: serialize(updated) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createReservation,
  listMyReservations,
  getReservation,
  listSellerReservations,
  updateReservationStatus
};
