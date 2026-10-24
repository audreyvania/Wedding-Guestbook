import {useEffect, useState} from 'react';
import {api, go} from '../lib/api';

export default function ReceptionDashboard() {
    const [data, setData] = useState(null);
    const [guests, setGuests] = useState(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    const loadGuests = () => api('/api/reception/guests?' + new URLSearchParams({search})).then(setGuests).catch(exception => setError(exception.message));
    useEffect(() => { api('/api/dashboard').then(setData).catch(exception => setError(exception.message)); }, []);
    useEffect(() => { const timer = setTimeout(loadGuests, 180); return () => clearTimeout(timer); }, [search]);

    const logout = async () => { await api('/logout', {method: 'POST'}); go('/login'); };
    const moveHero = event => {
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--px', ((event.clientX - box.left) / box.width - .5).toFixed(3));
        event.currentTarget.style.setProperty('--py', ((event.clientY - box.top) / box.height - .5).toFixed(3));
    };
    const resetHero = event => { event.currentTarget.style.setProperty('--px', '0'); event.currentTarget.style.setProperty('--py', '0'); };
    const stats = data ? [['Total Guests', data.stats.invitations], ['Attended', data.stats.attended_invitations], ['Absent', data.stats.absent_invitations]] : [];

    return <div className="reception-dashboard">
        <header className="reception-hero" onMouseMove={moveHero} onMouseLeave={resetHero}>
            <div className="hero-light"/><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-monogram">R<span>&amp;</span>D</div>
            <div className="sparkle-field">{Array.from({length: 22}, (_, index) => <i key={index} style={{'--x': `${(index * 37) % 96}%`, '--y': `${(index * 61) % 91}%`, '--d': `${(index % 6) * .42}s`, '--s': `${8 + (index % 4) * 5}px`}}>✦</i>)}</div>
            <button className="reception-logout" onClick={logout}>Keluar</button>
            <div className="reception-hero-inner"><div className="event-pill"><span/> Wedding reception</div><p className="eyebrow">The Wedding Of</p><h1>Raihan <span>&amp;</span> Debby</h1><p className="hero-subtitle">Selamat datang, tim penerima tamu</p><div className="reception-search"><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Cari nama tamu di sini..."/><button onClick={() => go('/scanner')}>⌁ Scan QR</button></div><p className="hero-helper">Cari undangan atau buka scanner untuk check-in cepat</p><div className="scroll-cue"><span/> Geser untuk melihat kehadiran</div></div>
        </header>
        <main className="reception-main">
            <div className="ornament"><span>✦</span> ❦ <span>✦</span></div>{error && <div className="alert error">{error}</div>}
            <section className="reception-overview"><div><p className="eyebrow">Live attendance</p><h2>Ringkasan Kehadiran</h2><p>Data diperbarui setiap kali QR undangan dipindai.</p></div><button className="scanner-cta" onClick={() => go('/scanner')}><b>▣</b><span>Mulai penerimaan tamu<small>Buka QR Scanner</small></span><i>→</i></button></section>
            <section className="reception-stats">{stats.map(([label, value], index) => <article key={label} className={'stat-card stat-' + index}><span>{label}</span><strong>{value}</strong><em>{index === 0 ? 'Undangan terdaftar' : index === 1 ? 'Sudah disambut' : 'Menunggu kedatangan'}</em></article>)}</section>
            <section className="reception-table"><div className="reception-table-head"><div><p className="eyebrow">Guestbook registry</p><h2>Data kehadiran tamu</h2></div><div className="table-count">{guests?.data?.length || 0} tamu ditampilkan</div></div>{!guests ? <p className="muted">Memuat daftar tamu...</p> : <div className="table-wrap"><table><thead><tr><th>Nama tamu</th><th>Kategori</th><th>Check-in</th><th>Status</th></tr></thead><tbody>{guests.data.length ? guests.data.map(guest => <tr key={guest.id}><td><b>{guest.guest_name}</b></td><td>{guest.category}</td><td>{guest.check_in_time ? new Date(guest.check_in_time).toLocaleString('id-ID') : '-'}</td><td><span className={'badge ' + (guest.status === 'Attended' ? 'success' : '')}>{guest.status === 'Attended' ? '● Hadir' : '○ Belum hadir'}</span></td></tr>) : <tr><td colSpan="4" className="muted">Tamu tidak ditemukan.</td></tr>}</tbody></table></div>}</section>
        </main>
    </div>;
}
