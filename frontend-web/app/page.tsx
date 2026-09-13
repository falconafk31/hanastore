import Link from 'next/link';

export default function Home() {
  return (
    <div className="py-10">
      <section className="text-center py-16 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl">
        <h1 className="text-4xl font-bold mb-4">Sewa Alat Berat Mudah & Terpercaya</h1>
        <p className="text-lg mb-6 opacity-90">Excavator, Bulldozer, Crane siap pakai di seluruh Indonesia</p>
        <Link href="/catalog" className="bg-white text-amber-600 px-6 py-3 rounded-lg font-semibold">Lihat Katalog</Link>
      </section>
      <section className="grid md:grid-cols-3 gap-6 mt-10">
        {[
          { title: 'Armada Terawat', desc: 'Perawatan rutin & inspeksi berkala' },
          { title: 'Harga Kompetitif', desc: 'Tarif harian transparan & diskon mingguan' },
          { title: 'Kontrak Digital', desc: 'Dokumen kontrak otomatis & tanda tangan digital' },
        ].map((f) => (
          <div key={f.title} className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{f.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
