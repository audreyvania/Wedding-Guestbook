import {useEffect, useState} from 'react';
import {api, go} from '../lib/api';

export default function Shell({children}) {
    const [authUser, setAuthUser] = useState(null);

    useEffect(() => {
        api('/api/user').then(setAuthUser).catch(() => go('/login'));
    }, []);

    const logout = async () => {
        await api('/logout', {method: 'POST'});
        go('/login');
    };

    const isAdmin = authUser?.role === 'admin';

    return <div className="app-shell">
        <aside>
            <div className="brand">R & D <small>Wedding Guestbook</small></div>
            <p className="role-label">{isAdmin ? 'Admin acara' : 'Penerima tamu'}</p>
            <nav>
                {isAdmin && <>
                    <a href="/" className={location.pathname === '/' ? 'active' : ''}>Dashboard</a>
                    <a href="/guests" className={location.pathname === '/guests' ? 'active' : ''}>Undangan</a>
                </>}
                <a href="/scanner" className={location.pathname === '/scanner' ? 'active' : ''}>Scanner QR</a>
            </nav>
            <button className="link-button" onClick={logout}>Keluar</button>
        </aside>
        <main>{children}</main>
    </div>;
}
