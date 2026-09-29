/* =====================================================================
   routes-kas.js — Kas per Pertemuan (Bukan Mingguan)
   ===================================================================== */

ROUTES.kas=el=>{
  const r=CURRENT_USER.role_sistem;
  if(r==='murid')return renderKasMurid(el);
  if(r==='admin')return renderKasAdmin(el);
  return renderKasPengelola(el,r==='pengurus'?CURRENT_EKSKUL_CTX:null);
};

/* ---------- MURID ---------- */
function renderKasMurid(el){
  const mine=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user&&a.status_anggota==='aktif');
  el.innerHTML=`
    <div class="card mb-3"><div class="card-header"><h2 class="font-display text-base" style="color:var(--text)">Kas Saya</h2></div>
      <div class="card-body">
      <p class="text-sm" style="color:var(--text-muted);margin-bottom:12px">Status pembayaran kas Anda per pertemuan. Klik untuk catat sudah bayar.</p>
      ${mine.map(a=>{
        const e=ekskulById(a.id_ekskul);if(!e)return '';
        const cfg=getKasSetting(e.id_ekskul);
        const ptm=getPertemuanClosed(e.id_ekskul);
        if(!cfg.nominal)return `<div class="card mb-3"><div class="card-body text-center py-4" style="color:var(--text-dim)"><p class="font-semibold">${esc(e.nama_ekskul)}</p><p class="text-xs mt-1">Kas belum diatur pengurus.</p></div></div>`;
        const sudahBayar=ptm.filter(p=>getKasBayar(CURRENT_USER.id_user,p.id_pertemuan)).length;
        const belum=ptm.length-sudahBayar;
        return `<div class="card mb-3"><div class="card-header">
            <div><h3 class="font-display text-sm" style="color:var(--text)">${esc(e.nama_ekskul)}</h3>
            <p class="text-xs mt-0.5" style="color:var(--text-dim)">${fmtRp(cfg.nominal)} / pertemuan</p></div>
            ${cfg.disepakati?'<span class="chip chip-ok">Disepakati</span>':'<span class="chip chip-warn">Belum disepakati</span>'}
          </div>
          <div class="card-body">
            <div class="grid grid-cols-2 gap-2 mb-3">
              <div class="px-3 py-2 rounded-lg" style="background:rgba(16,185,129,.1)"><p class="text-xs" style="color:var(--text-dim)">Sudah Bayar</p><p class="font-display text-base" style="color:#34D399">${sudahBayar}× pertemuan</p></div>
              <div class="px-3 py-2 rounded-lg" style="background:rgba(239,68,68,.1)"><p class="text-xs" style="color:var(--text-dim)">Belum Bayar</p><p class="font-display text-base" style="color:#F87171">${belum}× pertemuan</p></div>
            </div>
            <p class="field-label">Daftar Pertemuan</p>
            <div class="space-y-1 max-h-96 overflow-auto custom-scrollbar">
              ${ptm.length?ptm.map((p,i)=>{
                const bayar=getKasBayar(CURRENT_USER.id_user,p.id_pertemuan);
                return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;background:${bayar?'rgba(16,185,129,.08)':'var(--surface-2)'};border:1px solid ${bayar?'rgba(16,185,129,.3)':'var(--border)'};border-radius:9px">
                  <div style="width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;background:${bayar?'#10B981':'#EF4444'};color:#fff">${i+1}</div>
                  <div class="flex-1"><p class="text-sm font-semibold">${new Date(p.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</p>
                  <p class="text-xs" style="color:var(--text-dim)">${esc(p.materi||'-')}</p></div>
                  ${bayar?`<span class="chip chip-ok">${fmtRp(bayar.jumlah)}</span>`:`<button onclick="bayarKas('${e.id_ekskul}','${p.id_pertemuan}')" class="btn btn-success" style="padding:4px 10px;font-size:11.5px;">Bayar</button>`}
                </div>`;}).join(''):'<p class="text-xs text-center py-3" style="color:var(--text-dim)">Belum ada pertemuan tertutup.</p>'}
            </div>
          </div></div>`;
      }).join('')||'<div class="card"><div class="card-body text-center py-8" style="color:var(--text-dim)">Belum terdaftar di ekskul.</div></div>'}
      </div></div>`;

  window.bayarKas=(idEks,idPtm)=>{
    const cfg=getKasSetting(idEks);
    const e=ekskulById(idEks);
    const p=JURNAL.find(j=>j.id_pertemuan===idPtm);
    $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="card w-full max-w-md animate-fade-in"><div class="card-header"><h3 class="font-display text-base" style="color:var(--text)">Bayar Kas</h3></div>
      <div class="card-body space-y-3">
        <div class="px-3 py-3 rounded-lg" style="background:var(--surface-2)">
          <p class="text-xs" style="color:var(--text-dim)">Ekskul</p><p class="font-semibold text-sm">${esc(e.nama_ekskul)}</p>
          <p class="text-xs mt-2" style="color:var(--text-dim)">Pertemuan</p><p class="font-semibold text-sm">${new Date(p.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'long'})}</p>
          <p class="text-xs mt-2" style="color:var(--text-dim)">Nominal</p><p class="font-display text-xl" style="color:#A78BFA">${fmtRp(cfg.nominal)}</p>
        </div>
        <div><label class="field-label">Tanggal Bayar</label><input id="bayar-tgl" type="date" class="field-input" value="${todayStr()}"></div>
        <div><label class="field-label">Catatan (opsional)</label><input id="bayar-catatan" class="field-input" placeholder="cth: Bayar tunai tgl 5"></div>
        <p class="text-[11px] px-3 py-2 rounded-lg" style="background:rgba(96,165,250,.1);color:#60A5FA">
          Metode: <b>Tunai ke Bendahara</b>. Konfirmasi fisik dilakukan di luar aplikasi.</p>
        <div class="flex gap-2"><button onclick="konfirmasiBayarKas('${idEks}','${idPtm}')" class="btn btn-success flex-1">Konfirmasi</button>
        <button onclick="closeModal()" class="btn btn-dark flex-1">Batal</button></div>
      </div></div></div>`;
  };
  window.konfirmasiBayarKas=(idEks,idPtm)=>{
    const cfg=getKasSetting(idEks);
    if(getKasBayar(CURRENT_USER.id_user,idPtm))return showToast('Sudah tercatat','warning');
    KAS_BAYAR.push({id_bayar:uid('kb'),id_user:CURRENT_USER.id_user,id_ekskul:idEks,id_pertemuan:idPtm,
      jumlah:cfg.nominal,tanggal:$('#bayar-tgl').value||todayStr(),
      metode:'Tunai ke Bendahara',catatan:$('#bayar-catatan').value.trim(),
      dicatat_oleh:CURRENT_USER.id_user,self_report:true,created_at:new Date().toISOString()});
    persist();closeModal();showTab('kas');showToast('Tercatat','success');
  };
}

/* ---------- ADMIN ---------- */
function renderKasAdmin(el){
  const rows=EKSKUL.map(e=>{
    const cfg=getKasSetting(e.id_ekskul);
    const ptm=getPertemuanClosed(e.id_ekskul);
    const anggota=anggotaAktifOf(e.id_ekskul);
    const target=anggota.length*ptm.length;
    const sudah=KAS_BAYAR.filter(b=>b.id_ekskul===e.id_ekskul).length;
    return {e,cfg,ptm,anggota,target,sudah,belum:target-sudah};
  });
  const totalTarget=rows.reduce((s,r)=>s+r.target,0);
  const totalSudah=rows.reduce((s,r)=>s+r.sudah,0);
  el.innerHTML=`
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
      <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Total Target</p><p class="text-base font-extrabold mt-0.5" style="color:#A78BFA">${totalTarget}× bayar</p></div>
      <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Sudah Bayar</p><p class="text-base font-extrabold mt-0.5" style="color:#34D399">${totalSudah}× bayar</p></div>
      <div class="stat-card stat-a"><p class="text-xs uppercase" style="color:var(--text-dim)">Belum Bayar</p><p class="text-base font-extrabold mt-0.5" style="color:#F87171">${totalTarget-totalSudah}× bayar</p></div>
      <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Periode</p><p class="text-base font-extrabold mt-0.5" style="color:#FBBF24">Per Pertemuan</p></div>
    </div>
    <div class="card"><div class="card-header"><h3 class="font-display text-base" style="color:var(--text)">Ringkasan</h3></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Ekskul</th><th style="text-align:center;">Nominal</th><th style="text-align:center;">Pertemuan</th><th style="text-align:center;">Anggota</th><th style="text-align:right;">Target</th><th style="text-align:right;">Sudah</th><th style="text-align:right;">Belum</th></tr></thead>
    <tbody>${rows.map(r=>`<tr>
      <td class="font-semibold">${esc(r.e.nama_ekskul)} ${r.cfg.disepakati?'<span class="chip chip-ok" style="font-size:10px">✓</span>':''}</td>
      <td class="text-center">${r.cfg.nominal?fmtRp(r.cfg.nominal):'-'}</td>
      <td class="text-center">${r.ptm.length}</td><td class="text-center">${r.anggota.length}</td>
      <td class="text-right">${r.target}×</td><td class="text-right" style="color:#34D399">${r.sudah}×</td>
      <td class="text-right" style="color:#F87171">${r.belum}×</td></tr>`).join('')}</tbody></table></div></div>`;
}

/* ---------- PENGELOLA (Guru/Pelatih/Pengurus) ---------- */
function renderKasPengelola(el,idEksFokus){
  const ids=idEksFokus?[idEksFokus]:userEkskulIds(CURRENT_USER.id_user);
  el.innerHTML=ids.map(idEks=>{
    const e=ekskulById(idEks);if(!e)return '';
    const cfg=getKasSetting(idEks);
    const ptm=getPertemuanClosed(idEks);
    const anggota=anggotaAktifOf(idEks);
    const target=anggota.length*ptm.length;
    const sudah=KAS_BAYAR.filter(b=>b.id_ekskul===idEks).length;
    const belum=target-sudah;
    return `<div class="card mb-3"><div class="card-header">
        <div><h3 class="font-display text-base" style="color:var(--text)">${esc(e.nama_ekskul)}</h3>
        <p class="text-xs mt-0.5" style="color:var(--text-dim)">${cfg.nominal?fmtRp(cfg.nominal)+' / pertemuan':'Belum diatur'} ${cfg.disepakati?'· <span style="color:#34D399">✓ Disepakati</span>':'· <span style="color:#FBBF24">Belum disepakati</span>'}</p></div>
        <button onclick="openAturKas('${idEks}')" class="btn btn-dark" style="padding:5px 10px;font-size:11.5px;">Atur Kas</button>
      </div>
      <div class="card-body">
        ${cfg.nominal?`
          <div class="grid grid-cols-3 gap-2 mb-3">
            <div class="px-3 py-2 rounded-lg" style="background:rgba(139,92,246,.1)"><p class="text-xs" style="color:var(--text-dim)">Target</p><p class="font-display text-base" style="color:#A78BFA">${target}×</p></div>
            <div class="px-3 py-2 rounded-lg" style="background:rgba(16,185,129,.1)"><p class="text-xs" style="color:var(--text-dim)">Sudah</p><p class="font-display text-base" style="color:#34D399">${sudah}×</p></div>
            <div class="px-3 py-2 rounded-lg" style="background:rgba(239,68,68,.1)"><p class="text-xs" style="color:var(--text-dim)">Belum</p><p class="font-display text-base" style="color:#F87171">${belum}×</p></div>
          </div>
          <p class="field-label">Matriks per Pertemuan</p>
          <div class="overflow-x-auto custom-scrollbar">
            <table style="min-width:100%">
              <thead><tr>
                <th style="position:sticky;left:0;background:var(--surface-2);z-index:2;min-width:130px">Nama</th>
                ${ptm.map(p=>`<th style="text-align:center;min-width:50px;font-size:10px">${new Date(p.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})}</th>`).join('')}
                <th style="text-align:right;min-width:60px">Total</th>
              </tr></thead>
              <tbody>
                ${anggota.map(a=>{const u=userById(a.id_user);if(!u)return '';
                  let sudahA=0;
                  const cells=ptm.map(p=>{
                    const b=getKasBayar(a.id_user,p.id_pertemuan);
                    if(b)sudahA++;
                    return `<td style="text-align:center"><button onclick="toggleBayarPtm('${a.id_user}','${idEks}','${p.id_pertemuan}')" class="cell-bayar cell-bayar-mini ${b?'cell-sudah':'cell-belum'}">${b?'✓':''}</button></td>`;
                  }).join('');
                  return `<tr>
                    <td style="position:sticky;left:0;background:var(--surface);z-index:1;font-weight:600;font-size:12px">${esc(u.nama_lengkap)}<br><span style="font-size:10px;color:var(--text-dim)">${esc(u.kelas||'-')}</span></td>
                    ${cells}
                    <td style="text-align:right;color:#34D399;font-weight:700;font-size:12px">${sudahA}×</td>
                  </tr>`;
                }).join('')||`<tr><td colspan="${ptm.length+2}" class="text-center" style="padding:16px;color:var(--text-dim)">Belum ada anggota/pertemuan.</td></tr>`}
              </tbody>
            </table>
          </div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button onclick="lihatBelumBayarKas('${idEks}')" class="btn btn-primary" style="padding:5px 10px;font-size:11.5px;">Lihat Belum Bayar</button>
            <button onclick="exportKasCSV('${idEks}')" class="btn btn-dark" style="padding:5px 10px;font-size:11.5px;">CSV</button>
          </div>
        `:'<p class="text-sm text-center py-4" style="color:var(--text-dim)">Belum diatur. Klik "Atur Kas".</p>'}
      </div></div>`;
  }).join('')||'<div class="card"><div class="card-body text-center py-8" style="color:var(--text-dim)">Belum ada ekskul.</div></div>';

  window.openAturKas=idEks=>{
    const cfg=getKasSetting(idEks);
    $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="card w-full max-w-md animate-fade-in"><div class="card-header"><h3 class="font-display text-base" style="color:var(--text)">Atur Kas</h3></div>
      <div class="card-body space-y-3">
        <div><label class="field-label">Nominal per Pertemuan (Rp)</label>
          <input id="kas-nominal" type="number" class="field-input" value="${cfg.nominal||3000}" min="0"></div>
        <div><label class="field-label">Keterangan</label>
          <input id="kas-ket" class="field-input" value="${esc(cfg.keterangan||'')}" placeholder="cth: hasil rapat tgl 5 Nov"></div>
        <div><label class="field-label">Status Kesepakatan</label>
          <div style="display:flex;align-items:center;gap:10px;padding:12px;background:var(--surface-2);border-radius:10px">
            <input type="checkbox" id="kas-disepakati" ${cfg.disepakati?'checked':''} style="width:20px;height:20px;cursor:pointer">
            <label for="kas-disepakati" style="cursor:pointer;font-size:13px">Sudah disepakati bersama di luar aplikasi</label>
          </div>
        </div>
        <div class="flex gap-2"><button onclick="simpanAturKas('${idEks}')" class="btn btn-primary flex-1">Simpan</button>
        <button onclick="closeModal()" class="btn btn-dark flex-1">Batal</button></div>
      </div></div></div>`;
  };
  window.simpanAturKas=idEks=>{
    KAS_SETTING[idEks]={
      nominal:Number($('#kas-nominal').value)||0,
      keterangan:$('#kas-ket').value.trim(),
      disepakati:$('#kas-disepakati').checked,
      metode:'Tunai ke Bendahara'
    };
    persist();closeModal();showTab('kas');showToast('Kas disimpan','success');
  };
  window.toggleBayarPtm=(idUser,idEks,idPtm)=>{
    const ex=getKasBayar(idUser,idPtm);
    if(ex){
      if(!confirm('Hapus catatan bayar ini?'))return;
      KAS_BAYAR=KAS_BAYAR.filter(b=>b.id_bayar!==ex.id_bayar);
      persist();showTab('kas');showToast('Dihapus','warning');
    }else{
      const cfg=getKasSetting(idEks);
      KAS_BAYAR.push({id_bayar:uid('kb'),id_user:idUser,id_ekskul:idEks,id_pertemuan:idPtm,
        jumlah:cfg.nominal,tanggal:todayStr(),metode:'Tunai ke Bendahara',catatan:'',
        dicatat_oleh:CURRENT_USER.id_user,self_report:false,created_at:new Date().toISOString()});
      persist();showTab('kas');showToast('Tercatat','success');
    }
  };
  window.lihatBelumBayarKas=idEks=>{
    const e=ekskulById(idEks);const ptm=getPertemuanClosed(idEks);const anggota=anggotaAktifOf(idEks);
    const rows=anggota.map(a=>{
      const u=userById(a.id_user);
      const belum=ptm.filter(p=>!getKasBayar(a.id_user,p.id_pertemuan));
      return {u,belum};
    }).filter(r=>r.u&&r.belum.length);
    $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="card w-full max-w-2xl animate-fade-in" style="max-height:85vh;overflow:auto">
        <div class="card-header"><h3 class="font-display text-base" style="color:var(--text)">Belum Bayar — ${esc(e.nama_ekskul)}</h3>
        <button onclick="closeModal()" class="btn btn-dark" style="padding:4px 10px;font-size:12px;">Tutup</button></div>
        <div class="card-body">
        ${rows.length?`<div class="space-y-2">${rows.map(r=>`
          <div class="px-3 py-2 rounded-lg" style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.2)">
            <p class="font-semibold text-sm">${esc(r.u.nama_lengkap)} <span class="text-xs" style="color:var(--text-dim)">(${esc(r.u.kelas||'-')})</span></p>
            <p class="text-xs mt-1" style="color:#F87171">Belum: ${r.belum.map(p=>new Date(p.tanggal+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric',month:'short'})).join(', ')}</p>
          </div>`).join('')}</div>`:'<p class="text-sm text-center py-6" style="color:var(--text-dim)">Semua sudah bayar.</p>'}
        </div></div></div>`;
  };
  window.exportKasCSV=idEks=>{
    const e=ekskulById(idEks);const ptm=getPertemuanClosed(idEks);const anggota=anggotaAktifOf(idEks);
    const r=[['Nama','Kelas',...ptm.map(p=>new Date(p.tanggal+'T00:00:00').toLocaleDateString('id-ID')),'Total']];
    anggota.forEach(a=>{const u=userById(a.id_user);if(!u)return;let sudah=0;
      const cells=ptm.map(p=>{const b=getKasBayar(a.id_user,p.id_pertemuan);if(b)sudah++;return b?'✓':'';});
      r.push([u.nama_lengkap,u.kelas||'',...cells,sudah]);});
    downloadCSV(r,`ETAM_Kas_${e.nama_ekskul}.csv`);
  };
}
