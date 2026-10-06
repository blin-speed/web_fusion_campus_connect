import { Navigate } from 'react-router'; export default function RequireUser({ children, user }) { return user ? children : <Navigate to='/' />; }
