import { LogOut, MapPin, Menu, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
          <Link to="/marketplace" className="transition hover:text-brand-700">Marketplace</Link>
          {user?.role === 'CUSTOMER' && <Link to="/reservations" className="transition hover:text-brand-700">My reservations</Link>}
          {user?.role === 'SELLER' && <Link to="/seller" className="transition hover:text-brand-700">Seller dashboard</Link>}
          {!user && <Link to="/login" className="transition hover:text-brand-700">Sign in</Link>}
          {!user && <Link to="/register" className="button-primary px-4 py-2">Join LocalLens</Link>}
          {user && (
            <button type="button" onClick={() => { logout(); navigate('/'); }} className="inline-flex items-center gap-2 transition hover:text-brand-700">
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          )}
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
