import { Outlet, Navigate } from 'react-router-dom';

const isAuthed = () => {
  const token = localStorage.getItem('jwt');
  return Boolean(token);
};

const Protected = () => {
  return isAuthed() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default Protected;


