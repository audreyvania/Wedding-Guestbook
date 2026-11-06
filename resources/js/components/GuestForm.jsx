import {useState} from 'react';
import {api} from '../lib/api';

const blankGuest = {guest_name: '', category: 'Other'};
const categories = ['Family', 'Friend', 'Colleague', 'Other'];

export default function GuestForm({guest, onSaved, onCancel}) {
    const [form, setForm] = useState(guest || blankGuest);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const save = async (event) => {
        event.preventDefault();
        if (busy) return;
        setError('');
        setBusy(true);
        try {
            const path = guest ? `/api/guests/${guest.id}` : '/api/guests';
            await api(path, {method: guest ? 'PUT' : 'POST', body: JSON.stringify(form)});
            onSaved();
        } catch (exception) {
            setError(exception.message);
        } finally { setBusy(false); }
    };

    return <>
        <div className="modal-backdrop fade show guest-form-backdrop"/>
        <div className="modal fade show d-block guest-form-modal" role="dialog" aria-modal="true" aria-labelledby="guest-form-title" onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}>
            <div className="modal-dialog modal-dialog-centered">
                <form className="modal-content guest-form guest-form-content" onSubmit={save}>
                    <div className="modal-header"><h2 id="guest-form-title">{guest ? 'Ubah undangan' : 'Tambah undangan'}</h2><button className="btn-close" type="button" onClick={onCancel} disabled={busy} aria-label="Tutup"/></div>
                    <div className="modal-body"><div className="guest-form-fields">{error && <div className="alert error">{error}</div>}<label>Nama undangan<input required autoFocus value={form.guest_name} onChange={event => setForm({...form, guest_name: event.target.value})}/></label><label>Kategori<select value={form.category} onChange={event => setForm({...form, category: event.target.value})}>{categories.map(category => <option key={category}>{category}</option>)}</select></label></div></div>
                    <div className="modal-footer"><button type="button" className="secondary" onClick={onCancel} disabled={busy}>Batal</button><button type="submit" disabled={busy}>{busy ? <><span className="loading-spinner"/>Menyimpan...</> : <><i className="bi bi-check2-circle me-2"/>Simpan</>}</button></div>
                </form>
            </div>
        </div>
    </>;
}
