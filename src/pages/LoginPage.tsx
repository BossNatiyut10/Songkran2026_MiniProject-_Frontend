import { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginForm>({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<{ token: string; user: { username: string; email: string } }>(
        '/auth/login',
        form
      );
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-black flex items-center justify-center p-8">
      <div className="bg-red-600 rounded-2xl shadow-lg p-8 w-full max-w-sm flex flex-col gap-5">
        <h1 className="text-white text-3xl font-bold text-center tracking-wider">Log in</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-white text-base font-medium lg:text-lg lg:tracking-wide">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="border border-gray-400 rounded-lg px-3 py-2 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-white text-base font-medium lg:text-lg lg:tracking-wide">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="border border-gray-400 rounded-lg px-3 py-2 text-base tracking-wide focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && (
            <p className="text-white text-base text-center">✗ {error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white font-normal tracking-wide text-lg py-2 rounded-lg hover:bg-white hover:text-red-600 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-base text-white">
          No account? {' '}
          <Link to="/register" className="text-black hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
