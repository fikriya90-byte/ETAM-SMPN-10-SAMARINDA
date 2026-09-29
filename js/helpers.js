/* =====================================================================
   helpers.js — Utility, lookup, theme
   ===================================================================== */

/* DOM & string */
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>(p||'id')+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const hashPwd=p=>{let h=5381;for(let i=0;i<p.length;i++)h=((h<<5)+h+p.charCodeAt(i))|0;return 'h'+(h>>>0).toString(36)};
const fmtRp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const todayStr=()=>new Date().toISOString().split('T')[0];

/* Toast */
function showToast(msg,type='success'){
  const c=$('#toast-container');if(!c)return;
  const t=document.createElement('div');
  t.className='toast text-white px-4 py-3 rounded-xl shadow-lg text-sm';
  t.style.background=type==='success'?'#16A34A':type==='error'?'#DC2626':'#CA8A04';
  t.innerHTML=`<b>${type==='success'?'OK':type==='error'?'Gagal':'Info'}:</b> ${esc(msg)}`;
  c.appendChild(t);setTimeout(()=>t.remove(),3000);
}

/* Lookup */
const userById=id=>USERS.find(u=>u.id_user===id);
const ekskulById=id=>EKSKUL.find(e=>e.id_ekskul===id);
const userEkskulIds=id=>PEMBINA.filter(p=>p.id_user===id&&p.status_akun==='aktif').map(p=>p.id_ekskul);
const anggotaAktifOf=idEkskul=>ANGGOTA.filter(a=>a.id_ekskul===idEkskul&&a.status_anggota==='aktif');
const muridOfEkskul=idEkskul=>anggotaAktifOf(idEkskul).map(a=>userById(a.id_user)).filter(Boolean);
const ketuaOf=idEkskul=>{const k=ANGGOTA.find(a=>a.id_ekskul===idEkskul&&a.jabatan==='ketua_ekskul'&&a.status_anggota==='aktif');return k?userById(k.id_user):null};

/* Cek apakah user boleh lihat status bayar seluruh anggota */
function canSeeAllIuran(idEkskul){
  if(!CURRENT_USER)return false;
  const r=CURRENT_USER.role_sistem;
  if(r==='admin')return true;
  if(r==='guru'||r==='pelatih')return userEkskulIds(CURRENT_USER.id_user).includes(idEkskul);
  if(r==='pengurus'){
    const a=ANGGOTA.find(x=>x.id_user===CURRENT_USER.id_user&&x.id_ekskul===idEkskul&&x.status_anggota==='aktif');
    return !!a&&a.jabatan!=='anggota';
  }
  return false;
}

/* Iuran helpers */
function getIuranCfg(idEkskul){
  return IURAN_CONFIG[idEkskul]||{aktif:false,jumlah:0,mode:'mingguan',jumlah_periode:4,keterangan:''};
}
function getPeriodeList(idEkskul,bulan,tahun){
  const cfg=getIuranCfg(idEkskul);
  if(cfg.mode==='pertemuan'){
    const bulanIdx=BULAN.indexOf(bulan);
    const js=JURNAL.filter(j=>j.id_ekskul===idEkskul&&
      new Date(j.tanggal+'T00:00:00').getMonth()===bulanIdx&&
      new Date(j.tanggal+'T00:00:00').getFullYear()===tahun)
      .sort((a,b)=>a.tanggal.localeCompare(b.tanggal));
    if(js.length)return js.map((j,i)=>({idx:i+1,label:'P'+(i+1),id_pertemuan:j.id_pertemuan,tanggal:j.tanggal}));
  }
  return Array.from({length:cfg.jumlah_periode},(_,i)=>({idx:i+1,label:'M'+(i+1),id_pertemuan:null,tanggal:null}));
}
function findBayar(id_user,id_ekskul,bulan,tahun,periode_label){
  return KAS_BAYAR.find(b=>b.id_user===id_user&&b.id_ekskul===id_ekskul&&b.bulan===bulan&&b.tahun===tahun&&b.periode_label===periode_label);
}

/* CSV */
function downloadCSV(rows,filename){
  const esc=v=>{const s=String(v??'');return /[,"\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
  const csv=rows.map(r=>r.map(esc).join(',')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('CSV diunduh','success');
}

/* Theme */
let themeMode=localStorage.getItem('themeMode')||'auto';
function applyTheme(){
  let actual=themeMode;
  if(themeMode==='auto')actual=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  document.documentElement.dataset.theme=actual;
  const label=themeMode==='light'?'Terang':themeMode==='dark'?'Gelap':'Otomatis';
  ['','-app'].forEach(sfx=>{const el=$('#theme-label'+sfx);if(el)el.textContent=label});
}
function cycleTheme(){
  themeMode=themeMode==='auto'?'dark':themeMode==='dark'?'light':'auto';
  localStorage.setItem('themeMode',themeMode);applyTheme();
}
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(themeMode==='auto')applyTheme()});

/* Modal */
window.closeModal=()=>{$('#modal-root').innerHTML='';stopQRScan();};
