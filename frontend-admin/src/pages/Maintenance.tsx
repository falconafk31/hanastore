import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Maintenance() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [form, setForm] = useState({ equipmentId: '', serviceDate: '', notes: '', cost: '' });

  async function load() {
    try {
      const res = await api.get('/maintenance?limit=100');
      setData(res.data.data?.data || res.data.data || []);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/maintenance', { ...form, cost: Number(form.cost) });
    setForm({ equipmentId: '', serviceDate: '', notes: '', cost: '' });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Maintenance</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6 grid md:grid-cols-4 gap-3">
        <input placeholder="Equipment ID" value={form.equipmentId} onChange={(e) => setForm({ ...form, equipmentId: e.target.value })} className="border px-2 py-2 rounded" required />
        <input type="date" value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} className="border px-2 py-2 rounded" required />
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="border px-2 py-2 rounded" required />
        <input placeholder="Cost" type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} className="border px-2 py-2 rounded" required />
        <button className="bg-amber-600 text-white px-4 py-2 rounded md:col-span-4">Tambah Log</button>
      </form>
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">Alat</th><th>Tanggal</th><th>Catatan</th><th>Biaya</th></tr></thead>
          <tbody>
            {data.map((m) => {
              const log = m as { id: string; serviceDate: string; notes: string; cost: string; equipment: { name: string } };
              return (
                <tr key={log.id} className="border-t">
                  <td className="p-3">{log.equipment?.name || '-'}</td>
                  <td>{new Date(log.serviceDate).toLocaleDateString()}</td>
                  <td>{log.notes}</td>
                  <td>Rp {Number(log.cost).toLocaleString('id-ID')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
