import 'dotenv/config';
import bcrypt from 'bcryptjs';
import express from 'express';
import session from 'express-session';
import mysql from 'mysql2/promise';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const app = express();
const db = mysql.createPool({ host: process.env.DB_HOST || '127.0.0.1', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USERNAME || 'root', password: process.env.DB_PASSWORD || '', database: process.env.DB_DATABASE || 'wedding_guestbook', waitForConnections: true });
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const user = ({ id, name, email, role }) => ({ id, name, email, role });
const auth = (req, res, next) => req.session.user ? next() : res.status(401).json({ message: 'Silakan masuk terlebih dahulu.' });
const role = (...roles) => (req, res, next) => roles.includes(req.session.user?.role) || req.session.user?.role === 'developer' ? next() : res.status(403).json({ message: 'Anda tidak memiliki akses ke halaman ini.' });
const text = value => typeof value === 'string' && value.trim() ? value.trim() : null;
const fields = body => {
    const guest_name = text(body.guest_name), category = text(body.category);
    if (!guest_name || !category || guest_name.length > 255 || category.length > 80) throw Object.assign(new Error('Nama undangan dan kategori wajib diisi.'), { status: 422 });
    return { guest_name, category };
};
const csvRow = line => {
    const values = []; let value = '', quoted = false;
    for (let index = 0; index < line.length; index += 1) {
        const character = line[index];
        if (character === '"' && quoted && line[index + 1] === '"') { value += '"'; index += 1; }
        else if (character === '"') quoted = !quoted;
        else if (character === ',' && !quoted) { values.push(value.trim()); value = ''; }
        else value += character;
    }
    values.push(value.trim()); return values;
};
const importGuests = rows => {
    if (!Array.isArray(rows) || rows.length < 2) throw Object.assign(new Error('File harus berisi header dan minimal satu tamu.'), { status: 422 });
    const header = (rows.shift() || []).map(value => String(value || '').trim().toLowerCase());
    if (header[0] !== 'nama' || header[1] !== 'kategori') throw Object.assign(new Error('Gunakan template dengan kolom Nama dan Kategori.'), { status: 422 });
    const filledRows = rows.filter(row => String(row?.[0] || '').trim() || String(row?.[1] || '').trim());
    if (!filledRows.length) throw Object.assign(new Error('Isi minimal satu nama tamu pada template.'), { status: 422 });
    if (filledRows.length > 500) throw Object.assign(new Error('Maksimal 500 tamu untuk sekali impor.'), { status: 422 });
    const guests = filledRows.map((row, index) => {
        const [guest_name, category] = row;
        try { return fields({guest_name: String(guest_name || ''), category: String(category || '')}); }
        catch (_) { throw Object.assign(new Error(`Data pada baris ${index + 2} belum lengkap. Isi Nama dan Kategori.`), { status: 422 }); }
    });
    // Satu nama adalah satu undangan. Jika file mengandung nama yang sama,
    // baris terakhir menang agar hasil impor selalu konsisten.
    return [...guests.reduce((unique, guest) => unique.set(guest.guest_name.toLocaleLowerCase('id-ID'), guest), new Map()).values()];
};
const csvGuests = csv => {
    if (typeof csv !== 'string' || csv.length > 250000) throw Object.assign(new Error('File CSV tidak valid atau terlalu besar.'), { status: 422 });
    return importGuests(csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim()).map(csvRow));
};
const excelGuests = file => {
    if (typeof file !== 'string' || file.length > 1_500_000) throw Object.assign(new Error('File Excel tidak valid atau terlalu besar.'), { status: 422 });
    let workbook;
    try { workbook = XLSX.read(Buffer.from(file, 'base64'), { type: 'buffer' }); }
    catch (_) { throw Object.assign(new Error('File Excel tidak dapat dibaca.'), { status: 422 }); }
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw Object.assign(new Error('File Excel tidak memiliki lembar data.'), { status: 422 });
    return importGuests(XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false }).slice(4));
};

async function initialise() {
    await db.query("CREATE TABLE IF NOT EXISTS users (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, role ENUM('admin','receptionist','developer') NOT NULL DEFAULT 'admin', password VARCHAR(255) NOT NULL, created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL)");
    await db.query("ALTER TABLE users MODIFY role ENUM('admin','receptionist','developer') NOT NULL DEFAULT 'admin'");
    await db.query("CREATE TABLE IF NOT EXISTS tamu_undangan (id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY, guest_name VARCHAR(255) NOT NULL, category VARCHAR(80) NOT NULL DEFAULT 'Other', qr_token CHAR(36) NOT NULL UNIQUE, check_in_time DATETIME NULL, status ENUM('Attended','Absent') NOT NULL DEFAULT 'Absent', created_at TIMESTAMP NULL, updated_at TIMESTAMP NULL)");
    await db.query("CREATE TABLE IF NOT EXISTS event_settings (id TINYINT UNSIGNED PRIMARY KEY, groom_name VARCHAR(100) NOT NULL, bride_name VARCHAR(100) NOT NULL, primary_color VARCHAR(7) NOT NULL, accent_color VARCHAR(7) NOT NULL, updated_at TIMESTAMP NULL)");
    await db.query("INSERT IGNORE INTO event_settings (id,groom_name,bride_name,primary_color,accent_color,updated_at) VALUES (1,'Raihan','Debby','#a54e72','#f5b7d1',NOW())");
    const accounts = [[process.env.ADMIN_NAME || 'Wedding Admin', process.env.ADMIN_EMAIL || 'admin@test.com', process.env.ADMIN_PASSWORD || 'password', 'admin'], [process.env.RECEPTIONIST_NAME || 'Penerima Tamu', process.env.RECEPTIONIST_EMAIL || 'tamu@test.com', process.env.RECEPTIONIST_PASSWORD || 'password', 'receptionist'], ['Developer', 'dev@test.com', 'password', 'developer']];
    for (const [name, email, password, accountRole] of accounts) {
        const [found] = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (!found.length) await db.query('INSERT INTO users (name,email,role,password,created_at,updated_at) VALUES (?,?,?,?,NOW(),NOW())', [name, email, accountRole, await bcrypt.hash(password, 12)]);
    }
}
await initialise();

app.use(express.json({ limit: '2mb' }));
app.use(session({ secret: process.env.SESSION_SECRET || 'replace-this-session-secret', resave: false, saveUninitialized: false, cookie: { maxAge: 7_200_000 } }));
app.get('/api/public/settings', wrap(async (_req, res) => { const [[settings]] = await db.query('SELECT groom_name,bride_name,primary_color,accent_color FROM event_settings WHERE id=1'); res.json(settings); }));
app.post('/login', wrap(async (req, res) => {
    const email = text(req.body.email), password = text(req.body.password);
    if (!email || !password) return res.status(422).json({ message: 'Email dan kata sandi wajib diisi.' });
    const [rows] = await db.query('SELECT id,name,email,role,password FROM users WHERE email = ? LIMIT 1', [email]);
    if (!rows[0] || !(await bcrypt.compare(password, rows[0].password))) return res.status(422).json({ message: 'Email atau kata sandi tidak valid.' });
    req.session.user = user(rows[0]); res.json({ user: req.session.user });
}));
app.post('/logout', auth, (req, res) => req.session.destroy(() => res.json({ message: 'Anda telah keluar.' })));
app.get('/api/user', auth, (req, res) => res.json(req.session.user));
app.get('/api/developer/settings', auth, role('developer'), wrap(async (_req, res) => { const [[settings]] = await db.query('SELECT groom_name,bride_name,primary_color,accent_color FROM event_settings WHERE id=1'); res.json(settings); }));
app.put('/api/developer/settings', auth, role('developer'), wrap(async (req, res) => {
    const groom_name = text(req.body.groom_name), bride_name = text(req.body.bride_name), primary_color = text(req.body.primary_color), accent_color = text(req.body.accent_color);
    if (!groom_name || !bride_name || groom_name.length > 100 || bride_name.length > 100 || !/^#[0-9a-f]{6}$/i.test(primary_color || '') || !/^#[0-9a-f]{6}$/i.test(accent_color || '')) return res.status(422).json({ message: 'Nama pasangan dan warna tema harus diisi dengan benar.' });
    await db.query('UPDATE event_settings SET groom_name=?,bride_name=?,primary_color=?,accent_color=?,updated_at=NOW() WHERE id=1', [groom_name, bride_name, primary_color, accent_color]);
    const [[settings]] = await db.query('SELECT groom_name,bride_name,primary_color,accent_color FROM event_settings WHERE id=1'); res.json(settings);
}));

app.get('/api/dashboard', auth, role('admin', 'receptionist'), wrap(async (_req, res) => {
    const [[stats]] = await db.query("SELECT COUNT(*) invitations, SUM(status='Attended') attended_invitations, SUM(status='Absent') absent_invitations FROM tamu_undangan");
    const [recent_checkins] = await db.query("SELECT * FROM tamu_undangan WHERE status='Attended' ORDER BY check_in_time DESC LIMIT 8");
    res.json({ stats: { invitations: Number(stats.invitations), attended_invitations: Number(stats.attended_invitations || 0), absent_invitations: Number(stats.absent_invitations || 0) }, recent_checkins });
}));
app.get('/api/guests', auth, role('admin', 'receptionist'), wrap(async (req, res) => {
    const where = [], values = [];
    if (req.query.search) { where.push('guest_name LIKE ?'); values.push(`%${req.query.search}%`); }
    if (req.query.category) { where.push('category = ?'); values.push(req.query.category); }
    if (req.query.status) { where.push('status = ?'); values.push(req.query.status); }
    const filter = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    const [[count]] = await db.query(`SELECT COUNT(*) total FROM tamu_undangan${filter}`, values);
    const page = Math.max(1, Number(req.query.page) || 1), per_page = 12;
    const [data] = await db.query(`SELECT * FROM tamu_undangan${filter} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...values, per_page, (page - 1) * per_page]);
    const total = Number(count.total); res.json({ data, current_page: page, per_page, total, last_page: Math.max(1, Math.ceil(total / per_page)) });
}));
app.get('/api/guests/categories', auth, role('admin', 'receptionist'), wrap(async (_req, res) => {
    const [rows] = await db.query('SELECT DISTINCT category FROM tamu_undangan WHERE category IS NOT NULL AND TRIM(category) <> \'\' ORDER BY category');
    res.json(rows.map(row => row.category));
}));
app.get('/api/reception/guests', auth, role('receptionist'), wrap(async (req, res) => {
    const search = text(req.query.search), values = search ? [`%${search}%`] : [];
    const filter = search ? ' WHERE guest_name LIKE ?' : '';
    const [[count]] = await db.query(`SELECT COUNT(*) total FROM tamu_undangan${filter}`, values);
    const [data] = await db.query(`SELECT * FROM tamu_undangan${filter} ORDER BY created_at DESC LIMIT 12`, values);
    const total = Number(count.total); res.json({ data, current_page: 1, per_page: 12, total, last_page: Math.max(1, Math.ceil(total / 12)) });
}));
app.post('/api/guests', auth, role('admin'), wrap(async (req, res) => {
    const { guest_name, category } = fields(req.body);
    const [[existing]] = await db.query('SELECT id FROM tamu_undangan WHERE LOWER(TRIM(guest_name)) = LOWER(TRIM(?)) ORDER BY id LIMIT 1', [guest_name]);
    if (existing) {
        await db.query('UPDATE tamu_undangan SET guest_name=?,category=?,updated_at=NOW() WHERE id=?', [guest_name, category, existing.id]);
        const [[guest]] = await db.query('SELECT * FROM tamu_undangan WHERE id=?', [existing.id]);
        return res.json(guest);
    }
    const qr_token = randomUUID();
    const [result] = await db.query('INSERT INTO tamu_undangan (guest_name,category,qr_token,created_at,updated_at) VALUES (?,?,?,NOW(),NOW())', [guest_name, category, qr_token]);
    const [[guest]] = await db.query('SELECT * FROM tamu_undangan WHERE id=?', [result.insertId]); res.status(201).json(guest);
}));
app.get('/api/guests/template.csv', auth, role('admin'), (_req, res) => res.attachment('template-daftar-tamu.csv').type('text/csv').send('\uFEFFNama,Kategori\nContoh Nama,Family\nContoh Teman,Friend\n'));
app.get('/api/guests/template.xlsx', auth, role('admin'), (_req, res) => res.download(join(root, 'public', 'template-daftar-tamu.xlsx'), 'template-daftar-tamu.xlsx'));
app.post('/api/guests/import', auth, role('admin'), wrap(async (req, res) => {
    const guests = req.body.xlsx ? excelGuests(req.body.xlsx) : csvGuests(req.body.csv), connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        let created = 0, updated = 0;
        for (const guest of guests) {
            const [[existing]] = await connection.query('SELECT id FROM tamu_undangan WHERE LOWER(TRIM(guest_name)) = LOWER(TRIM(?)) ORDER BY id LIMIT 1', [guest.guest_name]);
            if (existing) {
                await connection.query('UPDATE tamu_undangan SET guest_name=?,category=?,updated_at=NOW() WHERE id=?', [guest.guest_name, guest.category, existing.id]);
                updated += 1;
            } else {
                await connection.query('INSERT INTO tamu_undangan (guest_name,category,qr_token,created_at,updated_at) VALUES (?,?,?,NOW(),NOW())', [guest.guest_name, guest.category, randomUUID()]);
                created += 1;
            }
        }
        await connection.commit(); res.status(201).json({message: `Impor selesai: ${created} undangan baru, ${updated} undangan diperbarui.`, count: guests.length, created, updated});
    } catch (error) { await connection.rollback(); throw error; } finally { connection.release(); }
}));
app.get('/api/guests/:id', auth, role('admin'), asyncGuest((req, guest, res) => res.json(guest)));
app.put('/api/guests/:id', auth, role('admin'), wrap(async (req, res) => {
    const { guest_name, category } = fields(req.body); const [result] = await db.query('UPDATE tamu_undangan SET guest_name=?,category=?,updated_at=NOW() WHERE id=?', [guest_name, category, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Undangan tidak ditemukan.' }); const [[guest]] = await db.query('SELECT * FROM tamu_undangan WHERE id=?', [req.params.id]); res.json(guest);
}));
app.delete('/api/guests/:id', auth, role('admin'), wrap(async (req, res) => { const [result] = await db.query('DELETE FROM tamu_undangan WHERE id=?', [req.params.id]); result.affectedRows ? res.status(204).end() : res.status(404).json({ message: 'Undangan tidak ditemukan.' }); }));

app.get('/api/check-in/search', auth, role('admin', 'receptionist'), wrap(async (req, res) => { const q = text(req.query.q); if (!q) return res.json([]); const [guests] = await db.query('SELECT * FROM tamu_undangan WHERE guest_name LIKE ? ORDER BY guest_name LIMIT 8', [`%${q}%`]); res.json(guests); }));
app.post('/api/check-in/lookup', auth, role('admin', 'receptionist'), asyncGuest((req, guest, res) => res.json(guest), 'qr_token'));
app.post('/api/check-in', auth, role('admin', 'receptionist'), wrap(async (req, res) => { const token = text(req.body.qr_token); const [[guest]] = await db.query('SELECT * FROM tamu_undangan WHERE qr_token=?', [token]); if (!guest) return res.status(404).json({ message: 'QR undangan tidak ditemukan.' }); await db.query("UPDATE tamu_undangan SET status='Attended',check_in_time=NOW(),updated_at=NOW() WHERE id=?", [guest.id]); const [[updated]] = await db.query('SELECT * FROM tamu_undangan WHERE id=?', [guest.id]); res.json({ message: `Kehadiran ${updated.guest_name} berhasil dicatat.`, guest: updated }); }));

function asyncGuest(callback, lookup = 'id') { return wrap(async (req, res) => { const key = lookup === 'id' ? req.params.id : text(req.body.qr_token); const [[guest]] = await db.query(`SELECT * FROM tamu_undangan WHERE ${lookup}=?`, [key]); return guest ? await callback(req, guest, res) : res.status(404).json({ message: lookup === 'qr_token' ? 'QR undangan tidak ditemukan.' : 'Undangan tidak ditemukan.' }); }); }
async function allGuests(order = 'guest_name ASC') { const [guests] = await db.query(`SELECT * FROM tamu_undangan ORDER BY ${order}`); return guests; }
function pdf(res, filename, writer) { res.attachment(filename).type('application/pdf'); const doc = new PDFDocument({ margin: 42, size: 'A4' }); doc.pipe(res); writer(doc); doc.end(); }
app.get('/api/guests/:id/qr/view', auth, role('admin'), asyncGuest(async (_req, guest, res) => res.type('png').send(await QRCode.toBuffer(guest.qr_token, { width: 680, margin: 2 }))));
app.get('/api/guests/:id/qr', auth, role('admin'), asyncGuest(async (_req, guest, res) => res.attachment(`qr-${guest.guest_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`).type('png').send(await QRCode.toBuffer(guest.qr_token, { width: 340, margin: 1 }))));
app.get('/api/reports.csv', auth, role('admin'), wrap(async (_req, res) => { res.attachment('rekap-kehadiran.csv').type('text/csv'); res.write('\uFEFFNama,Kategori,Status,Waktu Check-in\n'); (await allGuests()).forEach(g => res.write([g.guest_name, g.category, g.status, g.check_in_time || ''].map(v => `"${String(v).replaceAll('"', '""')}"`).join(',') + '\n')); res.end(); }));
app.get('/api/reports.pdf', auth, role('admin'), wrap(async (_req, res) => { const guests = await allGuests('check_in_time DESC'); pdf(res, 'rekap-kehadiran.pdf', doc => { doc.fillColor('#8c3d61').fontSize(22).text('Rekap Kehadiran').moveDown(); doc.fillColor('#30242d').fontSize(10); guests.forEach(g => doc.text(`${g.guest_name}  |  ${g.category}  |  ${g.status}  |  ${g.check_in_time || '-'}`).moveDown(.45)); }); }));
app.get('/api/qr-sheet.pdf', auth, role('admin'), wrap(async (_req, res) => { const guests = await allGuests(), codes = await Promise.all(guests.map(g => QRCode.toDataURL(g.qr_token, { width: 150, margin: 1 }))); pdf(res, 'qr-undangan.pdf', doc => { doc.fillColor('#8c3d61').fontSize(20).text('Wedding Guestbook — Kartu QR Undangan'); guests.forEach((g, i) => { if (i && i % 6 === 0) doc.addPage(); const y = 75 + (i % 6) * 115; doc.image(Buffer.from(codes[i].split(',')[1], 'base64'), 46, y, { width: 88 }); doc.fillColor('#30242d').fontSize(13).text(g.guest_name, 150, y + 22).fontSize(10).text(g.category, 150, y + 44); }); }); }));

const dist = join(root, 'dist'); app.use(express.static(existsSync(dist) ? dist : join(root, 'public'))); app.get('/{*splat}', (_req, res) => existsSync(join(dist, 'index.html')) ? res.sendFile(join(dist, 'index.html')) : res.status(503).send('Frontend belum dibangun. Jalankan npm run build atau npm run dev.')); app.use((error, _req, res, _next) => { console.error(error); res.status(error.status || 500).json({ message: error.message || 'Terjadi kesalahan pada server.' }); });
app.listen(Number(process.env.PORT || 3000), () => console.log(`Wedding Guestbook berjalan di http://localhost:${process.env.PORT || 3000}`));
