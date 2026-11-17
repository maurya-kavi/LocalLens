import { useEffect, useState } from 'react';
import { LocateFixed, Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';

const categories = ['All', 'Clothing', 'Footwear', 'Mobile & Electronics'];
const initialLocation = { lat: '', lng: '', radius: '5' };

function Marketplace() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ q: searchParams.get('q') || '', category: searchParams.get('category') || '', sort: '', ...initialLocation });
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);
    return () => clearTimeout(timer);
  }, [filters.q, filters.category, filters.sort, filters.lat, filters.lng, filters.radius]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const params = { q: filters.q || undefined, category: filters.category || undefined, sort: filters.sort || undefined, radius: filters.radius || undefined };
      if (filters.lat && filters.lng) {
        params.lat = filters.lat;
        params.lng = filters.lng;
      }
      const response = await api.get('/products', { params });
      const payload = response.data;
      setProducts(payload.data || payload.products || []);
      setMeta(payload.meta || {});
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load products right now.');
    } finally {
      setLoading(false);
    }
  }

  function useBrowserLocation() {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser. You can enter coordinates manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setFilters({ ...filters, lat: coords.latitude.toFixed(6), lng: coords.longitude.toFixed(6) }),
      () => setError('We could not access your location. You can enter coordinates manually.')
    );
  }

  return (
    <section className="container-shell py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Local marketplace</p><h1 className="mt-2 text-4xl font-bold text-slate-950">Find products near you</h1><p className="mt-3 max-w-2xl text-slate-600">Compare local listings and contact the shop before you visit.</p></div>
        <button type="button" className="button-secondary" onClick={() => setLocationOpen(!locationOpen)}><SlidersHorizontal size={17} /> Location & filters</button>
      </div>
      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 focus-within:ring-2 focus-within:ring-brand-100"><Search size={19} className="text-slate-400" /><span className="sr-only">Search products</span><input className="w-full outline-none" placeholder="Search products by name or description" value={filters.q} onChange={(event) => setFilters({ ...filters, q: event.target.value })} /></label>
        <select className="field-input md:w-56" value={filters.sort} onChange={(event) => setFilters({ ...filters, sort: event.target.value })}><option value="">Sort by</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">{categories.map((category) => <button key={category} type="button" className={`rounded-full px-4 py-2 text-sm font-medium ${filters.category === (category === 'All' ? '' : category) ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-brand-300'}`} onClick={() => setFilters({ ...filters, category: category === 'All' ? '' : category })}>{category}</button>)}</div>
      {locationOpen && <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-5"><div className="flex flex-col gap-4 md:flex-row md:items-end"><label className="field-label flex-1">Latitude<input className="field-input" type="number" step="any" placeholder="e.g. 22.8046" value={filters.lat} onChange={(event) => setFilters({ ...filters, lat: event.target.value })} /></label><label className="field-label flex-1">Longitude<input className="field-input" type="number" step="any" placeholder="e.g. 86.2029" value={filters.lng} onChange={(event) => setFilters({ ...filters, lng: event.target.value })} /></label><label className="field-label md:w-36">Radius<select className="field-input" value={filters.radius} onChange={(event) => setFilters({ ...filters, radius: event.target.value })}><option value="5">5 km</option><option value="10">10 km</option><option value="15">15 km</option></select></label><button type="button" className="button-secondary" onClick={useBrowserLocation}><LocateFixed size={17} /> Use my location</button></div><p className="mt-3 text-xs text-slate-500">Radius filtering only includes shops with valid coordinates.</p></div>}
      <div className="mt-10 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-950">{meta.total !== undefined ? `${meta.total} products` : 'Available products'}</h2>{filters.lat && filters.lng && <span className="text-sm text-slate-500">Within {filters.radius} km</span>}</div>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
      {loading ? <div className="py-20 text-center text-slate-500">Loading local products…</div> : products.length > 0 ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><h3 className="font-semibold text-slate-900">No products found</h3><p className="mt-2 text-sm text-slate-500">Try another search, category, or radius.</p></div>}
    </section>
  );
}

export default Marketplace;
