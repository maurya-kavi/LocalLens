import { useEffect, useState } from 'react';
import api from '../../services/api';

const statusStyles = { PENDING: 'bg-amber-50 text-amber-700', CONFIRMED: 'bg-emerald-50 text-emerald-700', REJECTED: 'bg-red-50 text-red-700', CANCELLED: 'bg-slate-100 text-slate-600' };

function SellerReservations() {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');

  async function loadReservations() {
    try {
      const response = await api.get('/seller/reservations');
      setReservations(response.data.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load reservation requests.');
    }
  }

  useEffect(() => { loadReservations(); }, []);

  async function updateStatus(id, status) {
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      await loadReservations();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update reservation.');
    }
  }

  return <section className="mt-10"><h2 className="text-2xl font-bold text-slate-950">Reservation requests</h2>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{reservations.length === 0 && !error ? <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-8 text-sm text-slate-500">No reservation requests yet.</p> : <div className="mt-4 space-y-3">{reservations.map((reservation) => <article key={reservation.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="font-semibold">{reservation.product?.name}</p><p className="text-sm text-slate-500">{reservation.customer?.name} · {reservation.shop?.shopName} · {new Date(reservation.createdAt).toLocaleDateString()}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[reservation.status]}`}>{reservation.status}</span></div>{reservation.message && <p className="mt-3 text-sm text-slate-600">“{reservation.message}”</p>}{reservation.status === 'PENDING' && <div className="mt-4 flex gap-3"><button type="button" className="button-primary px-4 py-2" onClick={() => updateStatus(reservation.id, 'CONFIRMED')}>Confirm</button><button type="button" className="button-secondary px-4 py-2 text-red-700" onClick={() => updateStatus(reservation.id, 'REJECTED')}>Reject</button></div>}</article>)}</div>}</section>;
}

export default SellerReservations;
