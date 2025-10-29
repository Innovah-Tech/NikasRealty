import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/api';

const Login = () => {
  const [email, setEmail] = useState('admin@nikasrealty.co.ke');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login(email, password);
      localStorage.setItem('jwt', data.token);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <form onSubmit={onSubmit} style={{ width: 360, display: 'grid', gap: 12 }}>
        <h1>Admin Login</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;


