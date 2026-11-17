import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Tag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ContactButtons from '../components/common/ContactButtons';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');
  const [reservationMessage, setReservationMessage] = useState('');
  const [reservationState, setReservationState] = useState('idle');
  const [reservationError, setReservationError] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((response) => setProduct(response.data.data || response.data.product))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Product not found.'));
  }, [id]);

  if (error) return <div className="container-shell py-20 text-center"><p className="text-red-700">{error}</p><Link to="/marketplace" className="mt-4 inline-block font-semibold text-brand-700">Back to marketplace</Link></div>;
  if (!product) return <div className="container-shell py-20 text-center text-slate-500">Loading product…</div>;

  async function reserveProduct(event) {
    event.preventDefault();
    setReservationState('submitting');
    setReservationError('');
    try {
      await api.post('/reservations', { productId: product.id, message: reservationMessage });
      setReservationState('submitted');
    } catch (requestError) {
      setReservationError(requestError.response?.data?.message || 'Unable to send reservation request.');
      setReservationState('idle');
    }
  }

  return <section className="container-shell py-10"><Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"><ArrowLeft size={16} /> Back to marketplace</Link><div className="mt-8 grid gap-10 lg:grid-cols-2"><div className="flex aspect-square items-center justify-center overflow-hidden rounded-3xl bg-slate-100">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <Tag size={64} className="text-slate-300" />}</div><div><p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{product.category}</p><h1 className="mt-3 text-4xl font-bold text-slate-950">{product.name}</h1><p className="mt-5 text-3xl font-bold text-slate-950">₹{Number(product.price).toLocaleString('en-IN')}</p><p className="mt-6 leading-7 text-slate-600">{product.description || 'No description has been added for this listing.'}</p><div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5"><Link to={`/shops/${product.shop?.id}`} className="font-semibold text-slate-900 hover:text-brand-700">{product.shop?.shopName}</Link><p className="mt-2 flex gap-2 text-sm text-slate-600"><MapPin size={16} />{product.shop?.address}, {product.shop?.city}, {product.shop?.state}</p>{product.distanceKm !== null && product.distanceKm !== undefined && <p className="mt-2 text-sm text-slate-500">{product.distanceKm} km away</p>}<div className="mt-4"><ContactButtons shop={product.shop} product={product} /></div></div>{user?.role === 'CUSTOMER' && <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50 p-5"><h2 className="font-semibold text-slate-900">Request a reservation</h2>{reservationState === 'submitted' ? <p className="mt-3 text-sm text-emerald-700">Request sent. <Link to="/reservations" className="font-semibold underline">View your reservations</Link>.</p> : <form onSubmit={reserveProduct}><label className="field-label mt-4">Message (optional)<textarea className="field-input" rows="3" placeholder="Ask the shopkeeper anything..." value={reservationMessage} onChange={(event) => setReservationMessage(event.target.value)} /></label>{reservationError && <p className="mt-3 text-sm text-red-700">{reservationError}</p>}<button className="button-primary mt-4" disabled={reservationState === 'submitting'}>{reservationState === 'submitting' ? 'Sending…' : 'Reserve this product'}</button></form>}</div>}{!user && <p className="mt-6 text-sm text-slate-500"><Link to="/login" className="font-semibold text-brand-700">Sign in</Link> as a customer to request a reservation.</p>}<p className="mt-6 text-xs text-slate-500">Listings are for discovery only. A reservation is a request, not a confirmed purchase or stock guarantee.</p></div></div></section>;
}

export default ProductDetail;
