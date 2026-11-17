import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import LocationAutocomplete from '../components/common/LocationAutocomplete';
import SellerReservations from '../components/common/SellerReservations';
import api from '../services/api';

const emptyShop = { shopName: '', description: '', category: 'Clothing', address: '', city: '', state: '', pincode: '', phone: '', whatsappNumber: '', manualLatitude: '', manualLongitude: '' };
const emptyProduct = { name: '', description: '', category: 'Clothing', price: '', shopId: '' };

function SellerDashboard() {
  const [shops, setShops] = useState([]);
  const [shop, setShop] = useState(emptyShop);
  const [shopLocation, setShopLocation] = useState({ name: '', lat: null, lng: null });
  const [editingShopId, setEditingShopId] = useState(null);
  const [product, setProduct] = useState(emptyProduct);
  const [image, setImage] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadShops(); }, []);

  async function loadShops() {
    try {
      const response = await api.get('/shops/mine');
      const data = response.data.data || [];
      setShops(data);
      if (data[0]) setProduct((current) => ({ ...current, shopId: current.shopId || data[0].id }));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your shops.');
    }
  }

  async function saveShop(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    const hasManualLatitude = shop.manualLatitude.trim() !== '';
    const hasManualLongitude = shop.manualLongitude.trim() !== '';
    if (hasManualLatitude !== hasManualLongitude) {
      setError('Enter both manual latitude and longitude.');
      return;
    }
    let latitude = null;
    let longitude = null;
    if (hasManualLatitude) {
      latitude = Number(shop.manualLatitude);
      longitude = Number(shop.manualLongitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        setError('Latitude must be between -90 and 90.');
        return;
      }
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        setError('Longitude must be between -180 and 180.');
        return;
      }
    } else if (shopLocation.lat !== null && shopLocation.lng !== null) {
      latitude = Number(shopLocation.lat);
      longitude = Number(shopLocation.lng);
    }
    try {
      const { manualLatitude, manualLongitude, ...shopFields } = shop;
      const payload = { ...shopFields, locationName: shopLocation.name || null, latitude, longitude };
      if (editingShopId) await api.put(`/shops/${editingShopId}`, payload);
      else await api.post('/shops', payload);
      setShop(emptyShop);
      setShopLocation({ name: '', lat: null, lng: null });
      setEditingShopId(null);
      setMessage(editingShopId ? 'Shop profile updated.' : 'Shop profile created.');
      await loadShops();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create shop.');
    }
  }

  function changeShopLocation(name) {
    setShopLocation({ name, lat: null, lng: null });
  }

  function selectShopLocation(location) {
    setShopLocation(location);
  }

  function startEditShop(item) {
    setEditingShopId(item.id);
    setShop({
      shopName: item.shopName,
      description: item.description || '',
      category: item.category,
      address: item.address,
      city: item.city,
      state: item.state,
      pincode: item.pincode,
      phone: item.phone,
      whatsappNumber: item.whatsappNumber || '',
      manualLatitude: '',
      manualLongitude: ''
    });
    setShopLocation({
      name: item.locationName || `${item.address}, ${item.city}, ${item.state}`,
      lat: item.latitude === null ? null : Number(item.latitude),
      lng: item.longitude === null ? null : Number(item.longitude)
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelShopEdit() {
    setEditingShopId(null);
    setShop(emptyShop);
    setShopLocation({ name: '', lat: null, lng: null });
  }

  async function saveProduct(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    try {
      const data = new FormData();
      Object.entries(product).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('image', image);
      if (editingProductId) {
        await api.put(`/products/${editingProductId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Product listing updated.');
      } else {
        await api.post(`/shops/${product.shopId}/products`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
        setMessage('Product listing created.');
      }
      cancelEdit();
      await loadShops();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save product listing.');
    }
  }

  async function removeProduct(id) {
    if (!window.confirm('Remove this product listing?')) return;
    setMessage('');
    setError('');
    try {
      await api.delete(`/products/${id}`);
      setMessage('Product listing removed.');
      await loadShops();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove product listing.');
    }
  }

  function startEdit(item, shopId) {
    setEditingProductId(item.id);
    setProduct({ name: item.name, description: item.description || '', category: item.category, price: item.price, shopId });
    setImage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingProductId(null);
    setProduct({ ...emptyProduct, shopId: shops[0]?.id || '' });
    setImage(null);
  }

  return (
    <section className="container-shell py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">Seller workspace</p>
      <h1 className="mt-2 text-4xl font-bold text-slate-950">Manage your local listings</h1>
      <p className="mt-3 text-slate-600">Share product information for discovery. Listings do not guarantee current availability.</p>
      {message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <form onSubmit={saveShop} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">{editingShopId ? 'Edit shop profile' : 'Create a shop profile'}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              ['shopName', 'Shop name'], ['category', 'Category'], ['address', 'Address'], ['city', 'City'],
              ['state', 'State'], ['pincode', 'Pincode'], ['phone', 'Phone'], ['whatsappNumber', 'WhatsApp number']
            ].map(([key, label]) => (
              <label key={key} className="field-label">{label}
                <input className="field-input" required={key !== 'whatsappNumber'} type={['latitude', 'longitude'].includes(key) ? 'number' : 'text'} step={['latitude', 'longitude'].includes(key) ? 'any' : undefined} value={shop[key]} onChange={(event) => setShop({ ...shop, [key]: event.target.value })} />
              </label>
            ))}
            <div className="sm:col-span-2"><LocationAutocomplete label="Shop location (optional)" value={shopLocation.name} selected={shopLocation.lat !== null && shopLocation.lng !== null ? shopLocation : null} onChange={changeShopLocation} onSelect={selectShopLocation} /></div>
            <label className="field-label">Manual latitude<input className="field-input" type="number" step="any" placeholder="-90 to 90" value={shop.manualLatitude} onChange={(event) => setShop({ ...shop, manualLatitude: event.target.value })} /></label>
            <label className="field-label">Manual longitude<input className="field-input" type="number" step="any" placeholder="-180 to 180" value={shop.manualLongitude} onChange={(event) => setShop({ ...shop, manualLongitude: event.target.value })} /></label>
            <label className="field-label sm:col-span-2">Description
              <textarea className="field-input" rows="3" value={shop.description} onChange={(event) => setShop({ ...shop, description: event.target.value })} />
            </label>
          </div>
          <div className="mt-5 flex gap-3"><button className="button-primary flex-1">{editingShopId ? 'Save shop changes' : 'Create shop'}</button>{editingShopId && <button type="button" className="button-secondary" onClick={cancelShopEdit}>Cancel</button>}</div>
        </form>

        <div className="space-y-8">
          <form onSubmit={saveProduct} className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold">{editingProductId ? 'Edit product listing' : 'Add a product listing'}</h2>
            {shops.length === 0 ? <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Create a shop profile before adding products.</p> : (
              <div className="mt-5 space-y-4">
                <label className="field-label">Shop
                  <select className="field-input" required value={product.shopId} onChange={(event) => setProduct({ ...product, shopId: event.target.value })}>{shops.map((item) => <option key={item.id} value={item.id}>{item.shopName}</option>)}</select>
                </label>
                <label className="field-label">Product name<input className="field-input" required value={product.name} onChange={(event) => setProduct({ ...product, name: event.target.value })} /></label>
                <label className="field-label">Category<input className="field-input" required value={product.category} onChange={(event) => setProduct({ ...product, category: event.target.value })} /></label>
                <label className="field-label">Price<input className="field-input" required min="0.01" step="0.01" type="number" value={product.price} onChange={(event) => setProduct({ ...product, price: event.target.value })} /></label>
                <label className="field-label">Description<textarea className="field-input" rows="3" value={product.description} onChange={(event) => setProduct({ ...product, description: event.target.value })} /></label>
                <label className="field-label">{editingProductId ? 'Replace image (optional)' : 'Product image'}<input className="field-input" type="file" accept="image/*" onChange={(event) => setImage(event.target.files[0])} /></label>
                <div className="flex gap-3"><button className="button-primary flex-1">{editingProductId ? 'Save changes' : 'Publish listing'}</button>{editingProductId && <button type="button" className="button-secondary" onClick={cancelEdit}>Cancel</button>}</div>
              </div>
            )}
          </form>
          {shops.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{item.shopName}</h2><button type="button" className="button-secondary px-3 py-2" onClick={() => startEditShop(item)}><Pencil size={15} /> Edit shop</button></div>
              <div className="mt-4 divide-y divide-slate-100">
                {(item.products || []).map((listedProduct) => (
                  <div key={listedProduct.id} className="flex items-center justify-between gap-3 py-3">
                    <div><p className="font-medium">{listedProduct.name}</p><p className="text-sm text-slate-500">₹{Number(listedProduct.price).toLocaleString('en-IN')}</p></div>
                    <div className="flex gap-2"><button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-700" aria-label={`Edit ${listedProduct.name}`} onClick={() => startEdit(listedProduct, item.id)}><Pencil size={16} /></button><button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700" aria-label={`Delete ${listedProduct.name}`} onClick={() => removeProduct(listedProduct.id)}><Trash2 size={16} /></button></div>
                  </div>
                ))}
                {item.products?.length === 0 && <p className="py-3 text-sm text-slate-500">No product listings yet.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SellerReservations />
    </section>
  );
}

export default SellerDashboard;
