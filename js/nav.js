/* =====================================================================
   helpers.js — Utility, lookup, theme, image processing
   ===================================================================== */

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=p=>(p||'id')+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const hashPwd=p=>{let h=5381;for(let i=0;i<p.length;i++)h=((h<<5)+h+p.charCodeAt(i))|0;return 'h'+(h>>>0).toString(36)};
const fmtRp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const todayStr=()=>new Date().toISOString().split('T')[0];
const fmtDateTime=d=>{const x=new Date(d);return x.toLocaleDateString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric'})+' '+x.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});};

function showToast(msg,type='success'){
  const c=$('#toast-container');if(!c)return;
  const t=document.createElement('div');
  t.className='toast';
  t.style.background=type==='success'?'linear-gradient(135deg,#10B981,#059669)':type==='error'?'linear-gradient(135deg,#EF4444,#DC2626)':'linear-gradient(135deg,#FBBF24,#F59E0B)';
  t.innerHTML=`<b>${type==='success'?'OK':type==='error'?'Gagal':'Info'}:</b> ${esc(msg)}`;
  c.appendChild(t);setTimeout(()=>t.remove(),3000);
}

const userById=id=>USERS.find(u=>u.id_user===id);
const ekskulById=id=>EKSKUL.find(e=>e.id_ekskul===id);
const userEkskulIds=id=>PEMBINA.filter(p=>p.id_user===id&&p.status_akun==='aktif').map(p=>p.id_ekskul);
const anggotaAktifOf=idEkskul=>ANGGOTA.filter(a=>a.id_ekskul===idEkskul&&a.status_anggota==='aktif');
const muridOfEkskul=idEkskul=>anggotaAktifOf(idEkskul).map(a=>userById(a.id_user)).filter(Boolean);
const ketuaOf=idEkskul=>{const k=ANGGOTA.find(a=>a.id_ekskul===idEkskul&&a.jabatan==='ketua_ekskul'&&a.status_anggota==='aktif');return k?userById(k.id_user):null};

function downloadCSV(rows,filename){
  const esc=v=>{const s=String(v??'');return /[,\"\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
  const csv=rows.map(r=>r.map(esc).join(',')).join('\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename;a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);showToast('CSV diunduh','success');
}

/* ---------- COMPRESS & WATERMARK FOTO ---------- */
function compressImage(file,maxW=1280,quality=0.72){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=reject;
    reader.onload=e=>{
      const img=new Image();
      img.onerror=reject;
      img.onload=()=>{
        const canvas=document.createElement('canvas');
        let w=img.width,h=img.height;
        if(w>maxW){h=Math.round(h*maxW/w);w=maxW;}
        canvas.width=w;canvas.height=h;
        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.src=e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function addWatermark(dataUrl,lines){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onerror=reject;
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      canvas.width=img.width;canvas.height=img.height;
      const ctx=canvas.getContext('2d');
      ctx.drawImage(img,0,0);

      const fs=Math.max(16,Math.round(canvas.width*0.028));
      ctx.font='bold '+fs+'px "Plus Jakarta Sans", Arial, sans-serif';
      ctx.textBaseline='top';

      const pad=Math.round(fs*0.5);
      let maxW=0;
      lines.forEach(l=>{const w=ctx.measureText(l).width;if(w>maxW)maxW=w;});
      const boxW=maxW+pad*3;
      const boxH=lines.length*(fs+4)+pad*2;
      const bx=canvas.width-boxW-pad*2;
      const by=canvas.height-boxH-pad*2;

      ctx.fillStyle='rgba(10,14,39,0.65)';
      ctx.fillRect(bx,by,boxW,boxH);
      ctx.fillStyle='#FBBF24';
      ctx.fillRect(bx,by,4,boxH);

      ctx.fillStyle='#fff';
      lines.forEach((l,i)=>ctx.fillText(l,bx+pad*2,by+pad+i*(fs+4)));

      resolve(canvas.toDataURL('image/jpeg',0.78));
    };
    img.src=dataUrl;
  });
}

/* Watermark otomatis: tanggal + waktu + ekskul */
async function processPhoto(file,ekskulNama){
  const compressed=await compressImage(file);
  const now=new Date();
  const tgl=now.toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
  const jam=now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})+' WITA';
  const lines=[ekskulNama||'ETAM',tgl,jam];
  return await addWatermark(compressed,lines);
}

/* ---------- THEME ---------- */
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

window.closeModal=()=>{
  const root=document.getElementById('modal-root');
  if(root)root.innerHTML='';
  if(typeof stopQRScan==='function'){try{stopQRScan();}catch(e){}}
};
