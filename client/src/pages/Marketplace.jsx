import { useEffect, useState } from 'react';
import { LocateFixed, Search, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import LocationAutocomplete from '../components/common/LocationAutocomplete';

const categories = ['All', 'Clothing', 'Footwear', 'Mobile & Electronics'];
const initialLocation = { name: '', lat: '', lng: '', manualLat: '', manualLng: '', radius: '5' };

function getManualCoordinates(filters) {
  const hasLatitude = filters.manualLat.trim() !== '';
  const hasLongitude = filters.manualLng.trim() !== '';
  if (!hasLatitude && !hasLongitude) return { hasInput: false, coordinates: null, error: '' };
  if (hasLatitude !== hasLongitude) return { hasInput: true, coordinates: null, error: 'Enter both manual latitude and longitude.' };
  const latitude = Number(filters.manualLat);
  const longitude = Number(filters.manualLng);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return { hasInput: true, coordinates: null, error: 'Latitude must be between -90 and 90.' };
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return { hasInput: true, coordinates: null, error: 'Longitude must be between -180 and 180.' };
  return { hasInput: true, coordinates: { lat: latitude, lng: longitude }, error: '' };
}

function Marketplace() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({ q: searchParams.get('q') || '', category: searchParams.get('category') || '', sort: '', ...initialLocation });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(loadProducts, 250);
    return () => clearTimeout(timer);
  }, [filters.q, filters.category, filters.sort, filters.lat, filters.lng, filters.manualLat, filters.manualLng, filters.radius]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const manual = getManualCoordinates(filters);
      const activeLocation = manual.coordinates || (!manual.hasInput && selectedLocation?.lat !== undefined && selectedLocation?.lng !== undefined ? selectedLocation : null);
      const params = { q: filters.q || undefined, category: filters.category || undefined, sort: filters.sort || undefined };
      if (activeLocation) {
        params.radius = filters.radius;
        params.lat = activeLocation.lat;
        params.lng = activeLocation.lng;
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

  function changeManualCoordinate(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  function changeLocationName(name) {
    setFilters((current) => ({ ...current, name, lat: '', lng: '' }));
    setSelectedLocation(null);
  }

  function selectLocation(location) {
    setFilters((current) => ({ ...current, name: location.name, lat: location.lat, lng: location.lng }));
    setSelectedLocation(location);
  }

  function useBrowserLocation() {
    if (!navigator.geolocation) {
      setError('Location is not supported by this browser. You can enter coordinates manually.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location = { name: 'Current browser location', lat: Number(coords.latitude.toFixed(6)), lng: Number(coords.longitude.toFixed(6)) };
        setFilters((current) => ({ ...current, ...location, manualLat: '', manualLng: '' }));
        setSelectedLocation(location);
      },
      () => setError('We could not access your location. You can enter coordinates manually.')
    );
  }

  const manualCoordinates = getManualCoordinates(filters);
  const activeLocation = manualCoordinates.coordinates || (!manualCoordinates.hasInput && selectedLocation?.lat !== undefined && selectedLocation?.lng !== undefined ? selectedLocation : null);

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
      {locationOpen && <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50 p-5"><div className="grid gap-4 md:grid-cols-2"><LocationAutocomplete label="Search your location (optional)" value={filters.name} selected={selectedLocation} onChange={changeLocationName} onSelect={selectLocation} /><div className="grid gap-4 sm:grid-cols-2"><label className="field-label">Manual latitude<input className="field-input" type="number" step="any" placeholder="-90 to 90" value={filters.manualLat} onChange={(event) => changeManualCoordinate('manualLat', event.target.value)} /></label><label className="field-label">Manual longitude<input className="field-input" type="number" step="any" placeholder="-180 to 180" value={filters.manualLng} onChange={(event) => changeManualCoordinate('manualLng', event.target.value)} /></label></div></div><div className="mt-4 flex flex-wrap items-end gap-3"><label className="field-label w-36">Radius<select className="field-input" value={filters.radius} onChange={(event) => setFilters({ ...filters, radius: event.target.value })}><option value="5">5 km</option><option value="10">10 km</option><option value="15">15 km</option></select></label><button type="button" className="button-secondary" onClick={useBrowserLocation}><LocateFixed size={17} /> Use current location</button></div>{manualCoordinates.error && <p className="mt-3 text-xs text-red-700">{manualCoordinates.error}</p>}{filters.name && !selectedLocation && !manualCoordinates.coordinates && <p className="mt-3 text-xs text-amber-700">Select a suggested place to apply radius filtering.</p>}<p className="mt-3 text-xs text-slate-500">Location is optional. Manual coordinates take priority when both methods are provided.</p></div>}
      <div className="mt-10 flex items-center justify-between"><h2 className="text-xl font-semibold text-slate-950">{meta.total !== undefined ? `${meta.total} products` : 'Available products'}</h2>{activeLocation && <span className="text-sm text-slate-500">Within {filters.radius} km{activeLocation.name ? ` of ${activeLocation.name.split(',')[0]}` : ''}</span>}</div>
      {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
      {loading ? <div className="py-20 text-center text-slate-500">Loading local products…</div> : products.length > 0 ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"><h3 className="font-semibold text-slate-900">No products found</h3><p className="mt-2 text-sm text-slate-500">Try another search, category, or radius.</p></div>}
    </section>
  );
}

export default Marketplace;
