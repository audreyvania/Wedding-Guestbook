import {useEffect, useState} from 'react';
import {api, go} from '../lib/api';
import {useEventSettings} from '../lib/event-settings';

export default function Shell({children}) {
    const [authUser, setAuthUser] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const settings = useEventSettings();

    useEffect(() => {
        api('/api/user').then(setAuthUser).catch(() => go('/login'));
    }, []);

    const logout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try { await api('/logout', {method: 'POST'}); go('/login'); }
        catch (_) { setLoggingOut(false); }
    };

    const isAdminPreview = location.pathname === '/admin-preview';
    const isDeveloper = authUser?.role === 'developer' && !isAdminPreview;
    const canAccessAdmin = authUser?.role === 'admin' || authUser?.role === 'developer';
    const canAccessReception = authUser?.role === 'receptionist' || isDeveloper;

    return <div className="app-shell">
        <aside>
            <div className="brand">{settings.groom_name[0]} &amp; {settings.bride_name[0]} <small>Wedding Guestbook</small></div>
            <p className="role-label">{isDeveloper ? 'Developer' : canAccessAdmin ? 'Admin acara' : 'Penerima tamu'}</p>
            <nav>
                {canAccessAdmin && <>
                    {isDeveloper && <p className="nav-group-label">Admin</p>}
                    <a href="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</a>
                    <a href="/guests" className={location.pathname === '/guests' ? 'active' : ''}>Undangan</a>
                    <a href="/scanner" className={location.pathname === '/scanner' ? 'active' : ''}>{isDeveloper ? 'Scanner QR Admin' : 'Scanner QR'}</a>
                </>}
                {canAccessReception && <>
                    {isDeveloper && <p className="nav-group-label">Penerima tamu</p>}
                    <a href="/reception" className={location.pathname === '/reception' ? 'active' : ''}>Penerimaan tamu</a>
                    <a href="/reception/scanner" className={location.pathname === '/reception/scanner' ? 'active' : ''}>{isDeveloper ? 'Scanner QR Tamu' : 'Scanner QR'}</a>
                </>}
                {isDeveloper && <><p className="nav-group-label">Developer</p><a href="/developer" className={location.pathname === '/developer' ? 'active' : ''}>Pengaturan developer</a></>}
            </nav>
            <button className="link-button" onClick={logout} disabled={loggingOut}>{loggingOut ? <><span className="loading-spinner"/>Keluar...</> : 'Keluar'}</button>
        </aside>
        <main>{children}</main>
    </div>;
}
