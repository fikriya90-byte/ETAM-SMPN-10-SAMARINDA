/* =====================================================================
   init.js — Bootstrap (FIXED)
   ===================================================================== */

function init(){
  seedIfEmpty();
  applyTheme();

  const savedEmail = localStorage.getItem('etam_session');
  const u = savedEmail
    ? USERS.find(x => x.email.toLowerCase() === savedEmail.toLowerCase())
    : null;

  if (u && u.active) {
    // Shallow copy supaya data USERS tidak tercemar
    CURRENT_USER = { ...u };

    if (CURRENT_USER.role_sistem === 'murid') {
      const a = ANGGOTA.find(x =>
        x.id_user === CURRENT_USER.id_user &&
        x.jabatan !== 'anggota' &&
        x.status_anggota === 'aktif'
      );
      if (a) {
        CURRENT_USER.role_sistem = 'pengurus';
        CURRENT_USER._jabatan = a.jabatan;
        CURRENT_EKSKUL_CTX = a.id_ekskul;
      }
    }

    if (CURRENT_USER.role_sistem === 'pengurus') {
      const a = ANGGOTA.find(x =>
        x.id_user === CURRENT_USER.id_user &&
        x.jabatan !== 'anggota' &&
        x.status_anggota === 'aktif'
      );
      if (a) {
        CURRENT_USER._jabatan = a.jabatan;
        CURRENT_EKSKUL_CTX = a.id_ekskul;
      } else {
        CURRENT_USER.role_sistem = 'murid';
        CURRENT_USER._jabatan = null;
        CURRENT_EKSKUL_CTX = null;
      }
    }

    enterApp();
  } else {
    localStorage.removeItem('etam_session');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').classList.add('hidden');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
