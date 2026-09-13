import { useState } from 'react';
import api from '../lib/api';

type BookingRow = { id: string; status: string; startDate: string; totalAmount: string; user: { name: string }; equipment: { name: string } };

export default function Reports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState<BookingRow[]>([]);

  async function load() {
    const res = await api.get('/bookings?limit=100');
    const all: BookingRow[] = res.data.data?.data || res.data.data || [];
    let filtered = all;
    if (from) filtered = filtered.filter((r) => new Date(r.startDate) >= new Date(from));
    if (to) filtered = filtered.filter((r) => new Date(r.startDate) <= new Date(to));
    setRows(filtered);
  }

  function exportCsv() {
    const header = 'id,user,alat,tanggal,total,status\n';
    const rowsCsv = rows.map((r) => [r.id, r.user?.name, r.equipment?.name, r.startDate, r.totalAmount, r.status].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const csv = header + rowsCsv;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-${from}-${to}.csv`;
    a.click();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Laporan</h1>
      <div className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3">
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border px-2 py-2 rounded" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border px-2 py-2 rounded" />
        <button onClick={load} className="bg-gray-900 text-white px-4 py-2 rounded">Filter</button>
        <button onClick={exportCsv} disabled={rows.length === 0} className="bg-amber-600 text-white px-4 py-2 rounded disabled:opacity-50">Export CSV</button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">ID</th><th>User</th><th>Alat</th><th>Tanggal</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3 font-mono text-xs">{r.id.slice(0, 8)}</td>
                <td>{r.user?.name}</td>
                <td>{r.equipment?.name}</td>
                <td>{new Date(r.startDate).toLocaleDateString()}</td>
                <td>Rp {Number(r.totalAmount).toLocaleString('id-ID')}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
