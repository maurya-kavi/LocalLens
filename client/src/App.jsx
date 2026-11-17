import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import Footer from './components/layout/Footer';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import MyReservations from './pages/MyReservations';
import ProductDetail from './pages/ProductDetail';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import ShopDetail from './pages/ShopDetail';

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/shops/:id" element={<ShopDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reservations" element={<ProtectedRoute role="CUSTOMER"><MyReservations /></ProtectedRoute>} />
          <Route path="/seller" element={<ProtectedRoute role="SELLER"><SellerDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
