import { MessageCircle, Phone } from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api';

function normalizedWhatsAppNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 10 ? `91${digits}` : digits;
}

function ContactButtons({ shop, product }) {
  const [error, setError] = useState('');
  const message = `Hi, I found ${product?.name || 'a product'} on LocalLens. Is it currently available?`;

  async function record(channel) {
    setError('');
    try {
      await api.post('/activities/contact', {
        channel,
        productId: product?.id,
        productName: product?.name,
        shopId: shop.id
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Contact activity could not be recorded.');
    }
  }

  async function callShop() {
    await record('PHONE');
    window.location.href = `tel:${shop.phone}`;
  }

  async function openWhatsApp() {
    await record('WHATSAPP');
    const number = normalizedWhatsAppNumber(shop.whatsappNumber);
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }

  const whatsappNumber = normalizedWhatsAppNumber(shop.whatsappNumber);
  if (!shop.phone && !whatsappNumber) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {shop.phone && <button type="button" className="button-secondary" onClick={callShop}><Phone size={16} /> Call shop</button>}
        {whatsappNumber && <button type="button" className="button-secondary text-emerald-700" onClick={openWhatsApp}><MessageCircle size={16} /> WhatsApp</button>}
      </div>
      {error && <p className="mt-2 text-xs text-amber-700">{error}</p>}
    </div>
  );
}

export default ContactButtons;
