/* =====================================================================
   auth.js — Login, register, logout
   ===================================================================== */

function switchAuth(w){
  const l=w==='login';
  $('#tab-login').classList.toggle('active',l);
  $('#tab-register').classList.toggle('active',!l);
  $('#form-login').classList.toggle('hidden',!l);
  $('#form-register').classList.toggle('hidden',l);
  $('#login-error').classList.add('hidden');
}
function onRegRoleChange(){$('#reg-kelas-wrap').classList.toggle('hidden',$('#reg-role').value!=='murid')}

function handleLogin(ev){
  ev.preventDefault();
  const email=$('#login-email').value.trim().toLowerCase(),pwd=$('#login-password').value,err=$('#login-error');
  err.classList.add('hidden');
  const u=USERS.find(x=>x.email.toLowerCase()===email);
  const fail=m=>{err.textContent=m;err.classList.remove('hidden')};
  if(!u)return fail('Email tidak terdaftar');
  if(u.password!==hashPwd(pwd))return fail('Password salah');
  if(!u.active)return fail('Akun dinonaktifkan / belum diverifikasi');
  if((u.role_sistem==='guru'||u.role_sistem==='pelatih')&&PEMBINA.some(p=>p.id_user===u.id_user&&p.status_akun==='pending'))
    return fail('Menunggu verifikasi Admin');
  CURRENT_USER=u;
  if(u.role_sistem==='murid'){
    const a=ANGGOTA.find(x=>x.id_user===u.id_user&&x.jabatan!=='anggota'&&x.status_anggota==='aktif');
    if(a){CURRENT_USER.role_sistem='pengurus';CURRENT_USER._jabatan=a.jabatan;CURRENT_EKSKUL_CTX=a.id_ekskul;}
  }
  localStorage.setItem('etam_session',u.email);
  $('#login-email').value='';$('#login-password').value='';
  enterApp();
}

function handleRegister(ev){
  ev.preventDefault();
  const name=$('#reg-name').value.trim(),email=$('#reg-email').value.trim().toLowerCase();
  const wa=$('#reg-wa').value.trim(),role=$('#reg-role').value;
  const kelas=role==='murid'?$('#reg-kelas').value:null,pwd=$('#reg-password').value;
  const err=$('#reg-error'),info=$('#reg-info');err.classList.add('hidden');info.classList.add('hidden');
  const fail=m=>{err.textContent=m;err.classList.remove('hidden')};
  if(USERS.some(u=>u.email.toLowerCase()===email))return fail('Email sudah terdaftar');
  if(role==='murid'&&!kelas)return fail('Pilih kelas');
  const nu={id_user:uid('u'),nama_lengkap:name,email,password:hashPwd(pwd),no_wa:wa,role_sistem:role,kelas,active:role==='murid',created_at:new Date().toISOString()};
  USERS.push(nu);
  info.textContent=role==='murid'?'Pendaftaran berhasil. Silakan login.':'Pendaftaran berhasil. Tunggu verifikasi Admin.';
  info.classList.remove('hidden');persist();$('#form-register').reset();onRegRoleChange();
}

function logout(){
  if(!confirm('Keluar?'))return;
  stopQRScan();localStorage.removeItem('etam_session');
  CURRENT_USER=null;CURRENT_EKSKUL_CTX=null;
  $('#login-screen').style.display='flex';$('#app').classList.add('hidden');switchAuth('login');
}

function enterApp(){
  $('#login-screen').style.display='none';$('#app').classList.remove('hidden');
  renderNav();showTab(NAV[CURRENT_USER.role_sistem][0].key);
}
