import { useEffect, useState } from 'react';
import api from '../lib/api';

type Eq = { id: string; name: string; dailyRate: string; location: string; status: string; photoUrl?: string; category: { id: string; name: string } };

export default function Equipment() {
  const [data, setData] = useState<Eq[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState({ name: '', categoryId: '', dailyRate: '', location: '', status: 'available' });
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    try {
      const res = await api.get('/equipment?limit=100');
      setData(res.data.data?.data || res.data.data || []);
      const cats = await api.get('/equipment/categories');
      setCategories(cats.data.data || cats.data || []);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      let photoUrl: string | undefined;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const up = await api.post('/storage/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        photoUrl = up.data.data?.url || up.data.url;
      }
      await api.post('/equipment', {
        name: form.name,
        categoryId: form.categoryId,
        dailyRate: Number(form.dailyRate),
        location: form.location,
        status: form.status,
        photoUrl,
      });
      setForm({ name: '', categoryId: '', dailyRate: '', location: '', status: 'available' });
      setFile(null);
      load();
    } catch (err: unknown) {
      alert((err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manajemen Alat</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-5 gap-3">
        <input placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border px-2 py-2 rounded" required />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="border px-2 py-2 rounded" required>
          <option value="">Kategori</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Rate" type="number" value={form.dailyRate} onChange={(e) => setForm({ ...form, dailyRate: e.target.value })} className="border px-2 py-2 rounded" required />
        <input placeholder="Lokasi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="border px-2 py-2 rounded" required />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border px-2 py-2 rounded">
          <option value="available">available</option>
          <option value="rented">rented</option>
          <option value="maintenance">maintenance</option>
          <option value="inactive">inactive</option>
        </select>
        <input type="file" accept="image/*,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="border px-2 py-2 rounded" />
        <button className="bg-amber-600 text-white px-4 py-2 rounded md:col-span-5">Tambah Alat</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">Nama</th><th>Kategori</th><th>Rate</th><th>Lokasi</th><th>Status</th></tr></thead>
          <tbody>
            {data.map((eq) => (
              <tr key={eq.id} className="border-t">
                <td className="p-3 flex gap-2 items-center"><img src={eq.photoUrl || 'https://picsum.photos/seed/' + eq.id + '/40/40'} className="w-10 h-10 rounded object-cover" loading="lazy" />{eq.name}</td>
                <td>{eq.category?.name}</td>
                <td>Rp {Number(eq.dailyRate).toLocaleString('id-ID')}</td>
                <td>{eq.location}</td>
                <td><span className="px-2 py-1 bg-gray-100 rounded text-xs">{eq.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
