import {useEffect, useState} from 'react';
import {api, go} from '../lib/api';
import {useEventSettings} from '../lib/event-settings';

export default function ReceptionDashboard() {
    const [data, setData] = useState(null);
    const [guests, setGuests] = useState(null);
    const [search, setSearch] = useState('');
    const [searching, setSearching] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [successGuest, setSuccessGuest] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(4);
    const [error, setError] = useState('');
    const settings = useEventSettings();

    const loadGuests = async () => {
        setSearching(true);
        try { setGuests(await api('/api/reception/guests?' + new URLSearchParams({search}))); }
        catch (exception) { setError(exception.message); }
        finally { setSearching(false); }
    };
    useEffect(() => { api('/api/dashboard').then(setData).catch(exception => setError(exception.message)); }, []);
    useEffect(() => { const timer = setTimeout(loadGuests, 180); return () => clearTimeout(timer); }, [search]);
    useEffect(() => {
        if (!successGuest) return undefined;
        setSecondsLeft(4);
        const interval = window.setInterval(() => setSecondsLeft(value => Math.max(1, value - 1)), 1000);
        const timeout = window.setTimeout(() => setSuccessGuest(null), 4000);
        return () => { window.clearInterval(interval); window.clearTimeout(timeout); };
    }, [successGuest]);

    const confirmCheckin = async event => {
        event.preventDefault();
        if (!selectedGuest || checkingIn) return;
        setCheckingIn(true); setError('');
        try {
            const result = await api('/api/check-in', {method: 'POST', body: JSON.stringify({qr_token: selectedGuest.qr_token})});
            setSelectedGuest(null);
            setSuccessGuest(result.guest);
            setSearch('');
            setGuests(current => current ? {...current, data: current.data.map(guest => guest.id === result.guest.id ? result.guest : guest)} : current);
            api('/api/dashboard').then(setData).catch(() => {});
        } catch (exception) { setError(exception.message); }
        finally { setCheckingIn(false); }
    };

    const logout = async () => { await api('/logout', {method: 'POST'}); go('/login'); };
    const moveHero = event => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--px', ((event.clientX - box.left) / box.width - .5).toFixed(3));
        event.currentTarget.style.setProperty('--py', ((event.clientY - box.top) / box.height - .5).toFixed(3));
    };
    const resetHero = event => { event.currentTarget.style.setProperty('--px', '0'); event.currentTarget.style.setProperty('--py', '0'); };
    const stats = data ? [['Total Guests', data.stats.invitations], ['Attended', data.stats.attended_invitations], ['Absent', data.stats.absent_invitations]] : [];
    const bokehLights = Array.from({length: 13}, (_, index) => ({
        id: index,
        x: `${4 + ((index * 37) % 91)}%`, y: `${4 + ((index * 23) % 91)}%`,
        size: `${13 + (index % 5) * 9}px`, delay: `${-(index * .71)}s`, duration: `${5.8 + (index % 4) * 1.35}s`,
    }));

    return <div className="reception-dashboard">
        <div className="floral-frame frame-left" aria-hidden="true"><svg viewBox="0 0 260 430" fill="none"><path d="M8 418C84 365 77 279 131 230C181 185 192 112 247 13"/><path d="M70 338c-30-4-46-22-50-49 31 5 48 21 50 49ZM104 281c-3-29 13-49 40-58 4 29-9 49-40 58ZM153 216c-27-8-39-29-34-57 27 9 39 28 34 57ZM187 149c4-27 22-42 49-43-5 27-21 42-49 43ZM40 382c-16-18-15-39 2-57 17 19 16 38-2 57Z"/><path d="M119 231c-20-17-21-41-4-61 20 18 21 40 4 61ZM202 104c-18-18-18-41 0-59 18 19 18 41 0 59Z"/><circle cx="131" cy="230" r="12"/><path d="M119 230c-15-7-17-21-4-32 13 9 15 23 4 32ZM143 230c15-7 17-21 4-32-13 9-15 23-4 32ZM131 218c-7-15-21-17-32-4 9 13 23 15 32 4ZM131 242c-7 15-21 17-32 4 9-13 23-15 32-4Z"/></svg></div>
        <div className="floral-frame frame-right" aria-hidden="true"><svg viewBox="0 0 260 430" fill="none"><path d="M8 418C84 365 77 279 131 230C181 185 192 112 247 13"/><path d="M70 338c-30-4-46-22-50-49 31 5 48 21 50 49ZM104 281c-3-29 13-49 40-58 4 29-9 49-40 58ZM153 216c-27-8-39-29-34-57 27 9 39 28 34 57ZM187 149c4-27 22-42 49-43-5 27-21 42-49 43ZM40 382c-16-18-15-39 2-57 17 19 16 38-2 57Z"/><path d="M119 231c-20-17-21-41-4-61 20 18 21 40 4 61ZM202 104c-18-18-18-41 0-59 18 19 18 41 0 59Z"/><circle cx="131" cy="230" r="12"/><path d="M119 230c-15-7-17-21-4-32 13 9 15 23 4 32ZM143 230c15-7 17-21 4-32-13 9-15 23-4 32ZM131 218c-7-15-21-17-32-4 9 13 23 15 32 4ZM131 242c-7 15-21 17-32 4 9-13 23-15 32-4Z"/></svg></div>
        <div className="bokeh-field bokeh-left" aria-hidden="true">{bokehLights.map(light => <i key={light.id} style={{'--x': light.x, '--y': light.y, '--size': light.size, '--delay': light.delay, '--duration': light.duration}}/>)}</div>
        <div className="bokeh-field bokeh-right" aria-hidden="true">{bokehLights.map(light => <i key={light.id} style={{'--x': light.x, '--y': light.y, '--size': light.size, '--delay': `${parseFloat(light.delay) - .4}s`, '--duration': light.duration}}/>)}</div>
        <header className="reception-hero" onMouseMove={moveHero} onMouseLeave={resetHero}>
            <div className="hero-light"/><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-monogram">{settings.groom_name[0]}<span>&amp;</span>{settings.bride_name[0]}</div>
            <div className="sparkle-field">{Array.from({length: 22}, (_, index) => <i key={index} style={{'--x': `${(index * 37) % 96}%`, '--y': `${(index * 61) % 91}%`, '--d': `${(index % 6) * .42}s`, '--s': `${8 + (index % 4) * 5}px`}}>✦</i>)}</div>
            <button className="reception-logout" onClick={logout}>Keluar</button>
            <div className="reception-hero-inner"><div className="event-pill"><span/> Wedding reception</div><p className="eyebrow">The Wedding Of</p><h1>{settings.groom_name} <span>&amp;</span> {settings.bride_name}</h1><p className="hero-subtitle">Selamat datang, tim penerima tamu</p><div className="reception-search-wrap"><div className="reception-search"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari nama tamu di sini..."/><button onClick={() => go('/reception/scanner')}>⌁ Scan QR</button></div>{search.trim() && <div className="reception-search-results">{searching ? <p><span className="loading-spinner"/>Mencari tamu...</p> : guests?.data?.length ? guests.data.slice(0, 5).map(guest => <button type="button" key={guest.id} onClick={() => setSelectedGuest(guest)}><span><b>{guest.guest_name}</b><small>{guest.category}</small></span><em className={guest.status === 'Attended' ? 'attended' : ''}>{guest.status === 'Attended' ? 'Sudah hadir' : 'Belum hadir'}</em><i>→</i></button>) : <p>Tamu tidak ditemukan.</p>}</div>}</div><p className="hero-helper">Cari undangan atau buka scanner untuk check-in cepat</p><div className="scroll-cue"><span/> Geser untuk melihat kehadiran</div></div>
        </header>
        {selectedGuest && <div className="checkin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reception-checkin-title"><div className="checkin-modal reception-quick-checkin"><button className="modal-close" type="button" onClick={() => !checkingIn && setSelectedGuest(null)} aria-label="Tutup">×</button><div className="modal-flower">✓</div><p className="eyebrow">Konfirmasi kehadiran</p><h2 id="reception-checkin-title">{selectedGuest.guest_name}</h2><p className="modal-meta">{selectedGuest.category} · {selectedGuest.status === 'Attended' ? 'Sudah tercatat hadir' : 'Belum hadir'}</p><form onSubmit={confirmCheckin}><button className="modal-submit" disabled={checkingIn}>{checkingIn ? <><span className="loading-spinner"/>Mencatat kehadiran...</> : <><i className="bi bi-check2-circle me-2"/>Konfirmasi kehadiran</>}</button><button className="secondary modal-cancel" type="button" disabled={checkingIn} onClick={() => setSelectedGuest(null)}>Batal</button></form></div></div>}
        {successGuest && <div className="checkin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reception-success-title"><div className="checkin-modal checkin-success reception-search-success"><button className="modal-close" type="button" onClick={() => setSuccessGuest(null)} aria-label="Tutup">×</button><div className="success-state"><div className="success-sparkles" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div><div className="success-mark">✓</div><p className="eyebrow">Selamat datang</p><h2 id="reception-success-title">{successGuest.guest_name}</h2><div className="success-divider">✦</div><p className="success-message">Kehadiran Anda telah kami catat.<br/>Terima kasih sudah menjadi bagian dari hari bahagia kami.</p><p className="guest-closing">Selamat menikmati momen bahagia kami.</p><div className="auto-close"><span>{secondsLeft}</span><em>Kembali ke pencarian dalam <b>{secondsLeft} detik</b></em></div><button className="next-scan" type="button" onClick={() => setSuccessGuest(null)}>Selesai <i>→</i></button></div></div></div>}
        <main className="reception-main">
            <div className="ornament"><span>✦</span> ❦ <span>✦</span></div>{error && <div className="alert error">{error}</div>}
            <section className="reception-overview"><div><p className="eyebrow">Live attendance</p><h2>Ringkasan Kehadiran</h2><p>Data diperbarui setiap kali QR undangan dipindai.</p></div><button className="scanner-cta" onClick={() => go('/reception/scanner')}><b>▣</b><span>Mulai penerimaan tamu<small>Buka QR Scanner</small></span><i>→</i></button></section>
            <section className="reception-stats">{stats.map(([label, value], index) => <article key={label} className={'stat-card stat-' + index}><span>{label}</span><strong>{value}</strong><em>{index === 0 ? 'Undangan terdaftar' : index === 1 ? 'Sudah disambut' : 'Menunggu kedatangan'}</em></article>)}</section>
            <section className="reception-table"><div className="reception-table-head"><div><p className="eyebrow">Guestbook registry</p><h2>Data kehadiran tamu</h2></div><div className="table-count">{guests?.data?.length || 0} tamu ditampilkan</div></div>{!guests ? <p className="muted">Memuat daftar tamu...</p> : <div className="table-wrap"><table><thead><tr><th>Nama tamu</th><th>Kategori</th><th>Check-in</th><th>Status</th></tr></thead><tbody>{guests.data?.length ? guests.data.map(guest => <tr key={guest.id}><td><b>{guest.guest_name}</b></td><td>{guest.category}</td><td>{guest.check_in_time ? new Date(guest.check_in_time).toLocaleString('id-ID') : '-'}</td><td><span className={'badge ' + (guest.status === 'Attended' ? 'success' : '')}>{guest.status === 'Attended' ? '● Hadir' : '○ Belum hadir'}</span></td></tr>) : <tr><td colSpan="4" className="muted">Tamu tidak ditemukan.</td></tr>}</tbody></table></div>}</section>
        </main>
    </div>;
}
