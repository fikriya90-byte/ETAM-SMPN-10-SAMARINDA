/* =====================================================================
   routes-murid.js — Dashboard murid, Daftar (dropdown), Absen, Riwayat
   ===================================================================== */

ROUTES._dashMurid=el=>{
  const aktif=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user&&a.status_anggota==='aktif');
  const myP=PRESENSI.filter(p=>p.id_user===CURRENT_USER.id_user);
  const H=myP.filter(p=>p.status==='hadir').length,I=myP.filter(p=>p.status.startsWith('izin')).length,S=myP.filter(p=>p.status.startsWith('sakit')).length;
  el.innerHTML=`<div class="card mb-3"><div class="card-body">
      <p class="text-xs uppercase" style="color:var(--text-dim)">Selamat datang,</p>
      <p class="font-display text-lg" style="color:var(--text)">${esc(CURRENT_USER.nama_lengkap)}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">Kelas ${esc(CURRENT_USER.kelas||'-')}</p></div></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Hadir</p><p class="text-xl font-extrabold mt-0.5" style="color:#34D399">${H}</p></div>
      <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Izin</p><p class="text-xl font-extrabold mt-0.5" style="color:#FBBF24">${I}</p></div>
      <div class="stat-card stat-s"><p class="text-xs uppercase" style="color:var(--text-dim)">Sakit</p><p class="text-xl font-extrabold mt-0.5" style="color:#60A5FA">${S}</p></div>
      <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Ekskul</p><p class="text-xl font-extrabold mt-0.5" style="color:#A78BFA">${aktif.length}</p></div></div>`;
};

ROUTES._dashPengurus=el=>{
  const jabat=CURRENT_USER._jabatan,idEks=CURRENT_EKSKUL_CTX,e=ekskulById(idEks);
  if(!e)return el.innerHTML=`<div class="card"><div class="card-body text-center py-8" style="color:var(--text-dim)">Belum ditugaskan.</div></div>`;
  const ag=anggotaAktifOf(idEks).length,jr=JURNAL.filter(j=>j.id_ekskul===idEks).length;
  el.innerHTML=`<div class="card mb-3"><div class="card-body">
      <span class="chip chip-ok">${esc(JABATAN_LABEL[jabat]||'Pengurus')}</span>
      <h2 class="font-display text-lg mt-2" style="color:var(--text)">${esc(e.nama_ekskul)}</h2>
      <p class="text-sm" style="color:var(--text-muted)">${esc(e.deskripsi||'')}</p></div></div>
    <div class="grid grid-cols-2 gap-2.5">
      <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Anggota</p><p class="text-xl font-extrabold mt-0.5" style="color:#34D399">${ag}</p></div>
      <div class="stat-card stat-s"><p class="text-xs uppercase" style="color:var(--text-dim)">Pertemuan</p><p class="text-xl font-extrabold mt-0.5" style="color:#60A5FA">${jr}</p></div></div>`;
};

/* ---------- DAFTAR EKSKUL (dengan dropdown) ---------- */
ROUTES.daftar=el=>{
  const mine=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user);
  const sudahIds=mine.map(a=>a.id_ekskul);
  const available=EKSKUL.filter(e=>!sudahIds.includes(e.id_ekskul));

  el.innerHTML=`
    <div class="card mb-3"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Daftar Ekstrakurikuler</h2></div>
    <div class="card-body space-y-3">
      <div><label class="field-label">Nama Lengkap</label><input value="${esc(CURRENT_USER.nama_lengkap)}" class="field-input" disabled></div>
      <div><label class="field-label">Kelas Anda</label>
        <select id="daftar-kelas" class="field-input">
          ${['7A','7B','7C','7D','7E','7F','7G','7H','7I','7J','8A','8B','9A','9B'].map(k=>`<option ${k===CURRENT_USER.kelas?'selected':''}>${k}</option>`).join('')}
        </select></div>
      <div><label class="field-label">Pilih Ekskul</label>
        <select id="daftar-ekskul" class="field-input" ${available.length?'':'disabled'}>
          ${available.length?available.map(e=>`<option value="${e.id_ekskul}">${esc(e.nama_ekskul)}${e.jadwal_rutin?' — '+esc(e.jadwal_rutin):''}</option>`).join(''):'<option value="">Semua ekskul sudah Anda ikuti</option>'}
        </select></div>
      <button onclick="submitDaftar()" class="btn btn-primary w-full" ${available.length?'':'disabled'} style="padding:10px">
        + Daftar Ekskul Ini
      </button>
    </div></div>
    <div class="card"><div class="card-header"><h3 class="font-display text-base" style="color:var(--text)">Ekskul yang Diikuti</h3></div>
    <div class="card-body space-y-2">
      ${mine.length?mine.map(a=>{const e=ekskulById(a.id_ekskul);if(!e)return '';
        return `<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--surface-2);border:1px solid var(--border);border-radius:11px">
          ${e.logo_url?`<img src="${e.logo_url}" style="width:36px;height:36px;border-radius:9px;object-fit:cover">`:`<div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;background:linear-gradient(135deg,#3B82F6,#8B5CF6);font-size:12px">${esc(e.nama_ekskul.slice(0,2).toUpperCase())}</div>`}
          <div class="flex-1 min-w-0"><p class="font-semibold text-sm">${esc(e.nama_ekskul)}</p>
          <p class="text-xs" style="color:var(--text-dim)">${esc(e.jadwal_rutin||'-')}</p></div>
          <span class="chip chip-ok">Aktif</span>
        </div>`;}).join(''):'<p class="text-sm text-center py-4" style="color:var(--text-dim)">Belum mengikuti ekskul apapun.</p>'}
    </div></div>`;

  window.submitDaftar=()=>{
    const idEks=$('#daftar-ekskul').value;
    const kelas=$('#daftar-kelas').value;
    if(!idEks)return showToast('Pilih ekskul','warning');
    if(!kelas)return showToast('Pilih kelas','warning');

    // Update kelas user
    const uRec=USERS.find(u=>u.id_user===CURRENT_USER.id_user);
    if(uRec)uRec.kelas=kelas;
    CURRENT_USER.kelas=kelas;

    // Daftarkan langsung aktif
    if(ANGGOTA.some(a=>a.id_user===CURRENT_USER.id_user&&a.id_ekskul===idEks))return showToast('Sudah terdaftar','warning');
    ANGGOTA.push({id_anggota:uid('a'),id_user:CURRENT_USER.id_user,id_ekskul:idEks,
      jabatan:'anggota',status_anggota:'aktif',created_at:new Date().toISOString()});
    persist();showTab('daftar');showToast('Berhasil mendaftar!','success');
  };
};

/* ---------- ABSEN (sama seperti sebelumnya, ringkas) ---------- */
ROUTES.absen=el=>{
  const mine=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user&&a.status_anggota==='aktif');
  const ids=mine.map(a=>a.id_ekskul);
  const openSesi=JURNAL.filter(j=>ids.includes(j.id_ekskul)&&j.status==='open');
  el.innerHTML=`
    <div class="card mb-3"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Absen Kehadiran</h2>
      <span class="chip">${openSesi.length} terbuka</span></div>
    <div class="card-body space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <button onclick="startQRScan()" class="btn btn-purple" style="padding:12px">Scan QR</button>
        <button onclick="showManualForm()" class="btn btn-blue" style="padding:12px">Kode Manual</button>
      </div>
      <div id="qr-scan-wrap" class="hidden">
        <div class="p-3 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border)">
          <div class="flex justify-between items-center mb-2">
            <p class="text-xs font-bold" style="color:var(--text)">Arahkan ke QR</p>
            <button onclick="stopQRScan()" class="btn btn-danger" style="padding:3px 10px;font-size:11px;">Tutup</button></div>
          <div id="qr-reader"></div></div></div>
      <div id="manual-wrap" class="hidden space-y-2">
        <div><label class="field-label">Pilih Sesi</label>
          <select id="absen-sesi" class="field-input"><option value="">— Pilih —</option>
            ${openSesi.map(j=>{const e=ekskulById(j.id_ekskul);return `<option value="${j.id_pertemuan}">${esc(e?e.nama_ekskul:'-')}</option>`;}).join('')}
          </select></div>
        <div class="text-center text-xs" style="color:var(--text-dim)">— atau —</div>
        <div><label class="field-label">Kode</label>
          <input id="absen-kode" class="field-input" maxlength="8" style="text-transform:uppercase;letter-spacing:.2em;text-align:center;font-size:18px;font-weight:700"></div>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2" style="border-top:1px solid var(--border)">
        <button onclick="doAbsen()" class="btn btn-success">Hadir</button>
        <div class="flex gap-2">
          <button onclick="ajukanIzin('izin')" class="btn btn-dark flex-1">Izin</button>
          <button onclick="ajukanIzin('sakit')" class="btn btn-dark flex-1">Sakit</button>
        </div></div></div></div>`;
  window.showManualForm=()=>{$('#manual-wrap').classList.remove('hidden');stopQRScan();};
  window.startQRScan=()=>{
    $('#manual-wrap').classList.add('hidden');$('#qr-scan-wrap').classList.remove('hidden');
    if(!window.Html5Qrcode)return showToast('Library QR error','error');
    if(QR_SCANNER)return;
    QR_SCANNER=new Html5Qrcode("qr-reader");
    Html5Qrcode.getCameras().then(cams=>{
      if(!cams.length)return showToast('Tidak ada kamera','error');
      const back=cams.find(c=>/back|rear|environment/i.test(c.label))||cams[cams.length-1];
      return QR_SCANNER.start({deviceId:{exact:back.id}},{fps:10,qrbox:{width:220,height:220}},
        d=>{handleQRResult(d);stopQRScan();},()=>{});
    }).catch(()=>{QR_SCANNER.start({facingMode:"environment"},{fps:10,qrbox:{width:220,height:220}},d=>{handleQRResult(d);stopQRScan();},()=>{}).catch(e=>{showToast('Kamera error','error');QR_SCANNER=null;});});
  };
  window.stopQRScan=()=>{if(!QR_SCANNER)return;const s=QR_SCANNER;QR_SCANNER=null;try{s.stop().then(()=>s.clear()).catch(()=>{});}catch(e){}};
  window.handleQRResult=txt=>{
    let j=null;
    if(txt&&txt.startsWith('ETAM|')){const[,idP,kode]=txt.split('|');j=JURNAL.find(x=>x.id_pertemuan===idP&&x.sesi_code===kode&&x.status==='open');}
    else j=JURNAL.find(x=>x.sesi_code===String(txt).trim().toUpperCase()&&x.status==='open');
    if(!j)return showToast('QR tidak valid','error');
    if(!ids.includes(j.id_ekskul))return showToast('Bukan anggota','error');
    if(PRESENSI.find(p=>p.id_pertemuan===j.id_pertemuan&&p.id_user===CURRENT_USER.id_user))return showToast('Sudah absen','warning');
    PRESENSI.push({id_presensi:uid('pr'),id_pertemuan:j.id_pertemuan,id_user:CURRENT_USER.id_user,status:'hadir',waktu_absen:new Date().toISOString(),approved:true});
    persist();showTab('absen');showToast('Berhasil!','success');
  };
  window.doAbsen=()=>{
    let j=null;const sid=$('#absen-sesi')?$('#absen-sesi').value:'';
    if(sid)j=JURNAL.find(x=>x.id_pertemuan===sid);
    else{const kode=($('#absen-kode')?$('#absen-kode').value.trim():'').toUpperCase();if(!kode)return showToast('Isi kode','warning');j=JURNAL.find(x=>x.sesi_code===kode&&x.status==='open');}
    if(!j)return showToast('Sesi tidak ditemukan','error');
    if(!ids.includes(j.id_ekskul))return showToast('Bukan anggota','error');
    if(PRESENSI.find(p=>p.id_pertemuan===j.id_pertemuan&&p.id_user===CURRENT_USER.id_user))return showToast('Sudah absen','warning');
    PRESENSI.push({id_presensi:uid('pr'),id_pertemuan:j.id_pertemuan,id_user:CURRENT_USER.id_user,status:'hadir',waktu_absen:new Date().toISOString(),approved:true});
    persist();showTab('absen');showToast('Absen berhasil!','success');
  };
  window.ajukanIzin=type=>{
    const sid=$('#absen-sesi')?$('#absen-sesi').value:'';if(!sid)return showToast('Pilih sesi','warning');
    const j=JURNAL.find(x=>x.id_pertemuan===sid);if(!j)return;
    if(PRESENSI.find(p=>p.id_pertemuan===j.id_pertemuan&&p.id_user===CURRENT_USER.id_user))return showToast('Sudah ada','warning');
    PRESENSI.push({id_presensi:uid('pr'),id_pertemuan:j.id_pertemuan,id_user:CURRENT_USER.id_user,status:type+'_pending',waktu_absen:new Date().toISOString(),approved:false});
    persist();showTab('absen');showToast('Terkirim','success');
  };
};

ROUTES.riwayat=el=>{
  const mine=PRESENSI.filter(p=>p.id_user===CURRENT_USER.id_user).sort((a,b)=>(b.waktu_absen||'').localeCompare(a.waktu_absen||''));
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Riwayat Presensi</h2><span class="chip">${mine.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Tanggal</th><th>Ekskul</th><th>Materi</th><th style="text-align:center;">Status</th></tr></thead>
    <tbody>${mine.length?mine.map(p=>{const j=JURNAL.find(x=>x.id_pertemuan===p.id_pertemuan);if(!j)return '';const e=ekskulById(j.id_ekskul);
      const st=p.status,cls=st==='hadir'?'badge-H':st.startsWith('izin')?'badge-I':st.startsWith('sakit')?'badge-S':st==='alpa'?'badge-A':'badge-P';
      const lbl=st==='hadir'?'H':st.startsWith('izin')?'I':st.startsWith('sakit')?'S':st==='alpa'?'A':'?';
      return `<tr><td>${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</td>
      <td><span class="chip">${esc(e?e.nama_ekskul:'-')}</span></td><td>${esc(j.materi||'-')}</td>
      <td class="text-center"><span class="badge ${cls}">${lbl}</span></td></tr>`;}).join(''):`<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
};
