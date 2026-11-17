const prisma = require('../config/prisma');
const { httpError } = require('../utils/http');

async function recordContact(request, response, next) {
  try {
    const { productId, shopId, channel, productName } = request.body;
    if (!shopId || !['PHONE', 'WHATSAPP'].includes(channel)) {
      throw httpError(400, 'Shop and contact channel are required');
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw httpError(404, 'Shop not found');

    if (productId) {
      const product = await prisma.product.findFirst({ where: { id: productId, shopId } });
      if (!product) throw httpError(400, 'Product does not belong to this shop');
    }

    await prisma.activity.create({
      data: {
        userId: request.user?.id || null,
        eventType: 'CONTACT_SHOP',
        productId: productId || null,
        shopId,
        metadata: { channel, productName: productName || null }
      }
    });

    return response.status(201).json({ success: true, data: { recorded: true } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { recordContact };
