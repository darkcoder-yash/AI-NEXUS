import { LoginPage } from '@/components/LoginPage';
import { useAuthStore } from '@/store/useAuthStore';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/nexus" replace />;
  }

  return <LoginPage />;
};

export default Login;
