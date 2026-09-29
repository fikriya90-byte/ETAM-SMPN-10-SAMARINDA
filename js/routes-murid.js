/* =====================================================================
   routes-murid.js — Dashboard murid, Daftar, Absen, Riwayat
   ===================================================================== */

ROUTES._dashMurid=el=>{
  const aktif=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user&&a.status_anggota==='aktif');
  const myP=PRESENSI.filter(p=>p.id_user===CURRENT_USER.id_user);
  const H=myP.filter(p=>p.status==='hadir').length,I=myP.filter(p=>p.status.startsWith('izin')).length,S=myP.filter(p=>p.status.startsWith('sakit')).length;
  el.innerHTML=`<div class="card mb-5"><div class="card-body">
      <p class="text-xs uppercase" style="color:var(--text-dim)">Selamat datang,</p>
      <p class="font-display text-xl" style="color:var(--text)">${esc(CURRENT_USER.nama_lengkap)}</p>
      <p class="text-xs mt-0.5" style="color:var(--text-muted)">Kelas ${esc(CURRENT_USER.kelas||'-')}</p></div></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Hadir</p><p class="text-2xl font-extrabold mt-1" style="color:#34D399">${H}</p></div>
      <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Izin</p><p class="text-2xl font-extrabold mt-1" style="color:#FBBF24">${I}</p></div>
      <div class="stat-card stat-s"><p class="text-xs uppercase" style="color:var(--text-dim)">Sakit</p><p class="text-2xl font-extrabold mt-1" style="color:#60A5FA">${S}</p></div>
      <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Ekskul</p><p class="text-2xl font-extrabold mt-1" style="color:#A78BFA">${aktif.length}</p></div></div>`;
};

ROUTES.daftar=el=>{
  const mine=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user);
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Katalog Ekstrakurikuler</h2></div>
    <div class="card-body space-y-3">
      ${EKSKUL.map(e=>{
        const reg=mine.find(a=>a.id_ekskul===e.id_ekskul);
        const status=!reg?'<span class="chip">Belum terdaftar</span>':reg.status_anggota==='aktif'?'<span class="chip chip-ok">Aktif</span>':'<span class="chip chip-warn">Menunggu</span>';
        const btn=!reg?`<button onclick="daftarEkskul('${e.id_ekskul}')" class="btn btn-primary" style="padding:6px 14px;font-size:12px;">Daftar</button>`:'';
        return `<div style="display:flex;align-items:center;gap:12px;padding:11px 13px;background:var(--surface-2);border:1px solid var(--border);border-radius:11px">
          <div style="width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-weight:800;color:#0B0B0D;background:linear-gradient(135deg,#3B82F6,#8B5CF6)">${esc(e.nama_ekskul.slice(0,2).toUpperCase())}</div>
          <div class="flex-1 min-w-0"><p class="font-semibold text-sm">${esc(e.nama_ekskul)}</p>
          <p class="text-xs" style="color:var(--text-dim)">${esc(e.jadwal_rutin||'-')}</p></div>
          <div class="flex flex-col gap-1 items-end">${status}${btn}</div></div>`;}).join('')}
    </div></div>`;
  window.daftarEkskul=id=>{
    if(ANGGOTA.some(a=>a.id_user===CURRENT_USER.id_user&&a.id_ekskul===id))return showToast('Sudah terdaftar','warning');
    ANGGOTA.push({id_anggota:uid('a'),id_user:CURRENT_USER.id_user,id_ekskul:id,jabatan:'anggota',status_anggota:'pending',created_at:new Date().toISOString()});
    persist();showTab('daftar');showToast('Pendaftaran terkirim','success');
  };
};

ROUTES.absen=el=>{
  const mine=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user&&a.status_anggota==='aktif');
  const ids=mine.map(a=>a.id_ekskul);
  const openSesi=JURNAL.filter(j=>ids.includes(j.id_ekskul)&&j.status==='open');
  el.innerHTML=`
    <div class="card mb-5"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Absen Kehadiran</h2>
      <span class="chip">${openSesi.length} sesi terbuka</span></div>
    <div class="card-body space-y-4">
      <p class="text-sm" style="color:var(--text-muted)">Pilih: <b>scan QR</b> di lokasi, atau <b>kode manual</b>.</p>
      <div class="grid grid-cols-2 gap-2">
        <button onclick="startQRScan()" class="btn btn-purple" style="padding:14px">Scan QR</button>
        <button onclick="showManualForm()" class="btn btn-blue" style="padding:14px">Kode Manual</button>
      </div>
      <div id="qr-scan-wrap" class="hidden">
        <div class="p-3 rounded-xl" style="background:var(--surface-2);border:1px solid var(--border)">
          <div class="flex justify-between items-center mb-2">
            <p class="text-xs font-bold" style="color:var(--text)">Arahkan kamera ke QR Code</p>
            <button onclick="stopQRScan()" class="btn btn-danger" style="padding:4px 10px;font-size:11.5px;">Tutup</button></div>
          <div id="qr-reader"></div>
          <p class="text-[11px] mt-2 text-center" style="color:var(--text-dim)">Izinkan akses kamera.</p>
        </div>
      </div>
      <div id="manual-wrap" class="hidden space-y-3">
        <div><label class="field-label">Pilih Sesi Terbuka</label>
          <select id="absen-sesi" class="field-input"><option value="">— Pilih —</option>
            ${openSesi.map(j=>{const e=ekskulById(j.id_ekskul);return `<option value="${j.id_pertemuan}">${esc(e?e.nama_ekskul:'-')} — ${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID')}</option>`;}).join('')}
          </select></div>
        <div class="text-center text-xs" style="color:var(--text-dim)">— atau —</div>
        <div><label class="field-label">Kode Sesi</label>
          <input id="absen-kode" class="field-input" placeholder="cth: AB12CD" maxlength="8" style="text-transform:uppercase;letter-spacing:.2em;text-align:center;font-size:18px;font-weight:700"></div>
      </div>
      <div class="grid grid-cols-2 gap-2 pt-2" style="border-top:1px solid var(--border)">
        <button onclick="doAbsen()" class="btn btn-success">Hadir</button>
        <div class="flex gap-2">
          <button onclick="ajukanIzin('izin')" class="btn btn-dark flex-1">Izin</button>
          <button onclick="ajukanIzin('sakit')" class="btn btn-dark flex-1">Sakit</button>
        </div>
      </div>
    </div></div>`;
  window.showManualForm=()=>{$('#manual-wrap').classList.remove('hidden');stopQRScan();};
  window.startQRScan=()=>{
    $('#manual-wrap').classList.add('hidden');$('#qr-scan-wrap').classList.remove('hidden');
    if(!window.Html5Qrcode)return showToast('Library QR tidak termuat','error');
    if(QR_SCANNER)return;
    QR_SCANNER=new Html5Qrcode("qr-reader");
    Html5Qrcode.getCameras().then(cams=>{
      if(!cams.length)return showToast('Tidak ada kamera','error');
      const back=cams.find(c=>/back|rear|environment/i.test(c.label))||cams[cams.length-1];
      return QR_SCANNER.start({deviceId:{exact:back.id}},{fps:10,qrbox:{width:250,height:250},aspectRatio:1.0},
        d=>{handleQRResult(d);stopQRScan();},()=>{});
    }).catch(()=>{
      QR_SCANNER.start({facingMode:"environment"},{fps:10,qrbox:{width:250,height:250}},
        d=>{handleQRResult(d);stopQRScan();},()=>{}
      ).catch(e=>{showToast('Kamera tidak dapat diakses: '+e.message,'error');QR_SCANNER=null;});
    });
  };
  window.stopQRScan=()=>{if(!QR_SCANNER)return;const s=QR_SCANNER;QR_SCANNER=null;try{s.stop().then(()=>s.clear()).catch(()=>{});}catch(e){}};
  window.handleQRResult=txt=>{
    let j=null;
    if(txt&&txt.startsWith('ETAM|')){const[,idPertemuan,kode]=txt.split('|');
      j=JURNAL.find(x=>x.id_pertemuan===idPertemuan&&x.sesi_code===kode&&x.status==='open');}
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
    else{const kode=($('#absen-kode')?$('#absen-kode').value.trim():'').toUpperCase();
      if(!kode)return showToast('Pilih sesi / masukkan kode','warning');
      j=JURNAL.find(x=>x.sesi_code===kode&&x.status==='open');}
    if(!j)return showToast('Sesi tidak ditemukan','error');
    if(!ids.includes(j.id_ekskul))return showToast('Bukan anggota','error');
    if(PRESENSI.find(p=>p.id_pertemuan===j.id_pertemuan&&p.id_user===CURRENT_USER.id_user))return showToast('Sudah absen','warning');
    PRESENSI.push({id_presensi:uid('pr'),id_pertemuan:j.id_pertemuan,id_user:CURRENT_USER.id_user,status:'hadir',waktu_absen:new Date().toISOString(),approved:true});
    persist();showTab('absen');showToast('Absen berhasil!','success');
  };
  window.ajukanIzin=type=>{
    const sid=$('#absen-sesi')?$('#absen-sesi').value:'';if(!sid)return showToast('Pilih sesi dulu','warning');
    const j=JURNAL.find(x=>x.id_pertemuan===sid);if(!j)return;
    if(PRESENSI.find(p=>p.id_pertemuan===j.id_pertemuan&&p.id_user===CURRENT_USER.id_user))return showToast('Sudah ada presensi','warning');
    PRESENSI.push({id_presensi:uid('pr'),id_pertemuan:j.id_pertemuan,id_user:CURRENT_USER.id_user,status:type+'_pending',waktu_absen:new Date().toISOString(),approved:false});
    persist();showTab('absen');showToast('Pengajuan terkirim','success');
  };
};

ROUTES.riwayat=el=>{
  const mine=PRESENSI.filter(p=>p.id_user===CURRENT_USER.id_user).sort((a,b)=>(b.waktu_absen||'').localeCompare(a.waktu_absen||''));
  el.innerHTML=`<div class="card"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Riwayat Presensi</h2><span class="chip">${mine.length}</span></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Tanggal</th><th>Ekskul</th><th>Materi</th><th style="text-align:center;">Status</th></tr></thead>
    <tbody>${mine.length?mine.map(p=>{const j=JURNAL.find(x=>x.id_pertemuan===p.id_pertemuan);if(!j)return '';const e=ekskulById(j.id_ekskul);
      const st=p.status,cls=st==='hadir'?'badge-H':st.startsWith('izin')?'badge-I':st.startsWith('sakit')?'badge-S':st==='alpa'?'badge-A':'badge-P';
      const lbl=st==='hadir'?'H':st.startsWith('izin')?'I':st.startsWith('sakit')?'S':st==='alpa'?'A':'?';
      return `<tr><td>${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</td>
      <td><span class="chip">${esc(e?e.nama_ekskul:'-')}</span></td><td>${esc(j.materi||'-')}</td>
      <td class="text-center"><span class="badge ${cls}">${lbl}</span></td></tr>`;}).join(''):`<tr><td colspan="4" class="text-center" style="padding:20px;color:var(--text-dim)">Kosong.</td></tr>`}</tbody></table></div></div>`;
};
