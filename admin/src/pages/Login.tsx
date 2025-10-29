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
    <div className="min-h-screen grid place-items-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Admin Login</h1>
          <p className="text-sm text-gray-500">Sign in to manage Nikas Realty</p>
        </div>
        <div className="space-y-1">
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
        </div>
        <div className="space-y-1">
          <label className="label">Password</label>
          <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button className="btn btn-primary w-full" type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;


