import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function Bookings() {
  const [data, setData] = useState<Record<string, unknown>[]>([]);

  async function load() {
    try {
      const res = await api.get('/bookings?limit=100');
      setData(res.data.data?.data || res.data.data || []);
    } catch {}
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await api.patch(`/bookings/${id}/status`, { status });
    load();
  }

  async function generateContract(bookingId: string) {
    try {
      const res = await api.post(`/contracts/generate/${bookingId}`);
      alert('Kontrak dibuat: ' + (res.data.data?.docUrl || res.data.docUrl || 'ok'));
    } catch (e: unknown) {
      alert((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Gagal');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Manajemen Booking</h1>
      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100"><tr><th className="p-3 text-left">ID</th><th>User</th><th>Alat</th><th>Periode</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            {data.map((b) => {
              const booking = b as { id: string; status: string; startDate: string; endDate: string; user: { name: string }; equipment: { name: string } };
              return (
                <tr key={booking.id} className="border-t">
                  <td className="p-3 font-mono text-xs">{booking.id.slice(0, 8)}</td>
                  <td>{booking.user?.name}</td>
                  <td>{booking.equipment?.name}</td>
                  <td>{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}</td>
                  <td><span className="px-2 py-1 bg-gray-100 rounded text-xs">{booking.status}</span></td>
                  <td className="flex gap-1 p-2">
                    {booking.status === 'pending' && <>
                      <button onClick={() => updateStatus(booking.id, 'confirmed')} className="bg-green-600 text-white px-2 py-1 rounded text-xs">Approve</button>
                      <button onClick={() => updateStatus(booking.id, 'rejected')} className="bg-red-600 text-white px-2 py-1 rounded text-xs">Reject</button>
                    </>}
                    {booking.status === 'confirmed' && <button onClick={() => generateContract(booking.id)} className="bg-amber-600 text-white px-2 py-1 rounded text-xs">Kontrak</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
