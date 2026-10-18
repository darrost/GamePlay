import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function GuestOnlyRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) return <p role="status">Checking your session…</p>;
    if (user) return <Navigate to="/games" replace />;

    return <Outlet />;
}
