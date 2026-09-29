/* =====================================================================
   config.js — State & Storage
   ===================================================================== */

const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const JABATAN_LABEL={anggota:'Anggota',ketua_ekskul:'Ketua',wakil_ketua:'Wakil Ketua',sekretaris_ekskul:'Sekretaris',bendahara_ekskul:'Bendahara',dokumentasi:'Dokumentasi'};
const JABATAN_LABEL_SHORT={anggota:'Anggota',ketua_ekskul:'Ketua',wakil_ketua:'Wakil',sekretaris_ekskul:'Sekretaris',bendahara_ekskul:'Bendahara',dokumentasi:'Dokumentasi'};

let USERS=[],EKSKUL=[],PEMBINA=[],ANGGOTA=[],JURNAL=[],PRESENSI=[];
let KAS_SETTING={},KAS_BAYAR=[],APP_SETTINGS={};
let STRUKTUR_EKSKUL={},LAPORAN_FOTO=[];
let CURRENT_USER=null,CURRENT_EKSKUL_CTX=null,QR_SCANNER=null;

const DB={
  get(k,d){try{const s=localStorage.getItem('etam_'+k);return s?JSON.parse(s):(d??null)}catch(e){return d??null}},
  set(k,v){try{localStorage.setItem('etam_'+k,JSON.stringify(v))}catch(e){console.warn('Storage penuh',e);showToast('Penyimpanan penuh, hapus beberapa foto lama','error')}}
};

function persist(){
  DB.set('users',USERS);DB.set('ekskul',EKSKUL);DB.set('pembina',PEMBINA);
  DB.set('anggota',ANGGOTA);DB.set('jurnal',JURNAL);DB.set('presensi',PRESENSI);
  DB.set('kas_setting',KAS_SETTING);DB.set('kas_bayar',KAS_BAYAR);
  DB.set('struktur',STRUKTUR_EKSKUL);DB.set('foto',LAPORAN_FOTO);
  DB.set('settings',APP_SETTINGS);
}

function seedIfEmpty(){
  USERS=DB.get('users',null);
  if(!USERS||!USERS.length){
    USERS=[
      {id_user:uid('u'),nama_lengkap:'Koordinator Ekskul',email:'admin@etam.id',password:hashPwd('admin123'),no_wa:'081200000000',role_sistem:'admin',kelas:null,active:true,created_at:new Date().toISOString()},
      {id_user:uid('u'),nama_lengkap:'Muhammad Ibnu Syamwardana, S.Pd., M.Pd',email:'guru@etam.id',password:hashPwd('guru123'),no_wa:'081200000001',role_sistem:'guru',kelas:null,active:true,created_at:new Date().toISOString()},
      {id_user:uid('u'),nama_lengkap:'Pelatih Musik',email:'pelatih@etam.id',password:hashPwd('pelatih123'),no_wa:'081200000002',role_sistem:'pelatih',kelas:null,active:true,created_at:new Date().toISOString()},
      {id_user:uid('u'),nama_lengkap:'Budi Santoso',email:'murid@etam.id',password:hashPwd('murid123'),no_wa:'081200000003',role_sistem:'murid',kelas:'7A',active:true,created_at:new Date().toISOString()},
      {id_user:uid('u'),nama_lengkap:'Siti Aminah',email:'siti@etam.id',password:hashPwd('murid123'),no_wa:'081200000004',role_sistem:'murid',kelas:'7B',active:true,created_at:new Date().toISOString()},
      {id_user:uid('u'),nama_lengkap:'Ahmad Rizki',email:'ahmad@etam.id',password:hashPwd('murid123'),no_wa:'081200000005',role_sistem:'murid',kelas:'8A',active:true,created_at:new Date().toISOString()}
    ];
    DB.set('users',USERS);
  }
  EKSKUL=DB.get('ekskul',null);
  if(!EKSKUL||!EKSKUL.length){
    EKSKUL=[
      {id_ekskul:uid('e'),nama_ekskul:'Musik',deskripsi:'Ekstrakurikuler musik & vokal',logo_url:'',jadwal_rutin:'Sabtu, 14.00 - 16.00 WITA',tempat:'Ruang Musik'},
      {id_ekskul:uid('e'),nama_ekskul:'Pramuka',deskripsi:'Kepramukaan & kedisiplinan',logo_url:'',jadwal_rutin:'Sabtu, 14.00 - 16.00 WITA',tempat:'Lapangan'}
    ];
    DB.set('ekskul',EKSKUL);
    const guru=USERS.find(u=>u.role_sistem==='guru');
    const pelatih=USERS.find(u=>u.role_sistem==='pelatih');
    PEMBINA=[
      {id_pembina:uid('p'),id_user:guru.id_user,id_ekskul:EKSKUL[0].id_ekskul,status_akun:'aktif'},
      {id_pembina:uid('p'),id_user:pelatih.id_user,id_ekskul:EKSKUL[0].id_ekskul,status_akun:'aktif'}
    ];
    DB.set('pembina',PEMBINA);
    const murid=USERS.filter(u=>u.role_sistem==='murid');
    ANGGOTA=murid.map((m,i)=>({id_anggota:uid('a'),id_user:m.id_user,id_ekskul:EKSKUL[0].id_ekskul,jabatan:i===0?'ketua_ekskul':'anggota',status_anggota:'aktif',created_at:new Date().toISOString()}));
    DB.set('anggota',ANGGOTA);
  }
  PEMBINA=DB.get('pembina',[])||[];
  ANGGOTA=DB.get('anggota',[])||[];
  JURNAL=DB.get('jurnal',[])||[];
  PRESENSI=DB.get('presensi',[])||[];
  KAS_SETTING=DB.get('kas_setting',{})||{};
  KAS_BAYAR=DB.get('kas_bayar',[])||[];
  STRUKTUR_EKSKUL=DB.get('struktur',{})||{};
  LAPORAN_FOTO=DB.get('foto',[])||[];
  APP_SETTINGS=DB.get('settings',{
    school_name:'UPT SMP Negeri 10 Samarinda',
    kepala_upt:'Tuti Susandra Dewi, S.Pd., M.Pd',
    koordinator:'Muhammad Ibnu Syamwardana, S.Pd., M.Pd'
  });
}

/* Helper struktur default */
function getStruktur(idEkskul){
  if(!STRUKTUR_EKSKUL[idEkskul])STRUKTUR_EKSKUL[idEkskul]={seksi:[],anggota:[]};
  return STRUKTUR_EKSKUL[idEkskul];
}
function getKasSetting(idEkskul){
  return KAS_SETTING[idEkskul]||{nominal:0,disepakati:false,keterangan:'',metode:'Tunai ke Bendahara'};
}
function getPertemuanClosed(idEkskul){
  return JURNAL.filter(j=>j.id_ekskul===idEkskul&&j.status==='closed').sort((a,b)=>a.tanggal.localeCompare(b.tanggal));
}
function getLaporanFotoByPertemuan(idPertemuan){
  return LAPORAN_FOTO.filter(f=>f.id_pertemuan===idPertemuan);
}
function getKasBayar(idUser,idPertemuan){
  return KAS_BAYAR.find(b=>b.id_user===idUser&&b.id_pertemuan===idPertemuan);
}
function totalBelumBayar(idEkskul){
  const ptm=getPertemuanClosed(idEkskul);
  const anggota=anggotaAktifOf(idEkskul);
  let total=0;
  anggota.forEach(a=>{
    ptm.forEach(p=>{
      if(!getKasBayar(a.id_user,p.id_pertemuan))total++;
    });
  });
  return total;
}
