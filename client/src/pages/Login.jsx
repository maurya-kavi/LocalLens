import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'SELLER' ? '/seller' : '/marketplace'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate(location.state?.from || '/marketplace');
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container-shell flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-brand-700">Welcome back</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Sign in to LocalLens</h1>
        <p className="mt-2 text-sm text-slate-500">Discover local products or manage your shop.</p>
        {error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-6 space-y-4">
          <label className="field-label">Email<input className="field-input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="field-label">Password<input className="field-input" type="password" required minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        </div>
        <button className="button-primary mt-6 w-full" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
        <p className="mt-6 text-center text-sm text-slate-500">New to LocalLens? <Link to="/register" className="font-semibold text-brand-700">Create an account</Link></p>
      </form>
    </section>
  );
}

export default Login;
