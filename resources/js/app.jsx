import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../css/app.css';
import '../css/theme.css';
import '../css/layout-fixes.css';
import {Component} from 'react';
import {createRoot} from 'react-dom/client';
import {applyTheme} from './lib/event-settings';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Guests from './pages/Guests';
import ReceptionDashboard from './pages/ReceptionDashboard';
import Scanner from './pages/Scanner';
import Developer from './pages/Developer';

window.addEventListener('message', event => {
    if (event.origin !== window.location.origin || event.data?.type !== 'wedding-theme-preview') return;
    applyTheme(event.data.settings);
    window.dispatchEvent(new CustomEvent('wedding-theme-preview', {detail: event.data.settings}));
});

function App() { if (location.pathname === '/login') return <Login/>; if (location.pathname === '/guests') return <Guests/>; if (location.pathname === '/reception') return <ReceptionDashboard/>; if (location.pathname === '/scanner' || location.pathname === '/reception/scanner') return <Scanner/>; if (location.pathname === '/developer') return <Developer/>; return <AdminDashboard/>; }

class AppErrorBoundary extends Component {
    state = {error: null};
    static getDerivedStateFromError(error) { return {error}; }
    render() {
        if (this.state.error) return <div className="app-error"><h1>Halaman tidak dapat dimuat</h1><p>Silakan muat ulang halaman. Jika masalah berlanjut, buka kembali dari halaman login.</p></div>;
        return this.props.children;
    }
}

createRoot(document.getElementById('app')).render(<AppErrorBoundary><App/></AppErrorBoundary>);
