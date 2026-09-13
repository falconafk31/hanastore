import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Login from './pages/Login';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h1 className="text-xl font-bold text-amber-400 mb-6">HanaStore Admin</h1>
        <nav className="space-y-2 text-sm">
          <Link to="/" className="block hover:text-amber-400">Dashboard</Link>
          <Link to="/equipment" className="block hover:text-amber-400">Manajemen Alat</Link>
          <Link to="/bookings" className="block hover:text-amber-400">Manajemen Booking</Link>
          <Link to="/maintenance" className="block hover:text-amber-400">Maintenance</Link>
          <Link to="/reports" className="block hover:text-amber-400">Laporan</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}

export default function App() {
  const token = localStorage.getItem('adminToken');
  // simple guard - in real app use auth store
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={token ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
      <Route path="/equipment" element={token ? <Layout><Equipment /></Layout> : <Navigate to="/login" />} />
      <Route path="/bookings" element={token ? <Layout><Bookings /></Layout> : <Navigate to="/login" />} />
      <Route path="/maintenance" element={token ? <Layout><Maintenance /></Layout> : <Navigate to="/login" />} />
      <Route path="/reports" element={token ? <Layout><Reports /></Layout> : <Navigate to="/login" />} />
    </Routes>
  );
}
