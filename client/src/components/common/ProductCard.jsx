import { MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const price = Number(product.price);
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/products/${product.id}`} className="block">
        <div className="flex aspect-[4/3] items-center justify-center bg-slate-100">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <Tag size={32} className="text-slate-300" aria-hidden="true" />}
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{product.category}</p>
          <h3 className="mt-2 line-clamp-2 font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-3 text-xl font-bold text-slate-950">₹{price.toLocaleString('en-IN')}</p>
          <p className="mt-3 flex items-center gap-1 text-sm text-slate-600"><MapPin size={15} aria-hidden="true" />{product.shop?.shopName || 'Local shop'}</p>
          <p className="mt-1 text-xs text-slate-500">{product.shop?.city}{product.distanceKm !== null && product.distanceKm !== undefined && ` · ${product.distanceKm} km away`}</p>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
