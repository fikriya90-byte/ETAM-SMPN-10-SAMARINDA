/* =====================================================================
   routes-guru.js — Dashboard guru, Sesi, Jurnal, Izin, Struktur, Foto, Profil
   ===================================================================== */

ROUTES._dashGuru=el=>{
  const ids=userEkskulIds(CURRENT_USER.id_user);
  const sesiOpen=JURNAL.filter(j=>ids.includes(j.id_ekskul)&&j.status==='open').length;
  const pendIzin=PRESENSI.filter(p=>(p.status==='izin_pending'||p.status==='sakit_pending')&&JURNAL.filter(j=>ids.includes(j.id_ekskul)).some(j=>j.id_pertemuan===p.id_pertemuan)).length;
  const totalFoto=LAPORAN_FOTO.filter(f=>ids.includes(f.id_ekskul)).length;
  el.innerHTML=`<div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
    <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Sesi Aktif</p><p class="text-xl font-extrabold mt-0.5" style="color:#34D399">${sesiOpen}</p></div>
    <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Izin Pending</p><p class="text-xl font-extrabold mt-0.5" style="color:#FBBF24">${pendIzin}</p></div>
    <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Ekskul</p><p class="text-xl font-extrabold mt-0.5" style="color:#A78BFA">${ids.length}</p></div>
    <div class="stat-card stat-p"><p class="text-xs uppercase" style="color:var(--text-dim)">Foto</p><p class="text-xl font-extrabold mt-0.5" style="color:#F472B6">${totalFoto}</p></div></div>
    <div class="card"><div class="card-header"><h3 class="font-display text-base" style="color:var(--text)">Ekskul Anda</h3></div><div class="card-body">
      ${ids.map(id=>{const e=ekskulById(id);if(!e)return '';const kt=ketuaOf(id);const ag=anggotaAktifOf(id).length;
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:11px;margin-bottom:6px">
          ${e.logo_url?`<img src="${e.logo_url}" style="width:36px;height:36px;border-radius:9px;object-fit:cover">`:`<div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:linear-gradient(135deg,#3B82F6,#8B5CF6);font-size:12px">${esc(e.nama_ekskul.slice(0,2).toUpperCase())}</div>`}
          <div class="flex-1"><p class="font-semibold text-sm">${esc(e.nama_ekskul)}</p>
          <p class="text-xs" style="color:var(--text-dim)">${ag} anggota · Ketua: ${kt?esc(kt.nama_lengkap):'—'}</p></div></div>`;}).join('')||`<p class="text-sm text-center py-6" style="color:var(--text-dim)">Belum ada ekskul.</p>`}</div></div>`;
};

ROUTES.pendaftar=el=>{showTab('dashboard');}; // Redirect — pendaftar dihapus

ROUTES.sesi=el=>{
  const r=CURRENT_USER.role_sistem;
  const ids=r==='pengurus'?[CURRENT_EKSKUL_CTX]:userEkskulIds(CURRENT_USER.id_user);
  const idEks=CURRENT_EKSKUL_CTX||ids[0];
  if(!idEks)return el.innerHTML=`<div class="card"><div class="card-body text-center py-8" style="color:var(--text-dim)">Belum ditugaskan.</div></div>`;
  const aktifSesi=JURNAL.find(j=>j.id_ekskul===idEks&&j.status==='open');
  const e=ekskulById(idEks);
  el.innerHTML=`
    ${ids.length>1?`<div class="card mb-3"><div class="card-body flex flex-wrap gap-2 items-center">
      <span class="field-label" style="margin:0">Ekskul:</span>
      ${ids.map(id=>{const x=ekskulById(id);return x?`<button onclick="switchSesiEks('${id}')" class="chip ${id===idEks?'chip-ok':''}" style="cursor:pointer;border:none;padding:5px 10px;">${esc(x.nama_ekskul)}</button>`:''}).join('')}</div></div>`:''}
    <div class="card"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Sesi Latihan — ${esc(e.nama_ekskul)}</h2>
      ${aktifSesi?`<span class="chip chip-ok">Terbuka</span>`:`<span class="chip">Belum ada</span>`}</div>
    <div class="card-body">${aktifSesi?renderSesiAktif(aktifSesi,idEks):renderBukaSesi(idEks)}</div></div>`;
  window.switchSesiEks=id=>{CURRENT_EKSKUL_CTX=id;showTab('sesi');};
};

function renderBukaSesi(idEks){
  return `<div class="space-y-3">
    <p class="text-sm" style="color:var(--text-muted)">Buka sesi latihan untuk memulai absensi.</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div><label class="field-label">Tanggal</label><input id="sesi-tgl" type="date" class="field-input" value="${todayStr()}"></div>
      <div><label class="field-label">Materi</label><input id="sesi-materi" class="field-input"></div></div>
    <button onclick="openSesi('${idEks}')" class="btn btn-success w-full" style="padding:10px">Buka Sesi Latihan</button></div>`;
}

function renderSesiAktif(j,idEks){
  const hadir=PRESENSI.filter(p=>p.id_pertemuan===j.id_pertemuan&&p.status==='hadir').length;
  const izinP=PRESENSI.filter(p=>p.id_pertemuan===j.id_pertemuan&&(p.status==='izin_pending'||p.status==='sakit_pending')).length;
  const total=muridOfEkskul(idEks).length;
  return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <div class="text-center mb-2"><p class="text-xs uppercase" style="color:var(--text-dim)">Kode Sesi</p>
        <p class="font-display text-3xl tracking-widest" style="color:var(--text)">${esc(j.sesi_code)}</p></div>
      <div class="text-center"><div class="qr-box" id="qr-box"></div></div>
      <div class="grid grid-cols-3 gap-2 mt-3 text-center">
        <div class="chip">${hadir}/${total} H</div><div class="chip">${izinP} P</div>
        <div class="chip">${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</div></div></div>
    <div><div class="space-y-2">
      <div><label class="field-label">Jurnal</label><textarea id="sesi-jurnal" class="field-input" rows="2">${esc(j.materi||'')}</textarea></div>
      <div class="flex gap-2"><button onclick="updateJurnal('${j.id_pertemuan}')" class="btn btn-dark flex-1">Simpan</button>
      <button onclick="closeSesi('${j.id_pertemuan}')" class="btn btn-danger flex-1">Tutup</button></div></div>
      <div class="mt-3 pt-3" style="border-top:1px solid var(--border)"><p class="field-label">Live</p>
        <div class="space-y-1 max-h-48 overflow-auto custom-scrollbar">
          ${PRESENSI.filter(p=>p.id_pertemuan===j.id_pertemuan).map(p=>{const u=userById(p.id_user);if(!u)return '';
            const cls=p.status==='hadir'?'badge-H':p.status.startsWith('izin')?'badge-I':p.status.startsWith('sakit')?'badge-S':'badge-P';
            const lbl=p.status==='hadir'?'H':p.status.startsWith('izin')?'I':p.status.startsWith('sakit')?'S':'?';
            return `<div class="flex items-center gap-2 px-3 py-1.5 rounded-lg" style="background:var(--surface-2)">
              <span class="flex-1 text-xs">${esc(u.nama_lengkap)} <span style="color:var(--text-dim)">(${esc(u.kelas||'-')})</span></span>
              <span class="badge ${cls}">${lbl}</span></div>`;}).join('')||'<p class="text-xs text-center py-2" style="color:var(--text-dim)">-</p>'}
        </div></div></div></div>`;
}

window.openSesi=idEks=>{
  const tgl=$('#sesi-tgl').value;if(!tgl)return showToast('Pilih tanggal','warning');
  if(JURNAL.some(j=>j.id_ekskul===idEks&&j.status==='open'))return showToast('Sudah ada sesi terbuka','warning');
  const code=Math.random().toString(36).slice(2,8).toUpperCase();
  JURNAL.push({id_pertemuan:uid('jr'),id_ekskul:idEks,tanggal:tgl,materi:$('#sesi-materi').value.trim(),
    dibuat_oleh:CURRENT_USER.id_user,sesi_code:code,status:'open',created_at:new Date().toISOString()});
  persist();showTab('sesi');showToast('Sesi dibuka! Kode: '+code,'success');
};
window.updateJurnal=id=>{const j=JURNAL.find(x=>x.id_pertemuan===id);if(!j)return;j.materi=$('#sesi-jurnal').value;persist();showToast('Disimpan','success');};
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
  el.innerHTML='';new QRCode(el,{text:'ETAM|'+j.id_pertemuan+'|'+j.sesi_code,width:180,height:180,colorDark:'#0B0B0D',colorLight:'#fff'});
}

ROUTES.jurnal=el=>{
  const ids=CURRENT_USER.role_sistem==='pengurus'?[CURRENT_EKSKUL_CTX]:userEkskulIds(CURRENT_USER.id_user);
  const list=JURNAL.filter(j=>ids.includes(j.id_ekskul)).sort((a,b)=>(b.tanggal||'').localeCompare(a.tanggal||''));
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Jurnal Kegiatan</h2><span class="chip">${list.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Tanggal</th><th>Ekskul</th><th>Materi</th><th>Status</th></tr></thead>
    <tbody>${list.length?list.map(j=>{const e=ekskulById(j.id_ekskul);
      return `<tr><td>${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td><span class="chip">${esc(e?e.nama_ekskul:'-')}</span></td><td>${esc(j.materi||'-')}</td>
      <td><span class="chip ${j.status==='open'?'chip-ok':''}">${j.status||'closed'}</span></td></tr>`;}).join(''):`<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
};

ROUTES.izin=el=>{
  const r=CURRENT_USER.role_sistem;
  const ids=r==='pengurus'?[CURRENT_EKSKUL_CTX]:userEkskulIds(CURRENT_USER.id_user);
  const jIds=JURNAL.filter(j=>ids.includes(j.id_ekskul)).map(j=>j.id_pertemuan);
  const pend=PRESENSI.filter(p=>jIds.includes(p.id_pertemuan)&&(p.status==='izin_pending'||p.status==='sakit_pending'));
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Persetujuan Izin/Sakit</h2><span class="chip">${pend.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Tanggal</th><th>Ekskul</th><th>Murid</th><th>Jenis</th><th style="text-align:center;">Aksi</th></tr></thead>
    <tbody>${pend.length?pend.map(p=>{const j=JURNAL.find(x=>x.id_pertemuan===p.id_pertemuan),u=userById(p.id_user),e=j?ekskulById(j.id_ekskul):null;if(!u||!j)return '';
      return `<tr><td>${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID')}</td><td><span class="chip">${esc(e?e.nama_ekskul:'-')}</span></td>
      <td class="font-semibold">${esc(u.nama_lengkap)}</td>
      <td><span class="chip ${p.status.startsWith('izin')?'chip-warn':'chip-info'}">${p.status.startsWith('izin')?'Izin':'Sakit'}</span></td>
      <td class="text-center"><div class="flex gap-1 justify-center">
        <button onclick="approveIzin('${p.id_presensi}',true)" class="btn btn-success" style="padding:4px 10px;font-size:12px;">OK</button>
        <button onclick="approveIzin('${p.id_presensi}',false)" class="btn btn-danger" style="padding:4px 10px;font-size:12px;">No</button>
      </div></td></tr>`;}).join(''):`<tr><td colspan="5" class="text-center" style="padding:20px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
  window.approveIzin=(id,ok)=>{const p=PRESENSI.find(x=>x.id_presensi===id);if(!p)return;
    if(ok){p.status=p.status.replace('_pending','');p.approved=true;}else{p.status='alpa';p.approved=true;}
    persist();showTab('izin');showToast(ok?'Disetujui':'Ditolak','success');};
};

/* ---------- STRUKTUR ---------- */
ROUTES.struktur=el=>renderStrukturPage(el,null);

/* ---------- FOTO / DOKUMENTASI ---------- */
ROUTES.foto=el=>{
  const r=CURRENT_USER.role_sistem;
  const ids=(r==='guru'||r==='pelatih')?userEkskulIds(CURRENT_USER.id_user):[CURRENT_EKSKUL_CTX];
  const idEks=CURRENT_EKSKUL_CTX||ids[0];
  if(!idEks)return el.innerHTML=`<div class="card"><div class="card-body text-center py-8" style="color:var(--text-dim)">Belum ditugaskan.</div></div>`;
  const e=ekskulById(idEks);
  const ptm=getPertemuanClosed(idEks).reverse();
  el.innerHTML=`
    ${ids.length>1?`<div class="card mb-3"><div class="card-body flex flex-wrap gap-2 items-center">
      <span class="field-label" style="margin:0">Ekskul:</span>
      ${ids.map(id=>{const x=ekskulById(id);return x?`<button onclick="CURRENT_EKSKUL_CTX='${id}';showTab('foto')" class="chip ${id===idEks?'chip-ok':''}" style="cursor:pointer;border:none;padding:5px 10px;">${esc(x.nama_ekskul)}</button>`:''}).join('')}</div></div>`:''}
    <div class="card mb-3"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Dokumentasi Foto — ${esc(e.nama_ekskul)}</h2></div>
    <div class="card-body">
      <p class="text-sm" style="color:var(--text-muted);margin-bottom:12px">Upload foto kegiatan. Watermark tanggal & waktu otomatis. Maks 2 foto per pertemuan.</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div><label class="field-label">Pilih Pertemuan</label>
          <select id="foto-ptm" class="field-input">
            ${ptm.length?ptm.map(j=>`<option value="${j.id_pertemuan}">${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})} — ${esc(j.materi||'tanpa materi')}</option>`).join(''):'<option value="">Belum ada pertemuan tertutup</option>'}
          </select></div>
        <div><label class="field-label">Upload Foto</label>
          <input type="file" id="foto-file" accept="image/*" capture="environment" class="field-input" style="padding:6px"></div>
      </div>
      <button onclick="uploadFoto('${idEks}')" class="btn btn-primary w-full mt-3" ${ptm.length?'':'disabled'}>Upload & Watermark</button>
    </div></div>
    ${ptm.map(j=>{
      const fotos=getLaporanFotoByPertemuan(j.id_pertemuan);
      return `<div class="card mb-3"><div class="card-header">
        <div><h3 class="font-display text-sm" style="color:var(--text)">${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'})}</h3>
        <p class="text-xs" style="color:var(--text-dim)">${esc(j.materi||'-')} · ${fotos.length}/2 foto</p></div>
        <span class="chip ${fotos.length>=2?'chip-no':fotos.length?'chip-ok':''}">${fotos.length}/2</span></div>
      <div class="card-body">
        ${fotos.length?`<div class="grid grid-cols-2 gap-2">${fotos.map(f=>`
          <div style="position:relative">
            <img src="${f.data_url}" style="width:100%;border-radius:10px;display:block">
            <button onclick="hapusFoto('${f.id}')" class="btn btn-danger" style="position:absolute;top:6px;right:6px;padding:4px 8px;font-size:11px;">Hapus</button>
          </div>`).join('')}</div>`:'<p class="text-xs text-center py-3" style="color:var(--text-dim)">Belum ada foto.</p>'}
      </div></div>`;
    }).join('')}`;
  window.uploadFoto=async idEks=>{
    const idPtm=$('#foto-ptm').value;if(!idPtm)return showToast('Pilih pertemuan','warning');
    const f=$('#foto-file').files[0];if(!f)return showToast('Pilih foto','warning');
    const existing=getLaporanFotoByPertemuan(idPtm);
    if(existing.length>=2)return showToast('Maksimal 2 foto per pertemuan','warning');
    const eks=ekskulById(idEks);
    showToast('Memproses foto...','info');
    try{
      const data=await processPhoto(f,eks.nama_ekskul);
      LAPORAN_FOTO.push({id:uid('f'),id_pertemuan:idPtm,id_ekskul:idEks,id_user:CURRENT_USER.id_user,
        data_url:data,waktu:new Date().toISOString(),dicatat_oleh:CURRENT_USER.id_user});
      persist();showTab('foto');showToast('Foto tersimpan','success');
    }catch(err){showToast('Gagal memproses','error');}
  };
  window.hapusFoto=id=>{
    if(!confirm('Hapus foto ini?'))return;
    LAPORAN_FOTO=LAPORAN_FOTO.filter(f=>f.id!==id);
    persist();showTab('foto');showToast('Dihapus','success');
  };
};

ROUTES.profil=el=>{
  const e=ekskulById(CURRENT_EKSKUL_CTX);
  if(!e)return el.innerHTML=`<div class="card"><div class="card-body text-center py-8" style="color:var(--text-dim)">Belum ditugaskan.</div></div>`;
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Profil Ekskul</h2></div>
    <div class="card-body grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div class="sm:col-span-2 text-center">${e.logo_url?`<img src="${e.logo_url}" style="max-height:100px;margin:0 auto;border-radius:12px">`:''}</div>
      <div><label class="field-label">Nama</label><input id="pf-nama" class="field-input" value="${esc(e.nama_ekskul)}"></div>
      <div><label class="field-label">Jadwal</label><input id="pf-jadwal" class="field-input" value="${esc(e.jadwal_rutin||'')}"></div>
      <div><label class="field-label">Tempat</label><input id="pf-tempat" class="field-input" value="${esc(e.tempat||'')}"></div>
      <div><label class="field-label">Logo</label><input id="pf-logo" type="file" accept="image/*" class="field-input" style="padding:6px"></div>
      <div class="sm:col-span-2"><label class="field-label">Deskripsi</label><textarea id="pf-desc" class="field-input" rows="2">${esc(e.deskripsi||'')}</textarea></div>
      <div class="sm:col-span-2 flex justify-end"><button onclick="saveProfil()" class="btn btn-primary">Simpan</button></div></div></div>`;
  window.saveProfil=async()=>{
    e.nama_ekskul=$('#pf-nama').value.trim();e.jadwal_rutin=$('#pf-jadwal').value.trim();
    e.tempat=$('#pf-tempat').value.trim();e.deskripsi=$('#pf-desc').value.trim();
    const f=$('#pf-logo').files[0];
    if(f){try{e.logo_url=await compressImage(f,512,0.85);}catch(err){}}
    persist();showTab('profil');showToast('Disimpan','success');
  };
};
