import {useEffect, useRef, useState} from 'react';
import {Html5Qrcode} from 'html5-qrcode';
import Shell from '../components/Shell';
import {api, go} from '../lib/api';
import {useEventSettings} from '../lib/event-settings';

function ManualGuestSearch({onSelect}) {
    const [results, setResults] = useState([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');

    const search = async (name) => {
        name = name.trim();
        if (!name) {
            setResults([]);
            setSearched(false);
            setError('');
            return;
        }
        setError('');
        setSearched(true);
        try {
            setResults(await api('/api/check-in/search?q=' + encodeURIComponent(name)));
        } catch (exception) {
            setResults([]);
            setError(exception.message);
        }
    };

    const changeQuery = event => {
        const value = event.target.value;
        setQuery(value);
        search(value);
    };

    return <>
        <div className="manual dropdown"><label>Cari nama tamu<input className="form-control" name="guest_name" value={query} onChange={changeQuery} placeholder="Ketik nama tamu" autoComplete="off"/></label>
            {results.length > 0 && <div className="dropdown-menu show w-100 manual-results">{results.map(guest => <button className="dropdown-item" type="button" key={guest.id} onClick={() => onSelect(guest.qr_token)}><span>{guest.guest_name}</span><small>{guest.category}</small><i>→</i></button>)}</div>}
        </div>
        {!query.trim() && <p className="manual-hint">Ketik nama tamu, hasil akan muncul otomatis.</p>}
        {error && <div className="alert error">{error}</div>}
        {searched && results.length === 0 && !error && <p className="manual-empty">Nama tamu belum ditemukan. Coba nama lain.</p>}
    </>;
}

function ManualSearchModal({onClose, onSelect}) {
    return <div className="checkin-modal-backdrop" role="dialog" aria-modal="true" aria-label="Cari nama tamu">
        <div className="checkin-modal manual-search-modal">
            <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup">×</button>
            <div className="modal-flower">⌕</div>
            <p className="eyebrow">Pencarian tamu</p>
            <h2>Cari nama tamu</h2>
            <p className="modal-meta">Ketik nama untuk melihat hasil secara langsung.</p>
            <ManualGuestSearch onSelect={onSelect}/>
        </div>
    </div>;
}

function ReceptionSuccessModal({guest, secondsLeft, onClose}) {
    return <div className="checkin-modal-backdrop" role="dialog" aria-modal="true"><div className="checkin-modal checkin-success">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Tutup">×</button>
        <div className="success-state"><div className="success-sparkles" aria-hidden="true"><i>✦</i><i>✦</i><i>✦</i><i>✦</i></div><div className="success-mark">✓</div><p className="eyebrow">Selamat datang</p><h2>{guest.guest_name}</h2><div className="success-divider">✦</div><p className="success-message">Kehadiran Anda telah kami catat.<br/>Terima kasih sudah menjadi bagian dari hari bahagia kami.</p><p className="guest-closing">Selamat menikmati momen bahagia kami.</p><div className="auto-close"><span>{secondsLeft}</span><em>Kembali ke scanner dalam <b>{secondsLeft} detik</b></em></div><button className="next-scan" type="button" onClick={onClose}>Selesai <i>→</i></button></div>
    </div></div>;
}

function ReceptionConfirmModal({guest, onConfirm, onClose, busy}) {
    return <div className="checkin-modal-backdrop" role="dialog" aria-modal="true"><div className="checkin-modal">
        <button className="modal-close" type="button" onClick={onClose} disabled={busy} aria-label="Tutup">×</button>
        <div className="modal-flower">✦</div><p className="eyebrow">Selamat datang</p><h2>{guest.guest_name}</h2><p className="modal-meta">{guest.category}</p>
        <form onSubmit={onConfirm}><button className="modal-submit" disabled={busy}>{busy ? <><span className="loading-spinner"/>Mencatat kehadiran...</> : '✓ Konfirmasi kehadiran'}</button>{guest.status === 'Attended' && <p className="modal-note">Kehadiran Anda telah tercatat sebelumnya.</p>}</form>
    </div></div>;
}

export default function Scanner() {
    const scanner = useRef(null);
    const [guest, setGuest] = useState(null);
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [running, setRunning] = useState(false);
    const [cameraBusy, setCameraBusy] = useState(false);
    const [checkinBusy, setCheckinBusy] = useState(false);
    const [authUser, setAuthUser] = useState(null);
    const [manualOpen, setManualOpen] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(5);
    const settings = useEventSettings();

    useEffect(() => { api('/api/user').then(setAuthUser).catch(() => go('/login')); }, []);

    const stop = async () => {
        const activeScanner = scanner.current;
        if (activeScanner?.isScanning) await activeScanner.stop();
        if (activeScanner) {
            try { await activeScanner.clear(); } catch (_) { /* Scanner mungkin sudah dibersihkan. */ }
            scanner.current = null;
        }
        setRunning(false);
    };

    useEffect(() => () => { stop(); }, []);

    const lookup = async (code) => {
        setError('');
        setMessage('');
        try {
            await stop();
            const found = await api('/api/check-in/lookup', {method: 'POST', body: JSON.stringify({qr_token: code.trim()})});
            setToken(code.trim());
            setGuest(found);
        } catch (exception) {
            setGuest(null);
            setError(exception.message);
        }
    };

    const start = async () => {
        if (cameraBusy || running) return;
        setCameraBusy(true);
        setError('');
        const config = {fps: 10, aspectRatio: 1};
        const openCamera = async (camera) => {
            scanner.current ??= new Html5Qrcode('qr-reader');
            await scanner.current.start(camera, config, lookup, () => {});
            setRunning(true);
        };

        try {
            await openCamera({facingMode: 'environment'});
        } catch (_) {
            try {
                if (scanner.current) { try { await scanner.current.clear(); } catch (_) {} scanner.current = null; }
                const cameras = await Html5Qrcode.getCameras();
                if (!cameras.length) throw new Error('Kamera tidak ditemukan.');
                const preferredCamera = cameras.find(camera => /back|rear|environment/i.test(camera.label)) || cameras[0];
                await openCamera(preferredCamera.id);
            } catch (exception) {
                scanner.current = null;
                setRunning(false);
                const detail = `${exception?.name || ''} ${exception?.message || ''}`.toLowerCase();
                if (detail.includes('notallowed') || detail.includes('permission') || detail.includes('denied')) setError('Izin kamera belum diberikan. Klik ikon kunci pada browser, izinkan Camera, lalu coba lagi.');
                else if (detail.includes('notfound') || detail.includes('tidak ditemukan')) setError('Kamera tidak ditemukan pada perangkat ini. Gunakan pencarian nama tamu.');
                else if (detail.includes('notreadable') || detail.includes('in use')) setError('Kamera sedang dipakai aplikasi lain. Tutup Zoom, WhatsApp, atau aplikasi Camera lalu coba lagi.');
                else setError('Kamera tidak dapat dibuka. Pastikan halaman menggunakan HTTPS dan coba lagi.');
            }
        } finally { setCameraBusy(false); }
    };

    const confirm = async (event) => {
        event.preventDefault();
        if (checkinBusy) return;
        setCheckinBusy(true);
        try {
            const result = await api('/api/check-in', {method: 'POST', body: JSON.stringify({qr_token: token})});
            setMessage(result.message);
            setGuest(result.guest);
        } catch (exception) {
            setError(exception.message);
        } finally { setCheckinBusy(false); }
    };

    const closeReceptionModal = () => {
        setGuest(null);
        setMessage('');
        setError('');
        setTimeout(() => start(), 160);
    };

    const selectManualGuest = code => {
        setManualOpen(false);
        lookup(code);
    };

    useEffect(() => {
        if (!message) return undefined;
        setSecondsLeft(5);
        const counter = window.setInterval(() => setSecondsLeft(value => Math.max(1, value - 1)), 1000);
        const timer = window.setTimeout(closeReceptionModal, 5000);
        return () => { window.clearInterval(counter); window.clearTimeout(timer); };
    }, [message]);

    if (!authUser) return <div className="scanner-loading">Menyiapkan scanner...</div>;

    const manualSearch = <ManualGuestSearch onSelect={lookup}/>;
    const adminContent = <Shell><header className="page-header"><div><p className="eyebrow">Penerimaan tamu</p><h1>Scanner QR</h1></div></header><section className="scanner-grid"><div className="panel"><div id="qr-reader" className="reader"></div><div className="form-actions"><button onClick={start} disabled={running || cameraBusy}>{cameraBusy ? <><span className="loading-spinner"/>Membuka kamera...</> : 'Mulai kamera'}</button>{running && <button className="secondary" onClick={stop}>Hentikan</button>}</div>{manualSearch}</div><div className="panel">{error && <div className="alert error">{error}</div>}{guest ? <form className="checkin-card" onSubmit={confirm}><p className="eyebrow">Selamat datang</p><h2>{guest.guest_name}</h2><p>{guest.category}</p><button disabled={checkinBusy}>{checkinBusy ? <><span className="loading-spinner"/>Mencatat...</> : 'Konfirmasi kehadiran'}</button></form> : <p className="muted">Silakan arahkan QR undangan Anda ke kamera.</p>}</div></section></Shell>;
    if (authUser.role !== 'receptionist' && location.pathname !== '/reception/scanner') return adminContent;

    const scannerSparkles = [[5,9],[16,5],[28,15],[42,7],[58,12],[74,5],[89,14],[96,28],[7,31],[18,43],[31,28],[70,31],[84,42],[94,55],[4,62],[13,78],[26,91],[39,76],[62,88],[76,70],[90,82],[52,94],[48,35],[57,57]].map(([x, y], index) => ({
        id: index, x: `${x}%`, y: `${y}%`, size: `${8 + (index % 4) * 4}px`, delay: `${-(index * .37)}s`, duration: `${3.6 + (index % 4) * .7}s`,
    }));
    return <div className="reception-scanner"><div className="scanner-aurora" aria-hidden="true"/><div className="scanner-sparkles scanner-sparkles-rich" aria-hidden="true">{scannerSparkles.map(star => <i key={star.id} style={{left: star.x, top: star.y, fontSize: star.size, animationDelay: star.delay, animationDuration: star.duration}}>✦</i>)}</div><button className="reception-back" onClick={() => go('/reception')}>← Kembali</button><button className="reception-logout" onClick={() => api('/logout', {method: 'POST'}).then(() => go('/login'))}>Keluar</button><div className="reception-content"><div className="scanner-live"><span/> Live guest check-in</div><p className="eyebrow">{settings.groom_name} &amp; {settings.bride_name}</p><h1>QR Code Scanner</h1><p className="scan-here">Silakan arahkan QR undangan Anda ke kamera</p><div className="scan-frame"><div id="qr-reader" className="reader reception-reader"></div><span className="scan-beam" aria-hidden="true"/><i className="corner top-left"/><i className="corner top-right"/><i className="corner bottom-left"/><i className="corner bottom-right"/></div><div className="scan-controls"><button onClick={start} disabled={running || cameraBusy}>{cameraBusy ? <><span className="loading-spinner"/>Membuka...</> : running ? '● Kamera aktif' : '▣ Mulai scan'}</button>{running && <button className="secondary" onClick={stop}>Hentikan</button>}<button className="secondary" onClick={() => setManualOpen(true)}>⌕ Cari nama tamu</button></div><section className="reception-result">{!guest && <>{error && <div className="alert error">{error}</div>}<p className="muted">Silakan arahkan QR undangan Anda ke kamera.</p></>}</section></div>{manualOpen && <ManualSearchModal onClose={() => setManualOpen(false)} onSelect={selectManualGuest}/>} {guest && (message ? <ReceptionSuccessModal guest={guest} secondsLeft={secondsLeft} onClose={closeReceptionModal}/> : <ReceptionConfirmModal guest={guest} onConfirm={confirm} onClose={closeReceptionModal} busy={checkinBusy}/>)}</div>;
}
