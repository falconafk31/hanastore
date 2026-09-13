import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('admin@hanastore.local');
  const [password, setPassword] = useState('password123');
  const nav = useNavigate();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data || res.data;
      localStorage.setItem('adminToken', data.accessToken);
      nav('/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Login gagal';
      alert(msg);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handle} className="bg-white p-8 rounded-xl shadow w-96 space-y-4">
        <h1 className="text-xl font-bold">Admin Login</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border px-3 py-2 rounded" />
        <button className="w-full bg-amber-600 text-white py-2 rounded">Masuk</button>
        <p className="text-xs text-gray-500">admin@hanastore.local / password123</p>
      </form>
    </div>
  );
}
