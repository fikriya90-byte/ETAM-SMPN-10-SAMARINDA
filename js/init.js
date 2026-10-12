/* =====================================================================
   init.js — Bootstrap
   ===================================================================== */

async function loadFotosFromDB() {
  for (const f of LAPORAN_FOTO) {
    if (!f.file_url || f.file_url.includes('PLACEHOLDER')) {
      try {
        const data = await FotoDB.get(f.id_foto);
        if (data) f.file_url = data;
      } catch(e) {}
    }
  }
}

async function init() {
  await seedIfEmpty();
  applyTheme();

  const saved = localStorage.getItem('etam_session');
  const u = saved ? USERS.find(x =>
    (x.email && x.email.toLowerCase() === saved.toLowerCase()) || x.nis === saved
  ) : null;

  if (u && u.active) {
    CURRENT_USER = Object.assign({}, u);
    if (CURRENT_USER.role_sistem === 'murid') {
      const a = ANGGOTA.find(x => x.id_user === CURRENT_USER.id_user && x.jabatan !== 'anggota' && x.status_anggota === 'aktif');
      if (a) {
        CURRENT_USER.role_sistem = 'pengurus';
        CURRENT_USER._jabatan = a.jabatan;
        CURRENT_EKSKUL_CTX = a.id_ekskul;
      }
    }
    await loadFotosFromDB();
    enterApp();
  } else {
    localStorage.removeItem('etam_session');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').classList.add('hidden');
    selectLoginRole('murid');
  }
  const y = document.getElementById('brand-year');
  if (y) y.textContent = new Date().getFullYear();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}