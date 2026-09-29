/* =====================================================================
   auth.js — Login konvensional (email + password)
   Role otomatis terdeteksi dari akun
   ===================================================================== */

/* ---------- Switch Login <-> Register view ---------- */
function openRegister(){
  document.getElementById('view-login').classList.add('hidden');
  document.getElementById('view-register').classList.remove('hidden');
}
function closeRegister(){
  document.getElementById('view-register').classList.add('hidden');
  document.getElementById('view-login').classList.remove('hidden');
  document.getElementById('reg-error').classList.add('hidden');
  document.getElementById('reg-info').classList.add('hidden');
}

/* ---------- Login ---------- */
function handleLogin(ev){
  ev.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pwd   = document.getElementById('login-password').value;
  const err   = document.getElementById('login-error');
  err.classList.add('hidden');

  const fail = m => { err.textContent = m; err.classList.remove('hidden'); };

  const u = USERS.find(x => x.email.toLowerCase() === email);
  if (!u) return fail('Email tidak terdaftar');
  if (u.password !== hashPwd(pwd)) return fail('Password salah');
  if (!u.active) return fail('Akun belum diverifikasi / dinonaktifkan');

  if ((u.role_sistem === 'guru' || u.role_sistem === 'pelatih') &&
      PEMBINA.some(p => p.id_user === u.id_user && p.status_akun === 'pending')) {
    return fail('Akun Anda menunggu verifikasi Admin');
  }

  CURRENT_USER = u;

  // Cek apakah murid ini sebenarnya pengurus ekskul
  if (u.role_sistem === 'murid') {
    const a = ANGGOTA.find(x =>
      x.id_user === u.id_user &&
      x.jabatan !== 'anggota' &&
      x.status_anggota === 'aktif'
    );
    if (a) {
      CURRENT_USER.role_sistem = 'pengurus';
      CURRENT_USER._jabatan = a.jabatan;
      CURRENT_EKSKUL_CTX = a.id_ekskul;
    }
  }

  localStorage.setItem('etam_session', u.email);
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  enterApp();
}

/* ---------- Register (hanya siswa) ---------- */
function handleRegister(ev){
  ev.preventDefault();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const wa    = document.getElementById('reg-wa').value.trim();
  const kelas = document.getElementById('reg-kelas').value;
  const pwd   = document.getElementById('reg-password').value;
  const err   = document.getElementById('reg-error');
  const info  = document.getElementById('reg-info');
  err.classList.add('hidden');
  info.classList.add('hidden');

  const fail = m => { err.textContent = m; err.classList.remove('hidden'); };

  if (USERS.some(u => u.email.toLowerCase() === email)) return fail('Email sudah terdaftar');
  if (!kelas) return fail('Pilih kelas');

  const nu = {
    id_user: uid('u'),
    nama_lengkap: name,
    email,
    password: hashPwd(pwd),
    no_wa: wa,
    role_sistem: 'murid',
    kelas,
    active: true,
    created_at: new Date().toISOString()
  };
  USERS.push(nu);
  persist();

  info.textContent = 'Pendaftaran berhasil! Silakan login.';
  info.classList.remove('hidden');
  document.getElementById('form-register').reset();

  setTimeout(closeRegister, 1800);
}

/* ---------- Kompatibilitas dengan kode lama ---------- */
function switchAuth(w){
  if (w === 'register') openRegister();
  else closeRegister();
}
function selectLoginRole(){ /* no-op, role auto-detect */ }

/* ---------- Logout ---------- */
function logout(){
  if (!confirm('Keluar dari akun ini?')) return;
  if (typeof stopQRScan === 'function') stopQRScan();
  localStorage.removeItem('etam_session');
  CURRENT_USER = null;
  CURRENT_EKSKUL_CTX = null;
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('app').classList.add('hidden');
  closeRegister();
}

/* ---------- Masuk ke aplikasi ---------- */
function enterApp(){
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').classList.remove('hidden');
  renderNav();
  showTab(NAV[CURRENT_USER.role_sistem][0].key);
}
