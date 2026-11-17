import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const statusStyles = {
  PENDING: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-emerald-50 text-emerald-700',
  REJECTED: 'bg-red-50 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-600'
};

function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  async function loadReservations() {
    try {
      const response = await api.get('/reservations/my');
      setReservations(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load reservations.');
    }
  }

  useEffect(() => { loadReservations(); }, []);

  async function cancelReservation(id) {
    try {
      await api.patch(`/reservations/${id}/status`, { status: 'CANCELLED' });
      await loadReservations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to cancel reservation.');
    }
  }

  return (
    <section className="container-shell py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Your requests</p>
      <h1 className="mt-2 text-4xl font-bold text-slate-950">My reservations</h1>
      <p className="mt-3 text-slate-600">These are requests to shopkeepers, not confirmed purchases or stock guarantees.</p>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
      {reservations.length === 0 && !error ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><h2 className="font-semibold">No reservations yet</h2><p className="mt-2 text-sm text-slate-500">Find something you like in the marketplace and send a request.</p><Link to="/marketplace" className="button-primary mt-5">Browse marketplace</Link></div> : <div className="mt-8 space-y-4">{reservations.map((reservation) => <article key={reservation.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><Link to={`/products/${reservation.productId}`} className="text-lg font-semibold text-slate-950 hover:text-brand-700">{reservation.product?.name}</Link><p className="mt-1 text-sm text-slate-500">{reservation.shop?.shopName} · {new Date(reservation.createdAt).toLocaleDateString()}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[reservation.status] || statusStyles.PENDING}`}>{reservation.status}</span></div>{reservation.message && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">“{reservation.message}”</p>}{reservation.status === 'PENDING' && <button type="button" className="mt-4 text-sm font-semibold text-red-700 hover:underline" onClick={() => cancelReservation(reservation.id)}>Cancel request</button>}</article>)}</div>}
    </section>
  );
}

export default MyReservations;
