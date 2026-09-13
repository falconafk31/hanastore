'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gagal daftar');
      alert('Registrasi berhasil');
      router.push('/login');
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow mt-10">
      <h1 className="text-xl font-bold mb-4">Daftar</h1>
      <form onSubmit={handle} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" className="w-full border px-3 py-2 rounded" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password min 8 karakter" className="w-full border px-3 py-2 rounded" required />
        <button className="w-full bg-amber-600 text-white py-2 rounded">Daftar</button>
      </form>
      <p className="text-sm mt-3 text-center">Sudah punya akun? <Link href="/login" className="text-amber-600">Masuk</Link></p>
    </div>
  );
}
