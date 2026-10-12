/* =====================================================================
   storage.js — DB layer + seed
   ===================================================================== */

const DB = {
  get(k, d) {
    try {
      const s = localStorage.getItem('etam_' + k);
      return s ? JSON.parse(s) : (d ?? null);
    } catch (e) { return d ?? null; }
  },
  set(k, v) {
    try { localStorage.setItem('etam_' + k, JSON.stringify(v)); }
    catch (e) {
      console.warn('Storage penuh', e);
      showToast('Penyimpanan penuh! Hapus foto lama.', 'error');
    }
  }
};

function persist() {
  DB.set('users', USERS); DB.set('ekskul', EKSKUL); DB.set('pembina', PEMBINA);
  DB.set('anggota', ANGGOTA); DB.set('jurnal', JURNAL); DB.set('presensi', PRESENSI);
  DB.set('kas_setting', KAS_SETTING); DB.set('kas_bayar', KAS_BAYAR);
  DB.set('struktur', STRUKTUR_EKSKUL); DB.set('foto', LAPORAN_FOTO);
  DB.set('konten', KONTEN); DB.set('pengumuman', PENGUMUMAN);
  DB.set('notifikasi', NOTIFIKASI); DB.set('logs', LOGS);
  DB.set('lupa_password', LUPA_PASSWORD); DB.set('settings', APP_SETTINGS);
}

/* IndexedDB untuk foto base64 */
const FotoDB = (() => {
  const DB_NAME = 'etam_foto_db';
  const STORE = 'photos';
  let db = null;
  function init() {
    if (db) return Promise.resolve(db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = e => {
        const d = e.target.result;
        if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = e => { db = e.target.result; resolve(db); };
      req.onerror = e => reject(e.target.error);
    });
  }
  return {
    async put(id, data) {
      const d = await init();
      return new Promise((res, rej) => {
        const tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id, data, saved_at: Date.now() });
        tx.oncomplete = () => res();
        tx.onerror = e => rej(e.target.error);
      });
    },
    async get(id) {
      const d = await init();
      return new Promise((res, rej) => {
        const req = d.transaction(STORE, 'readonly').objectStore(STORE).get(id);
        req.onsuccess = e => res(e.target.result ? e.target.result.data : null);
        req.onerror = e => rej(e.target.error);
      });
    },
    async del(id) {
      const d = await init();
      return new Promise((res, rej) => {
        const tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = () => res();
        tx.onerror = e => rej(e.target.error);
      });
    },
    async clear() {
      const d = await init();
      return new Promise((res, rej) => {
        const tx = d.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).clear();
        tx.oncomplete = () => res();
        tx.onerror = e => rej(e.target.error);
      });
    }
  };
})();

function logAction(aksi, detail = {}) {
  LOGS.push({
    id_log: uid('log'),
    timestamp: new Date().toISOString(),
    user_id: CURRENT_USER ? CURRENT_USER.id_user : 'anon',
    aksi,
    detail_json: JSON.stringify(detail)
  });
  if (LOGS.length > 1000) LOGS = LOGS.slice(-1000);
  DB.set('logs', LOGS);
}

async function seedIfEmpty() {
  USERS = DB.get('users', null) || [];
  let adminExists = USERS.some(u => u.email === ADMIN_DEFAULT.email);
  if (!adminExists) {
    const adminHash = await hashPwd(ADMIN_DEFAULT_PASSWORD);
    USERS.push(Object.assign({}, ADMIN_DEFAULT, {
      password_hash: adminHash,
      created_at: new Date().toISOString(),
      last_login: ''
    }));
    DB.set('users', USERS);
  }
  // Migrasi: hash lama djb2 → tetap kompatibel (login pakai hashPwd baru, tapi cek dua-duanya di auth)

  EKSKUL = DB.get('ekskul', []) || [];
  PEMBINA = DB.get('pembina', []) || [];
  ANGGOTA = DB.get('anggota', []) || [];
  JURNAL = DB.get('jurnal', []) || [];
  PRESENSI = DB.get('presensi', []) || [];
  KAS_SETTING = DB.get('kas_setting', {}) || {};
  KAS_BAYAR = DB.get('kas_bayar', []) || [];
  STRUKTUR_EKSKUL = DB.get('struktur', {}) || {};
  LAPORAN_FOTO = DB.get('foto', []) || [];
  KONTEN = DB.get('konten', []) || [];
  PENGUMUMAN = DB.get('pengumuman', []) || [];
  NOTIFIKASI = DB.get('notifikasi', []) || [];
  LOGS = DB.get('logs', []) || [];
  LUPA_PASSWORD = DB.get('lupa_password', []) || [];
  APP_SETTINGS = Object.assign({}, DEFAULT_SETTINGS, DB.get('settings', {}) || {});
} 