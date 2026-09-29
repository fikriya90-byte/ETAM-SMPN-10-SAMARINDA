/* =====================================================================
   init.js — Bootstrap
   ===================================================================== */

function init(){
  seedIfEmpty();
  applyTheme();
  const savedEmail=localStorage.getItem('etam_session');
  const u=savedEmail?USERS.find(x=>x.email.toLowerCase()===savedEmail.toLowerCase()):null;
  if(u&&u.active){
    CURRENT_USER=u;
    if(u.role_sistem==='murid'){
      const a=ANGGOTA.find(x=>x.id_user===u.id_user&&x.jabatan!=='anggota'&&x.status_anggota==='aktif');
      if(a){CURRENT_USER.role_sistem='pengurus';CURRENT_USER._jabatan=a.jabatan;CURRENT_EKSKUL_CTX=a.id_ekskul;}
    }
    enterApp();
  } else {
    localStorage.removeItem('etam_session');
    $('#login-screen').style.display='flex';
    $('#app').classList.add('hidden');
  }
}
init();
