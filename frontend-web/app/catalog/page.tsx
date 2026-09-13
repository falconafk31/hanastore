'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

type Equipment = {
  id: string;
  name: string;
  dailyRate: string;
  location: string;
  status: string;
  photoUrl?: string;
  category: { name: string };
};

export default function CatalogPage() {
  const [data, setData] = useState<Equipment[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('categoryId', category);
    params.set('limit', '12');
    try {
      const res = await fetch(`${API_URL}/equipment?${params.toString()}`);
      const json = await res.json();
      setData(json.data?.data || json.data || []);
    } catch {
      setData([]);
    }
    setLoading(false);
  }

  async function fetchCats() {
    try {
      const res = await fetch(`${API_URL}/equipment/categories`);
      const json = await res.json();
      setCategories(json.data || json || []);
    } catch {}
  }

  useEffect(() => {
    fetchCats();
  }, []);
  useEffect(() => {
    fetchData();
  }, [category]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Katalog Alat</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          placeholder="Cari alat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          className="border px-3 py-2 rounded w-64"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border px-3 py-2 rounded">
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button onClick={fetchData} className="bg-amber-600 text-white px-4 py-2 rounded">Cari</button>
      </div>
      {loading ? (
        <p>Memuat...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-500">Tidak ada alat ditemukan. Pastikan backend berjalan.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {data.map((eq) => (
            <Link key={eq.id} href={`/catalog/${eq.id}`} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-lg transition">
              <img src={eq.photoUrl || `https://picsum.photos/seed/${eq.id}/400/250`} alt={eq.name} className="w-full h-48 object-cover" loading="lazy" />
              <div className="p-4">
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">{eq.category?.name}</span>
                <h3 className="font-semibold mt-2">{eq.name}</h3>
                <p className="text-sm text-gray-500">{eq.location} • {eq.status}</p>
                <p className="font-bold text-amber-600 mt-2">Rp {Number(eq.dailyRate).toLocaleString('id-ID')} / hari</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
