import {useEffect, useState} from 'react';
import Shell from '../components/Shell';
import GuestForm from '../components/GuestForm';
import {api} from '../lib/api';

const templateCategories = ['Family', 'Friend', 'Colleague', 'Other'];
const fileToBase64 = async file => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
};

export default function Guests() {
    const [data, setData] = useState(null);
    const [categories, setCategories] = useState(templateCategories);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [adding, setAdding] = useState(false);
    const [importing, setImporting] = useState(false);
    const [file, setFile] = useState(null);
    const [importMessage, setImportMessage] = useState('');
    const [importBusy, setImportBusy] = useState(false);
    const [deleteBusy, setDeleteBusy] = useState(false);
    const [filters, setFilters] = useState({search: '', category: '', status: ''});
    const [error, setError] = useState('');

    const load = async () => {
        setError('');
        try { setData(await api('/api/guests?' + new URLSearchParams(filters))); }
        catch (exception) { setError(exception.message); }
    };
    useEffect(() => { load(); }, [filters.search, filters.category, filters.status]);
    useEffect(() => { api('/api/guests/categories').then(values => setCategories(values.length ? values : templateCategories)).catch(() => {}); }, [data?.total]);
    const closed = () => { setAdding(false); setEditing(null); load(); };
    const remove = guest => setDeleting(guest);
    const confirmRemove = async () => {
        if (!deleting) return;
        if (deleteBusy) return;
        setDeleteBusy(true);
        try {
            await api(`/api/guests/${deleting.id}`, {method: 'DELETE'});
            setDeleting(null);
            load();
        } catch (exception) { setError(exception.message); } finally { setDeleteBusy(false); }
    };
    const importGuests = async event => {
        event.preventDefault();
        if (!file) return setError('Pilih file template Excel atau CSV terlebih dahulu.');
        if (importBusy) return;
        setImportBusy(true);
        try {
            setError(''); setImportMessage('');
            const isExcel = /\.xlsx$/i.test(file.name);
            const xlsx = isExcel ? await fileToBase64(file) : null;
            const result = await api('/api/guests/import', {method: 'POST', body: JSON.stringify(isExcel ? {xlsx} : {csv: await file.text()})});
            setImportMessage(result.message); setFile(null); setImporting(false); load();
        } catch (exception) { setError(exception.message); } finally { setImportBusy(false); }
    };

    return <Shell>
        <div className="admin-page guests-page">
        <header className="page-header"><div><p className="eyebrow">Manajemen tamu</p><h1>Undangan</h1><p className="page-description">Tambah, perbarui, dan siapkan QR untuk setiap tamu undangan.</p></div><div className="header-actions"><a className="button secondary" href="/api/qr-sheet.pdf"><i className="bi bi-qr-code me-2"/>Cetak semua QR</a><button className="secondary" onClick={() => setImporting(value => !value)}><i className="bi bi-file-earmark-arrow-up me-2"/>Impor daftar</button><button onClick={() => setAdding(true)}><i className="bi bi-plus-lg me-2"/>Tambah undangan</button></div></header>
        {(adding || editing) && <GuestForm guest={editing} onSaved={closed} onCancel={() => { setAdding(false); setEditing(null); }}/>}
        {deleting && <><div className="modal-backdrop fade show guest-form-backdrop"/><div className="modal fade show d-block delete-guest-modal" role="dialog" aria-modal="true" aria-labelledby="delete-guest-title" onMouseDown={event => { if (event.target === event.currentTarget && !deleteBusy) setDeleting(null); }}><div className="modal-dialog modal-dialog-centered"><section className="modal-content delete-guest-content"><div className="modal-header"><h2 id="delete-guest-title">Hapus undangan?</h2><button className="btn-close" type="button" onClick={() => setDeleting(null)} disabled={deleteBusy} aria-label="Tutup"/></div><div className="modal-body"><p>Undangan <b>{deleting.guest_name}</b> akan dihapus permanen dari daftar dan QR-nya tidak dapat digunakan lagi.</p></div><div className="modal-footer"><button type="button" className="secondary" onClick={() => setDeleting(null)} disabled={deleteBusy}>Batal</button><button type="button" className="delete-confirm" onClick={confirmRemove} disabled={deleteBusy}>{deleteBusy ? <><span className="loading-spinner"/>Menghapus...</> : <><i className="bi bi-trash3 me-2"/>Hapus undangan</>}</button></div></section></div></div></>}
        {importing && <section className="panel bulk-import"><div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3"><div><p className="eyebrow">Impor massal</p><h2 className="mb-1">Template daftar tamu</h2><p className="muted mb-0">Isi template Excel lalu unggah untuk menambahkan hingga 500 undangan sekaligus.</p></div><a className="btn btn-outline-primary" href="/api/guests/template.xlsx"><i className="bi bi-file-earmark-excel me-2"/>Unduh template Excel</a></div><div className="row g-3 mb-3"><div className="col-md-7"><div className="table-responsive border rounded-3"><table className="table table-sm mb-0"><thead><tr><th>Nama</th><th>Kategori</th></tr></thead><tbody><tr><td>Contoh Nama Keluarga</td><td>Family</td></tr><tr><td>Contoh Nama Teman</td><td>Friend</td></tr></tbody></table></div></div><div className="col-md-5"><div className="alert mb-0 bulk-import-note"><b>Isi kategori dengan:</b><br/>{templateCategories.join(', ')}.<br/><span>Kolom kategori di Excel sudah punya dropdown. Jangan ubah judul kolom.</span></div></div></div><form className="row g-2 align-items-end" onSubmit={importGuests}><div className="col-md"><label className="mb-1">Pilih file Excel atau CSV</label><input className="form-control" type="file" disabled={importBusy} accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={event => setFile(event.target.files?.[0] || null)}/></div><div className="col-md-auto d-flex gap-2"><button type="submit" disabled={importBusy}>{importBusy ? <><span className="loading-spinner"/>Mengimpor...</> : <><i className="bi bi-upload me-2"/>Impor</>}</button><button type="button" className="secondary" disabled={importBusy} onClick={() => { setImporting(false); setFile(null); }}>Batal</button></div></form>{file && <p className="small mt-2 mb-0 bulk-file-name"><i className="bi bi-file-earmark-check me-1"/>{file.name} siap diimpor.</p>}</section>}
        <section className="panel guest-directory-panel">
            <div className="filters"><input placeholder="Cari nama..." value={filters.search} onChange={event => setFilters({...filters, search: event.target.value})}/><select value={filters.category} onChange={event => setFilters({...filters, category: event.target.value})}><option value="">Semua kategori</option>{categories.map(category => <option key={category}>{category}</option>)}</select><select value={filters.status} onChange={event => setFilters({...filters, status: event.target.value})}><option value="">Semua status</option><option value="Attended">Hadir</option><option value="Absent">Belum hadir</option></select></div>
            {error && <div className="alert error">{error}</div>}{importMessage && <div className="alert success-alert">{importMessage}</div>}
            {!data ? <p>Memuat undangan...</p> : <table><thead><tr><th>Nama</th><th>Kategori</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{data.data.map(guest => <tr key={guest.id}><td>{guest.guest_name}</td><td>{guest.category}</td><td><span className={'badge ' + (guest.status === 'Attended' ? 'success' : '')}>{guest.status === 'Attended' ? 'Hadir' : 'Belum hadir'}</span></td><td className="actions"><a className="btn btn-sm btn-outline-primary action-icon" href={`/api/guests/${guest.id}/qr/view`} target="_blank" rel="noreferrer" title="Lihat QR" aria-label="Lihat QR"><i className="bi bi-eye"/></a><a className="btn btn-sm btn-outline-primary action-icon" href={`/api/guests/${guest.id}/qr`} title="Unduh QR" aria-label="Unduh QR"><i className="bi bi-download"/></a><button className="btn btn-sm btn-outline-primary action-icon" title="Ubah undangan" aria-label="Ubah undangan" onClick={() => setEditing(guest)}><i className="bi bi-pencil-square"/></button><button className="btn btn-sm btn-outline-danger action-icon danger" title="Hapus undangan" aria-label="Hapus undangan" onClick={() => remove(guest)}><i className="bi bi-trash3"/></button></td></tr>)}</tbody></table>}
        </section></div>
    </Shell>;
}
