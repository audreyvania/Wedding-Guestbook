import {useEffect, useState} from 'react';
import Shell from '../components/Shell';
import GuestForm from '../components/GuestForm';
import {api} from '../lib/api';

const categories = ['Family', 'Friend', 'Colleague', 'Other'];

export default function Guests() {
    const [data, setData] = useState(null);
    const [editing, setEditing] = useState(null);
    const [adding, setAdding] = useState(false);
    const [filters, setFilters] = useState({search: '', category: '', status: ''});
    const [error, setError] = useState('');

    const load = () => api('/api/guests?' + new URLSearchParams(filters)).then(setData).catch(exception => setError(exception.message));
    useEffect(load, [filters.search, filters.category, filters.status]);
    const closed = () => { setAdding(false); setEditing(null); load(); };
    const remove = async (guest) => {
        if (!confirm(`Hapus undangan ${guest.guest_name}?`)) return;
        await api(`/api/guests/${guest.id}`, {method: 'DELETE'});
        load();
    };

    return <Shell>
        <header className="page-header"><div><p className="eyebrow">Manajemen tamu</p><h1>Undangan</h1></div><div className="header-actions"><a className="button secondary" href="/api/qr-sheet.pdf">Cetak semua QR</a><button onClick={() => setAdding(true)}>+ Tambah undangan</button></div></header>
        {(adding || editing) && <GuestForm guest={editing} onSaved={closed} onCancel={() => { setAdding(false); setEditing(null); }}/>}
        <section className="panel">
            <div className="filters"><input placeholder="Cari nama..." value={filters.search} onChange={event => setFilters({...filters, search: event.target.value})}/><select value={filters.category} onChange={event => setFilters({...filters, category: event.target.value})}><option value="">Semua kategori</option>{categories.map(category => <option key={category}>{category}</option>)}</select><select value={filters.status} onChange={event => setFilters({...filters, status: event.target.value})}><option value="">Semua status</option><option value="Attended">Hadir</option><option value="Absent">Belum hadir</option></select></div>
            {error && <div className="alert error">{error}</div>}
            {!data ? <p>Memuat undangan...</p> : <table><thead><tr><th>Nama</th><th>Kategori</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{data.data.map(guest => <tr key={guest.id}><td>{guest.guest_name}</td><td>{guest.category}</td><td><span className={'badge ' + (guest.status === 'Attended' ? 'success' : '')}>{guest.status === 'Attended' ? 'Hadir' : 'Belum hadir'}</span></td><td className="actions"><a href={`/api/guests/${guest.id}/qr`} title="Unduh QR">QR</a><button className="text" onClick={() => setEditing(guest)}>Ubah</button><button className="text danger" onClick={() => remove(guest)}>Hapus</button></td></tr>)}</tbody></table>}
        </section>
    </Shell>;
}
