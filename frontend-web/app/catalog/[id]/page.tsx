'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [equipment, setEquipment] = useState<Record<string, unknown> | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState<{ available?: boolean } | null>(null);
  const [pricing, setPricing] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/equipment/${id}`).then((r) => r.json()).then((j) => setEquipment(j.data || j)).catch(() => {});
  }, [id]);

  async function check() {
    if (!startDate || !endDate) return alert('Pilih tanggal');
    const r = await fetch(`${API_URL}/equipment/${id}/availability?startDate=${startDate}&endDate=${endDate}`);
    const j = await r.json();
    setAvailability(j.data || j);
    const p = await fetch(`${API_URL}/pricing/calculate?equipmentId=${id}&startDate=${startDate}&endDate=${endDate}`);
    const pj = await p.json();
    setPricing(pj.data || pj);
  }

  async function book() {
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentId: id, startDate, endDate }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.message || 'Gagal booking');
      }
      const j = await res.json();
      alert('Booking berhasil! ID: ' + (j.data?.id || j.id));
      router.push('/dashboard');
    } catch (e) {
      alert((e as Error).message);
    }
  }

  if (!equipment) return <p>Memuat...</p>;
  const eq = equipment as { name: string; dailyRate: string; location: string; status: string; photoUrl?: string; category?: { name: string } };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <img src={eq.photoUrl || `https://picsum.photos/seed/${id}/600/400`} alt={eq.name} className="w-full rounded-xl" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">{eq.name}</h1>
        <p className="text-sm text-gray-500">{eq.category?.name} • {eq.location}</p>
        <p className="text-xl font-bold text-amber-600 mt-2">Rp {Number(eq.dailyRate).toLocaleString('id-ID')} / hari</p>
        <div className="mt-6 bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-3">Cek Ketersediaan & Booking</h3>
          <div className="flex gap-3 mb-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-2 py-2 rounded w-full" />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-2 py-2 rounded w-full" />
          </div>
          <button onClick={check} className="w-full bg-gray-900 text-white py-2 rounded mb-2">Cek Availability & Harga</button>
          {availability && (
            <p className={`text-sm ${availability.available ? 'text-green-600' : 'text-red-600'}`}>
              {availability.available ? '✓ Tersedia' : '✗ Tidak tersedia di tanggal tersebut'}
            </p>
          )}
          {pricing && (
            <div className="text-sm bg-amber-50 p-3 rounded mt-2">
              <p>{String(pricing['days'])} hari • Subtotal Rp {Number(pricing['subtotal']).toLocaleString('id-ID')}</p>
              {Number(pricing['discountAmount']) > 0 && <p>Diskon {(Number(pricing['discountRate'])*100)}% → -Rp {Number(pricing['discountAmount']).toLocaleString('id-ID')}</p>}
              <p className="font-bold">Total Rp {Number(pricing['total']).toLocaleString('id-ID')}</p>
            </div>
          )}
          <button onClick={book} disabled={availability ? !availability.available : false} className="w-full bg-amber-600 text-white py-2 rounded mt-3 disabled:opacity-50">Lanjut Checkout →</button>
        </div>
      </div>
    </div>
  );
}
