import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Team from './pages/Team';
import Protected from './components/Protected';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<Protected /> }>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/properties" element={<Properties />} />
      <Route path="/dashboard/team" element={<Team />} />
    </Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default App;


