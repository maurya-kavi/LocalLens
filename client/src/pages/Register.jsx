import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'SELLER' ? '/seller' : '/marketplace'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form);
      navigate(form.role === 'SELLER' ? '/seller' : '/marketplace');
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container-shell flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-brand-700">Join the local marketplace</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Create your account</h1>
        {error && <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
        <div className="mt-6 space-y-4">
          <label className="field-label">Name<input className="field-input" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label className="field-label">Email<input className="field-input" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
          <label className="field-label">Password<input className="field-input" type="password" required minLength="6" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
          <fieldset>
            <legend className="field-label">I am joining as</legend>
            <div className="mt-2 grid grid-cols-2 gap-3">
              {[['CUSTOMER', 'Customer'], ['SELLER', 'Shopkeeper']].map(([value, label]) => (
                <label key={value} className={`cursor-pointer rounded-lg border p-3 text-center text-sm ${form.role === value ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200'}`}>
                  <input className="sr-only" type="radio" name="role" value={value} checked={form.role === value} onChange={(event) => setForm({ ...form, role: event.target.value })} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <button className="button-primary mt-6 w-full" disabled={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
        <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-brand-700">Sign in</Link></p>
      </form>
    </section>
  );
}

export default Register;
