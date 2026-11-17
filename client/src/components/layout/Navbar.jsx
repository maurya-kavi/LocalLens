import { MapPin, Menu, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand-700" aria-label="LocalLens home">
          <span className="rounded-lg bg-brand-600 p-2 text-white">
            <Store size={18} aria-hidden="true" />
          </span>
          LocalLens
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex" aria-label="Main navigation">
          <a href="#how-it-works" className="transition hover:text-brand-700">How it works</a>
          <a href="#for-shops" className="transition hover:text-brand-700">For local shops</a>
        </nav>
        <button type="button" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden" aria-label="Open navigation menu">
          <Menu size={22} aria-hidden="true" />
        </button>
        <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
          <MapPin size={16} className="text-brand-600" aria-hidden="true" />
          Adityapur
        </div>
      </div>
    </header>
  );
}

export default Navbar;
