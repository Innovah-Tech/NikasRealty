import { Outlet, Navigate, Link } from 'react-router-dom';

const isAuthed = () => {
  const token = localStorage.getItem('jwt');
  return Boolean(token);
};

const Protected = () => {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-600"></span>
            Nikas Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link to="/dashboard/properties" className="hover:text-emerald-700">Properties</Link>
            <Link to="/dashboard/team" className="hover:text-emerald-700">Team</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Protected;


