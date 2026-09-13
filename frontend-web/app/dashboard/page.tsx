'use client';
import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export default function DashboardPage() {
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/bookings/my`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((j) => setBookings(j.data?.data || j.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function pay(bookingId: string) {
    const res = await fetch(`${API_URL}/payments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    });
    const j = await res.json();
    if (!res.ok) return alert(j.message || 'Gagal');
    alert('Pembayaran dibuat: ' + (j.data?.midtrans?.redirectUrl || 'cek dashboard'));
    // simulate webhook success for demo
    // In real app redirect to midtrans url
  }

  if (loading) return <p>Memuat...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard Customer</h1>
      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <p className="text-gray-500">Belum ada booking. <a href="/catalog" className="text-amber-600">Mulai sewa</a></p>
        ) : (
          bookings.map((b) => {
            const booking = b as { id: string; status: string; startDate: string; endDate: string; totalAmount: string; equipment: { name: string }; contract?: { signed: boolean; docUrl?: string }; payments?: { status: string }[] };
            return (
              <div key={booking.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
                <div>
                  <p className="font-semibold">{booking.equipment?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()} • Rp {Number(booking.totalAmount).toLocaleString('id-ID')}</p>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100">{booking.status}</span>
                  {booking.contract && <p className="text-xs mt-1">Kontrak: {booking.contract.signed ? '✓ Signed' : 'Belum ditanda'} {booking.contract.docUrl && <a href={booking.contract.docUrl} target="_blank" className="text-amber-600">Lihat</a>}</p>}
                </div>
                <div className="flex gap-2">
                  {booking.status === 'pending' && <button onClick={() => pay(booking.id)} className="bg-amber-600 text-white px-3 py-1 rounded text-sm">Bayar</button>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
