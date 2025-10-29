import { useEffect, useState } from 'react';
import { getMe, listProperties, listTeam } from '../lib/api';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [counts, setCounts] = useState({ properties: 0, team: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await getMe();
        const [p, t] = await Promise.all([listProperties(), listTeam()]);
        setCounts({ properties: p.data.length, team: t.data.length });
      } catch {
        navigate('/login');
      }
    })();
  }, [navigate]);

  const logout = () => { localStorage.removeItem('jwt'); navigate('/login'); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">Quick overview of your content</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Properties</div>
          <div className="text-2xl font-semibold">{counts.properties}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Team</div>
          <div className="text-2xl font-semibold">{counts.team}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/dashboard/properties" className="btn btn-primary">Manage Properties</Link>
        <Link to="/dashboard/team" className="btn border border-gray-300">Manage Team</Link>
        <button onClick={logout} className="btn border border-gray-300">Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;


