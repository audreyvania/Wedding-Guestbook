import {useEffect, useRef, useState} from 'react';
import Shell from '../components/Shell';
import {api} from '../lib/api';
import {applyTheme} from '../lib/event-settings';

export default function Developer() {
    const [form, setForm] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const receptionPreview = useRef(null);
    const adminPreview = useRef(null);

    useEffect(() => { api('/api/developer/settings').then(settings => { setForm(settings); applyTheme(settings); }).catch(exception => setError(exception.message)); }, []);
    const sendPreview = frame => frame?.contentWindow?.postMessage({type: 'wedding-theme-preview', settings: form}, window.location.origin);
    useEffect(() => { if (form) { sendPreview(receptionPreview.current); sendPreview(adminPreview.current); } }, [form]);
    const updateForm = changes => {
        const next = {...form, ...changes};
        setForm(next);
        applyTheme(next);
    };
    const save = async event => {
        event.preventDefault(); if (busy) return; setMessage(''); setError(''); setBusy(true);
        try { const settings = await api('/api/developer/settings', {method: 'PUT', body: JSON.stringify(form)}); setForm(settings); applyTheme(settings); setMessage('Pengaturan tampilan berhasil disimpan.'); }
        catch (exception) { setError(exception.message); } finally { setBusy(false); }
    };

    return <Shell>{!form ? <p>Memuat pengaturan developer...</p> : <div className="admin-page developer-page"><header className="page-header"><div><p className="eyebrow">Developer tools</p><h1>Pengaturan acara</h1><p className="page-description">Atur identitas acara dan lihat dampak tema secara langsung.</p></div></header><div className="developer-layout"><form className="guest-form developer-form" onSubmit={save}><div className="developer-section-title"><i className="bi bi-heart"/><div><h2>Nama pasangan</h2><span>Ditampilkan di semua halaman acara.</span></div></div><label>Nama mempelai pria<input value={form.groom_name} onChange={event => updateForm({groom_name: event.target.value})} required/></label><label>Nama mempelai wanita<input value={form.bride_name} onChange={event => updateForm({bride_name: event.target.value})} required/></label><div className="developer-section-title theme-title"><i className="bi bi-palette2"/><div><h2>Warna tema</h2><span>Otomatis diolah agar tetap kontras dan nyaman dibaca.</span></div></div><label>Warna utama<input type="color" value={form.primary_color} onChange={event => updateForm({primary_color: event.target.value})}/></label><label>Warna aksen<input type="color" value={form.accent_color} onChange={event => updateForm({accent_color: event.target.value})}/></label>{error && <div className="alert error">{error}</div>}{message && <div className="alert success-alert">{message}</div>}<div className="form-actions"><button disabled={busy}>{busy ? <><span className="loading-spinner"/>Menyimpan tema...</> : <><i className="bi bi-check2-circle me-2"/>Simpan pengaturan</>}</button></div></form><section className="developer-live-preview"><div className="preview-heading"><p className="eyebrow">Preview langsung</p><h2>Halaman asli</h2><span>Warna dan nama berubah tanpa menyimpan pengaturan.</span></div><div className="preview-screens"><article className="live-preview"><p className="mini-label">Tampilan tamu</p><div className="live-preview-frame"><iframe ref={receptionPreview} src="/reception" title="Preview tampilan tamu" onLoad={event => sendPreview(event.currentTarget)}/></div></article><article className="live-preview"><p className="mini-label">Tampilan admin</p><div className="live-preview-frame"><iframe ref={adminPreview} src="/admin-preview" title="Preview tampilan admin" onLoad={event => sendPreview(event.currentTarget)}/></div></article></div></section></div></div>}</Shell>;
}
