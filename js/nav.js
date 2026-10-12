/* =====================================================================
   nav.js — Navigasi & Routing
   ===================================================================== */

const NAV = {
  admin: [
    { key:'dashboard', label:'Dashboard' },
    { key:'verifikasi', label:'Verifikasi' },
    { key:'ekskul', label:'Ekskul' },
    { key:'struktur', label:'Struktur' },
    { key:'pengumuman', label:'Pengumuman' },
    { key:'rekap', label:'Rekap' },
    { key:'kas', label:'Kas' },
    { key:'laporan', label:'Laporan' },
    { key:'peta', label:'Peta' },
    { key:'log', label:'Log' },
    { key:'lupapwd', label:'Lupa Pwd' },
    { key:'setting', label:'Setting' },
    { key:'faq', label:'FAQ' }
  ],
  guru: [
    { key:'dashboard', label:'Dashboard' },
    { key:'sesi', label:'Sesi' },
    { key:'jurnal', label:'Jurnal' },
    { key:'izin', label:'Izin' },
    { key:'struktur', label:'Struktur' },
    { key:'konten', label:'Konten' },
    { key:'pengumuman', label:'Pengumuman' },
    { key:'foto', label:'Foto' },
    { key:'kas', label:'Kas' },
    { key:'laporan', label:'Laporan' },
    { key:'kalender', label:'Kalender' },
    { key:'profil', label:'Profil' },
    { key:'faq', label:'FAQ' }
  ],
  pelatih: [
    { key:'dashboard', label:'Dashboard' },
    { key:'sesi', label:'Sesi' },
    { key:'jurnal', label:'Jurnal' },
    { key:'izin', label:'Izin' },
    { key:'struktur', label:'Struktur' },
    { key:'konten', label:'Konten' },
    { key:'pengumuman', label:'Pengumuman' },
    { key:'foto', label:'Foto' },
    { key:'kas', label:'Kas' },
    { key:'laporan', label:'Laporan' },
    { key:'kalender', label:'Kalender' },
    { key:'profil', label:'Profil' },
    { key:'faq', label:'FAQ' }
  ],
  pengurus: [
    { key:'dashboard', label:'Dashboard' },
    { key:'sesi', label:'Sesi' },
    { key:'jurnal', label:'Jurnal' },
    { key:'izin', label:'Izin' },
    { key:'struktur', label:'Struktur' },
    { key:'konten', label:'Konten' },
    { key:'pengumuman', label:'Pengumuman' },
    { key:'foto', label:'Foto' },
    { key:'kas', label:'Kas' },
    { key:'laporan', label:'Laporan' },
    { key:'kalender', label:'Kalender' },
    { key:'profil', label:'Profil' },
    { key:'faq', label:'FAQ' }
  ],
  murid: [
    { key:'dashboard', label:'Dashboard' },
    { key:'daftar', label:'Daftar Ekskul' },
    { key:'absen', label:'Absen' },
    { key:'riwayat', label:'Riwayat' },
    { key:'kas', label:'Kas Saya' },
    { key:'kartu', label:'Kartu Ekskul' },
    { key:'pengumuman', label:'Pengumuman' },
    { key:'konten', label:'Info & Kegiatan' },
    { key:'kalender', label:'Kalender' },
    { key:'peta', label:'Peta' },
    { key:'notifikasi', label:'Notifikasi' },
    { key:'profil', label:'Profil Saya' },
    { key:'faq', label:'FAQ' }
  ]
};

const ROUTES = {};

function renderNav() {
  const tabs = NAV[CURRENT_USER.role_sistem] || [];
  const el = document.getElementById('nav-tabs');
  if (!el) return;
  el.innerHTML = tabs.map(t =>
    `<button class="tab-btn" data-tab="${t.key}" onclick="showTab('${t.key}')">${esc(t.label)}</button>`
  ).join('');
}

function showTab(key) {
  if (!key || !ROUTES[key]) {
    const el = document.getElementById('main-content');
    if (el) el.innerHTML = `<div class="card"><div class="card-body text-center py-8" style="color:var(--text-dim)">Halaman "${esc(key)}" belum tersedia.</div></div>`;
    return;
  }
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === key));
  const el = document.getElementById('main-content');
  el.innerHTML = '';
  try {
    ROUTES[key](el);
    if (key === 'sesi' && typeof afterRenderSesi === 'function') afterRenderSesi();
    if (key === 'notifikasi') updateNotifBadge();
  } catch (e) {
    console.error(e);
    el.innerHTML = `<div class="card"><div class="card-body text-center py-8" style="color:#F87171">Error: ${esc(e.message)}</div></div>`;
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.showTab = showTab;
window.NAV = NAV;
window.ROUTES = ROUTES;