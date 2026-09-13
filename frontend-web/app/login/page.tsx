'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function LoginPage() {
  const [email, setEmail] = useState('customer@hanastore.local');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login gagal');
      // token disimpan aman via httpOnly cookie oleh backend (bukan localStorage)
      // untuk kebutuhan UX, simpan di Zustand/memory saja jika diperlukan
      alert('Login berhasil');
      router.push('/catalog');
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mt-10">
      <h1 className="text-xl font-bold mb-4">Masuk</h1>
      <form onSubmit={handle} className="space-y-3">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border px-3 py-2 rounded" required />
        <button disabled={loading} className="w-full bg-amber-600 text-white py-2 rounded">{loading ? '...' : 'Masuk'}</button>
      </form>
      <p className="text-sm mt-3 text-center">Belum punya akun? <Link href="/register" className="text-amber-600">Daftar</Link></p>
      <p className="text-xs text-gray-500 mt-4">Demo: customer@hanastore.local / password123<br/>admin@hanastore.local / password123</p>
    </div>
  );
}
