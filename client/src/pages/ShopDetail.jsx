import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, Tag } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ContactButtons from '../components/common/ContactButtons';
import api from '../services/api';

function ShopDetail() {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/shops/${id}`)
      .then((response) => setShop(response.data.data))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Shop not found.'));
  }, [id]);

  if (error) return <div className="container-shell py-20 text-center text-red-700">{error}</div>;
  if (!shop) return <div className="container-shell py-20 text-center text-slate-500">Loading shop…</div>;

  return (
    <section className="container-shell py-10">
      <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700"><ArrowLeft size={16} /> Back to marketplace</Link>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">{shop.category}</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-950">{shop.shopName}</h1>
        <p className="mt-4 flex gap-2 text-slate-600"><MapPin size={18} />{shop.address}, {shop.city}, {shop.state} {shop.pincode}</p>
        {shop.description && <p className="mt-4 max-w-2xl text-slate-600">{shop.description}</p>}
        <div className="mt-6"><ContactButtons shop={shop} /></div>
      </div>
      <h2 className="mt-10 text-2xl font-bold">Listed products</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(shop.products || []).map((product) => <Link key={product.id} to={`/products/${product.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:border-brand-300"><div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-xl object-cover" /> : <Tag className="text-slate-300" />}</div><h3 className="mt-4 font-semibold">{product.name}</h3><p className="mt-2 text-lg font-bold">₹{Number(product.price).toLocaleString('en-IN')}</p></Link>)}</div>
    </section>
  );
}

export default ShopDetail;
