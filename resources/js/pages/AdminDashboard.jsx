import {useEffect, useState} from 'react';
import Shell from '../components/Shell';
import {api} from '../lib/api';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => { api('/api/dashboard').then(setData).catch(exception => setError(exception.message)); }, []);

    if (error) return <Shell><div className="alert error">{error}</div></Shell>;
    if (!data) return <Shell><p>Memuat dashboard...</p></Shell>;

    const cards = [
        ['Total undangan', data.stats.invitations],
        ['Undangan hadir', data.stats.attended_invitations],
        ['Belum hadir', data.stats.absent_invitations],
    ];

    return <Shell>
        <header className="page-header"><div><p className="eyebrow">Operasional acara</p><h1>Dashboard</h1></div><div className="header-actions"><a className="button secondary" href="/api/reports.csv">Unduh CSV</a><a className="button secondary" href="/api/reports.pdf">Rekap PDF</a></div></header>
        <section className="stats">{cards.map(([label, value]) => <article className="stat" key={label}><span>{label}</span><strong>{value}</strong></article>)}</section>
        <section className="panel"><div className="panel-title"><h2>Check-in terbaru</h2><a href="/scanner">Buka scanner</a></div>{data.recent_checkins.length ? <table><thead><tr><th>Nama</th><th>Kategori</th><th>Waktu</th></tr></thead><tbody>{data.recent_checkins.map(guest => <tr key={guest.id}><td>{guest.guest_name}</td><td>{guest.category}</td><td>{new Date(guest.check_in_time).toLocaleString('id-ID')}</td></tr>)}</tbody></table> : <p className="muted">Belum ada tamu yang check-in.</p>}</section>
    </Shell>;
}
