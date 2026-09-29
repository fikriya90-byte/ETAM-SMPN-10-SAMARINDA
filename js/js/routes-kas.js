/* =====================================================================
   routes-kas.js — Modul Kas & Iuran
   ===================================================================== */

ROUTES.kas=el=>{
  const r=CURRENT_USER.role_sistem;
  if(r==='admin')return renderKasAdmin(el);
  if(r==='guru'||r==='pelatih')return renderKasPengelola(el,null);
  if(r==='pengurus')return renderKasPengelola(el,CURRENT_EKSKUL_CTX);
  return renderKasMurid(el);
};

function renderKasMurid(el){
  const mine=ANGGOTA.filter(a=>a.id_user===CURRENT_USER.id_user&&a.status_anggota==='aktif');
  const ids=mine.map(a=>a.id_ekskul);
  const bulan=BULAN[KAS_BULAN];
  let totalTarget=0,totalSudah=0;
  ids.forEach(idEks=>{
    const cfg=getIuranCfg(idEks);if(!cfg.aktif)return;
    const periodeList=getPeriodeList(idEks,bulan,KAS_TAHUN);
    periodeList.forEach(p=>{totalTarget+=cfg.jumlah;
      if(findBayar(CURRENT_USER.id_user,idEks,bulan,KAS_TAHUN,p.label))totalSudah+=cfg.jumlah;});
  });
  el.innerHTML=`
    <div class="card mb-5"><div class="card-body flex flex-wrap gap-3 items-end">
      <div><label class="field-label">Bulan</label>
        <select id="kas-bulan" class="field-input" style="width:auto;padding:7px 12px" onchange="setKasBulan(this.value)">
          ${BULAN.map((b,i)=>`<option value="${i}" ${i===KAS_BULAN?'selected':''}>${b}</option>`).join('')}
        </select></div>
      <div><label class="field-label">Tahun</label>
        <input id="kas-tahun" type="number" class="field-input" style="width:auto;padding:7px 12px" value="${KAS_TAHUN}" onchange="setKasTahun(this.value)"></div>
    </div></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Total Target</p><p class="text-lg font-extrabold mt-1" style="color:var(--gold)">${fmtRp(totalTarget)}</p></div>
      <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Sudah Dibayar</p><p class="text-lg font-extrabold mt-1" style="color:#4ADE80">${fmtRp(totalSudah)}</p></div>
      <div class="stat-card stat-a"><p class="text-xs uppercase" style="color:var(--text-dim)">Kekurangan</p><p class="text-lg font-extrabold mt-1" style="color:#F87171">${fmtRp(totalTarget-totalSudah)}</p></div>
      <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Bulan</p><p class="text-lg font-extrabold mt-1" style="color:#FBBF24">${esc(bulan)} ${KAS_TAHUN}</p></div>
    </div>
    ${ids.length?ids.map(idEks=>{
      const e=ekskulById(idEks);if(!e)return '';
      const cfg=getIuranCfg(idEks);
      if(!cfg.aktif)return `<div class="card mb-5"><div class="card-body text-center py-6" style="color:var(--text-dim)">
        <p class="font-semibold">${esc(e.nama_ekskul)}</p><p class="text-xs mt-1">Iuran belum diatur oleh pengurus.</p></div></div>`;
      const periodeList=getPeriodeList(idEks,bulan,KAS_TAHUN);
      return `<div class="card mb-5"><div class="card-header">
          <div><h3 class="font-display text-lg" style="color:var(--gold)">${esc(e.nama_ekskul)}</h3>
          <p class="text-xs mt-0.5" style="color:var(--text-dim)">${fmtRp(cfg.jumlah)} / ${cfg.mode==='pertemuan'?'pertemuan':'minggu'} · ${esc(cfg.keterangan||'')}</p></div></div>
        <div class="card-body">
          <p class="field-label">Klik periode untuk catat pembayaran</p>
          <div class="flex flex-wrap gap-2">
            ${periodeList.map(p=>{
              const b=findBayar(CURRENT_USER.id_user,idEks,bulan,KAS_TAHUN,p.label);
              return `<button onclick="toggleBayarMurid('${idEks}','${p.label}')" class="cell-bayar ${b?'cell-sudah':'cell-belum'}">${esc(p.label)}</button>`;
            }).join('')}
          </div>
          <div class="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div class="px-3 py-2 rounded-lg" style="background:rgba(74,222,128,.08);color:#4ADE80">✓ Sudah: ${periodeList.filter(p=>findBayar(CURRENT_USER.id_user,idEks,bulan,KAS_TAHUN,p.label)).length} ${cfg.mode==='pertemuan'?'pertemuan':'minggu'}</div>
            <div class="px-3 py-2 rounded-lg" style="background:rgba(248,113,113,.08);color:#F87171">✕ Belum: ${periodeList.filter(p=>!findBayar(CURRENT_USER.id_user,idEks,bulan,KAS_TAHUN,p.label)).length} ${cfg.mode==='pertemuan'?'pertemuan':'minggu'}</div>
          </div>
        </div></div>`;
    }).join(''):`<div class="card"><div class="card-body text-center py-10" style="color:var(--text-dim)">Belum terdaftar di ekskul manapun.</div></div>`}`;

  window.setKasBulan=v=>{KAS_BULAN=parseInt(v);showTab('kas');};
  window.setKasTahun=v=>{KAS_TAHUN=parseInt(v)||new Date().getFullYear();showTab('kas');};
  window.toggleBayarMurid=(idEks,label)=>{
    const ex=findBayar(CURRENT_USER.id_user,idEks,bulan,KAS_TAHUN,label);
    if(ex){
      if(!confirm('Batalkan pencatatan ini?'))return;
      KAS_BAYAR=KAS_BAYAR.filter(b=>b.id_bayar!==ex.id_bayar);
      persist();showTab('kas');showToast('Dibatalkan','warning');
    }else{
      const cfg=getIuranCfg(idEks);
      $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="card w-full max-w-md animate-fade-in"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Catat Pembayaran ${esc(label)}</h3></div>
        <div class="card-body space-y-3.5">
          <div class="px-3 py-3 rounded-lg" style="background:var(--surface-2)"><p class="text-xs" style="color:var(--text-dim)">Jumlah</p>
            <p class="font-display text-2xl" style="color:var(--gold)">${fmtRp(cfg.jumlah)}</p></div>
          <div><label class="field-label">Tanggal Bayar</label><input id="bayar-tgl" type="date" class="field-input" value="${todayStr()}"></div>
          <div><label class="field-label">Metode</label>
            <select id="bayar-metode" class="field-input">
              <option value="Tunai ke Bendahara">Tunai ke Bendahara</option>
              <option value="Tunai ke Pembina">Tunai ke Pembina</option>
              <option value="Transfer Bank">Transfer Bank</option>
              <option value="E-Wallet">E-Wallet</option>
            </select></div>
          <div><label class="field-label">Catatan (opsional)</label><input id="bayar-catatan" class="field-input"></div>
          <p class="text-[11px] px-3 py-2 rounded-lg" style="background:rgba(96,165,250,.1);color:#60A5FA;border:1px solid rgba(96,165,250,.3)">
            ℹ️ Hanya pencatatan. Pembayaran fisik ke Bendahara/Pembina.</p>
          <div class="flex gap-2"><button onclick="konfirmasiBayarMurid('${idEks}','${label}')" class="btn btn-success flex-1">Catat</button>
          <button onclick="closeModal()" class="btn btn-dark flex-1">Batal</button></div></div></div></div>`;
    }
  };
  window.konfirmasiBayarMurid=(idEks,label)=>{
    const cfg=getIuranCfg(idEks);
    KAS_BAYAR.push({id_bayar:uid('kb'),id_user:CURRENT_USER.id_user,id_ekskul:idEks,bulan,tahun:KAS_TAHUN,
      periode_label:label,jumlah:cfg.jumlah,tanggal:$('#bayar-tgl').value||todayStr(),
      metode:$('#bayar-metode').value,catatan:$('#bayar-catatan').value.trim(),
      dicatat_oleh:CURRENT_USER.id_user,self_report:true,created_at:new Date().toISOString()});
    persist();closeModal();showTab('kas');showToast('Tercatat','success');
  };
}

function renderKasAdmin(el){
  const bulan=BULAN[KAS_BULAN];
  let totalSemua=0,totalTarget=0;
  const perEks=EKSKUL.map(e=>{
    const cfg=getIuranCfg(e.id_ekskul);
    if(!cfg.aktif)return {e,cfg,aktif:false};
    const anggota=anggotaAktifOf(e.id_ekskul);
    const periodeList=getPeriodeList(e.id_ekskul,bulan,KAS_TAHUN);
    let sudah=0;
    const target=anggota.length*periodeList.length*cfg.jumlah;
    KAS_BAYAR.filter(b=>b.id_ekskul===e.id_ekskul&&b.bulan===bulan&&b.tahun===KAS_TAHUN).forEach(b=>sudah+=Number(b.jumlah||0));
    totalSemua+=sudah;totalTarget+=target;
    return {e,cfg,aktif:true,anggota,sudah,target,kurang:target-sudah};
  });
  el.innerHTML=`
    <div class="card mb-5"><div class="card-body flex flex-wrap gap-3 items-end">
      <div><label class="field-label">Bulan</label>
        <select id="kas-bulan" class="field-input" style="width:auto;padding:7px 12px" onchange="setKasBulan(this.value)">
          ${BULAN.map((b,i)=>`<option value="${i}" ${i===KAS_BULAN?'selected':''}>${b}</option>`).join('')}
        </select></div>
      <div><label class="field-label">Tahun</label>
        <input id="kas-tahun" type="number" class="field-input" style="width:auto;padding:7px 12px" value="${KAS_TAHUN}" onchange="setKasTahun(this.value)"></div>
    </div></div>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <div class="stat-card stat-cash"><p class="text-xs uppercase" style="color:var(--text-dim)">Target</p><p class="text-lg font-extrabold mt-1" style="color:var(--gold)">${fmtRp(totalTarget)}</p></div>
      <div class="stat-card stat-h"><p class="text-xs uppercase" style="color:var(--text-dim)">Terkumpul</p><p class="text-lg font-extrabold mt-1" style="color:#4ADE80">${fmtRp(totalSemua)}</p></div>
      <div class="stat-card stat-a"><p class="text-xs uppercase" style="color:var(--text-dim)">Kekurangan</p><p class="text-lg font-extrabold mt-1" style="color:#F87171">${fmtRp(Math.max(0,totalTarget-totalSemua))}</p></div>
      <div class="stat-card stat-i"><p class="text-xs uppercase" style="color:var(--text-dim)">Periode</p><p class="text-lg font-extrabold mt-1" style="color:#FBBF24">${esc(bulan)} ${KAS_TAHUN}</p></div>
    </div>
    <div class="card"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Rekap Kas per Ekskul</h3></div>
    <div class="overflow-x-auto custom-scrollbar"><table><thead><tr><th>Ekskul</th><th>Iuran</th><th style="text-align:center;">Anggota</th><th style="text-align:right;">Target</th><th style="text-align:right;">Terkumpul</th><th style="text-align:right;">Kekurangan</th></tr></thead>
    <tbody>${perEks.map(x=>x.aktif?`<tr>
      <td class="font-semibold">${esc(x.e.nama_ekskul)}</td>
      <td><span class="chip">${fmtRp(x.cfg.jumlah)}/${x.cfg.mode==='pertemuan'?'P':'M'}</span></td>
      <td class="text-center">${x.anggota.length}</td>
      <td class="text-right" style="color:var(--text-muted)">${fmtRp(x.target)}</td>
      <td class="text-right font-bold" style="color:#4ADE80">${fmtRp(x.sudah)}</td>
      <td class="text-right font-bold" style="color:#F87171">${fmtRp(x.kurang)}</td></tr>`:`<tr>
      <td class="font-semibold">${esc(x.e.nama_ekskul)}</td><td colspan="5" style="color:var(--text-dim)">Iuran belum diatur</td></tr>`).join('')}</tbody></table></div></div>`;
  window.setKasBulan=v=>{KAS_BULAN=parseInt(v);showTab('kas');};
  window.setKasTahun=v=>{KAS_TAHUN=parseInt(v)||new Date().getFullYear();showTab('kas');};
}

function renderKasPengelola(el,idEksFokus){
  const ids=idEksFokus?[idEksFokus]:userEkskulIds(CURRENT_USER.id_user);
  const bulan=BULAN[KAS_BULAN];
  el.innerHTML=`
    <div class="card mb-5"><div class="card-body flex flex-wrap gap-3 items-end">
      <div><label class="field-label">Bulan</label>
        <select id="kas-bulan" class="field-input" style="width:auto;padding:7px 12px" onchange="setKasBulan(this.value)">
          ${BULAN.map((b,i)=>`<option value="${i}" ${i===KAS_BULAN?'selected':''}>${b}</option>`).join('')}
        </select></div>
      <div><label class="field-label">Tahun</label>
        <input id="kas-tahun" type="number" class="field-input" style="width:auto;padding:7px 12px" value="${KAS_TAHUN}" onchange="setKasTahun(this.value)"></div>
    </div></div>
    ${ids.map(idEks=>{
      const e=ekskulById(idEks);if(!e)return '';
      const cfg=getIuranCfg(idEks);
      const anggota=anggotaAktifOf(idEks);
      const periodeList=getPeriodeList(idEks,bulan,KAS_TAHUN);
      const target=anggota.length*periodeList.length*cfg.jumlah;
      let terkumpul=0;
      anggota.forEach(a=>periodeList.forEach(p=>{const b=findBayar(a.id_user,idEks,bulan,KAS_TAHUN,p.label);if(b)terkumpul+=Number(b.jumlah||0);}));
      const kurang=target-terkumpul;
      return `
      <div class="card mb-5"><div class="card-header">
        <div><h3 class="font-display text-lg" style="color:var(--gold)">${esc(e.nama_ekskul)}</h3>
        <p class="text-xs mt-0.5" style="color:var(--text-dim)">${cfg.aktif?`${fmtRp(cfg.jumlah)} / ${cfg.mode==='pertemuan'?'pertemuan':'minggu'} · ${cfg.jumlah_periode} periode/bulan`:'Iuran belum diatur'}</p></div>
        <button onclick="openSettingIuran('${idEks}')" class="btn btn-dark" style="padding:6px 12px;font-size:12px;">⚙ Atur Iuran</button>
      </div>
      <div class="card-body">
        ${cfg.aktif?`
          <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="px-3 py-2 rounded-lg" style="background:rgba(232,181,5,.1)"><p class="text-xs" style="color:var(--text-dim)">Target</p><p class="font-display text-lg" style="color:var(--gold)">${fmtRp(target)}</p></div>
            <div class="px-3 py-2 rounded-lg" style="background:rgba(74,222,128,.1)"><p class="text-xs" style="color:var(--text-dim)">Terkumpul</p><p class="font-display text-lg" style="color:#4ADE80">${fmtRp(terkumpul)}</p></div>
            <div class="px-3 py-2 rounded-lg" style="background:rgba(248,113,113,.1)"><p class="text-xs" style="color:var(--text-dim)">Kekurangan</p><p class="font-display text-lg" style="color:#F87171">${fmtRp(kurang)}</p></div>
          </div>
          <p class="field-label">Matriks Pembayaran — klik sel untuk catat/batal</p>
          <div class="overflow-x-auto custom-scrollbar">
            <table style="min-width:100%">
              <thead><tr>
                <th style="position:sticky;left:0;background:var(--surface-2);z-index:2">Nama</th>
                ${periodeList.map(p=>`<th style="text-align:center;min-width:56px" title="${p.tanggal?new Date(p.tanggal).toLocaleDateString('id-ID'):''}">${esc(p.label)}</th>`).join('')}
                <th style="text-align:right;min-width:100px">Total</th>
                <th style="text-align:right;min-width:100px">Kurang</th>
              </tr></thead>
              <tbody>
                ${anggota.map(a=>{const u=userById(a.id_user);if(!u)return '';
                  let sudah=0;
                  const cells=periodeList.map(p=>{
                    const b=findBayar(a.id_user,idEks,bulan,KAS_TAHUN,p.label);
                    if(b)sudah+=Number(b.jumlah||0);
                    return `<td style="text-align:center"><button onclick="toggleBayarAtasNama('${a.id_user}','${idEks}','${p.label}')" class="cell-bayar cell-bayar-mini ${b?'cell-sudah':'cell-belum'}">${b?'✓':''}</button></td>`;
                  }).join('');
                  const kurangA=periodeList.length*cfg.jumlah-sudah;
                  return `<tr>
                    <td style="position:sticky;left:0;background:var(--surface);z-index:1;font-weight:600">${esc(u.nama_lengkap)}<br><span style="font-size:11px;color:var(--text-dim)">${esc(u.kelas||'-')}</span></td>
                    ${cells}
                    <td style="text-align:right;color:#4ADE80;font-weight:700">${fmtRp(sudah)}</td>
                    <td style="text-align:right;color:${kurangA>0?'#F87171':'var(--text-dim)'};font-weight:700">${fmtRp(kurangA)}</td></tr>`;
                }).join('')||`<tr><td colspan="${periodeList.length+3}" class="text-center" style="padding:20px;color:var(--text-dim)">Belum ada anggota aktif.</td></tr>`}
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            <button onclick="lihatBelumBayar('${idEks}')" class="btn btn-primary" style="padding:6px 12px;font-size:12px;">Lihat yang Belum Bayar</button>
            <button onclick="exportKasCSV('${idEks}')" class="btn btn-dark" style="padding:6px 12px;font-size:12px;">Export CSV</button>
          </div>
        `:'<p class="text-sm text-center py-6" style="color:var(--text-dim)">Belum diatur. Klik "Atur Iuran".</p>'}
      </div></div>`;
    }).join('')}`;

  window.setKasBulan=v=>{KAS_BULAN=parseInt(v);showTab('kas');};
  window.setKasTahun=v=>{KAS_TAHUN=parseInt(v)||new Date().getFullYear();showTab('kas');};

  window.openSettingIuran=idEks=>{
    const cfg=getIuranCfg(idEks);
    $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="card w-full max-w-md animate-fade-in"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Atur Iuran</h3></div>
      <div class="card-body space-y-3.5">
        <div><label class="field-label">Status</label><select id="iur-aktif" class="field-input">
          <option value="1" ${cfg.aktif?'selected':''}>Aktif</option>
          <option value="0" ${!cfg.aktif?'selected':''}>Nonaktif</option></select></div>
        <div><label class="field-label">Nominal per Periode (Rp)</label>
          <input id="iur-jml" type="number" class="field-input" value="${cfg.jumlah||3000}" min="0"></div>
        <div><label class="field-label">Mode Perhitungan</label>
          <select id="iur-mode" class="field-input" onchange="onIuranModeChange()">
            <option value="mingguan" ${cfg.mode==='mingguan'?'selected':''}>Per Minggu (M1-M4)</option>
            <option value="pertemuan" ${cfg.mode==='pertemuan'?'selected':''}>Per Pertemuan (P1-P8, ikut jurnal)</option>
          </select></div>
        <div id="iur-periode-wrap"><label class="field-label">Jumlah Periode per Bulan</label>
          <input id="iur-periode" type="number" class="field-input" value="${cfg.jumlah_periode||4}" min="1" max="8"></div>
        <div><label class="field-label">Keterangan</label><input id="iur-ket" class="field-input" value="${esc(cfg.keterangan||'')}"></div>
        <div class="flex gap-2"><button onclick="simpanIuran('${idEks}')" class="btn btn-primary flex-1">Simpan</button>
        <button onclick="closeModal()" class="btn btn-dark flex-1">Batal</button></div></div></div></div>`;
    window.onIuranModeChange=()=>{$('#iur-periode-wrap').style.display=$('#iur-mode').value==='mingguan'?'block':'none';};
    window.onIuranModeChange();
  };
  window.simpanIuran=idEks=>{
    const cfg={aktif:$('#iur-aktif').value==='1',jumlah:Number($('#iur-jml').value)||0,
      mode:$('#iur-mode').value,jumlah_periode:Number($('#iur-periode').value)||4,keterangan:$('#iur-ket').value.trim()};
    IURAN_CONFIG[idEks]=cfg;persist();closeModal();showTab('kas');showToast('Iuran disimpan','success');
  };

  window.toggleBayarAtasNama=(idUser,idEks,label)=>{
    const ex=findBayar(idUser,idEks,bulan,KAS_TAHUN,label);
    if(ex){
      if(!confirm('Hapus pencatatan ini?'))return;
      KAS_BAYAR=KAS_BAYAR.filter(b=>b.id_bayar!==ex.id_bayar);
      persist();showTab('kas');showToast('Dihapus','warning');
    }else{
      const cfg=getIuranCfg(idEks);
      $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
        <div class="card w-full max-w-md animate-fade-in"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--gold)">Catat Bayar ${esc(label)}</h3></div>
        <div class="card-body space-y-3.5">
          <div class="px-3 py-3 rounded-lg" style="background:var(--surface-2)"><p class="text-xs" style="color:var(--text-dim)">Jumlah</p>
            <p class="font-display text-2xl" style="color:var(--gold)">${fmtRp(cfg.jumlah)}</p></div>
          <div><label class="field-label">Tanggal Bayar</label><input id="bayar-tgl" type="date" class="field-input" value="${todayStr()}"></div>
          <div><label class="field-label">Metode</label><select id="bayar-metode" class="field-input">
            <option value="Tunai ke Bendahara">Tunai ke Bendahara</option>
            <option value="Tunai ke Pembina">Tunai ke Pembina</option>
            <option value="Transfer Bank">Transfer Bank</option>
            <option value="E-Wallet">E-Wallet</option></select></div>
          <div><label class="field-label">Catatan</label><input id="bayar-catatan" class="field-input"></div>
          <div class="flex gap-2"><button onclick="konfirmasiAtasNama('${idUser}','${idEks}','${label}')" class="btn btn-success flex-1">Catat</button>
          <button onclick="closeModal()" class="btn btn-dark flex-1">Batal</button></div></div></div></div>`;
    }
  };
  window.konfirmasiAtasNama=(idUser,idEks,label)=>{
    const cfg=getIuranCfg(idEks);
    KAS_BAYAR.push({id_bayar:uid('kb'),id_user:idUser,id_ekskul:idEks,bulan,tahun:KAS_TAHUN,
      periode_label:label,jumlah:cfg.jumlah,tanggal:$('#bayar-tgl').value||todayStr(),
      metode:$('#bayar-metode').value,catatan:$('#bayar-catatan').value.trim(),
      dicatat_oleh:CURRENT_USER.id_user,self_report:false,created_at:new Date().toISOString()});
    persist();closeModal();showTab('kas');showToast('Tercatat','success');
  };
  window.lihatBelumBayar=idEks=>{
    const e=ekskulById(idEks);if(!e)return;
    const cfg=getIuranCfg(idEks);
    const periodeList=getPeriodeList(idEks,bulan,KAS_TAHUN);
    const anggota=anggotaAktifOf(idEks);
    const rows=anggota.map(a=>{
      const u=userById(a.id_user);
      const belum=periodeList.filter(p=>!findBayar(a.id_user,idEks,bulan,KAS_TAHUN,p.label));
      const kurang=belum.length*cfg.jumlah;
      return {u,belum,kurang};
    }).filter(r=>r.u);
    const adaBelum=rows.filter(r=>r.belum.length>0);
    const totalKurang=adaBelum.reduce((s,r)=>s+r.kurang,0);
    $('#modal-root').innerHTML=`<div class="modal-overlay" onclick="if(event.target===this)closeModal()">
      <div class="card w-full max-w-2xl animate-fade-in" style="max-height:85vh;overflow:auto">
        <div class="card-header"><div><h3 class="font-display text-lg" style="color:var(--gold)">Belum Bayar — ${esc(e.nama_ekskul)}</h3>
        <p class="text-xs mt-1" style="color:var(--text-dim)">${esc(bulan)} ${KAS_TAHUN} · Total kurang: ${fmtRp(totalKurang)}</p></div>
        <button onclick="closeModal()" class="btn btn-dark" style="padding:4px 10px;font-size:12px;">Tutup</button></div>
        <div class="card-body">
        ${adaBelum.length?`<div class="space-y-2">${adaBelum.map(r=>`
          <div class="px-3 py-2 rounded-lg" style="background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2)">
            <div class="flex justify-between items-center gap-2">
              <div><p class="font-semibold text-sm">${esc(r.u.nama_lengkap)} <span class="text-xs" style="color:var(--text-dim)">(${esc(r.u.kelas||'-')})</span></p>
              <p class="text-xs mt-0.5" style="color:#F87171">Belum: ${r.belum.map(p=>p.label).join(', ')}</p></div>
