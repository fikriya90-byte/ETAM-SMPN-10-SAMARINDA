/* =====================================================================
   routes-laporan.js — Cetak laporan 3 lembar
   ===================================================================== */

ROUTES.laporan=el=>{
  const r=CURRENT_USER.role_sistem;
  const opts=r==='admin'?EKSKUL:(r==='pengurus'?[ekskulById(CURRENT_EKSKUL_CTX)].filter(Boolean):userEkskulIds(CURRENT_USER.id_user).map(id=>ekskulById(id)).filter(Boolean));
  const def=CURRENT_EKSKUL_CTX||(opts[0]&&opts[0].id_ekskul)||'';
  el.innerHTML=`
    <div class="card mb-5"><div class="card-header"><h2 class="font-display text-lg" style="color:var(--text)">Laporan</h2></div>
    <div class="card-body grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <div><label class="field-label">Ekskul</label><select id="rep-ekskul" class="field-input">${opts.map(e=>`<option value="${e.id_ekskul}" ${e.id_ekskul===def?'selected':''}>${esc(e.nama_ekskul)}</option>`).join('')}</select></div>
      <div><label class="field-label">Bulan</label><select id="rep-bulan" class="field-input">${BULAN.slice(0,6).map(b=>`<option>${b}</option>`).join('')}</select></div>
      <div><label class="field-label">Tahun Ajaran</label><input id="rep-tahun" class="field-input" value="2025/2026"></div></div>
    <div class="card-body pt-0 flex flex-wrap gap-2">
      <button onclick="previewLaporan()" class="btn btn-primary">Preview</button>
      <button onclick="printLaporan()" class="btn btn-blue">Print</button>
      <button onclick="downloadLaporan()" class="btn btn-dark">.doc</button></div></div>
    <div class="card"><div class="card-header"><h3 class="font-display text-lg" style="color:var(--text)">Preview</h3></div>
      <div class="card-body overflow-auto custom-scrollbar" style="background:var(--surface-2)">
        <div id="laporan-preview" class="bg-white text-black mx-auto shadow-2xl" style="width:210mm;min-height:297mm;padding:15mm;font-family:'Times New Roman',serif;"></div></div></div>`;
  previewLaporan();
};

function buildLaporan(){
  const idEks=$('#rep-ekskul').value,bulan=$('#rep-bulan').value,tahun=$('#rep-tahun').value;
  const e=ekskulById(idEks);if(!e)return '<p>Pilih ekskul</p>';
  const pembinaAktif=PEMBINA.filter(p=>p.id_ekskul===idEks&&p.status_akun==='aktif').map(p=>userById(p.id_user)).filter(Boolean);
  const pembinaNama=pembinaAktif[0]?pembinaAktif[0].nama_lengkap:'....................................................';
  const murid=muridOfEkskul(idEks);
  const bulanIdx=BULAN.indexOf(bulan);
  const jurnalBulan=JURNAL.filter(j=>j.id_ekskul===idEks&&new Date(j.tanggal+'T00:00:00').getMonth()===bulanIdx);
  const mtgs=[1,2,3,4,5,6,7];
  const pertFor=mtg=>jurnalBulan[mtg-1];
  const headNums=mtgs.map(m=>`<th style="border:1px solid #000;padding:3px;text-align:center;background:#eee;">${m}</th>`).join('');
  const rows1=murid.map((m,i)=>{
    const cells=mtgs.map(mt=>{const j=pertFor(mt);if(!j)return `<td style="border:1px solid #000;padding:4px;text-align:center;">-</td>`;
      const p=PRESENSI.find(x=>x.id_pertemuan===j.id_pertemuan&&x.id_user===m.id_user);
      let st='-';if(p)st=p.status==='hadir'?'H':p.status.startsWith('izin')?'I':p.status.startsWith('sakit')?'S':'A';
      return `<td style="border:1px solid #000;padding:4px;text-align:center;">${st}</td>`;}).join('');
    return `<tr><td style="border:1px solid #000;padding:4px;text-align:center;">${i+1}</td><td style="border:1px solid #000;padding:4px;">${esc(m.nama_lengkap)}</td><td style="border:1px solid #000;padding:4px;text-align:center;">${esc(m.kelas||'-')}</td>${cells}</tr>`;
  }).join('')||`<tr><td colspan="10" style="border:1px solid #000;padding:12px;text-align:center;">Belum ada anggota</td></tr>`;
  const rows2=jurnalBulan.map((j,i)=>`<tr><td style="border:1px solid #000;padding:4px;text-align:center;">${i+1}</td>
    <td style="border:1px solid #000;padding:4px;">${new Date(j.tanggal+'T00:00:00').toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</td>
    <td style="border:1px solid #000;padding:4px;">${esc(j.materi||'-')}</td></tr>`).join('')||`<tr><td colspan="3" style="border:1px solid #000;padding:12px;text-align:center;">Belum ada jurnal</td></tr>`;
  const rows3=pembinaAktif.map((p,i)=>{const cells=[1,2,3,4,5].map(mt=>{const j=pertFor(mt);const hadir=j&&j.dibuat_oleh===p.id_user;
    return `<td style="border:1px solid #000;padding:4px;text-align:center;">${hadir?'✓':''}</td>`;}).join('');
    return `<tr><td style="border:1px solid #000;padding:4px;text-align:center;">${i+1}</td><td style="border:1px solid #000;padding:4px;">${esc(p.nama_lengkap)}</td>${cells}</tr>`;
  }).join('')||`<tr><td colspan="7" style="border:1px solid #000;padding:12px;text-align:center;">Belum ada pembina</td></tr>`;
  const kop=`<div style="text-align:center;border-bottom:3px double #000;padding-bottom:8px;margin-bottom:12px;line-height:1.35;">
    <div style="font-size:13pt;font-weight:bold;">PEMERINTAH KOTA SAMARINDA</div>
    <div style="font-size:13pt;font-weight:bold;">DINAS PENDIDIKAN DAN KEBUDAYAAN</div>
    <div style="font-size:15pt;font-weight:bold;">UPT SMP NEGERI 10</div>
    <div style="font-size:9pt;">Alamat : Jl. Untung Suropati No.01, Karang Asam Ulu, Sungai Kunjang 75126</div>
    <div style="font-size:9pt;">e-mail : samarindasmpn10@gmail.com &nbsp; web.smpn10smd.net</div>
    <div style="font-size:9pt;">Akreditasi : A &nbsp; NSS : 20.1.16.60.05.001 &nbsp; NPSN : 30401026 &nbsp; NIS : 200015</div></div>`;
  const ttd=`<div style="margin-top:30px;display:flex;justify-content:space-between;font-size:11pt;">
    <div style="text-align:left;width:45%;"><div>Mengetahui,</div><div>Kepala UPT SMP Negeri 10</div>
    <div style="margin-top:70px;font-weight:bold;text-decoration:underline;">${esc(APP_SETTINGS.kepala_upt)}</div><div>NIP. ..................................</div></div>
    <div style="text-align:left;width:45%;"><div>Samarinda, ................................ ${new Date().getFullYear()}</div><div>Pembina Ekskul,</div>
    <div style="margin-top:70px;font-weight:bold;text-decoration:underline;">${esc(pembinaNama)}</div><div>NIP. ..................................</div></div></div>`;
  const ttd3=`<div style="margin-top:30px;display:flex;justify-content:space-between;font-size:11pt;">
    <div style="text-align:left;width:45%;"><div>Mengetahui,</div><div>Kepala UPT SMP Negeri 10</div>
    <div style="margin-top:70px;font-weight:bold;text-decoration:underline;">${esc(APP_SETTINGS.kepala_upt)}</div><div>NIP. ..................................</div></div>
    <div style="text-align:left;width:45%;"><div>Samarinda, ................................ ${new Date().getFullYear()}</div><div>Koordinator Ekskul,</div>
    <div style="margin-top:70px;font-weight:bold;text-decoration:underline;">${esc(APP_SETTINGS.koordinator)}</div><div>NIP. ..................................</div></div></div>`;
  return `<div style="font-family:'Times New Roman',serif;font-size:11pt;color:#000;line-height:1.35;">
    ${kop}
    <div style="text-align:center;font-size:12.5pt;font-weight:bold;margin:10px 0 12px;">ABSEN SISWA / SISWI EKSTRAKULIKULER<br>PERIODE BULAN : ${esc(bulan).toUpperCase()}</div>
    <table style="margin-bottom:8px;font-size:11pt;">
      <tr><td style="width:140px;">Nama Ekskul</td><td>:</td><td>${esc(e.nama_ekskul)}</td></tr>
      <tr><td>Jam Pelaksanaan</td><td>:</td><td>${esc(e.jadwal_rutin||'-')}</td></tr>
      <tr><td>Tempat</td><td>:</td><td>${esc(e.tempat||'-')}</td></tr>
      <tr><td>Pembina</td><td>:</td><td>${esc(pembinaNama)}</td></tr>
      <tr><td>Tahun Ajaran</td><td>:</td><td>${esc(tahun)}</td></tr></table>
    <table style="width:100%;border-collapse:collapse;font-size:10pt;">
      <thead><tr><th rowspan="2" style="border:1px solid #000;padding:4px;background:#eee;">NO</th>
      <th rowspan="2" style="border:1px solid #000;padding:4px;background:#eee;">NAMA SISWA</th>
      <th rowspan="2" style="border:1px solid #000;padding:4px;background:#eee;">KELAS</th>
      <th colspan="${mtgs.length}" style="border:1px solid #000;padding:4px;background:#eee;">PERTEMUAN</th></tr>
      <tr>${headNums}</tr></thead><tbody>${rows1}</tbody></table>
    ${ttd}<div style="page-break-after:always;"></div>
    ${kop}
    <div style="text-align:center;font-size:12.5pt;font-weight:bold;margin:10px 0 12px;">PROGRAM EKSTRAKULIKULER (JURNAL KEGIATAN)<br>${esc(e.nama_ekskul).toUpperCase()} — ${esc(bulan).toUpperCase()}</div>
    <table style="width:100%;border-collapse:collapse;font-size:10.5pt;">
      <thead><tr><th style="border:1px solid #000;padding:4px;background:#eee;width:40px;text-align:center;">NO</th>
      <th style="border:1px solid #000;padding:4px;background:#eee;width:200px;">HARI/TANGGAL</th>
      <th style="border:1px solid #000;padding:4px;background:#eee;">MATERI</th></tr></thead><tbody>${rows2}</tbody></table>
    ${ttd}<div style="page-break-after:always;"></div>
    ${kop}
    <div style="text-align:center;font-size:12.5pt;font-weight:bold;margin:10px 0 12px;">ABSEN PEMBINA / PELATIH<br>PERIODE BULAN : ${esc(bulan).toUpperCase()}</div>
    <table style="width:100%;border-collapse:collapse;font-size:10.5pt;">
      <thead><tr><th style="border:1px solid #000;padding:4px;background:#eee;width:40px;text-align:center;">NO</th>
      <th style="border:1px solid #000;padding:4px;background:#eee;">NAMA PEMBINA / PELATIH</th>
      ${[1,2,3,4,5].map(n=>`<th style="border:1px solid #000;padding:4px;background:#eee;width:50px;text-align:center;">${n}</th>`).join('')}
      </tr></thead><tbody>${rows3}</tbody></table>
    ${ttd3}</div>`;
}
window.previewLaporan=()=>{const el=$('#laporan-preview');if(el)el.innerHTML=buildLaporan();};
window.printLaporan=()=>{$('#print-area').innerHTML=buildLaporan();setTimeout(()=>window.print(),80);};
window.downloadLaporan=()=>{
  const inner=buildLaporan();
  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body>${inner}</body></html>`;
  const blob=new Blob(['\ufeff',html],{type:'application/msword'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='Laporan_Etam.doc';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('File diunduh','success');
};
