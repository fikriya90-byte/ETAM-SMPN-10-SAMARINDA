/* =====================================================================
   nav.js — Menu navigasi & dispatcher
   ===================================================================== */

const NAV={
  admin:[
    {key:'dashboard',label:'Dashboard',icon:'M3 12l9-9 9 9M5 10v10h14V10'},
    {key:'verifikasi',label:'Verifikasi',icon:'M9 12l2 2 4-4M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z'},
    {key:'ekskul',label:'Master Ekskul',icon:'M4 4h16v4H4zM4 10h16v4H4zM4 16h16v4H4z'},
    {key:'kas',label:'Kas & Iuran',icon:'M2 6h20v12H2zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'},
    {key:'rekap',label:'Rekap',icon:'M3 3v18h18M7 12h3v6H7zM12 8h3v10h-3zM17 5h3v13h-3z'},
    {key:'laporan',label:'Cetak',icon:'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z'},
    {key:'setting',label:'Pengaturan',icon:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'}
  ],
  guru:[
    {key:'dashboard',label:'Dashboard',icon:'M3 12l9-9 9 9M5 10v10h14V10'},
    {key:'pendaftar',label:'Pendaftar',icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'},
    {key:'sesi',label:'Sesi',icon:'M9 11l3 3L22 4'},
    {key:'jurnal',label:'Jurnal',icon:'M4 4h16v16H4z'},
    {key:'izin',label:'Izin/Sakit',icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'},
    {key:'kas',label:'Kas & Iuran',icon:'M2 6h20v12H2zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'},
    {key:'laporan',label:'Cetak',icon:'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z'}
  ],
  pelatih:[
    {key:'dashboard',label:'Dashboard',icon:'M3 12l9-9 9 9M5 10v10h14V10'},
    {key:'pendaftar',label:'Pendaftar',icon:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'},
    {key:'sesi',label:'Sesi',icon:'M9 11l3 3L22 4'},
    {key:'jurnal',label:'Jurnal',icon:'M4 4h16v16H4z'},
    {key:'izin',label:'Izin/Sakit',icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'},
    {key:'kas',label:'Kas & Iuran',icon:'M2 6h20v12H2zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'},
    {key:'laporan',label:'Cetak',icon:'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z'}
  ],
  pengurus:[
    {key:'dashboard',label:'Dashboard',icon:'M3 12l9-9 9 9M5 10v10h14V10'},
    {key:'profil',label:'Profil Ekskul',icon:'M4 4h16v4H4zM4 10h16v4H4z'},
    {key:'sesi',label:'Sesi',icon:'M9 11l3 3L22 4'},
    {key:'jurnal',label:'Jurnal',icon:'M4 4h16v16H4z'},
    {key:'izin',label:'Izin/Sakit',icon:'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'},
    {key:'kas',label:'Kas & Iuran',icon:'M2 6h20v12H2zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'},
    {key:'laporan',label:'Cetak',icon:'M6 9V2h12v7'}
  ],
  murid:[
    {key:'dashboard',label:'Dashboard',icon:'M3 12l9-9 9 9M5 10v10h14V10'},
    {key:'daftar',label:'Daftar Ekskul',icon:'M12 5v14M5 12h14'},
    {key:'absen',label:'Absen',icon:'M9 11l3 3L22 4'},
    {key:'riwayat',label:'Riwayat',icon:'M3 3v18h18M7 12h3v6H7zM12 8h3v10h-3z'},
    {key:'kas',label:'Kas & Iuran',icon:'M2 6h20v12H2zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'}
  ]
};

const ROUTES={};

function renderNav(){
  const r=CURRENT_USER.role_sistem;
  $('#nav-tabs').innerHTML=NAV[r].map(t=>`<button onclick="showTab('${t.key}')" id="tab-${t.key}" class="tab-btn">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${t.icon}"/></svg>
    ${esc(t.label)}</button>`).join('');
  let label=CURRENT_USER.nama_lengkap.split(' ')[0];
  let peran={admin:'Admin',guru:'Guru',pelatih:'Pelatih',murid:'Murid'}[r];
  if(r==='pengurus')peran=JABATAN_LABEL_SHORT[CURRENT_USER._jabatan]||'Pengurus';
  $('#role-badge-text').textContent=label+' · '+peran;
}

function showTab(key){
  $$('#nav-tabs .tab-btn').forEach(b=>b.classList.remove('active'));
  const tb=$('#tab-'+key);if(tb)tb.classList.add('active');
  if(key!=='absen'&&key!=='sesi')stopQRScan();
  const fn=ROUTES[key];if(!fn)return;
  $('#main-content').innerHTML='';
  fn($('#main-content'));
  if(key==='sesi')setTimeout(afterRenderSesi,80);
}
