import {useState} from 'react';
import {api, go} from '../lib/api';

export default function Login() {
    const [form, setForm] = useState({email: '', password: ''});
    const [role, setRole] = useState('receptionist');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const selected = role === 'admin';

    const submit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
            const result = await api('/login', {method: 'POST', body: JSON.stringify(form)});
            go(result.user.role === 'receptionist' ? '/reception' : '/');
        } catch (exception) {
            setError(exception.message);
        } finally {
            setBusy(false);
        }
    };

    return <div className="login-page"><div className="login-layout">
        <section className="login-intro">
            <p className="eyebrow">Raihan & Debby</p>
            <h1>Wedding<br/>Guestbook</h1>
            <p>Satu aplikasi untuk kelola undangan dan mencatat kedatangan tamu pada hari acara.</p>
            <div className="login-steps"><span>1. Kelola undangan</span><span>2. Bagikan QR unik</span><span>3. Scan saat tamu tiba</span></div>
        </section>
        <form className="login-card" onSubmit={submit}>
            <div><p className="eyebrow">Akses panitia</p><h2>Masuk ke sistem</h2><p>Pilih peran kerja Anda terlebih dahulu.</p></div>
            <div className="role-picker">
                <button type="button" className={selected ? 'role-option active' : 'role-option'} onClick={() => setRole('admin')}><strong>Admin acara</strong><span>Kelola undangan, QR, dan laporan</span></button>
                <button type="button" className={!selected ? 'role-option active' : 'role-option'} onClick={() => setRole('receptionist')}><strong>Penerima tamu</strong><span>Scan QR dan konfirmasi kedatangan</span></button>
            </div>
            <p className="role-hint">{selected ? 'Akun admin akan masuk ke dashboard.' : 'Akun penerima tamu akan langsung masuk ke scanner.'}</p>
            {error && <div className="alert error">{error}</div>}
            <label>Email<input type="email" required value={form.email} onChange={event => setForm({...form, email: event.target.value})}/></label>
            <label>Kata sandi<input type="password" required value={form.password} onChange={event => setForm({...form, password: event.target.value})}/></label>
            <button disabled={busy}>{busy ? 'Memproses...' : selected ? 'Masuk sebagai admin' : 'Masuk ke scanner'}</button>
            <small className="login-note">Peran akun tetap diverifikasi oleh sistem saat masuk.</small>
        </form>
    </div></div>;
}
