import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, MapPin, Search } from 'lucide-react';
import { getHealthStatus } from '../services/api';

function Home() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    getHealthStatus()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('unavailable'));
  }, []);

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="container-shell grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              <MapPin size={15} aria-hidden="true" />
              Starting in Adityapur, Jamshedpur
            </p>
            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              Discover local products, without the shop-to-shop search.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              LocalLens helps you explore products from nearby physical stores so you can compare options, connect with shopkeepers, and visit with confidence.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <label className="flex flex-1 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
                <Search size={20} className="text-slate-400" aria-hidden="true" />
                <span className="sr-only">Search for products</span>
                <input type="search" placeholder="What are you looking for?" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
              </label>
              <button type="button" className="button-primary">
                Explore nearby
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
              <MapPin size={16} aria-hidden="true" />
              <span>Choose your location to see nearby options</span>
            </div>
          </div>
          <div className="rounded-3xl bg-brand-900 p-8 text-white shadow-xl shadow-brand-900/10 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-100">A better local shopping start</p>
            <h2 className="mt-5 text-2xl font-semibold">Find first. Visit prepared.</h2>
            <p className="mt-4 leading-7 text-indigo-100">
              Browse local listings before you leave home, then confirm availability directly with the shopkeeper.
            </p>
            <div className="mt-8 space-y-4 text-sm text-indigo-100">
              {['Compare nearby options', 'See shop details and distance', 'Connect directly with local sellers'].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-300" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="container-shell py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Built for local discovery</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-950">The convenience of browsing, the confidence of buying local.</h2>
          <p className="mt-4 text-slate-600">LocalLens is a discovery platform, not an inventory system. Product listings are a starting point, so please confirm availability with the shopkeeper.</p>
        </div>
        <p className="mt-8 text-sm text-slate-500" role="status">
          {apiStatus === 'checking' && 'Connecting to LocalLens API…'}
          {apiStatus === 'connected' && 'LocalLens API connected.'}
          {apiStatus === 'unavailable' && 'API connection is unavailable. The interface is still available.'}
        </p>
      </section>
    </>
  );
}

export default Home;
