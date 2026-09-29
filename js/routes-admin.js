/* =====================================================================
   routes-admin.js — Dashboard, Verifikasi, Master Ekskul, Rekap, Setting
   ===================================================================== */

ROUTES.dashboard=el=>{
  const r=CURRENT_USER.role_sistem;
  if(r==='admin'){
    const pv=PEMBINA.filter(p=>p.status_akun==='pending').length;
    el.innerHTML=`<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div class="stat-card stat-p"><p class="text-xs uppercase" style="color:var(--text-dim)">Verifikasi</p><p class="text-2xl font-extrabold mt-1" style="color:#C4B5FD">${pv}</p></div>
      <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Ekskul</p><p class="text-2xl font-extrabold mt-1" style="color:var(--gold)">${EKSKUL.length}</p></div>
      <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Murid Aktif</p><p class="text-2xl font-extrabold mt-1" style="color:#4ADE80">${ANGGOTA.filter(a=>a.status_anggota==='aktif').length}</p></div>
      <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Total Kas Masuk</p><p class="text-lg font-extrabold mt-1" style="color:#FBBF24">${fmtRp(KAS_BAYAR.reduce((a,b)=>a+Number(b.jumlah||0),0))}</p></div></div>
      <div class="card"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Ringkasan per Ekskul</h3></div>
      <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Ekskul</th><th style="text-align:center;">Anggota</th><th>Pengurus</th><th>Iuran</th></tr></thead>
      <tbody>${EKSKUL.map(e=>{const cfg=getIuranCfg(e.id_ekskul);const pg=anggotaAktifOf(e.id_ekskul).filter(a=>a.jabatan!=='anggota');
        return `<tr><td class="font-semibold">${esc(e.nama_ekskul)}</td><td class="text-center">${anggotaAktifOf(e.id_ekskul).length}</td>
        <td>${pg.length?pg.map(p=>{const u=userById(p.id_user);return `<span class="chip chip-info" style="margin:1px;">${esc(JABATAN_LABEL_SHORT[p.jabatan])}: ${esc(u?u.nama_lengkap.split(' ')[0]:'-')}</span>`}).join(''):'<span style="color:var(--text-dim)">—</span>'}</td>
        <td>${cfg.aktif?`<span class="chip chip-ok">${fmtRp(cfg.jumlah)}/${cfg.mode==='pertemuan'?'pertemuan':'minggu'}</span>`:'<span class="chip chip-no">Belum diatur</span>'}</td></tr>`;}).join('')}</tbody></table></div></div>`;
  } else if(r==='guru'||r==='pelatih'){
    ROUTES._dashGuru(el);
  } else if(r==='pengurus'){
    const jabat=CURRENT_USER._jabatan,idEks=CURRENT_EKSKUL_CTX,e=ekskulById(idEks);
    if(!e)return el.innerHTML=`<div class="card"><div class="card-body text-center py-10" style="color:var(--text-dim)">Belum ditugaskan.</div></div>`;
    const ag=anggotaAktifOf(idEks).length,jr=JURNAL.filter(j=>j.id_ekskul===idEks).length;
    el.innerHTML=`<div class="card mb-5"><div class="card-body">
        <span class="chip chip-ok">${esc(JABATAN_LABEL[jabat]||'Pengurus')}</span>
        <h2 class="font-display text-xl mt-2" style="color:var(--gold)">${esc(e.nama_ekskul)}</h2>
        <p class="text-sm" style="color:var(--text-muted)">${esc(e.deskripsi||'')}</p></div></div>
      <div class="grid grid-cols-2 gap-3">
        <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Anggota</p><p class="text-2xl font-extrabold mt-1" style="color:#4ADE80">${ag}</p></div>
        <div class="stat-card stat-s"><p class="text-xs uppercase" style="color:var(--text-dim)">Pertemuan</p><p class="text-2xl font-extrabold mt-1" style="color:#60A5FA">${jr}</p></div></div>`;
  } else if(r==='murid'){
    ROUTES._dashMurid(el);
  }
};

ROUTES.verifikasi=el=>{
  const pend=PEMBINA.filter(p=>p.status_akun==='pending');
  el.innerHTML=`
    <div class="card mb-5"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--gold)">Verifikasi Akun</h2><span class="chip">${pend.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Nama</th><th>Email</th><th>Role</th><th>Ekskul</th><th style="text-align:center;">Aksi</th></tr></thead>
    <tbody>${pend.length?pend.map(p=>{const u=userById(p.id_user),e=ekskulById(p.id_ekskul);if(!u||!e)return '';
      return `<tr><td class="font-semibold">${esc(u.nama_lengkap)}</td><td style="color:var(--text-muted)">${esc(u.email)}</td>
      <td><span class="chip chip-info">${esc(u.role_sistem)}</span></td><td>${esc(e.nama_ekskul)}</td>
      <td class="text-center"><div class="flex gap-1 justify-center">
        <button onclick="approvePembina('${p.id_pembina}',true)" class="btn btn-success" style="padding:5px 12px;font-size:12px;">✓ Setujui</button>
        <button onclick="approvePembina('${p.id_pembina}',false)" class="btn btn-danger" style="padding:5px 12px;font-size:12px;">✕ Tolak</button>
      </div></td></tr>`;}).join(''):`<tr><td colspan="5" class="text-center" style="padding:24px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>
    <div class="card"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Pemetaan Pembina → Ekskul</h3>
      <button onclick="openMapPembinaModal()" class="btn btn-primary" style="padding:7px 12px;font-size:12px;">+ Petakan</button></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Nama</th><th>Role</th><th>Ekskul</th><th>Status</th><th style="text-align:center;">Aksi</th></tr></thead>
    <tbody>${PEMBINA.map(p=>{const u=userById(p.id_user),e=ekskulById(p.id_ekskul);if(!u||!e)return '';
      return `<tr><td class="font-semibold">${esc(u.nama_lengkap)}</td><td><span class="chip">${esc(u.role_sistem)}</span></td><td>${esc(e.nama_ekskul)}</td>
      <td><span class="chip ${p.status_akun==='aktif'?'chip-ok':'chip-warn'}">${esc(p.status_akun)}</span></td>
      <td class="text-center"><button onclick="unmapPembina('${p.id_pembina}')" class="btn" style="background:rgba(220,38,38,.15);color:#F87171;padding:4px 10px;font-size:11.5px;">Hapus</button></td></tr>`;}).join('')}</tbody></table></div></div>`;
  window.approvePembina=(id,ok)=>{const p=PEMBINA.find(x=>x.id_pembina===id);if(!p)return;
    if(ok){p.status_akun='aktif';const u=userById(p.id_user);if(u)u.active=true;showToast('Disetujui','success');}
    else{PEMBINA=PEMBINA.filter(x=>x.id_pembina!==id);const u=userById(p.id_user);if(u)u.active=false;showToast('Ditolak','warning');}
    persist();showTab('verifikasi');};
  window.unmapPembina=id=>{if(!confirm('Hapus?'))return;PEMBINA=PEMBINA.filter(x=>x.id_pembina!==id);persist();showTab('verifikasi');};
};

window.openMapPembinaModal=()=>{
  const g=USERS.filter(u=>u.role_sistem==='guru'||u.role_sistem==='pelatih');
  $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
    <div class="card w-full max-w-lg animate-fade-in"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Pemetaan Baru</h3></div>
    <div class="card-body space-y-3.5">
      <div><label class="field-label">User</label><select id="map-user" class="field-input">${g.map(u=>`<option value="${u.id_user}">${esc(u.nama_lengkap)} (${u.role_sistem})</option>`).join('')||'<option value="">-</option>'}</select></div>
      <div><label class="field-label">Ekskul</label><select id="map-ekskul" class="field-input">${EKSKUL.map(e=>`<option value="${e.id_ekskul}">${esc(e.nama_ekskul)}</option>`).join('')}</select></div>
      <div class="flex gap-2 pt-2"><button onclick="saveMapPembina()" class="btn btn-primary flex-1">Simpan</button>
      <button onclick="closeModal()" class="btn btn-dark flex-1">Batal</button></div></div></div></div>`;
};
window.saveMapPembina=()=>{const iu=$('#map-user').value,ie=$('#map-ekskul').value;
  if(!iu||!ie)return showToast('Lengkapi','warning');
  if(PEMBINA.some(p=>p.id_user===iu&&p.id_ekskul===ie))return showToast('Sudah ada','warning');
  PEMBINA.push({id_pembina:uid('p'),id_user:iu,id_ekskul:ie,status_akun:'aktif'});persist();closeModal();showTab('verifikasi');showToast('OK','success');};

ROUTES.ekskul=el=>{
  el.innerHTML=`
    <div class="card mb-5"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--gold)">Tambah Ekskul</h2></div>
    <div class="card-body grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <div><label class="field-label">Nama</label><input id="me-nama" class="field-input"></div>
      <div><label class="field-label">Jadwal</label><input id="me-jadwal" class="field-input"></div>
      <div class="sm:col-span-2"><label class="field-label">Deskripsi</label><input id="me-desc" class="field-input"></div>
      <div><label class="field-label">Tempat</label><input id="me-tempat" class="field-input"></div>
      <div class="flex items-end"><button onclick="addEkskul()" class="btn btn-primary w-full">+ Tambah</button></div></div></div>
    <div class="card"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Daftar</h3></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Nama</th><th>Jadwal</th><th style="text-align:center;">Anggota</th><th style="text-align:center;">Aksi</th></tr></thead>
    <tbody>${EKSKUL.map(e=>`<tr><td class="font-semibold">${esc(e.nama_ekskul)}</td><td style="color:var(--text-muted)">${esc(e.jadwal_rutin||'-')}</td>
      <td class="text-center">${anggotaAktifOf(e.id_ekskul).length}</td>
      <td class="text-center"><button onclick="delEkskul('${e.id_ekskul}')" class="btn" style="background:rgba(220,38,38,.15);color:#F87171;padding:4px 10px;font-size:11.5px;">Hapus</button></td></tr>`).join('')}</tbody></table></div></div>`;
  window.addEkskul=()=>{const nama=$('#me-nama').value.trim();if(!nama)return showToast('Isi nama','warning');
    if(EKSKUL.some(e=>e.nama_ekskul.toLowerCase()===nama.toLowerCase()))return showToast('Sudah ada','warning');
    EKSKUL.push({id_ekskul:uid('e'),nama_ekskul:nama,deskripsi:$('#me-desc').value.trim(),logo_url:'',jadwal_rutin:$('#me-jadwal').value.trim(),tempat:$('#me-tempat').value.trim()});
    persist();showTab('ekskul');showToast('OK','success');};
  window.delEkskul=id=>{if(!confirm('Hapus?'))return;
    EKSKUL=EKSKUL.filter(e=>e.id_ekskul!==id);PEMBINA=PEMBINA.filter(p=>p.id_ekskul!==id);
    ANGGOTA=ANGGOTA.filter(a=>a.id_ekskul!==id);
    const jIds=JURNAL.filter(j=>j.id_ekskul===id).map(j=>j.id_pertemuan);JURNAL=JURNAL.filter(j=>j.id_ekskul!==id);
    PRESENSI=PRESENSI.filter(p=>!jIds.includes(p.id_pertemuan));
    KAS_BAYAR=KAS_BAYAR.filter(b=>b.id_ekskul!==id);
    delete IURAN_CONFIG[id];
    persist();showTab('ekskul');showToast('OK','success');};
};

ROUTES.rekap=el=>{
  const rows=[];
  EKSKUL.forEach(e=>{
    muridOfEkskul(e.id_ekskul).forEach(m=>{
      const p=PRESENSI.filter(x=>x.id_user===m.id_user&&JURNAL.some(j=>j.id_pertemuan===x.id_pertemuan&&j.id_ekskul===e.id_ekskul));
      const H=p.filter(x=>x.status==='hadir').length,I=p.filter(x=>x.status.startsWith('izin')).length;
      const S=p.filter(x=>x.status.startsWith('sakit')).length,A=p.filter(x=>x.status==='alpa').length,t=H+I+S+A;
      rows.push({ekskul:e.nama_ekskul,nama:m.nama_lengkap,kelas:m.kelas,H,I,S,A,t,pct:t?((H/t)*100).toFixed(1):'-'});
    });
  });
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--gold)">Rekap Global</h2>
    <button onclick="exportGlobalCSV()" class="btn btn-dark">CSV</button></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Ekskul</th><th>Nama</th><th>Kelas</th><th style="text-align:center;">H</th><th style="text-align:center;">I</th><th style="text-align:center;">S</th><th style="text-align:center;">A</th><th style="text-align:center;">Total</th><th style="text-align:center;">%</th></tr></thead>
    <tbody>${rows.length?rows.map(r=>`<tr><td><span class="chip">${esc(r.ekskul)}</span></td><td class="font-semibold">${esc(r.nama)}</td><td>${esc(r.kelas||'-')}</td>
      <td class="text-center" style="color:#4ADE80">${r.H}</td><td class="text-center" style="color:#FBBF24">${r.I}</td>
      <td class="text-center" style="color:#60A5FA">${r.S}</td><td class="text-center" style="color:#F87171">${r.A}</td>
      <td class="text-center">${r.t}</td><td class="text-center font-extrabold">${r.pct}${r.pct!=='-'?'%':''}</td></tr>`).join(''):`<tr><td colspan="9" class="text-center" style="padding:20px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
  window.exportGlobalCSV=()=>{const r=[['Ekskul','Nama','Kelas','H','I','S','A','Total','%']];rows.forEach(x=>r.push([x.ekskul,x.nama,x.kelas,x.H,x.I,x.S,x.A,x.t,x.pct]));downloadCSV(r,'ETAM_Rekap_Global.csv');};
};

ROUTES.setting=el=>{
  el.innerHTML=`<div class="card mb-5"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--gold)">Identitas Sekolah</h2></div>
    <div class="card-body grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <div><label class="field-label">Nama Sekolah</label><input id="s-school" class="field-input"></div>
      <div><label class="field-label">Kepala UPT</label><input id="s-kepala" class="field-input"></div>
      <div><label class="field-label">Koordinator Ekskul</label><input id="s-koord" class="field-input"></div>
      <div class="sm:col-span-3 flex justify-end"><button onclick="saveSettings()" class="btn btn-primary">Simpan</button></div></div></div>
    <div class="card mb-5"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Backup & Restore</h3></div>
    <div class="card-body flex flex-wrap gap-2">
      <button onclick="backupAll()" class="btn btn-primary">Backup JSON</button>
      <label class="btn btn-dark cursor-pointer">Restore<input type="file" accept=".json" onchange="restoreAll(event)" style="display:none"></label></div></div>`;
  $('#s-school').value=APP_SETTINGS.school_name;
  $('#s-kepala').value=APP_SETTINGS.kepala_upt;
  $('#s-koord').value=APP_SETTINGS.koordinator;
  window.saveSettings=()=>{
    APP_SETTINGS.school_name=$('#s-school').value;
    APP_SETTINGS.kepala_upt=$('#s-kepala').value;
    APP_SETTINGS.koordinator=$('#s-koord').value;
    persist();showToast('Disimpan','success');
  };
};
window.backupAll=()=>{
  const data={app:'Ekskul Etam',version:4,exported_at:new Date().toISOString(),
    users:USERS,ekskul:EKSKUL,pembina:PEMBINA,anggota:ANGGOTA,jurnal:JURNAL,
    presensi:PRESENSI,iuran:IURAN_CONFIG,kas_bayar:KAS_BAYAR,settings:APP_SETTINGS};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`ETAM_Backup_${todayStr()}.json`;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('Backup diunduh','success');
};
window.restoreAll=async ev=>{
  const f=ev.target.files[0];if(!f)return;
  try{
    const d=JSON.parse(await f.text());
    ['users','ekskul','pembina','anggota','jurnal','presensi','iuran','kas_bayar','settings']
      .forEach(k=>{if(d[k])DB.set(k,d[k])});
    showToast('Direstore. Reload...','success');
    setTimeout(()=>location.reload(),900);
  }catch(e){showToast('File tidak valid','error')}
};
