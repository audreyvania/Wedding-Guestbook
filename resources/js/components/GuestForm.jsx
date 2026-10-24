import {useState} from 'react';
import {api} from '../lib/api';

const blankGuest = {guest_name: '', category: 'Other'};
const categories = ['Family', 'Friend', 'Colleague', 'Other'];

export default function GuestForm({guest, onSaved, onCancel}) {
    const [form, setForm] = useState(guest || blankGuest);
    const [error, setError] = useState('');

    const save = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const path = guest ? `/api/guests/${guest.id}` : '/api/guests';
            await api(path, {method: guest ? 'PUT' : 'POST', body: JSON.stringify(form)});
            onSaved();
        } catch (exception) {
            setError(exception.message);
        }
    };

    return <form className="guest-form" onSubmit={save}>
        <h2>{guest ? 'Ubah undangan' : 'Tambah undangan'}</h2>
        {error && <div className="alert error">{error}</div>}
        <label>Nama undangan<input required value={form.guest_name} onChange={event => setForm({...form, guest_name: event.target.value})}/></label>
        <label>Kategori<select value={form.category} onChange={event => setForm({...form, category: event.target.value})}>{categories.map(category => <option key={category}>{category}</option>)}</select></label>
        <div className="form-actions"><button>Simpan</button><button type="button" className="secondary" onClick={onCancel}>Batal</button></div>
    </form>;
}
