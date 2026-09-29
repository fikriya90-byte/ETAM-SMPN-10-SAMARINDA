/* =====================================================================
   config.js — Konstanta, state global, storage, seed
   ===================================================================== */

/* Konstanta */
const BULAN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const JABATAN_LABEL={anggota:'Anggota',ketua_ekskul:'Ketua',wakil_ketua:'Wakil Ketua',sekretaris_ekskul:'Sekretaris',bendahara_ekskul:'Bendahara'};
const JABATAN_LABEL_SHORT={anggota:'Anggota',ketua_ekskul:'Ketua',wakil_ketua:'Wakil',sekretaris_ekskul:'Sekretaris',bendahara_ekskul:'Bendahara'};

/* State global */
let USERS=[],EKSKUL=[],PEMBINA=[],ANGGOTA=[],JURNAL=[],PRESENSI=[];
let IURAN_CONFIG={},KAS_BAYAR=[],APP_SETTINGS={};
let CURRENT_USER=null,CURRENT_EKSKUL_CTX=null,QR_SCANNER=null;
let KAS_BULAN=new Date().getMonth();
let KAS_TAHUN=new Date().getFullYear();

/* Storage wrapper */
const DB={
  get(k,d){try{const s=localStorage.getItem('etam_'+k);return s?JSON.parse(s):(d??null)}catch(e){return d??null}},
  set(k,v){localStorage.setItem('etam_'+k,JSON.stringify(v))}
};

/* Simpan semua */
function persist(){
  DB.set('users',USERS);DB.set('ekskul',EKSKUL);DB.set('pembina',PEMBINA);
  DB.set('anggota',ANGGOTA);DB.set('jurnal',JURNAL);DB.set('presensi',PRESENSI);
  DB.set('iuran',IURAN_CONFIG);DB.set('kas_bayar',KAS_BAYAR);DB.set('settings',APP_SETTINGS);
}

/* Seed data awal */
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
    IURAN_CONFIG={};
    IURAN_CONFIG[EKSKUL[0].id_ekskul]={aktif:true,jumlah:3000,mode:'mingguan',jumlah_periode:4,keterangan:'Iuran rutin kas ekskul'};
    DB.set('iuran',IURAN_CONFIG);
  }
  PEMBINA=DB.get('pembina',[])||[];
  ANGGOTA=DB.get('anggota',[])||[];
  JURNAL=DB.get('jurnal',[])||[];
  PRESENSI=DB.get('presensi',[])||[];
  IURAN_CONFIG=DB.get('iuran',{})||{};
  KAS_BAYAR=DB.get('kas_bayar',[])||[];
  APP_SETTINGS=DB.get('settings',{
    school_name:'UPT SMP Negeri 10 Samarinda',
    kepala_upt:'Tuti Susandra Dewi, S.Pd., M.Pd',
    koordinator:'Muhammad Ibnu Syamwardana, S.Pd., M.Pd'
  });
}
