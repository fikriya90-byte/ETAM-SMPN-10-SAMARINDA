/* =====================================================================
   routes-guru.js — Dashboard guru, Pendaftar, Sesi, Jurnal, Izin, Profil
   ===================================================================== */

ROUTES._dashGuru=el=>{
  const ids=userEkskulIds(CURRENT_USER.id_user);
  const pend=ANGGOTA.filter(a=>ids.includes(a.id_ekskul)&&a.status_anggota==='pending').length;
  const sesiOpen=JURNAL.filter(j=>ids.includes(j.id_ekskul)&&j.status==='open').length;
  const pendIzin=PRESENSI.filter(p=>(p.status==='izin_pending'||p.status==='sakit_pending')&&JURNAL.filter(j=>ids.includes(j.id_ekskul)).some(j=>j.id_pertemuan===p.id_pertemuan)).length;
  el.innerHTML=`<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
    <div class="stat-card stat-p"><p class="text-xs uppercase" style="color:var(--text-dim)">Pendaftar</p><p class="text-2xl font-extrabold mt-1" style="color:#F472B6">${pend}</p></div>
    <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Sesi Aktif</p><p class="text-2xl font-extrabold mt-1" style="color:#34D399">${sesiOpen}</p></div>
    <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Izin Pending</p><p class="text-2xl font-extrabold mt-1" style="color:#FBBF24">${pendIzin}</p></div>
    <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Ekskul</p><p class="text-2xl font-extrabold mt-1" style="color:#A78BFA">${ids.length}</p></div></div>
    <div class="card"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--text)">Ekskul Anda</h3></div><div class="card-body">
      ${ids.map(id=>{const e=ekskulById(id);if(!e)return '';const kt=ketuaOf(id);
        return `<div style="display:flex;align-items:center;gap:12px;padding:11px 13px;background:var(--surface-2);border:1px solid var(--border);border-radius:11px;margin-bottom:8px">
          <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#0B0B0D;background:linear-gradient(135deg,#3B82F6,#8B5CF6)">${esc(e.nama_ekskul.slice(0,2).toUpperCase())}</div>
          <div class="flex-1"><p class="font-semibold text-sm">${esc(e.nama_ekskul)}</p>
          <p class="text-xs" style="color:var(--text-dim)">${anggotaAktifOf(id).length} anggota · Ketua: ${kt?esc(kt.nama_lengkap):'—'}</p></div></div>`;}).join('')||`<p class="text-sm text-center py-6" style="color:var(--text-dim)">Belum ada ekskul.</p>`}</div></div>`;
};

ROUTES.pendaftar=el=>{
  const ids=userEkskulIds(CURRENT_USER.id_user);
  const pend=ANGGOTA.filter(a=>ids.includes(a.id_ekskul)&&a.status_anggota==='pending');
  const aktif=ANGGOTA.filter(a=>ids.includes(a.id_ekskul)&&a.status_anggota==='aktif');
  el.innerHTML=`
    <div class="card mb-5"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Pendaftar Menunggu</h2><span class="chip">${pend.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Nama</th><th>Kelas</th><th>Ekskul</th><th>WA</th><th style="text-align:center;">Aksi</th></tr></thead>
    <tbody>${pend.length?pend.map(a=>{const u=userById(a.id_user),e=ekskulById(a.id_ekskul);if(!u||!e)return '';
      return `<tr><td class="font-semibold">${esc(u.nama_lengkap)}</td><td>${esc(u.kelas||'-')}</td><td><span class="chip">${esc(e.nama_ekskul)}</span></td>
      <td style="color:var(--text-muted)">${esc(u.no_wa||'-')}</td>
      <td class="text-center"><div class="flex gap-1 justify-center">
        <button onclick="approveAnggota('${a.id_anggota}',true)" class="btn btn-success" style="padding:5px 12px;font-size:12px;">Terima</button>
        <button onclick="approveAnggota('${a.id_anggota}',false)" class="btn btn-danger" style="padding:5px 12px;font-size:12px;">Tolak</button>
      </div></td></tr>`;}).join(''):`<tr><td colspan="5" class="text-center" style="padding:24px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>
    <div class="card"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--text)">Anggota Aktif — Tunjuk Pengurus</h3></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Nama</th><th>Kelas</th><th>Ekskul</th><th>Jabatan</th><th style="text-align:center;">Aksi</th></tr></thead>
    <tbody>${aktif.length?aktif.map(a=>{const u=userById(a.id_user),e=ekskulById(a.id_ekskul);if(!u||!e)return '';
      const jab=a.jabatan||'anggota',isPeng=jab!=='anggota';
      return `<tr><td class="font-semibold">${esc(u.nama_lengkap)}</td><td>${esc(u.kelas||'-')}</td><td><span class="chip">${esc(e.nama_ekskul)}</span></td>
      <td><span class="chip ${isPeng?'chip-ok':''}">${esc(JABATAN_LABEL[jab])}</span></td>
      <td class="text-center"><div class="flex gap-1 justify-center">
        <button onclick="openTunjukPengurus('${a.id_anggota}')" class="btn btn-primary" style="padding:4px 10px;font-size:11.5px;">Atur Jabatan</button>
        ${isPeng?`<button onclick="unsetJabatan('${a.id_anggota}')" class="btn" style="background:rgba(220,38,38,.15);color:#F87171;padding:4px 10px;font-size:11.5px;">Lepas</button>`:''}
      </div></td></tr>`;}).join(''):`<tr><td colspan="5" class="text-center" style="padding:20px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
  window.approveAnggota=(id,ok)=>{const a=ANGGOTA.find(x=>x.id_anggota===id);if(!a)return;
    if(ok)a.status_anggota='aktif';else ANGGOTA=ANGGOTA.filter(x=>x.id_anggota!==id);
    persist();showTab('pendaftar');showToast(ok?'Disetujui':'Ditolak','success');};
  window.openTunjukPengurus=id=>{
    const a=ANGGOTA.find(x=>x.id_anggota===id);if(!a)return;const u=userById(a.id_user),e=ekskulById(a.id_ekskul);
    $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="card w-full max-w-md animate-fade-in"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--text)">Atur Jabatan</h3></div>
      <div class="card-body space-y-3.5">
        <div class="px-3 py-3 rounded-lg" style="background:var(--surface-2)">
          <p class="text-xs" style="color:var(--text-dim)">Nama</p><p class="font-semibold">${esc(u?u.nama_lengkap:'-')}</p>
          <p class="text-xs mt-2" style="color:var(--text-dim)">Ekskul</p><p class="font-semibold">${esc(e?e.nama_ekskul:'-')}</p></div>
        <div><label class="field-label">Jabatan</label><select id="jab-select" class="field-input">
          <option value="anggota">Anggota biasa</option>
          <option value="ketua_ekskul">Ketua Ekskul</option>
          <option value="wakil_ketua">Wakil Ketua</option>
          <option value="sekretaris_ekskul">Sekretaris</option>
          <option value="bendahara_ekskul">Bendahara</option>
        </select></div>
        <p class="text-xs" style="color:var(--text-dim)">Pengurus dapat melihat status bayar semua anggota.</p>
        <div class="flex gap-2"><button onclick="saveJabatan('${id}')" class="btn btn-primary flex-1">Simpan</button>
        <button onclick="closeModal()" class="btn btn-dark flex-1">Batal</button></div></div></div></div>`;
    $('#jab-select').value=a.jabatan||'anggota';
  };
  window.saveJabatan=id=>{
    const a=ANGGOTA.find(x=>x.id_anggota===id);if(!a)return;
    const newJab=$('#jab-select').value;
    if(newJab!=='anggota')ANGGOTA.forEach(x=>{if(x.id_ekskul===a.id_ekskul&&x.jabatan===newJab&&x.id_anggota!==id)x.jabatan='anggota';});
    a.jabatan=newJab;persist();closeModal();showTab('pendaftar');showToast('Jabatan disimpan','success');
  };
  window.unsetJabatan=id=>{const a=ANGGOTA.find(x=>x.id_anggota===id);if(!a)return;a.jabatan='anggota';persist();showTab('pendaftar');showToast('Jabatan dilepas','success');};
};

ROUTES.sesi=el=>{
  const r=CURRENT_USER.role_sistem;
  const ids=r==='pengurus'?[CURRENT_EKSKUL_CTX]:userEkskulIds(CURRENT_USER.id_user);
  const idEks=CURRENT_EKSKUL_CTX||ids[0];
  if(!idEks)return el.innerHTML=`<div class="card"><div class="card-body text-center py-10" style="color:var(--text-dim)">Belum ditugaskan.</div></div>`;
  const aktifSesi=JURNAL.find(j=>j.id_ekskul===idEks&&j.status==='open');
  const e=ekskulById(idEks);
  el.innerHTML=`
    ${ids.length>1?`<div class="card mb-5"><div class="card-body flex flex-wrap gap-2 items-center">
      <span class="field-label" style="margin:0">Ekskul:</span>
      ${ids.map(id=>{const x=ekskulById(id);return x?`<button onclick="switchSesiEks('${id}')" class="chip ${id===idEks?'chip-ok':''}" style="cursor:pointer;border:none;padding:6px 12px;">${esc(x.nama_ekskul)}</button>`:''}).join('')}</div></div>`:''}
    <div class="card"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Sesi Latihan — ${esc(e.nama_ekskul)}</h2>
      ${aktifSesi?`<span class="chip chip-ok">Terbuka</span>`:`<span class="chip">Belum ada</span>`}</div>
    <div class="card-body">${aktifSesi?renderSesiAktif(aktifSesi,idEks):renderBukaSesi(idEks)}</div></div>`;
  window.switchSesiEks=id=>{CURRENT_EKSKUL_CTX=id;showTab('sesi');};
};

function renderBukaSesi(idEks){
  return `<div class="space-y-3">
    <p class="text-sm" style="color:var(--text-muted)">Buka sesi latihan untuk memulai absensi. Sistem membuat kode unik + QR Code.</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div><label class="field-label">Tanggal</label><input id="sesi-tgl" type="date" class="field-input" value="${todayStr()}"></div>
      <div><label class="field-label">Materi</label><input id="sesi-materi" class="field-input"></div></div>
    <button onclick="openSesi('${idEks}')" class="btn btn-success w-full" style="padding:11px">Buka Sesi Latihan</button></div>`;
}

function renderSesiAktif(j,idEks){
  const hadir=PRESENSI.filter(p=>p.id_pertemuan===j.id_pertemuan&&p.status==='hadir').length;
  const izinP=PRESENSI.filter(p=>p.id_pertemuan===j.id_pertemuan&&(p.status==='izin_pending'||p.status==='sakit_pending')).length;
  const total=muridOfEkskul(idEks).length;
  return `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
    <div>
      <div class="text-center mb-3"><p class="text-xs uppercase" style="color:var(--text-dim)">Kode Sesi</p>
        <p class="font-display text-4xl tracking-widest" style="color:var(--text)">${esc(j.sesi_code)}</p></div>
      <div class="text-center"><div class="qr-box" id="qr-box"></div>
        <p class="text-xs mt-2" style="color:var(--text-dim)">Murid scan pakai HP</p></div>
      <div class="grid grid-cols-3 gap-2 mt-4 text-center">
        <div class="chip">${hadir}/${total} Hadir</div><div class="chip">${izinP} Pending</div>
        <div class="chip">${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</div></div></div>
    <div><div class="space-y-3">
      <div><label class="field-label">Jurnal / Materi</label><textarea id="sesi-jurnal" class="field-input" rows="3">${esc(j.materi||'')}</textarea></div>
      <div><label class="field-label">Foto (opsional)</label><input type="file" id="sesi-foto" accept="image/*" class="field-input" style="padding:6px"></div>
      <div class="flex gap-2"><button onclick="updateJurnal('${j.id_pertemuan}')" class="btn btn-dark flex-1">Simpan Jurnal</button>
      <button onclick="closeSesi('${j.id_pertemuan}')" class="btn btn-danger flex-1">Tutup Sesi</button></div></div>
      <div class="mt-5 pt-4" style="border-top:1px solid var(--border)"><p class="field-label">Daftar Hadir Live</p>
        <div class="space-y-1 max-h-64 overflow-auto custom-scrollbar">
          ${PRESENSI.filter(p=>p.id_pertemuan===j.id_pertemuan).map(p=>{const u=userById(p.id_user);if(!u)return '';
            const cls=p.status==='hadir'?'badge-H':p.status.startsWith('izin')?'badge-I':p.status.startsWith('sakit')?'badge-S':'badge-P';
            const lbl=p.status==='hadir'?'H':p.status.startsWith('izin')?'I':p.status.startsWith('sakit')?'S':'?';
            return `<div class="flex items-center gap-2 px-3 py-2 rounded-lg" style="background:var(--surface-2)">
              <span class="flex-1 text-sm">${esc(u.nama_lengkap)} <span class="text-xs" style="color:var(--text-dim)">(${esc(u.kelas||'-')})</span></span>
              <span class="badge ${cls}">${lbl}</span></div>`;}).join('')||'<p class="text-xs text-center py-3" style="color:var(--text-dim)">Belum ada.</p>'}
        </div></div></div></div>`;
}

window.openSesi=idEks=>{
  const tgl=$('#sesi-tgl').value;if(!tgl)return showToast('Pilih tanggal','warning');
  if(JURNAL.some(j=>j.id_ekskul===idEks&&j.status==='open'))return showToast('Sudah ada sesi terbuka','warning');
  const code=Math.random().toString(36).slice(2,8).toUpperCase();
  JURNAL.push({id_pertemuan:uid('jr'),id_ekskul:idEks,tanggal:tgl,materi:$('#sesi-materi').value.trim(),
    foto_kegiatan:'',dibuat_oleh:CURRENT_USER.id_user,sesi_code:code,status:'open',created_at:new Date().toISOString()});
  persist();showTab('sesi');showToast('Sesi dibuka! Kode: '+code,'success');
};
window.updateJurnal=id=>{
  const j=JURNAL.find(x=>x.id_pertemuan===id);if(!j)return;j.materi=$('#sesi-jurnal').value;
  const f=$('#sesi-foto').files[0];
  if(f){const r=new FileReader();r.onload=e=>{j.foto_kegiatan=e.target.result;persist();showTab('sesi');showToast('Disimpan','success')};r.readAsDataURL(f);}
  else{persist();showToast('Disimpan','success');}
};
window.closeSesi=id=>{
  if(!confirm('Tutup sesi ini?'))return;
  const j=JURNAL.find(x=>x.id_pertemuan===id);if(!j)return;
  muridOfEkskul(j.id_ekskul).forEach(m=>{
    if(!PRESENSI.find(p=>p.id_pertemuan===id&&p.id_user===m.id_user))
      PRESENSI.push({id_presensi:uid('pr'),id_pertemuan:id,id_user:m.id_user,status:'alpa',waktu_absen:new Date().toISOString(),approved:true});});
  j.status='closed';persist();showTab('sesi');showToast('Sesi ditutup','success');
};
function afterRenderSesi(){
  const el=$('#qr-box');if(!el)return;
  const idEks=CURRENT_EKSKUL_CTX||(CURRENT_USER.role_sistem==='pengurus'?CURRENT_EKSKUL_CTX:userEkskulIds(CURRENT_USER.id_user)[0]);
  const j=JURNAL.find(x=>x.status==='open'&&x.id_ekskul===idEks);
  if(!j||!window.QRCode)return;
  el.innerHTML='';new QRCode(el,{text:'ETAM|'+j.id_pertemuan+'|'+j.sesi_code,width:200,height:200,colorDark:'#0B0B0D',colorLight:'#fff'});
}

ROUTES.jurnal=el=>{
  const ids=CURRENT_USER.role_sistem==='pengurus'?[CURRENT_EKSKUL_CTX]:userEkskulIds(CURRENT_USER.id_user);
  const list=JURNAL.filter(j=>ids.includes(j.id_ekskul)).sort((a,b)=>(b.tanggal||'').localeCompare(a.tanggal||''));
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Jurnal Kegiatan</h2><span class="chip">${list.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Tanggal</th><th>Ekskul</th><th>Materi</th><th>Foto</th><th>Status</th></tr></thead>
    <tbody>${list.length?list.map(j=>{const e=ekskulById(j.id_ekskul);
      return `<tr><td>${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td><span class="chip">${esc(e?e.nama_ekskul:'-')}</span></td><td>${esc(j.materi||'-')}</td>
      <td>${j.foto_kegiatan?`<a href="${j.foto_kegiatan}" target="_blank" class="chip chip-info">Lihat</a>`:'<span style="color:var(--text-dim)">—</span>'}</td>
      <td><span class="chip ${j.status==='open'?'chip-ok':''}">${j.status||'closed'}</span></td></tr>`;}).join(''):`<tr><td colspan="5" class="text-center" style="padding:24px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
};

ROUTES.izin=el=>{
  const r=CURRENT_USER.role_sistem;
  const ids=r==='pengurus'?[CURRENT_EKSKUL_CTX]:userEkskulIds(CURRENT_USER.id_user);
  const jIds=JURNAL.filter(j=>ids.includes(j.id_ekskul)).map(j=>j.id_pertemuan);
  const pend=PRESENSI.filter(p=>jIds.includes(p.id_pertemuan)&&(p.status==='izin_pending'||p.status==='sakit_pending'));
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Persetujuan Izin/Sakit</h2><span class="chip">${pend.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Tanggal</th><th>Ekskul</th><th>Murid</th><th>Jenis</th><th style="text-align:center;">Aksi</th></tr></thead>
    <tbody>${pend.length?pend.map(p=>{const j=JURNAL.find(x=>x.id_pertemuan===p.id_pertemuan),u=userById(p.id_user),e=j?ekskulById(j.id_ekskul):null;if(!u||!j)return '';
      return `<tr><td>${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID')}</td><td><span class="chip">${esc(e?e.nama_ekskul:'-')}</span></td>
      <td class="font-semibold">${esc(u.nama_lengkap)}</td>
      <td><span class="chip ${p.status.startsWith('izin')?'chip-warn':'chip-info'}">${p.status.startsWith('izin')?'Izin':'Sakit'}</span></td>
      <td class="text-center"><div class="flex gap-1 justify-center">
        <button onclick="approveIzin('${p.id_presensi}',true)" class="btn btn-success" style="padding:5px 12px;font-size:12px;">Setujui</button>
        <button onclick="approveIzin('${p.id_presensi}',false)" class="btn btn-danger" style="padding:5px 12px;font-size:12px;">Tolak</button>
      </div></td></tr>`;}).join(''):`<tr><td colspan="5" class="text-center" style="padding:24px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
  window.approveIzin=(id,ok)=>{const p=PRESENSI.find(x=>x.id_presensi===id);if(!p)return;
    if(ok){p.status=p.status.replace('_pending','');p.approved=true;}else{p.status='alpa';p.approved=true;}
    persist();showTab('izin');showToast(ok?'Disetujui':'Ditolak','success');};
};

ROUTES.profil=el=>{
  const e=ekskulById(CURRENT_EKSKUL_CTX);
  if(!e)return el.innerHTML=`<div class="card"><div class="card-body text-center py-10" style="color:var(--text-dim)">Belum ditugaskan.</div></div>`;
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Profil Ekskul</h2></div>
    <div class="card-body grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <div><label class="field-label">Nama</label><input id="pf-nama" class="field-input" value="${esc(e.nama_ekskul)}"></div>
      <div><label class="field-label">Jadwal</label><input id="pf-jadwal" class="field-input" value="${esc(e.jadwal_rutin||'')}"></div>
      <div><label class="field-label">Tempat</label><input id="pf-tempat" class="field-input" value="${esc(e.tempat||'')}"></div>
      <div><label class="field-label">Logo URL</label><input id="pf-logo" class="field-input" value="${esc(e.logo_url||'')}"></div>
      <div class="sm:col-span-2"><label class="field-label">Deskripsi</label><textarea id="pf-desc" class="field-input" rows="3">${esc(e.deskripsi||'')}</textarea></div>
      <div class="sm:col-span-2 flex justify-end"><button onclick="saveProfil()" class="btn btn-primary">Simpan</button></div></div></div>`;
  window.saveProfil=()=>{e.nama_ekskul=$('#pf-nama').value.trim();e.jadwal_rutin=$('#pf-jadwal').value.trim();
    e.tempat=$('#pf-tempat').value.trim();e.logo_url=$('#pf-logo').value.trim();e.deskripsi=$('#pf-desc').value.trim();
    persist();showToast('Disimpan','success');};
};
