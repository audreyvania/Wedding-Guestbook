import './bootstrap';
import '../css/app.css';
import {createRoot} from 'react-dom/client';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Guests from './pages/Guests';
import ReceptionDashboard from './pages/ReceptionDashboard';
import Scanner from './pages/Scanner';

function App() { if (location.pathname === '/login') return <Login/>; if (location.pathname === '/guests') return <Guests/>; if (location.pathname === '/reception') return <ReceptionDashboard/>; if (location.pathname === '/scanner') return <Scanner/>; return <AdminDashboard/>; }
createRoot(document.getElementById('app')).render(<App/>);
