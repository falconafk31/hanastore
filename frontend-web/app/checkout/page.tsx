'use client';
export default function CheckoutPage() {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Checkout</h1>
      <p className="text-sm text-gray-600">Alur checkout terintegrasi di halaman detail alat: pilih tanggal → cek availability → booking → bayar via Midtrans. Lihat dashboard untuk status pembayaran dan kontrak.</p>
      <a href="/catalog" className="inline-block mt-4 bg-amber-600 text-white px-4 py-2 rounded">Kembali ke Katalog</a>
    </div>
  );
}
