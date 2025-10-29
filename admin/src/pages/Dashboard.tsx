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
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'flex', gap: 16, margin: '16px 0' }}>
        <div>Properties: {counts.properties}</div>
        <div>Team: {counts.team}</div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/dashboard/properties">Manage Properties</Link>
        <Link to="/dashboard/team">Manage Team</Link>
        <button onClick={logout}>Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;


