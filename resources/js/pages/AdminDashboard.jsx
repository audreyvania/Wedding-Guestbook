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
        ['Total undangan', data.stats.invitations, 'bi-envelope-heart'],
        ['Undangan hadir', data.stats.attended_invitations, 'bi-check2-circle'],
        ['Belum hadir', data.stats.absent_invitations, 'bi-hourglass-split'],
    ];

    return <Shell>
        <div className="admin-page admin-dashboard">
            <header className="page-header"><div><p className="eyebrow">Operasional acara</p><h1>Dashboard</h1><p className="page-description">Pantau kehadiran tamu dan kelola kebutuhan resepsi dari satu tempat.</p></div><div className="header-actions"><a className="button secondary" href="/api/reports.csv"><i className="bi bi-filetype-csv me-2"/>Unduh CSV</a><a className="button secondary" href="/api/reports.pdf"><i className="bi bi-file-earmark-pdf me-2"/>Rekap PDF</a></div></header>
            <section className="stats">{cards.map(([label, value, icon]) => <article className="stat" key={label}><div><span>{label}</span><strong>{value}</strong></div><i className={'bi ' + icon}/></article>)}</section>
            <section className="panel recent-checkin-panel"><div className="panel-title"><div><p className="eyebrow">Aktivitas terbaru</p><h2>Check-in terbaru</h2></div><a className="scanner-link" href="/scanner"><i className="bi bi-qr-code-scan"/>Buka scanner</a></div>{data.recent_checkins.length ? <div className="table-responsive"><table><thead><tr><th>Nama</th><th>Kategori</th><th>Waktu</th></tr></thead><tbody>{data.recent_checkins.map(guest => <tr key={guest.id}><td><span className="guest-initial">{guest.guest_name[0]}</span><b>{guest.guest_name}</b></td><td><span className="table-category">{guest.category}</span></td><td>{new Date(guest.check_in_time).toLocaleString('id-ID')}</td></tr>)}</tbody></table></div> : <p className="muted">Belum ada tamu yang check-in.</p>}</section>
        </div>
    </Shell>;
}
