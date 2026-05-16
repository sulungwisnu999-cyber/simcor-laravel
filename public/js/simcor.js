// ===== SERVER PERSISTENCE HELPERS =====
function _csrf(){ return document.querySelector('meta[name=csrf-token]')?.content||''; }
function _apiSave(url, data){
  return fetch(url,{method:'POST',headers:{'X-CSRF-TOKEN':_csrf(),'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({data:data})})
    .catch(e=>console.warn('Save failed:',e));
}
function _apiGet(url){
  return fetch(url,{headers:{'Accept':'application/json'}}).then(r=>r.json()).catch(()=>null);
}
// ===== RELAY CONFIG AUTO-SAVE (debounced, 3 s after last change) =====
const _rcTimer={id:null};
function _scheduleRelayConfigSave(){
  clearTimeout(_rcTimer.id);
  _rcTimer.id=setTimeout(_saveRelayConfigNow, 3000);
}
function _saveRelayConfigNow(){
  const cfg={
    sys:{name:$('sys-name')?.value,gi:$('sys-gi')?.value,mva:$('sys-mva')?.value,vhv:$('sys-vhv')?.value,vlv:$('sys-vlv')?.value,vbase:$('sys-vbase')?.value},
    ngr:{io:$('ngr-io')?.value,v:$('ngr-v')?.value,r:$('ngr-r')?.value,t:$('ngr-t')?.value},
    relays:JSON.parse(JSON.stringify(relays)),
    faultRows:JSON.parse(JSON.stringify(faultRows)),
    tfcEvents:JSON.parse(JSON.stringify(tfcEvents))
  };
  _apiSave('/api/simcor/relay-config', cfg);
}

const CURVES={
  'OFF': {label:'OFF (Nonaktif)',            std:'--',          type:'off', k:0,     al:0,    B:0,  f:'--'},
  'DT':  {label:'DT -- Definite Time',       std:'IEC/ANSI',   type:'dt',  k:0,     al:0,    B:0,  f:'t = TMS (digunakan sebagai TD)'},
  'C_SI':{label:'IEC SI -- Standard Inverse',std:'IEC 60255',  type:'iec', k:.14,   al:.02,  B:0,  f:'0.14/(M^0.02-1)'},
  'C_VI':{label:'IEC VI -- Very Inverse',    std:'IEC 60255',  type:'iec', k:13.5,  al:1,    B:0,  f:'13.5/(M-1)'},
  'C_EI':{label:'IEC EI -- Ext. Inverse',    std:'IEC 60255',  type:'iec', k:80,    al:2,    B:0,  f:'80/(M^2-1)'},
  'C_LTI':{label:'IEC LTI -- Long Time Inv.',std:'IEC 60255',  type:'iec', k:120,   al:1,    B:0,  f:'120/(M-1)'},
  'C_STI':{label:'IEC STI -- Short Time Inv.',std:'IEC 60255', type:'iec', k:.05,   al:.04,  B:0,  f:'0.05/(M^0.04-1)'},
  'A_MI':{label:'ANSI MI -- Mod. Inverse',   std:'IEEE C37.112',type:'ansi',k:.0515,al:.02,  B:.114, f:'0.0515/(M^0.02-1)+0.114'},
  'A_I': {label:'ANSI I -- Inverse',         std:'IEEE C37.112',type:'ansi',k:.0104,al:.02,  B:.491, f:'0.0104/(M^0.02-1)+0.491'},
  'A_VI':{label:'ANSI VI -- Very Inverse',   std:'IEEE C37.112',type:'ansi',k:19.61,al:2,    B:.491, f:'19.61/(M^2-1)+0.491'},
  'A_EI':{label:'ANSI EI -- Ext. Inverse',   std:'IEEE C37.112',type:'ansi',k:28.2, al:2,    B:.1217,f:'28.2/(M^2-1)+0.1217'},
  'A_STI':{label:'ANSI STI -- Short Time Inv.',std:'IEEE C37.112',type:'ansi',k:.0226,al:.02,B:.0215,f:'0.0226/(M^0.02-1)+0.0215'},
  'A_LTI':{label:'ANSI LTI -- Long Time Inv.',std:'IEEE C37.112',type:'ansi',k:5.67, al:2,   B:.0352,f:'5.67/(M^2-1)+0.0352'},
  'A_DI':{label:'ANSI DI -- Definite Inv.',  std:'IEEE C37.112',type:'ansi',k:29.1, al:2,    B:.1184,f:'29.1/(M^2-1)+0.1184'},
};

const DEFAULTS={
  sys:{name:"Trafo [NAMA BAY]",gi:"GI [NAMA GI]",mva:"60",vhv:"150",vlv:"20",vbase:"20"},
  ngr:{io:"300",v:"11500",r:"40",t:"10"},
  relays:[
    {id:0,name:"BPU HV",color:"#e53e3e",merk:"",tipe:"",sn:"",
     ocr:{en:true,ctP:300,ctS:1,vRef:150,char:"C_SI",Is:277,TMS:0.363,Iinst:979,tInst:0.9,Iinst2:0,tInst2:0},
     gfr:{en:true,ctP:300,ctS:1,vRef:150,char:"C_SI",Is:360,TMS:0.093,Iinst:0,tInst:0,Iinst2:0,tInst2:0}},
    {id:1,name:"INCOMING",color:"#df20d9",merk:"",tipe:"",sn:"",
     ocr:{en:true,ctP:2000,ctS:5,vRef:20,char:"C_SI",Is:2079,TMS:0.279,Iinst:7085,tInst:0.6,Iinst2:0,tInst2:0},
     gfr:{en:true,ctP:2000,ctS:5,vRef:20,char:"C_SI",Is:36,TMS:0.425,Iinst:0,tInst:0,Iinst2:0,tInst2:0}},
    {id:2,name:"COUPLER",color:"#38a169",merk:"",tipe:"",sn:"",
     ocr:{en:true,ctP:2000,ctS:5,vRef:20,char:"C_SI",Is:2079,TMS:0.195,Iinst:6352,tInst:0.3,Iinst2:0,tInst2:0},
     gfr:{en:true,ctP:2000,ctS:5,vRef:20,char:"C_SI",Is:36,TMS:0.334,Iinst:0,tInst:0,Iinst2:0,tInst2:0}},
    {id:3,name:"OUTGOING",color:"#3182ce",merk:"",tipe:"",sn:"",
     ocr:{en:true,ctP:800,ctS:5,vRef:20,char:"C_SI",Is:360,TMS:0.3,Iinst:4769,tInst:0.2,Iinst2:7058,tInst2:0},
     gfr:{en:true,ctP:800,ctS:5,vRef:20,char:"C_SI",Is:30,TMS:0.3,Iinst:288,tInst:0.3,Iinst2:0,tInst2:0}},
    {id:4,name:"SBEF-1",color:"#030303",merk:"",tipe:"",sn:"",
     ocr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:400,TMS:0.3,Iinst:0,tInst:0.1,Iinst2:0,tInst2:0},
     gfr:{en:true,ctP:300,ctS:5,vRef:20,char:"C_LTI",Is:36,TMS:0.3,Iinst:0,tInst:0,Iinst2:0,tInst2:0}},
    {id:5,name:"SBEF-2",color:"#6b5c00",merk:"",tipe:"",sn:"",
     ocr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:400,TMS:0.3,Iinst:0,tInst:0.1,Iinst2:0,tInst2:0},
     gfr:{en:true,ctP:300,ctS:5,vRef:20,char:"C_LTI",Is:36,TMS:0.32,Iinst:0,tInst:0.3,Iinst2:0,tInst2:0}},
    {id:6,name:"Rele 7 (Spare)",color:"#d69e2e",merk:"",tipe:"",sn:"",ocr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:400,TMS:0.3,Iinst:0,tInst:.1,Iinst2:0,tInst2:0},gfr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:30,TMS:0.3,Iinst:0,tInst:.3,Iinst2:0,tInst2:0}},
    {id:7,name:"Rele 8 (Spare)",color:"#db2777",merk:"",tipe:"",sn:"",ocr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:400,TMS:0.3,Iinst:0,tInst:.1,Iinst2:0,tInst2:0},gfr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:30,TMS:0.3,Iinst:0,tInst:.3,Iinst2:0,tInst2:0}},
    {id:8,name:"Rele 9 (Spare)",color:"#374151",merk:"",tipe:"",sn:"",ocr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:400,TMS:0.3,Iinst:0,tInst:.1,Iinst2:0,tInst2:0},gfr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:30,TMS:0.3,Iinst:0,tInst:.3,Iinst2:0,tInst2:0}},
    {id:9,name:"Rele 10 (Spare)",color:"#6b7280",merk:"",tipe:"",sn:"",ocr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:400,TMS:0.3,Iinst:0,tInst:.1,Iinst2:0,tInst2:0},gfr:{en:false,ctP:600,ctS:5,vRef:20,char:"C_SI",Is:30,TMS:0.3,Iinst:0,tInst:.3,Iinst2:0,tInst2:0}},
  ],
  faultRows:[
    {id:1,I:6928,label:"FAULT A",recO:"",recG:""},
    {id:2,I:3000,label:"FAULT B",recO:"",recG:""},
    {id:3,I:1732,label:"FAULT C",recO:"",recG:""},
    {id:4,I:600, label:"FAULT D",recO:"",recG:""},
    {id:5,I:300, label:"FAULT E",recO:"",recG:""},
    {id:6,I:150, label:"FAULT F",recO:"",recG:""},
  ]
};

let relays=JSON.parse(JSON.stringify(DEFAULTS.relays));
let faultRows=JSON.parse(JSON.stringify(DEFAULTS.faultRows));
let ovs={trafo:false,inrush:false,ngr:true,marker:true};
let chOCR=null,chGFR=null;
let engResults=null;    // hasil kalkulasi setting engine
let tfcEvents=[];       // histori event gangguan TFC
let valPairs=[];        // pasangan upstream-downstream untuk validator

const $=id=>document.getElementById(id);
const fv=id=>parseFloat($(id).value)||0;
const vb=()=>parseFloat($('sys-vbase').value)||20;
const inT=()=>{const m=+($('sys-mva').value||60),v=+($('sys-vlv').value||20);return(m*1000)/(Math.sqrt(3)*v);};

// ===== CORE CALCULATION FUNCTIONS (unchanged from v5) =====
function calcTOC(s,Ic){
  const Ir=Ic*(vb()/s.vRef),M=Ir/s.Is;
  if(!s.Is||M<=1)return null;
  const c=CURVES[s.char];
  if(!c||c.type==='off')return null;
  if(c.type==='dt')return s.TMS;
  const d=Math.pow(M,c.al)-1;
  if(d<=0)return null;
  const t=c.type==='iec'?s.TMS*c.k/d:s.TMS*(c.k/d+c.B);
  return isFinite(t)&&t>0?Math.min(Math.max(t,.005),10000):null;
}
function calcTime(s,Ic){
  const Ir=Ic*(vb()/s.vRef);
  if(s.Iinst2>0&&Ir>=s.Iinst2&&s.tInst2>0)return{t:s.tInst2,stage:3};
  if(s.Iinst>0&&Ir>=s.Iinst&&s.tInst>0)return{t:s.tInst,stage:2};
  const t=calcTOC(s,Ic);
  if(t===null)return null;
  return{t,stage:CURVES[s.char]?.type==='dt'?'dt':1};
}
function calcTOCDirect(Is,TMS,char,I){
  const c=CURVES[char]; if(!c||c.type==='off')return null;
  const M=I/Is; if(M<=1)return null;
  if(c.type==='dt')return TMS;
  const d=Math.pow(M,c.al)-1; if(d<=0)return null;
  const t=c.type==='iec'?TMS*c.k/d:TMS*(c.k/d+c.B);
  return isFinite(t)&&t>0?Math.min(Math.max(t,.005),10000):null;
}
function findTMS(Is,char,I_check,t_target){
  // Binary search TMS so that t_trip = t_target
  const c=CURVES[char]; if(!c||c.type==='off'||c.type==='dt')return t_target;
  const M=I_check/Is; if(M<=1)return 0.1;
  const d=Math.pow(M,c.al)-1; if(d<=0)return 0.1;
  let TMS=c.type==='iec'?t_target*d/c.k:t_target/(c.k/d+c.B);
  return Math.max(0.02,Math.round(TMS*1000)/1000);
}

// ===== CURVE / CHART FUNCTIONS (unchanged from v5) =====
// ===== Y-axis viewport bounds =====
// Sumbu Y chart: min=0.01s, max=fv('ch-tmax')||100s.
// Semua segmen kurva di-clip ke [yMinView, yMaxView] supaya tidak muncul "ekor"
// vertikal yang menjulur keluar plot (mis. TOC mendekati pickup → t∞,
// atau Stage 3 dengan TD_inst2 yang sangat kecil → t mendekati 0).
function _yViewBounds(){
  const tmax = fv('ch-tmax')||100;
  // Sedikit margin di atas tmax untuk garis kurva tetap terlihat menyentuh tepi atas.
  return { yMin: 0.01, yMax: tmax * 1.05 };
}
function _clampY(t){
  const {yMin,yMax} = _yViewBounds();
  if(!isFinite(t)) return yMax;
  if(t < yMin) return yMin;
  if(t > yMax) return yMax;
  return t;
}
function tocPts(s,imax){
  if(!s.en||s.char==='OFF')return[];
  const imin=fv('ch-imin')||1;
  const IsC=s.Is*(s.vRef/vb());
  let lim=imax;
  if(s.Iinst>0&&s.tInst>0)lim=Math.min(lim,s.Iinst*(s.vRef/vb()));
  if(s.Iinst2>0&&s.tInst2>0)lim=Math.min(lim,s.Iinst2*(s.vRef/vb()));
  const startI=Math.max(IsC*1.001,imin,.1);
  const endI=Math.min(lim*.999,imax);
  if(startI>=endI)return[];
  const {yMin,yMax} = _yViewBounds();
  if(s.char==='DT')return[{x:startI,y:_clampY(s.TMS)},{x:endI,y:_clampY(s.TMS)}];
  const N=320,lMin=Math.log10(startI),lMax=Math.log10(endI);
  const c=CURVES[s.char],pts=[];
  for(let i=0;i<=N;i++){
    const I=Math.pow(10,lMin+(lMax-lMin)*i/N);
    const Ir=I*(vb()/s.vRef),M=Ir/s.Is;
    const d=Math.pow(M,c.al)-1;if(d<=0)continue;
    const t=c.type==='iec'?s.TMS*c.k/d:s.TMS*(c.k/d+c.B);
    if(!isFinite(t))continue;
    // Stop kurva ketika sudah jauh di atas tmax → cegah ekor vertikal yang terlalu panjang.
    if(t > yMax) continue;
    if(t < yMin) continue;
    pts.push({x:I,y:t});
  }
  return pts;
}
function connPts(s,imax){
  // Staircase connector antar-stage:
  //   • Step 1 (TOC → Stage 2)  : pada I=Iinst  — vertikal dari y=tTOC(Iinst)  turun ke y=tInst
  //   • Step 2 (Stage 2 → 3)    : pada I=Iinst2 — vertikal dari y=tInst (plateau Stage 2) ke y=tInst2
  // Endpoint atas konektor Stage-3 SEBELUMNYA = tTOC, padahal Stage 2 sudah datar di y=tInst.
  // Ini bikin "ekor" vertikal naik melewati plateau Stage 2. Sekarang dipakai plateau prev-stage.
  if(!s.en||s.char==='OFF'||s.char==='DT')return[];
  const vb_=vb(),segs=[];
  const stgs=[{Ii:s.Iinst,ti:s.tInst},{Ii:s.Iinst2,ti:s.tInst2}]
    .filter(x=>x.Ii>0&&x.ti>0).sort((a,b)=>a.Ii-b.Ii);
  stgs.forEach(({Ii,ti},idx)=>{
    const Ic=Ii*(s.vRef/vb_); if(Ic>imax)return;
    let yTop;
    if(idx===0){
      // First stage: turun dari kurva TOC ke plateau stage ini
      const tTOC=calcTOC(s,Ic);
      yTop = (tTOC!==null && tTOC>ti) ? tTOC : null;
    } else {
      // Stage berikutnya: turun dari plateau stage sebelumnya (anak tangga)
      const tPrev = stgs[idx-1].ti;
      yTop = (tPrev>ti) ? tPrev : null;
    }
    if(yTop!==null){
      segs.push([{x:Ic,y:_clampY(yTop)},{x:Ic,y:_clampY(ti)}]);
    }
  });
  return segs;
}
function instPts(s,imax){
  if(!s.en)return[];
  const vb_=vb();
  const stgs=[{Ii:s.Iinst,ti:s.tInst},{Ii:s.Iinst2,ti:s.tInst2}]
    .filter(x=>x.Ii>0&&x.ti>0).sort((a,b)=>a.Ii-b.Ii);
  return stgs.map(({Ii,ti},idx)=>{
    const Ic=Ii*(s.vRef/vb_);if(Ic>imax)return null;
    const nextIc=idx<stgs.length-1?stgs[idx+1].Ii*(s.vRef/vb_):imax;
    // Clip ti ke yMin agar segmen horizontal tidak menjulur di bawah plot ketika TD sangat kecil (mis. 0.0001s).
    const yi = _clampY(ti);
    return{data:[{x:Ic,y:yi},{x:Math.min(nextIc,imax),y:yi}]};
  }).filter(Boolean);
}
function trafoW(imax){const In=inT();return[100,80].map(p=>{const pts=[];for(let M=1.05;M<=20;M+=.1){const I=M*In;if(I>imax)break;const t=Math.pow(p/100,2)*1000/Math.pow(M,2);if(t>=.01&&t<=10000)pts.push({x:I,y:t});}return{pts,p};});}
function inrushPts(imax){const In=inT();const mx=[10,8,6.5,5,4,3.5,3,2.9,2.7,2.5,2.3,2,1.9,1.8],tx=[.01,.02,.04,.06,.08,.1,.12,.14,.16,.18,.2,.28,.32,.36];return mx.map((m,i)=>({x:m*In,y:tx[i]})).filter(p=>p.x<=imax);}
function ngrPts(imax){const Io=fv('ngr-io')||300,t=fv('ngr-t')||10;return Io<=imax?[{x:Io,y:t},{x:imax,y:t}]:[];}
function markerDS(I,lbl,idx,imax){
  const tmax=fv('ch-tmax')||100,imin=fv('ch-imin')||1;
  if(I<imin||I>imax)return null;
  const cols=['#ef4444','#f59e0b','#10b981','#6366f1','#ec4899','#0ea5e9','#84cc16','#f97316'];
  const col=cols[idx%cols.length];
  return{label:`${lbl} (${I.toLocaleString()}A)`,data:[{x:I,y:.005},{x:I,y:tmax*2}],borderColor:col+'88',backgroundColor:'transparent',borderWidth:1.2,borderDash:[4,4],pointRadius:0,tension:0,isMarker:true};
}
function makeDS(type,imax){
  const ds=[];
  relays.forEach(r=>{
    const s=type==='OCR'?r.ocr:r.gfr;
    if(!s.en||s.char==='OFF')return;
    const col=r.color;
    const tp=tocPts(s,imax);
    if(tp.length>0)ds.push({label:r.name,data:tp,borderColor:col,backgroundColor:'transparent',borderWidth:2.5,pointRadius:0,pointHoverRadius:5,tension:.05,spanGaps:false,borderDash:[]});
    connPts(s,imax).forEach(seg=>ds.push({label:r.name+' [conn]',data:seg,borderColor:col,backgroundColor:'transparent',borderWidth:2.5,pointRadius:0,tension:0,borderDash:[]}));
    // Marker segitiga di awal segmen I>> dihilangkan (request user) — kurva tetap kontinu tanpa point.
    instPts(s,imax).forEach(seg=>ds.push({label:r.name+' [I>>]',data:seg.data,borderColor:col,backgroundColor:'transparent',borderWidth:2.5,pointRadius:0,pointHoverRadius:5,tension:0,borderDash:[]}));
  });
  if(type==='OCR'){
    if(ovs.trafo)trafoW(imax).forEach(({pts,p})=>ds.push({label:'Ketahanan Trafo '+p+'%',data:pts,borderColor:'#b45309',backgroundColor:'transparent',borderWidth:1.5,borderDash:[5,4],pointRadius:0,tension:0}));
    if(ovs.inrush)ds.push({label:'Inrush Current',data:inrushPts(imax),borderColor:'#be185d',backgroundColor:'transparent',borderWidth:1.5,borderDash:[3,3],pointRadius:0,tension:.3});
  }
  if(type==='GFR'&&ovs.ngr){const n=ngrPts(imax);if(n.length)ds.push({label:'Batas Io NGR',data:n,borderColor:'#15803d',backgroundColor:'transparent',borderWidth:2,borderDash:[8,4],pointRadius:[5,0],tension:0});}
  if(ovs.marker)faultRows.forEach((row,i)=>{const d=markerDS(+row.I,row.label,i,imax);if(d)ds.push(d);});
  return ds;
}
function chartCfg(ds,imax){
  const tmax=fv('ch-tmax')||100,imin=fv('ch-imin')||1;
  return{type:'line',data:{datasets:ds},options:{
    responsive:true,maintainAspectRatio:false,animation:{duration:180},
    plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.dataset.isMarker?ctx.dataset.label:`${ctx.dataset.label}: I=${ctx.parsed.x.toFixed(0)}A, t=${ctx.parsed.y.toFixed(3)}s`}}},
    scales:{
      x:{type:'logarithmic',min:imin,max:imax,
         title:{display:true,text:'Arus Gangguan (Ampere)',font:{size:10,weight:'bold'},color:'#374151'},
         grid:{color:'rgba(0,0,0,.06)'},
         // Tick X = kelipatan eksponensial murni: 1, 10, 100, 1k, 10k, 100k
         ticks:{callback:v=>{
           const lg=Math.log10(v);
           if(Math.abs(lg-Math.round(lg))>0.01) return '';
           const n=Math.round(lg);
           if(n<0) return v.toString();
           if(n<3) return Math.pow(10,n).toString();
           return Math.pow(10,n-3)+'k';
         },font:{size:9},maxRotation:0,color:'#64748b',autoSkip:false}},
      y:{type:'logarithmic',min:.01,max:tmax,
         title:{display:true,text:'Waktu Trip (Detik)',font:{size:10,weight:'bold'},color:'#374151'},
         grid:{color:'rgba(0,0,0,.06)'},
         ticks:{callback:v=>{const m=[.01,.02,.05,.1,.2,.5,1,2,5,10,20,50,100];return m.some(x=>Math.abs(x-v)<x*.01)?v+'s':'';},font:{size:9},color:'#64748b'}}
    }
  }};
}
function renderCharts(){
  const imO=fv('ch-imax-o')||100000,imG=fv('ch-imax-g')||5000;
  if(chOCR){chOCR.destroy();chOCR=null;}
  if(chGFR){chGFR.destroy();chGFR=null;}
  chOCR=new Chart($('cv-o'),chartCfg(makeDS('OCR',imO),imO));
  chGFR=new Chart($('cv-g'),chartCfg(makeDS('GFR',imG),imG));
  buildLeg('leg-o','OCR',imO);buildLeg('leg-g','GFR',imG);
  $('ocr-cnt').textContent=relays.filter(r=>r.ocr.en&&r.ocr.char!=='OFF').length+' kurva aktif';
  $('gfr-cnt').textContent=relays.filter(r=>r.gfr.en&&r.gfr.char!=='OFF').length+' kurva aktif';
}
function buildLeg(elId,type,imax){
  const el=$(elId);el.innerHTML='';
  relays.forEach(r=>{
    const s=type==='OCR'?r.ocr:r.gfr;
    if(!s.en||s.char==='OFF')return;
    const d=document.createElement('div');d.className='li';
    d.innerHTML='<div class="li-dot" style="background:'+r.color+'"></div>'+r.name;
    d.title='Klik untuk nonaktifkan';
    d.onclick=()=>{s.en=false;renderCards();refreshAll();};
    el.appendChild(d);
  });
  const addL=(lbl,col)=>{const d=document.createElement('div');d.className='li';d.innerHTML='<div class="li-dot" style="background:'+col+'"></div>'+lbl;el.appendChild(d);};
  if(type==='OCR'){if(ovs.trafo)addL('Ketahanan Trafo','#b45309');if(ovs.inrush)addL('Inrush','#be185d');}
  if(type==='GFR'&&ovs.ngr)addL('Batas NGR','#15803d');
  if(ovs.marker)faultRows.forEach((row,i)=>{
    const I=+row.I;if(I<1||I>imax)return;
    const cols=['#ef4444','#f59e0b','#10b981','#6366f1','#ec4899','#0ea5e9','#84cc16','#f97316'];
    addL(row.label,cols[i%cols.length]);
  });
}
function renderAnalysis(){buildTbl('tbl-o','body-o','OCR');buildTbl('tbl-g','body-g','GFR');}
function buildTbl(tId,bId,type){
  const isO=type==='OCR';
  const thead=$(tId).querySelector('thead tr');
  thead.innerHTML='<th>Arus (A)</th><th>Keterangan</th>';
  const act=relays.filter(r=>(isO?r.ocr:r.gfr).en&&(isO?r.ocr:r.gfr).char!=='OFF');
  act.forEach(r=>{const th=document.createElement('th');th.innerHTML='<span style="display:flex;align-items:center;gap:2px;justify-content:center"><span style="width:6px;height:6px;border-radius:50%;background:'+r.color+';display:inline-block"></span>'+r.name+'</span>';thead.appendChild(th);});
  const recTh=document.createElement('th');recTh.textContent='Rekomendasi Engineer';thead.appendChild(recTh);
  const tbody=$(bId);tbody.innerHTML='';
  if(!faultRows.length||!act.length){tbody.innerHTML='<tr><td colspan="'+(act.length+3)+'" class="empty">'+((!act.length)?'Tidak ada rele '+type+' aktif':'Tambah arus gangguan & klik Hitung')+'</td></tr>';return;}
  faultRows.forEach((row,ri)=>{
    const tr=document.createElement('tr');
    tr.innerHTML='<td><b>'+(+row.I).toLocaleString()+' A</b></td><td style="color:var(--muted);font-size:.62rem;white-space:nowrap">'+row.label+'</td>';
    act.forEach(r=>{
      const s=isO?r.ocr:r.gfr,res=calcTime(s,+row.I),td=document.createElement('td');
      if(!res){td.innerHTML='<span class="t-inf">-- &lt; I&gt;</span>';}
      else if(res.stage===3){td.innerHTML='<span class="'+(isO?'t-inst':'t-inst-g')+'">'+res.t.toFixed(3)+' s</span> <span class="tag-s3">I&gt;&gt;&gt;</span>';}
      else if(res.stage===2){td.innerHTML='<span class="'+(isO?'t-inst':'t-inst-g')+'">'+res.t.toFixed(3)+' s</span> <span class="tag-s2">I&gt;&gt;</span>';}
      else if(res.stage==='dt'){td.innerHTML='<span style="color:#075985;font-weight:700">'+res.t.toFixed(3)+' s</span> <span class="tag-dt">DT</span>';}
      else{const cls=res.t<.15?'t-warn':res.t<2?'t-ok':'t-warn';td.innerHTML='<span class="'+cls+'">'+res.t.toFixed(3)+' s</span> <span class="tag-toc">TOC</span>';}
      tr.appendChild(td);
    });
    const recTd=document.createElement('td');recTd.className='rec-cell';
    const inp=document.createElement('input');inp.type='text';inp.value=row[isO?'recO':'recG']||'';inp.placeholder='Catatan engineer...';
    inp.oninput=e=>{faultRows[ri][isO?'recO':'recG']=e.target.value;};
    recTd.appendChild(inp);tr.appendChild(recTd);
    tbody.appendChild(tr);
  });
}
function charOpts(sel){return Object.entries(CURVES).map(([k,v])=>'<option value="'+k+'" '+(k===sel?'selected':'')+'>'+v.label+'</option>').join('');}
function fnHTML(ri,ti){
  const r=relays[ri],s=ti==='ocr'?r.ocr:r.gfr,isO=ti==='ocr',sid=ri+'-'+ti;
  const s1=isO?'I>  Pickup':'Io>  Pickup',s2=isO?'I>>':'Io>>',s3=isO?'I>>>':'Io>>>';
  return '<div class="fn-block'+(s.en?'':' off')+'" id="fnb-'+sid+'">'
    +'<div class="fn-hdr '+(isO?'fn-hdr-o':'fn-hdr-g')+'">'
    +'<span class="fn-lbl '+(isO?'fn-lbl-o':'fn-lbl-g')+'">'+(isO?'OCR — Over Current Relay':'GFR — Ground Fault Relay')+'</span>'
    +'<div class="tog" onclick="togFn('+ri+',\''+ti+'\')">'
    +'<span class="tog-lbl" id="tl-'+sid+'" style="color:'+(s.en?(isO?'var(--ocr)':'var(--gfr)'):'var(--muted)')+'">'+( s.en?'AKTIF':'OFF')+'</span>'
    +'<div class="tog-sw'+(s.en?(isO?' on-o':' on-g'):'')+'" id="ts-'+sid+'"></div></div></div>'
    +'<div class="fn-off-msg">Fungsi '+ti.toUpperCase()+' nonaktif — klik toggle untuk aktifkan</div>'
    +'<div class="fn-body">'
    +'<div class="fgrid" style="margin-bottom:5px">'
    +'<div class="fg"><label>CT Primer (A)</label><input type="number" value="'+s.ctP+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'ctP\',+this.value)"></div>'
    +'<div class="fg"><label>CT Sekunder (A)</label><input type="number" value="'+s.ctS+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'ctS\',+this.value)"></div>'
    +'<div class="fg"><label>Vref Rele (kV)</label><input type="number" value="'+s.vRef+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'vRef\',+this.value)"></div>'
    +'</div><hr>'
    +'<div style="margin-bottom:5px"><span class="stg stg1">Stage 1 — TOC Inverse: '+s1+' + TMS</span>'
    +'<div class="fgrid">'
    +'<div class="fg"><label>Karakteristik</label><select onchange="setSP('+ri+',\''+ti+'\',\'char\',this.value)">'+charOpts(s.char)+'</select></div>'
    +'<div class="fg"><label>'+s1+' (A primer)</label><input type="number" value="'+s.Is+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'Is\',+this.value)" id="Is-'+sid+'"></div>'
    +'<div class="fg"><label>x In CT (auto)</label><input type="text" value="'+(s.ctP>0?(s.Is/s.ctP).toFixed(4):'-')+'" readonly id="ism-'+sid+'" style="background:#f8fafc;color:var(--muted)"></div>'
    +'<div class="fg"><label>TMS '+(s.char==='DT'?'(= TD utk DT)':'')+'</label><input type="number" value="'+s.TMS+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'TMS\',+this.value)"></div>'
    +'</div></div><hr>'
    +'<div style="margin-bottom:5px"><span class="stg stg2">Stage 2 — Instantaneous: '+s2+' + TD>></span>'
    +'<div class="fgrid">'
    +'<div class="fg"><label>'+s2+' (A primer) [0=OFF]</label><input type="number" value="'+(s.Iinst||0)+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'Iinst\',+this.value)" placeholder="0=OFF"></div>'
    +'<div class="fg"><label>TD>> (s)</label><input type="number" value="'+(s.tInst||0)+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'tInst\',+this.value)"></div>'
    +'</div></div><hr>'
    +'<div><span class="stg stg3">Stage 3 — High Inst: '+s3+' + TD>>></span>'
    +'<div class="fgrid">'
    +'<div class="fg"><label>'+s3+' (A primer) [0=OFF]</label><input type="number" value="'+(s.Iinst2||0)+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'Iinst2\',+this.value)" placeholder="0=OFF"></div>'
    +'<div class="fg"><label>TD>>> (s)</label><input type="number" value="'+(s.tInst2||0)+'" step="any" onchange="setSP('+ri+',\''+ti+'\',\'tInst2\',+this.value)"></div>'
    +'</div></div></div></div>';
}
function renderCards(){
  const grid=$('relay-grid');grid.innerHTML='';
  relays.forEach((r,idx)=>{
    const oOn=r.ocr.en&&r.ocr.char!=='OFF',gOn=r.gfr.en&&r.gfr.char!=='OFF';
    const card=document.createElement('div');card.className='r-card';card.id='rc-'+idx;card.style.borderLeftColor=r.color;
    card.innerHTML='<div class="r-hdr" onclick="togCard('+idx+',event)">'
      +'<div class="r-dot" style="background:'+r.color+'"></div>'
      +'<input class="r-name-inp" value="'+r.name+'" onclick="event.stopPropagation()" oninput="setRP('+idx+',\'name\',this.value)">'
      +'<div class="r-status">'
      +'<span class="sb '+(oOn?'sb-oc':'sb-off')+'" id="sbo-'+idx+'">OCR</span>'
      +'<span class="sb '+(gOn?'sb-gc':'sb-off')+'" id="sbg-'+idx+'">GFR</span>'
      +'</div>'
      +'<input type="color" value="'+r.color+'" onclick="event.stopPropagation()" onchange="setRP('+idx+',\'color\',this.value)" style="width:24px;height:20px;padding:1px;border:1px solid var(--bdr);border-radius:3px;cursor:pointer;flex-shrink:0">'
      +'<span class="r-arr">&#9660;</span></div>'
      +'<div class="r-body">'
      +'<div class="r-ident">'
      +'<div class="fg"><label>Merk</label><input type="text" value="'+(r.merk||'')+'" placeholder="e.g. Siemens" oninput="setRP('+idx+',\'merk\',this.value)"></div>'
      +'<div class="fg"><label>Tipe / Model</label><input type="text" value="'+(r.tipe||'')+'" placeholder="e.g. 7SJ85" oninput="setRP('+idx+',\'tipe\',this.value)"></div>'
      +'<div class="fg"><label>Serial Number (S/N)</label><input type="text" value="'+(r.sn||'')+'" placeholder="e.g. BF12345678" oninput="setRP('+idx+',\'sn\',this.value)"></div>'
      +'</div>'
      +fnHTML(idx,'ocr')+fnHTML(idx,'gfr')
      +'<div style="margin-top:6px;display:flex;gap:5px">'
      +'<button class="btn btn-pln btn-sm" onclick="refreshAll()">Refresh</button>'
      +'<button class="btn btn-out btn-sm" onclick="cloneR('+idx+')">Duplikat</button>'
      +'</div></div>';
    grid.appendChild(card);
  });
}
function togCard(idx,e){if(e.target.closest('.tog')||['INPUT','SELECT'].includes(e.target.tagName))return;$('rc-'+idx).classList.toggle('exp');}
function togFn(ri,ti){
  const s=ti==='ocr'?relays[ri].ocr:relays[ri].gfr;s.en=!s.en;
  const isO=ti==='ocr',sid=ri+'-'+ti;
  const sw=$('ts-'+sid),lbl=$('tl-'+sid),fnb=$('fnb-'+sid);
  if(sw)sw.className='tog-sw'+(s.en?(isO?' on-o':' on-g'):'');
  if(lbl){lbl.textContent=s.en?'AKTIF':'OFF';lbl.style.color=s.en?(isO?'var(--ocr)':'var(--gfr)'):'var(--muted)';}
  if(fnb)fnb.classList.toggle('off',!s.en);
  const oOn=relays[ri].ocr.en&&relays[ri].ocr.char!=='OFF',gOn=relays[ri].gfr.en&&relays[ri].gfr.char!=='OFF';
  const so=$('sbo-'+ri),sg=$('sbg-'+ri);
  if(so)so.className='sb '+(oOn?'sb-oc':'sb-off');
  if(sg)sg.className='sb '+(gOn?'sb-gc':'sb-off');
  refreshAll();
}
function setSP(ri,ti,prop,val){
  const s=ti==='ocr'?relays[ri].ocr:relays[ri].gfr;s[prop]=val;
  if(prop==='Is'||prop==='ctP'){const el=$('ism-'+ri+'-'+ti);if(el)el.value=s.ctP>0?(s.Is/s.ctP).toFixed(4):'-';}
}
function setRP(idx,prop,val){
  relays[idx][prop]=val;
  if(prop==='color'){const c=$('rc-'+idx);if(c){c.style.borderLeftColor=val;c.querySelector('.r-dot').style.background=val;}}
}
function cloneR(idx){
  const r=JSON.parse(JSON.stringify(relays[idx]));
  const free=relays.findIndex((x,i)=>i>0&&!x.ocr.en&&!x.gfr.en);
  if(free>=0){relays[free]={...r,id:relays[free].id,name:r.name+' (copy)'};renderCards();refreshAll();}
  else notify('Semua slot terpakai.',true);
}
function addFaultRow(I,lbl,ro,rg){faultRows.push({id:Date.now()+Math.random(),I:I||3000,label:lbl||'Titik Baru',recO:ro||'',recG:rg||''});renderFaultRows();}
function removeFaultRow(id){faultRows=faultRows.filter(r=>r.id!==id);renderFaultRows();}
function renderFaultRows(){
  const el=$('fault-rows');el.innerHTML='';
  faultRows.forEach((row,i)=>{
    const d=document.createElement('div');d.className='fault-row';
    d.innerHTML='<input type="number" value="'+row.I+'" step="any" style="width:100px" oninput="faultRows['+i+'].I=+this.value">'
      +'<input type="text" value="'+row.label+'" style="width:140px" oninput="faultRows['+i+'].label=this.value" placeholder="Keterangan">'
      +'<button class="btn btn-sm" style="background:var(--err);color:#fff;padding:2px 7px" onclick="removeFaultRow('+row.id+')">&#10005;</button>';
    el.appendChild(d);
  });
}
function populateTMSsel(){
  const sel=$('ti-char');
  Object.entries(CURVES).filter(([k])=>k!=='OFF'&&k!=='DT').forEach(([k,v])=>{
    const o=document.createElement('option');o.value=k;o.textContent=v.label;if(k==='C_SI')o.selected=true;sel.appendChild(o);
  });
}
function tmsBase(){
  const I=+$('ti-I').value,Is=+$('ti-Is').value,ch=$('ti-char').value,c=CURVES[ch];
  if(I<=Is)return{err:'Arus gangguan harus > Is (pickup)'};
  const M=I/Is,d=Math.pow(M,c.al)-1;
  if(d<=0)return{err:'M terlalu kecil untuk kurva ini'};
  return{M,d,c,I,Is};
}
function calcTMSresult(){
  const el=$('tms-out');el.style.display='block';
  const b=tmsBase();if(b.err){el.innerHTML='<span style="color:var(--err)">'+b.err+'</span>';return;}
  const t_t=+$('ti-t').value;
  let TMS=b.c.type==='iec'?t_t*b.d/b.c.k:t_t/(b.c.k/b.d+b.c.B);
  el.innerHTML=resHTML('TMS dari Waktu Target',TMS.toFixed(4),t_t.toFixed(3),b.I,b.Is,b.M,b.c);
}
function calcTimeResult(){
  const el=$('tms-out');el.style.display='block';
  const b=tmsBase();if(b.err){el.innerHTML='<span style="color:var(--err)">'+b.err+'</span>';return;}
  const TMS=+$('ti-tms').value;
  let t=b.c.type==='iec'?TMS*b.c.k/b.d:TMS*(b.c.k/b.d+b.c.B);
  el.innerHTML=resHTML('Waktu Trip dari TMS',TMS.toFixed(4),t.toFixed(3),b.I,b.Is,b.M,b.c);
}
function resHTML(mode,TMS,t,I,Is,M,c){
  return '<b>'+mode+':</b>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:5px;margin:6px 0">'
    +'<div><div style="font-size:.57rem;color:var(--muted);font-weight:600">TMS</div><div style="font-size:1.2rem;font-weight:900;color:var(--pln)">'+TMS+'</div></div>'
    +'<div><div style="font-size:.57rem;color:var(--muted);font-weight:600">Waktu Trip</div><div style="font-size:1.2rem;font-weight:900;color:var(--ok)">'+t+' s</div></div>'
    +'<div><div style="font-size:.57rem;color:var(--muted);font-weight:600">M = I/Is</div><b>'+M.toFixed(3)+'</b></div>'
    +'<div><div style="font-size:.57rem;color:var(--muted);font-weight:600">Arus</div><b>'+(+I).toLocaleString()+' A</b></div>'
    +'<div><div style="font-size:.57rem;color:var(--muted);font-weight:600">Is Pickup</div><b>'+(+Is).toLocaleString()+' A</b></div>'
    +'</div>'
    +'<div style="padding:5px 9px;background:#dbeafe;border-radius:4px;font-size:.67rem">Verifikasi: t = '+TMS+' x ['+c.f+'] = <b>'+t+' s</b></div>';
}
function buildFormulaTable(){
  const tb=$('ftbl');if(!tb)return;
  Object.entries(CURVES).forEach(([k,v])=>{
    const tr=document.createElement('tr');
    tr.innerHTML='<td style="font-weight:700;font-family:monospace;color:var(--pln)">'+k+'</td>'
      +'<td>'+v.label+'</td><td style="color:var(--muted)">'+v.std+'</td>'
      +'<td style="font-family:monospace;font-size:.61rem">'+v.f+'</td>'
      +'<td style="font-family:monospace">'+(v.k||'--')+'</td>'
      +'<td style="font-family:monospace">'+(v.al||'--')+'</td>'
      +'<td style="font-family:monospace">'+(v.B||'--')+'</td>';
    tb.appendChild(tr);
  });
}
function recalcIn(){const In=inT();$('sys-in').value=In.toFixed(2);}
function exportCfg(){
  const cfg={version:'7.0',
    sys:{name:$('sys-name').value,gi:$('sys-gi').value,mva:$('sys-mva').value,vhv:$('sys-vhv').value,vlv:$('sys-vlv').value,vbase:$('sys-vbase').value},
    ngr:{io:$('ngr-io').value,v:$('ngr-v').value,r:$('ngr-r').value,t:$('ngr-t').value},
    relays:JSON.parse(JSON.stringify(relays)),faultRows,tfcEvents};
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(cfg,null,2)],{type:'application/json'}));
  a.download='SIMCOR_v7_'+($('sys-gi').value||'config')+'_'+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  _saveRelayConfigNow();
  notify('Konfigurasi disimpan!');
}
function loadCfg(inp){
  const f=inp.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=e=>{
    try{
      const c=JSON.parse(e.target.result);
      if(c.sys)['name','gi','mva','vhv','vlv','vbase'].forEach(k=>{const el=$('sys-'+k);if(el)el.value=c.sys[k]??el.value;});
      if(c.ngr)['io','v','r','t'].forEach(k=>{const el=$('ngr-'+k);if(el)el.value=c.ngr[k]??el.value;});
      if(c.relays)relays=c.relays.map(r=>({merk:'',tipe:'',sn:'',...r}));
      if(c.faultRows){faultRows=c.faultRows.map(r=>({...r,recO:r.recO||'',recG:r.recG||''}));renderFaultRows();}
      if(c.tfcEvents){tfcEvents=c.tfcEvents;renderTFCHealth();}
      recalcIn();renderCards();refreshAll();notify('Konfigurasi dimuat!');
    }catch(err){notify('Gagal: '+err.message,true);}
  };
  rd.readAsText(f);inp.value='';
}
function resetDef(){
  if(confirm('Reset ke nilai default template?')){
    relays=JSON.parse(JSON.stringify(DEFAULTS.relays));
    faultRows=JSON.parse(JSON.stringify(DEFAULTS.faultRows));
    applyDefSys();recalcIn();renderCards();renderFaultRows();refreshAll();notify('Reset ke default.');
  }
}
function applyDefSys(){
  const d=DEFAULTS.sys;['name','gi','mva','vhv','vlv','vbase'].forEach(k=>{const el=$('sys-'+k);if(el)el.value=d[k];});
  const n=DEFAULTS.ngr;['io','v','r','t'].forEach(k=>{const el=$('ngr-'+k);if(el)el.value=n[k];});
}


// ===== SETTING ENGINE v7 — FORMULA TERKOREKSI =====
function runSettingEngine(){
  const mva=fv('eng-mva')||60;
  const xt_pct=fv('eng-xt')||12.5;
  const vlv=fv('eng-vlv')||20;
  const ngr_ohm=fv('eng-ngr')||40;
  const ihs_150kv_kA=fv('eng-ihs150')||8.1;
  const ct_p=fv('eng-ct-p')||2000;
  const ct_op=fv('eng-ct-op')||600;
  const i_beban=fv('eng-ibeban')||200;
  const kha=fv('eng-kha')||400;
  const kha_couple=fv('eng-kha-couple')||1000;
  const dt=fv('eng-dt')||0.3;
  const char_ocr=$('eng-char-ocr').value;
  const char_gfr=$('eng-char-gfr').value;

  // ===== DERIVED SYSTEM PARAMETERS =====
  const In = (mva*1000) / (Math.sqrt(3)*vlv);
  const In_150 = (mva*1000) / (Math.sqrt(3)*150);
  const Xt_100 = (vlv*vlv) / mva;
  const Xt_trafo = Xt_100 * (xt_pct/100);
  const IHS_trafo = In / (xt_pct/100);
  const IHS_trafo_PhN = IHS_trafo / 7.5;

  // IHS_20kV system (termasuk impedansi upstream 150kV)
  const IHS_150_MVA = Math.sqrt(3) * 150 * ihs_150kv_kA;
  const Z_150 = (150*150) / IHS_150_MVA;
  const Z_150_ref = Math.pow(vlv/150, 2) * Z_150;
  const IHS_20kV = (vlv*1000/Math.sqrt(3)) / (Xt_trafo + Z_150_ref);

  const I_NGR = (vlv*1000/Math.sqrt(3)) / ngr_ohm;

  // ===== FUNGSI TMS LANGSUNG =====
  function tms_SI(Is, I_ref, t_target){
    const M = I_ref / Is;
    if(M <= 1) return 0.05;
    return Math.round(t_target * (Math.pow(M, 0.02) - 1) / 0.14 * 10000) / 10000;
  }
  function tms_LTI(Is, I_ref, t_target){
    const M = I_ref / Is;
    if(M <= 1) return 0.05;
    return Math.round(t_target * (M - 1) / 120 * 10000) / 10000;
  }
  function tms_generic(Is, I_ref, t_target, char_code){
    const c = CURVES[char_code];
    if(!c || c.type==='off' || c.type==='dt') return t_target;
    const M = I_ref / Is;
    if(M <= 1) return 0.05;
    const d = Math.pow(M, c.al) - 1;
    if(d <= 0) return 0.05;
    const TMS = c.type==='iec' ? t_target * d / c.k : (t_target - c.B) * d / c.k;
    return Math.round(Math.max(0.02, TMS) * 10000) / 10000;
  }

  // ===== INCOMING OCR =====
  const Is_OCR_INC = Math.round(1.2 * In);
  const TMS_OCR_INC = tms_generic(Is_OCR_INC, IHS_trafo, 1.0, char_ocr);
  const Iinst_OCR_INC = Math.round(0.5 * IHS_trafo);  // Stage 2: t=0.6s

  // ===== COUPLER OCR =====
  const Is_OCR_COUP = Math.round(Math.min(1.2*kha_couple, 1.2*In));
  const TMS_OCR_COUP = tms_generic(Is_OCR_COUP, IHS_trafo, 0.7, char_ocr);
  const Iinst_OCR_COUP = Math.round(0.45 * IHS_trafo);  // Stage 2: t=0.3s

  // ===== OUTGOING OCR =====
  const Is_OCR_OUT = Math.round(1.2 * i_beban);
  const TMS_OCR_OUT = tms_generic(Is_OCR_OUT, 0.4*IHS_trafo, 1.0, char_ocr);
  const Iinst2_OCR_OUT = Math.round(0.4 * IHS_20kV);   // Stage 2: t=0.2s
  const Iinst3_OCR_OUT = Math.round(0.5 * IHS_trafo);   // Stage 3: t=0s (fast)

  // ===== INCOMING GFR =====
  const Is_GFR_INC = Math.round(0.125 * I_NGR);
  const TMS_GFR_INC = tms_generic(Is_GFR_INC, I_NGR, 1.4, char_gfr);

  // ===== COUPLER GFR =====
  const Is_GFR_COUP = Math.round(0.125 * I_NGR);
  const TMS_GFR_COUP = tms_generic(Is_GFR_COUP, I_NGR, 1.1, char_gfr);

  // ===== OUTGOING GFR =====
  const Is_GFR_OUT = Math.round(0.104 * I_NGR);
  const TMS_GFR_OUT = tms_generic(Is_GFR_OUT, I_NGR, 0.9, char_gfr);
  const Io_INST_OUT = Math.round(1.0 * I_NGR);  // Io>>: 1.0×I_NGR, t=0.3s

  // ===== SBEF (IEC LTI) =====
  const Is_SBEF = Math.round(0.125 * I_NGR);
  const M_SBEF = I_NGR / Is_SBEF;  // = 8
  const TMS_SBEF1 = Math.round(5.0 * (M_SBEF-1) / 120 * 10000) / 10000;
  const TMS_SBEF2 = Math.round(5.5 * (M_SBEF-1) / 120 * 10000) / 10000;

  // ===== BPU HV TRAFO (150kV OCR) =====
  const Is_BPU = Math.round(1.2 * In_150);
  const TMS_BPU = tms_generic(Is_BPU, IHS_trafo_PhN, 1.3, char_ocr);
  const Iinst_BPU = Math.round(0.52 * IHS_trafo_PhN);

  // Hitung waktu trip untuk info
  const t_SBEF_at_NGR = calcTOCDirect(Is_SBEF, TMS_SBEF1, 'C_LTI', I_NGR);
  const t_GFR_INC_at_NGR = calcTOCDirect(Is_GFR_INC, TMS_GFR_INC, char_gfr, I_NGR);

  engResults = {
    mva, xt_pct, vlv, ngr_ohm, In, In_150,
    IHS_trafo, IHS_trafo_PhN, IHS_20kV, I_NGR, ihs_150kv_kA,
    t_SBEF: t_SBEF_at_NGR,
    t_GFR_INC: t_GFR_INC_at_NGR,
    INCOMING:{
      ocr:{Is:Is_OCR_INC,TMS:TMS_OCR_INC,Iinst:Iinst_OCR_INC,tInst:0.6,Iinst2:0,tInst2:0,char:char_ocr,ctP:ct_p,ctS:5,vRef:vlv},
      gfr:{Is:Is_GFR_INC,TMS:TMS_GFR_INC,Iinst:0,tInst:0,Iinst2:0,tInst2:0,char:char_gfr,ctP:ct_p,ctS:5,vRef:vlv}
    },
    COUPLER:{
      ocr:{Is:Is_OCR_COUP,TMS:TMS_OCR_COUP,Iinst:Iinst_OCR_COUP,tInst:0.3,Iinst2:0,tInst2:0,char:char_ocr,ctP:ct_p,ctS:5,vRef:vlv},
      gfr:{Is:Is_GFR_COUP,TMS:TMS_GFR_COUP,Iinst:0,tInst:0,Iinst2:0,tInst2:0,char:char_gfr,ctP:ct_p,ctS:5,vRef:vlv}
    },
    OUTGOING:{
      ocr:{Is:Is_OCR_OUT,TMS:TMS_OCR_OUT,Iinst:Iinst2_OCR_OUT,tInst:0.2,Iinst2:Iinst3_OCR_OUT,tInst2:0.05,char:char_ocr,ctP:ct_op,ctS:5,vRef:vlv},
      gfr:{Is:Is_GFR_OUT,TMS:TMS_GFR_OUT,Iinst:Io_INST_OUT,tInst:0.3,Iinst2:0,tInst2:0,char:char_gfr,ctP:ct_op,ctS:5,vRef:vlv}
    },
    SBEF:{
      gfr1:{Is:Is_SBEF,TMS:TMS_SBEF1,Iinst:0,tInst:0,Iinst2:0,tInst2:0,char:'C_LTI',ctP:300,ctS:5,vRef:vlv},
      gfr2:{Is:Is_SBEF,TMS:TMS_SBEF2,Iinst:0,tInst:0,Iinst2:0,tInst2:0,char:'C_LTI',ctP:300,ctS:5,vRef:vlv}
    },
    BPU:{
      ocr:{Is:Is_BPU,TMS:TMS_BPU,Iinst:Iinst_BPU,tInst:0.9,Iinst2:0,tInst2:0,char:char_ocr,ctP:300,ctS:1,vRef:150}
    }
  };

  renderEngResults();
  notify('✅ Kalkulasi setting v7 selesai!');
}


function renderEngResults(){
  if(!engResults)return;
  const r=engResults;
  $('eng-results').style.display='block';

  // System info
  $('eng-sys-info').innerHTML=`
    <div class="result-box"><div class="lbl">In 20kV</div><div class="val">${r.In.toFixed(0)} A</div><div class="sub">${r.mva} MVA / ${r.vlv} kV</div></div>
    <div class="result-box hi"><div class="lbl">IHS Trafo (3Φ)</div><div class="val">${r.IHS_trafo.toFixed(0)} A</div><div class="sub">In/Xt(${r.xt_pct}%)</div></div>
    <div class="result-box"><div class="lbl">IHS Sistem 20kV</div><div class="val">${r.IHS_20kV.toFixed(0)} A</div><div class="sub">incl. Z upstream</div></div>
    <div class="result-box"><div class="lbl">IHS Trafo Ph-N</div><div class="val">${r.IHS_trafo_PhN.toFixed(0)} A</div><div class="sub">IHS/7.5</div></div>
    <div class="result-box"><div class="lbl">I NGR</div><div class="val">${r.I_NGR.toFixed(0)} A</div><div class="sub">${r.vlv}kV/(√3×${r.ngr_ohm}Ω)</div></div>
    <div class="result-box"><div class="lbl">IHS 150kV</div><div class="val">${r.ihs_150kv_kA} kA</div><div class="sub">sistem primer</div></div>
  `;

  // Build simplified primer-only result table
  const rows=[
    {id:'BPU HV',color:'#e53e3e',type:'150kV OCR',
      fields:[
        {n:'Is (A primer)',v:r.BPU?.ocr.Is,c:'var(--ocr)'},
        {n:'TMS',v:r.BPU?.ocr.TMS},
        {n:'I>> (A)',v:r.BPU?.ocr.Iinst,c:'var(--ocr)'},
        {n:'TD>> (s)',v:r.BPU?.ocr.tInst},
        {n:'Kurva',v:CURVES[r.BPU?.ocr.char]?.label}
      ]},
    {id:'INCOMING',color:'#df20d9',type:'20kV OCR',
      fields:[
        {n:'Is (A primer)',v:r.INCOMING?.ocr.Is,c:'var(--ocr)'},
        {n:'TMS',v:r.INCOMING?.ocr.TMS},
        {n:'I>> (A)',v:r.INCOMING?.ocr.Iinst,c:'var(--ocr)'},
        {n:'TD>> (s)',v:r.INCOMING?.ocr.tInst},
        {n:'Kurva',v:CURVES[r.INCOMING?.ocr.char]?.label}
      ]},
    {id:'INCOMING',color:'#df20d9',type:'GFR',
      fields:[
        {n:'Io> (A primer)',v:r.INCOMING?.gfr.Is,c:'var(--gfr)'},
        {n:'TMS',v:r.INCOMING?.gfr.TMS},
        {n:'—',v:'—'},{n:'—',v:'—'},
        {n:'Kurva',v:CURVES[r.INCOMING?.gfr.char]?.label}
      ]},
    {id:'COUPLER',color:'#38a169',type:'OCR',
      fields:[
        {n:'Is (A primer)',v:r.COUPLER?.ocr.Is,c:'var(--ocr)'},
        {n:'TMS',v:r.COUPLER?.ocr.TMS},
        {n:'I>> (A)',v:r.COUPLER?.ocr.Iinst,c:'var(--ocr)'},
        {n:'TD>> (s)',v:r.COUPLER?.ocr.tInst},
        {n:'Kurva',v:CURVES[r.COUPLER?.ocr.char]?.label}
      ]},
    {id:'COUPLER',color:'#38a169',type:'GFR',
      fields:[
        {n:'Io> (A primer)',v:r.COUPLER?.gfr.Is,c:'var(--gfr)'},
        {n:'TMS',v:r.COUPLER?.gfr.TMS},
        {n:'—',v:'—'},{n:'—',v:'—'},
        {n:'Kurva',v:CURVES[r.COUPLER?.gfr.char]?.label}
      ]},
    {id:'OUTGOING',color:'#3182ce',type:'OCR',
      fields:[
        {n:'Is (A primer)',v:r.OUTGOING?.ocr.Is,c:'var(--ocr)'},
        {n:'TMS',v:r.OUTGOING?.ocr.TMS},
        {n:'I>> (A)',v:r.OUTGOING?.ocr.Iinst,c:'var(--ocr)'},
        {n:'TD>> (s)',v:r.OUTGOING?.ocr.tInst},
        {n:'Kurva',v:CURVES[r.OUTGOING?.ocr.char]?.label}
      ]},
    {id:'OUTGOING',color:'#3182ce',type:'GFR',
      fields:[
        {n:'Io> (A primer)',v:r.OUTGOING?.gfr.Is,c:'var(--gfr)'},
        {n:'TMS',v:r.OUTGOING?.gfr.TMS},
        {n:'Io>> (A)',v:r.OUTGOING?.gfr.Iinst,c:'var(--gfr)'},
        {n:'TD>> (s)',v:r.OUTGOING?.gfr.tInst},
        {n:'Kurva',v:CURVES[r.OUTGOING?.gfr.char]?.label}
      ]},
    {id:'SBEF-1',color:'#333333',type:'GFR (LTI)',
      fields:[
        {n:'Io> (A primer)',v:r.SBEF?.gfr1.Is,c:'var(--gfr)'},
        {n:'TMS',v:r.SBEF?.gfr1.TMS},
        {n:'t@I_NGR (s)',v:r.t_SBEF?r.t_SBEF.toFixed(3):'—'},
        {n:'Target',v:'5.0 s'},
        {n:'Kurva',v:'IEC LTI'}
      ]},
    {id:'SBEF-2',color:'#6b5c00',type:'GFR (LTI)',
      fields:[
        {n:'Io> (A primer)',v:r.SBEF?.gfr2.Is,c:'var(--gfr)'},
        {n:'TMS',v:r.SBEF?.gfr2.TMS},
        {n:'t@I_NGR (s)',v:r.SBEF?calcTOCDirect(r.SBEF.gfr2.Is,r.SBEF.gfr2.TMS,'C_LTI',r.I_NGR)?.toFixed(3):'—'},
        {n:'Target',v:'5.5 s'},
        {n:'Kurva',v:'IEC LTI'}
      ]},
  ];

  // Render as clean table
  let html='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.67rem">'
    +'<thead><tr style="background:var(--pln);color:#fff">'
    +'<th style="padding:6px 8px;text-align:left">Bay / Rele</th>'
    +'<th style="padding:6px 8px;text-align:left">Fungsi</th>'
    +'<th style="padding:6px 8px;text-align:right">Is / Io> (A)</th>'
    +'<th style="padding:6px 8px;text-align:right">TMS</th>'
    +'<th style="padding:6px 8px;text-align:right">I>> / Io>> (A)</th>'
    +'<th style="padding:6px 8px;text-align:right">TD (s)</th>'
    +'<th style="padding:6px 8px;text-align:center">Kurva</th>'
    +'</tr></thead><tbody>';

  rows.forEach((row,i)=>{
    const bg=i%2===0?'#fff':'#f8fafc';
    const f=row.fields;
    const fmtV=v=>v===undefined||v===null||v==='—'?'<span style="color:#94a3b8">—</span>'
      :`<b>${typeof v==='number'?v.toLocaleString():v}</b>`;
    const fmtC=(v,col)=>v===undefined||v===null||v==='—'?'<span style="color:#94a3b8">—</span>'
      :`<b style="color:${col}">${typeof v==='number'?v.toLocaleString():v}</b>`;
    html+=`<tr style="background:${bg}">
      <td style="padding:5px 8px;border-left:3px solid ${row.color};font-weight:700;color:${row.color}">${row.id}</td>
      <td style="padding:5px 8px;font-size:.6rem;font-weight:600;color:var(--muted)">${row.type}</td>
      <td style="padding:5px 8px;text-align:right">${fmtC(f[0].v,f[0].c||'var(--txt)')}</td>
      <td style="padding:5px 8px;text-align:right">${fmtV(f[1].v)}</td>
      <td style="padding:5px 8px;text-align:right">${fmtC(f[2].v,f[2].c||'var(--txt)')}</td>
      <td style="padding:5px 8px;text-align:right">${fmtV(f[3].v)}</td>
      <td style="padding:5px 8px;text-align:center;font-size:.6rem;color:var(--muted)">${f[4].v||'—'}</td>
    </tr>`;
  });

  html+='</tbody></table></div>';
  $('eng-relay-results').innerHTML=html;
}

// (FUNGSI LAMA — sengaja dihapus untuk menghindari shadowing.
//  applyEngineToRelays versi v8 yang aktif berada di bawah Setting Engine v8 — menangani 10 slot
//  dan menggunakan struktur engResults.bays[*] yang konsisten dengan Standard Rules.)


function getTFCK(mva){
  if(mva>=55)return{k:384,tmax:38400};
  if(mva>=25)return{k:96,tmax:9600};
  return{k:42.67,tmax:4267};
}
function addTFCEvent(){
  const mva=parseInt($('tfc-mva').value)||60;
  const {k}=getTFCK(mva);
  const I=fv('tfc-ev-I'),t=fv('tfc-ev-t');
  const In=(mva*1000)/(Math.sqrt(3)*20);
  const I_pu=I/In;
  const D_event=(I_pu*I_pu*t)/k;
  tfcEvents.push({
    id:Date.now(),mva,tanggal:$('tfc-ev-date').value||new Date().toISOString().slice(0,10),
    I_A:I,t_s:t,zona:$('tfc-ev-zona').value,jenis:$('tfc-ev-jenis').value,
    rele:$('tfc-ev-rele').value,D_event
  });
  renderTFCHealth();
  notify('Event gangguan ditambahkan!');
}
function clearTFCEvents(){
  if(confirm('Hapus semua riwayat event TFC?')){tfcEvents=[];renderTFCHealth();}}
function exportTFCCSV(){
  if(!tfcEvents.length){notify('Tidak ada data event.',true);return;}
  const mva=parseInt($('tfc-mva').value)||60;
  const evs=tfcEvents.filter(e=>e.mva===mva);
  let csv='No,Tanggal,Arus (A),t trip (s),Zona,Jenis Gangguan,Rele Trip,D_event,D_kumulatif\n';
  let cum=0;
  evs.forEach((e,i)=>{cum+=e.D_event;csv+=`${i+1},${e.tanggal},${e.I_A},${e.t_s},${e.zona},${e.jenis},${e.rele},${e.D_event.toFixed(6)},${cum.toFixed(6)}\n`;});
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download='TFC_Events_'+mva+'MVA_'+new Date().toISOString().slice(0,10)+'.csv';a.click();
}
function renderTFCHealth(){
  const mva=parseInt($('tfc-mva').value)||60;
  const {k,tmax}=getTFCK(mva);
  const In=(mva*1000)/(Math.sqrt(3)*20);
  const evs=tfcEvents.filter(e=>e.mva===mva);
  let D_total=0;
  evs.forEach(e=>{D_total+=e.D_event;});
  const pct=Math.min(100,D_total*100);
  let risk='green',riskTxt='AMAN',riskEmoji='✅';
  if(D_total>0.8){risk='red';riskTxt='KRITIS';riskEmoji='🔴';}
  else if(D_total>0.5){risk='yellow';riskTxt='PERHATIAN';riskEmoji='⚠️';}

  $('tfc-health-display').innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
      <span style="font-size:.7rem;font-weight:700">Status Trafo:</span>
      <span class="risk-badge ${risk}">${riskEmoji} ${riskTxt}</span>
      <span style="font-size:.65rem;color:var(--muted);margin-left:auto">${evs.length} event | k=${k} | tmax=${tmax.toLocaleString()}s (${(tmax/60).toFixed(0)} min)</span>
    </div>
    <div class="health-bar-wrap">
      <div class="health-bar risk-${risk}" style="width:${Math.max(pct,1)}%">${pct.toFixed(1)}%</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:5px;margin-top:6px">
      <div class="result-box"><div class="lbl">D_total</div><div class="val" style="color:var(--tfc)">${(D_total*100).toFixed(2)}%</div><div class="sub">dari total kapasitas</div></div>
      <div class="result-box"><div class="lbl">Kapasitas Sisa</div><div class="val">${((1-D_total)*100).toFixed(2)}%</div></div>
      <div class="result-box"><div class="lbl">In Trafo</div><div class="val">${In.toFixed(0)} A</div><div class="sub">${mva} MVA @ 20 kV</div></div>
      <div class="result-box"><div class="lbl">Total Events</div><div class="val">${evs.length}</div></div>
    </div>
    ${D_total>0.5?`<div style="margin-top:6px;padding:7px;background:${risk==='red'?'#fee2e2':'#fffbeb'};border-radius:5px;font-size:.65rem;color:${risk==='red'?'#b91c1c':'#a16207'};border:1px solid ${risk==='red'?'#fecaca':'#fde68a'}">
    ⚠️ <b>Rekomendasi:</b> ${risk==='red'?'Segera jadwalkan pengujian insulasi & evaluasi penggantian core transformer.':'Jadwalkan evaluasi kondisi trafo dalam 3 bulan ke depan. Perketat monitoring setting rele.'}
    </div>`:''}
  `;

  // Render event table
  const tbody=$('tfc-evt-body');
  if(!evs.length){tbody.innerHTML='<tr><td colspan="10" class="empty">Belum ada event untuk trafo '+mva+' MVA</td></tr>';return;}
  let cum2=0,html='';
  evs.forEach((e,i)=>{
    cum2+=e.D_event;
    const rowClass=cum2>0.8?'style="background:#fee2e2"':cum2>0.5?'style="background:#fffbeb"':'';
    html+=`<tr ${rowClass}><td>${i+1}</td><td>${e.tanggal}</td><td>${e.I_A.toLocaleString()}</td><td>${e.t_s}</td>
    <td>${e.zona}</td><td>${e.jenis}</td><td>${e.rele||'--'}</td>
    <td style="color:var(--tfc)">${e.D_event.toFixed(6)}</td>
    <td><b>${(cum2*100).toFixed(2)}%</b></td>
    <td><button class="btn btn-sm btn-err" onclick="removeTFCEvent(${e.id})">✕</button></td></tr>`;
  });
  tbody.innerHTML=html;

  // Render reference table
  renderTFCRefTable(mva,k,In);
}
function removeTFCEvent(id){tfcEvents=tfcEvents.filter(e=>e.id!==id);renderTFCHealth();}
function renderTFCRefTable(mva,k,In){
  const zones=[
    {name:'Busbar 20kV',I_pu:8},
    {name:'Zona 1 (0-5 km)',I_pu:4},
    {name:'Zona 2 (5-10 km)',I_pu:2.3},
    {name:'Zona 3 (>10 km)',I_pu:1.15}
  ];
  const times=[0.1,0.2,0.5,1.0,2.0];
  let html='<div style="overflow-x:auto"><table class="evt-table">';
  html+='<thead><tr><th>Zona</th><th>I_pu (×In)</th><th>I aktual (A)</th>';
  times.forEach(t=>html+=`<th>D @ t=${t}s</th>`);
  html+='</tr></thead><tbody>';
  zones.forEach(z=>{
    html+=`<tr><td>${z.name}</td><td>${z.I_pu}×</td><td>${(z.I_pu*In).toFixed(0)}</td>`;
    times.forEach(t=>{
      const D=(z.I_pu*z.I_pu*t)/k;
      const col=D>0.01?'color:var(--err)':D>0.001?'color:var(--warn)':'color:var(--ok)';
      html+=`<td style="${col}">${D.toFixed(5)}</td>`;
    });
    html+='</tr>';
  });
  html+='</tbody></table></div>';
  $('tfc-ref-table').innerHTML=`<p style="font-size:.63rem;color:var(--muted);margin-bottom:5px">Estimasi D_event per kejadian (ISQT formula: k/${k}, In=${In.toFixed(0)} A). Akumulasi D ≥ 50% = Perhatian, ≥ 80% = Kritis.</p>${html}`;
}

// ===== COORDINATION VALIDATOR (MODULE 3) =====
function initValPairs(){
  if(valPairs.length)return;
  // Default pairs from relay structure
  valPairs=[
    {id:1,us:1,ds:3,type:'OCR',label:'INCOMING → OUTGOING'},
    {id:2,us:2,ds:3,type:'OCR',label:'COUPLER → OUTGOING'},
    {id:3,us:1,ds:4,type:'GFR',label:'GFR INCOMING → SBEF-1'},
  ];
}
function addValPair(){
  const newId=Date.now();
  valPairs.push({id:newId,us:1,ds:3,type:'OCR',label:'Pasangan Baru'});
  renderValPairs();
}
function renderValPairs(){
  const g=$('val-pairs-grid');g.innerHTML='';
  valPairs.forEach((p,i)=>{
    const d=document.createElement('div');d.style.cssText='display:flex;gap:5px;align-items:center;margin-bottom:5px;flex-wrap:wrap';
    const relOpts=relays.map((r,ri)=>`<option value="${ri}" ${ri==p.us?'selected':''}>${r.name}</option>`).join('');
    const relOpts2=relays.map((r,ri)=>`<option value="${ri}" ${ri==p.ds?'selected':''}>${r.name}</option>`).join('');
    d.innerHTML=`
      <select class="inp-sm" onchange="valPairs[${i}].us=+this.value" style="width:120px">${relOpts}</select>
      <span style="font-size:.7rem">→</span>
      <select class="inp-sm" onchange="valPairs[${i}].ds=+this.value" style="width:120px">${relOpts2}</select>
      <select class="inp-sm" onchange="valPairs[${i}].type=this.value" style="width:70px">
        <option ${p.type==='OCR'?'selected':''}>OCR</option>
        <option ${p.type==='GFR'?'selected':''}>GFR</option>
      </select>
      <input class="inp-sm" value="${p.label}" style="width:160px" oninput="valPairs[${i}].label=this.value" placeholder="Label">
      <button class="btn btn-sm btn-err" onclick="valPairs.splice(${i},1);renderValPairs()">✕</button>`;
    g.appendChild(d);
  });
}
function runValidation(){
  initValPairs();
  const ngr_I=fv('ngr-io')||300,dt_min=0.30;
  const results=[];

  valPairs.forEach(p=>{
    const us=relays[p.us],ds=relays[p.ds];
    if(!us||!ds)return;
    const sus=p.type==='OCR'?us.ocr:us.gfr;
    const sds=p.type==='OCR'?ds.ocr:ds.gfr;
    const checkI=sds.Iinst>0?sds.Iinst*(sds.vRef/vb()):sds.Is*10;

    // V-01: Time grading
    const t_us=calcTime(sus,checkI),t_ds=calcTime(sds,checkI);
    const dt=t_us&&t_ds?t_us.t-t_ds.t:null;
    results.push({pair:p.label,rule:'V-01',status:dt===null?'NA':dt>=dt_min?'PASS':dt>=dt_min-0.05?'WARN':'FAIL',
      detail:`Δt = ${dt!==null?dt.toFixed(3):'N/A'} s (min ${dt_min} s) @ I=${checkI.toFixed(0)} A`});

    // V-02: Is ratio
    const ratio_s=sus.Is>0?sus.Is/sds.Is:null;
    results.push({pair:p.label,rule:'V-02',status:ratio_s===null?'NA':ratio_s>=1.2?'PASS':ratio_s>=1.1?'WARN':'FAIL',
      detail:`Is_US/Is_DS = ${ratio_s?ratio_s.toFixed(3):'N/A'} (min 1.2)`});

    // V-03: Iinst no overlap
    if(sus.Iinst2>0&&sds.Iinst2>0){
      const overlap=sds.Iinst2<sus.Iinst2*0.8;
      results.push({pair:p.label,rule:'V-03',status:overlap?'PASS':'FAIL',
        detail:`Iinst2_DS=${sds.Iinst2} A vs 0.8×Iinst2_US=${(sus.Iinst2*0.8).toFixed(0)} A`});
    }else{results.push({pair:p.label,rule:'V-03',status:'NA',detail:'Stage 3 tidak aktif'});}

    // V-04: Stage 3 reclose
    results.push({pair:p.label,rule:'V-04',status:'INFO',detail:`Stage 3 downstream: ${sds.Iinst2>0?'AKTIF — DILARANG RECLOSE':'Tidak aktif'}`});
  });

  // V-05 & V-06: GFR/SBEF check (global)
  const incGFR=relays[1]?.gfr,sbef1GFR=relays[4]?.gfr;
  if(incGFR&&sbef1GFR&&incGFR.en&&sbef1GFR.en){
    const tInc=calcTime(incGFR,ngr_I),tSBEF=calcTime(sbef1GFR,ngr_I);
    const dtGFR=tInc&&tSBEF?tInc.t-tSBEF.t:null;
    results.push({pair:'GFR INCOMING ↔ SBEF-1',rule:'V-05',status:dtGFR===null?'NA':dtGFR>=dt_min?'PASS':dtGFR>=dt_min-0.05?'WARN':'FAIL',
      detail:`Δt GFR = ${dtGFR!==null?dtGFR.toFixed(3):'N/A'} s @ Io_NGR=${ngr_I} A`});
    const t06=tSBEF?.t;
    results.push({pair:'SBEF-1',rule:'V-06',status:t06===null||t06===undefined?'NA':t06<=10?'PASS':t06<=12?'WARN':'FAIL',
      detail:`t_SBEF @ I_NGR = ${t06!==null&&t06!==undefined?t06.toFixed(3):'N/A'} s (max 10 s)`});
  }

  renderValidationResults(results);
}
function renderValidationResults(results){
  if(!results.length){$('val-matrix-wrap').innerHTML='<p class="empty">Tidak ada hasil validasi.</p>';return;}
  const pairs=[...new Set(results.map(r=>r.pair))];
  const rules=[...new Set(results.map(r=>r.rule))];
  let html='<table class="val-matrix"><thead><tr><th>Pasangan Rele</th>';
  rules.forEach(r=>html+=`<th>${r}</th>`);
  html+='</tr></thead><tbody>';
  pairs.forEach(p=>{
    html+=`<tr><td style="text-align:left;font-weight:600">${p}</td>`;
    rules.forEach(r=>{
      const res=results.find(x=>x.pair===p&&x.rule===r);
      if(!res){html+='<td class="v-na">—</td>';return;}
      const icon=res.status==='PASS'?'✅':res.status==='FAIL'?'❌':res.status==='WARN'?'⚠️':res.status==='INFO'?'ℹ️':'—';
      html+=`<td title="${res.detail}" class="${res.status==='PASS'?'v-pass':res.status==='FAIL'?'v-fail':res.status==='WARN'?'v-warn':'v-na'}">${icon}</td>`;
    });
    html+='</tr>';
  });
  html+='</tbody></table>';
  $('val-matrix-wrap').innerHTML=html;

  // Detail cards
  const fails=results.filter(r=>r.status==='FAIL'||r.status==='WARN');
  if(!fails.length){$('val-details').innerHTML='<div class="detail-card detail-pass"><b>✅ Semua rules PASS</b> — Koordinasi memenuhi standar Kesepakatan Bersama.</div>';return;}
  let dhtml='';
  fails.forEach(f=>{
    const cls=f.status==='FAIL'?'detail-fail':'detail-warn';
    dhtml+=`<div class="detail-card ${cls}"><b>${f.status==='FAIL'?'❌':'⚠️'} ${f.rule} — ${f.pair}:</b> ${f.detail}</div>`;
  });
  $('val-details').innerHTML=dhtml;
}

function autoFixSuggestions(){
  initValPairs();
  const ngr_I=fv('ngr-io')||300, dt_min=0.30;
  const fixes=[];

  valPairs.forEach(p=>{
    const us=relays[p.us],ds=relays[p.ds];
    if(!us||!ds)return;
    const sus=p.type==='OCR'?us.ocr:us.gfr;
    const sds=p.type==='OCR'?ds.ocr:ds.gfr;
    if(!sus.en||!sds.en)return;
    const checkI=sds.Iinst>0?sds.Iinst*(sds.vRef||20)/(+($('sys-vbase').value)||20):sds.Is*10;
    const t_us=calcTime(sus,checkI),t_ds=calcTime(sds,checkI);
    if(t_us&&t_ds&&(t_us.t-t_ds.t)<dt_min){
      const t_needed=t_ds.t+dt_min;
      const c=CURVES[sus.char];
      if(!c||c.type==='off'||c.type==='dt')return;
      const Ir=checkI*(sus.vRef||20)/(+($('sys-vbase').value)||20);
      const M=Ir/sus.Is;
      if(M<=1)return;
      const d=Math.pow(M,c.al)-1;
      if(d<=0)return;
      let newTMS=c.type==='iec'?t_needed*d/c.k:(t_needed-c.B)*d/c.k;
      newTMS=Math.ceil(Math.max(0.02,newTMS)*1000)/1000;
      fixes.push({relay:p.us,type:p.type,field:'TMS',newVal:newTMS,
        desc:`${us.name} (${p.type}) — V-01: TMS ${sus.TMS} → ${newTMS} (t_target=${t_needed.toFixed(3)}s @ I=${checkI.toFixed(0)}A)`});
    }
  });

  // V-05: GFR INCOMING vs SBEF
  const incGFR=relays[1]?.gfr,sbef1GFR=relays[4]?.gfr;
  if(incGFR&&sbef1GFR&&incGFR.en&&sbef1GFR.en){
    const tInc=calcTime(incGFR,ngr_I),tSBEF=calcTime(sbef1GFR,ngr_I);
    if(tInc&&tSBEF&&(tInc.t-tSBEF.t)<dt_min){
      const t_needed=tSBEF.t+dt_min;
      const c=CURVES[incGFR.char];
      if(c&&c.type!=='off'&&c.type!=='dt'){
        const M=ngr_I/incGFR.Is;
        if(M>1){
          const d=Math.pow(M,c.al)-1;
          if(d>0){
            let newTMS=c.type==='iec'?t_needed*d/c.k:(t_needed-c.B)*d/c.k;
            newTMS=Math.ceil(Math.max(0.02,newTMS)*1000)/1000;
            fixes.push({relay:1,type:'gfr',field:'TMS',newVal:newTMS,
              desc:`GFR INCOMING — V-05: TMS ${incGFR.TMS} → ${newTMS} (t_target=${t_needed.toFixed(3)}s @ I_NGR=${ngr_I}A)`});
          }
        }
      }
    }
  }

  if(!fixes.length){
    runValidation();
    notify('✅ Semua koordinasi sudah valid — tidak ada perbaikan diperlukan.');
    return;
  }

  // Apply all fixes
  fixes.forEach(f=>{
    const s=f.type==='ocr'||f.type==='OCR'?relays[f.relay].ocr:relays[f.relay].gfr;
    s[f.field]=f.newVal;
  });

  renderCards();refreshAll();runValidation();
  notify('🔧 '+fixes.length+' perbaikan TMS diterapkan!');

  // Show fix report
  const details=$('val-details');
  let html='<div class="detail-card detail-pass" style="background:#f0fdf4;border-color:var(--ok)">'
    +'<b>🔧 Perbaikan Otomatis ('+fixes.length+') Diterapkan:</b>';
  fixes.forEach(f=>html+=`<div style="margin-top:4px;font-size:.63rem;color:#166534">✅ ${f.desc}</div>`);
  html+='</div>';
  if(details)details.innerHTML=html+(details.innerHTML||'');
}


// ===== LAPORAN BA (MODULE 4) =====
function getBaDate(){
  const d=$('ba-date')?.value;
  return d?new Date(d).toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'}):new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'long',year:'numeric'});
}
function previewBA(){
  $('ba-preview-wrap').style.display='block';
  $('ba-preview-content').innerHTML=buildBAContent(false);
}
function generateBA(){
  const baHtml=buildBAContent(true);
  const w=window.open('','_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>BA Setting Rele - ${$('sys-gi').value}</title>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Times New Roman',serif;font-size:10pt;color:#111;background:#fff}
  @page{size:A4;margin:12mm 12mm}
  .page{padding:0;max-width:210mm;margin:0 auto}
  .bab{padding:6mm 4mm 8mm;page-break-before:always;break-before:page;page-break-inside:auto}
  .bab:first-child{page-break-before:avoid;break-before:auto;display:flex;flex-direction:column;min-height:260mm}
  .cover-spacer{flex:1 1 auto;min-height:6mm}
  .bab:first-child .sig-wrap{margin-top:auto}
  h2{font-size:13pt;font-weight:700;text-align:center;color:#003087;margin-bottom:4px}
  h3{font-size:10pt;font-weight:700;margin:0 0 8px;color:#003087;border-bottom:1px solid #003087;padding-bottom:2px;page-break-after:avoid;break-after:avoid}
  .sub{text-align:center;font-size:9pt;color:#555;margin-bottom:10px}
  .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px;padding:8px;background:#f0f4f8;border-radius:4px;margin-bottom:10px;font-size:9pt;page-break-inside:avoid;break-inside:avoid}
  .info-row{display:flex;gap:5px}.info-lbl{font-weight:700;min-width:120px}.info-val{flex:1}
  table{width:100%;border-collapse:collapse;margin-bottom:10px;font-size:8.5pt;page-break-inside:avoid;break-inside:avoid}
  thead{display:table-header-group}
  thead th{background:#003087;color:#fff;padding:4px 5px;text-align:center}
  .tg thead th{background:#15803d}
  tbody td{padding:3px 5px;border:1px solid #ccc;text-align:center}
  tr{page-break-inside:avoid;break-inside:avoid}
  /* ===== TANDA TANGAN (di cover, kompak) ===== */
  .sig-wrap{margin-top:8px;padding:6px 8px 4px;border:1px solid #d4dbe3;border-radius:4px;background:#fff;page-break-inside:avoid;break-inside:avoid}
  .sig-title{font-size:8.5pt;line-height:1.4;color:#334155;margin-bottom:4px;font-style:italic;text-align:center}
  .sig-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;page-break-inside:avoid;break-inside:avoid}
  .sig-box{text-align:center;font-size:8.5pt;padding:3px 2px}
  .sig-role{font-weight:700;font-size:9pt;color:#003087;margin-bottom:1px}
  .sig-jab{font-size:8pt;color:#334155;margin-bottom:2px}
  .sig-space{height:40px}
  .sig-line{border-top:1px solid #333;margin:0 6px 2px}
  .sig-name{font-size:8.5pt;color:#111}
  /* ===== DAFTAR BAB — dot leaders ===== */
  .toc-wrap{margin-top:8px;padding:7px 10px;background:#fff;border:1px solid #d4dbe3;border-radius:4px}
  .toc-title{font-size:9.5pt;font-weight:700;color:#003087;border-bottom:1px solid #003087;padding-bottom:2px;margin-bottom:4px;text-align:center;letter-spacing:1px}
  .toc-item{display:flex;align-items:baseline;font-size:9.5pt;line-height:1.55;gap:3px}
  .toc-rom{min-width:22px;font-weight:700;color:#003087}
  .toc-lbl{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .toc-dots{flex:1;border-bottom:2px dotted #475569;margin:0 4px;transform:translateY(-3px)}
  .toc-pg{min-width:22px;text-align:right;font-weight:700;color:#003087}
  /* ===== CATATAN & REKOMENDASI (di cover, kompak) ===== */
  .catatan-wrap{margin-top:8px;padding:6px 10px;background:#fffef5;border:1px solid #eab308;border-left:4px solid #eab308;border-radius:4px;font-size:8.5pt;line-height:1.45}
  .catatan-title{font-size:9pt;font-weight:700;color:#854d0e;margin-bottom:3px;text-transform:uppercase;letter-spacing:.4px}
  .catatan-wrap p{margin-bottom:2px}
  .k-panel{page-break-inside:avoid;break-inside:avoid}
  .k-charts{page-break-inside:avoid;break-inside:avoid}
  .k-leg{page-break-inside:avoid;break-inside:avoid}
  @media print{body{margin:0}}
  /* ===== KURVA / ANALISA STYLES (mirror tab) ===== */
  .k-charts{display:flex;gap:8px;margin:6px 0 8px}
  .k-panel{flex:1;border:1px solid #d4dbe3;border-radius:4px;margin-bottom:8px;background:#fff;overflow:hidden}
  .k-phd{font-size:9pt;font-weight:700;color:#fff;padding:4px 8px;letter-spacing:.3px}
  .k-phd-o{background:#1d4ed8}
  .k-phd-g{background:#15803d}
  .k-img{width:100%;display:block;border-top:1px solid #d4dbe3}
  .k-ov{font-size:8pt;color:#475569;margin:4px 0 8px;padding:4px 8px;background:#f1f5f9;border-radius:3px;border-left:3px solid #003087}
  .k-empty{padding:10px;font-size:8.5pt;color:#888;text-align:center;font-style:italic}
  .k-tbl{width:100%;border-collapse:collapse;font-size:8pt;margin:0}
  .k-tbl thead th{color:#fff;padding:4px 5px;text-align:center;font-weight:700;font-size:8pt;border:1px solid #fff}
  .k-tbl-o thead th{background:#1d4ed8}
  .k-tbl-g thead th{background:#15803d}
  .k-tbl tbody td{padding:3px 5px;border:1px solid #cbd5e1;text-align:center;vertical-align:middle}
  .k-tbl tbody tr:nth-child(even) td{background:#f8fafc}
  .k-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:3px;vertical-align:middle;border:1px solid rgba(0,0,0,.15)}
  .k-lab{color:#475569;font-size:7.5pt;text-align:left !important}
  .k-rec{text-align:left !important;font-size:7.5pt;color:#334155;min-width:90px}
  .k-tag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:7pt;font-weight:700;margin-left:2px;letter-spacing:.3px}
  .k-toc .k-tag,.k-tag.k-toc{background:#dcfce7;color:#166534}
  .k-dt .k-tag,.k-tag.k-dt{background:#e0f2fe;color:#075985}
  .k-s2 .k-tag,.k-tag.k-s2{background:#fee2e2;color:#991b1b}
  .k-s3 .k-tag,.k-tag.k-s3{background:#fce7f3;color:#9d174d}
  .k-inf,.k-tag.k-inf{color:#94a3b8;font-style:italic;font-weight:400;background:#f1f5f9}
  .k-leg{margin:6px 0 10px;padding:5px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;font-size:8pt;color:#334155}
  .k-leg .k-tag{margin-left:5px}
  </style>
  </head><body><div class="page">${baHtml}</div></body></html>`);
  w.document.close();setTimeout(()=>w.print(),600);
}
function buildBAContent(fullPrint){
  const nm=$('sys-name').value,gi=$('sys-gi').value,mva=$('sys-mva').value;
  const vhv=$('sys-vhv').value,vlv=$('sys-vlv').value,In=inT().toFixed(2);
  const baNo=$('ba-nomor')?.value||'---';
  const tgl=getBaDate();
  // Unit UPT / Unit ULTG diambil dari row DB yang sedang di-load (idx 0 = UPT, idx 1 = ULTG)
  const _esc=s=>String(s==null?'':s).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
  const upt  = (loadedGIRow && loadedGIRow[0]) ? _esc(loadedGIRow[0]) : '—';
  const ultg = (loadedGIRow && loadedGIRow[1]) ? _esc(loadedGIRow[1]) : '—';
  // 3 pasang jabatan + nama (fleksibel) — default placeholder bila kosong
  const J='[isi jabatan]', N='[isi nama]';
  const sig1Jab=($('ba-sig1-jab')?.value||'').trim()||J;
  const sig1Nm =($('ba-sig1-nm')?.value ||'').trim()||N;
  const sig2Jab=($('ba-sig2-jab')?.value||'').trim()||J;
  const sig2Nm =($('ba-sig2-nm')?.value ||'').trim()||N;
  const sig3Jab=($('ba-sig3-jab')?.value||'').trim()||J;
  const sig3Nm =($('ba-sig3-nm')?.value ||'').trim()||N;
  const tim=(sig1Nm===N?sig1Jab:sig1Nm);

  // Optional sections via checklist
  let sections='';
  let romIdx=0; const rom=()=>['I','II','III','IV','V'][romIdx++];

  // I. Setting Engine
  if(baChecklist.engine){
    let engTbl='';
    if(engResults&&engResults.bays){
      Object.entries(engResults.bays).forEach(([key,b])=>{
        ['ocr','gfr'].forEach(ti=>{
          const s=b[ti]; if(!s||!s.en)return;
          engTbl+=`<tr><td>${b.label}</td><td>${ti.toUpperCase()}</td><td>${CURVES[s.char]?.label||s.char}</td>
            <td>${s.Is}</td><td>${s.TMS}</td><td>${s.Iinst||'--'}</td><td>${s.tInst||'--'}</td>
            <td>${s.Iinst2||'--'}</td><td>${s.tInst2||'--'}</td><td>${s.reclose?'✔':'✘'}</td></tr>`;
        });
      });
    }
    sections+=`<h3>${rom()}. Hasil Setting Engine (Kalkulasi Otomatis)</h3>`;
    if(engTbl){
      sections+=`<table class="tg"><thead><tr><th>Bay</th><th>Fungsi</th><th>Karakteristik</th><th>Is / Io> (A)</th><th>TMS</th><th>I>> (A)</th><th>TD>> (s)</th><th>I>>> (A)</th><th>TD>>> (s)</th><th>Reclose</th></tr></thead><tbody>${engTbl}</tbody></table>`;
      sections+=`<p style="font-size:8pt;color:#555">Sistem: In=${engResults.In?.toFixed(0)}A, IHS_trafo=${engResults.IHS_trafo?.toFixed(0)}A, IHS_20kV=${engResults.IHS_20kV?.toFixed(0)}A, I_NGR=${engResults.I_NGR?.toFixed(0)}A</p>`;
    }else{
      sections+=`<p style="font-size:9pt;color:#888">Setting Engine belum dijalankan.</p>`;
    }
  }

  // II. Setting Rele
  if(baChecklist.rele){
    let setRows='';
    relays.forEach(r=>{
      ['ocr','gfr'].forEach(ti=>{
        const s=ti==='ocr'?r.ocr:r.gfr;if(!s.en)return;
        setRows+=`<tr><td>${r.name}</td><td>${ti.toUpperCase()}</td>
          <td>${r.merk||'--'}</td><td>${r.tipe||'--'}</td><td>${r.sn||'--'}</td>
          <td>${s.ctP}/${s.ctS}</td><td>${s.vRef}</td>
          <td>${CURVES[s.char]?.label||s.char}</td>
          <td>${s.Is}</td><td>${s.TMS}</td>
          <td>${s.Iinst||'--'}</td><td>${s.tInst||'--'}</td>
          <td>${s.Iinst2||'--'}</td><td>${s.tInst2||'--'}</td></tr>`;
      });
    });
    sections+=`<h3>${rom()}. Rekapitulasi Setting Rele (Nilai Aktual)</h3>
      <table><thead><tr><th>Nama Rele</th><th>Jenis</th><th>Merk</th><th>Tipe</th><th>S/N</th><th>CT (P/S)</th><th>Vref</th><th>Karakteristik</th><th>I>/Io> (A)</th><th>TMS</th><th>I>>/Io>> (A)</th><th>TD>></th><th>I>>>/Io>>> (A)</th><th>TD>>></th></tr></thead>
      <tbody>${setRows}</tbody></table>`;
  }

  // III. Kurva & Analisa — tampilan mirip tab Kurva (panel + chart + tabel lebar per-rele)
  if(baChecklist.curve){
    // --- Charts OCR & GFR (side by side, dengan header panel ala tab) ---
    let chartHtml='';
    try{
      const u1=document.getElementById('cv-o')?.toDataURL('image/png',1);
      const u2=document.getElementById('cv-g')?.toDataURL('image/png',1);
      if(u1&&u2){
        chartHtml=`<div class="k-charts">
          <div class="k-panel">
            <div class="k-phd k-phd-o">OCR — Over Current Relay</div>
            <img src="${u1}" class="k-img">
          </div>
          <div class="k-panel">
            <div class="k-phd k-phd-g">GFR — Ground Fault Relay</div>
            <img src="${u2}" class="k-img">
          </div>
        </div>`;
      }
    }catch(e){}

    // --- Status overlay (Trafo/Inrush/NGR/Marker) dari state ovs ---
    const ovStat=[
      'Trafo: '+(ovs.trafo?'ON':'OFF'),
      'Inrush: '+(ovs.inrush?'ON':'OFF'),
      'NGR: '+(ovs.ngr?'ON':'OFF'),
      'Marker: '+(ovs.marker?'ON':'OFF')
    ].join(' &nbsp;|&nbsp; ');
    const ovHtml=`<div class="k-ov">Overlay aktif: ${ovStat}</div>`;

    // --- Tabel lebar OCR & GFR (kolom per rele + kolom Rekomendasi) ---
    const mkAnalisa=(type)=>{
      const isO=type==='OCR';
      const act=relays.filter(r=>(isO?r.ocr:r.gfr).en&&(isO?r.ocr:r.gfr).char!=='OFF');
      if(!act.length)return `<div class="k-panel"><div class="k-phd ${isO?'k-phd-o':'k-phd-g'}">Analisa Waktu Trip — ${type}</div><div class="k-empty">Tidak ada rele ${type} aktif</div></div>`;
      if(!faultRows.length)return `<div class="k-panel"><div class="k-phd ${isO?'k-phd-o':'k-phd-g'}">Analisa Waktu Trip — ${type}</div><div class="k-empty">Belum ada arus gangguan yang ditentukan</div></div>`;

      let head='<tr><th>Arus (A)</th><th>Keterangan</th>';
      act.forEach(r=>{ head+=`<th><span class="k-dot" style="background:${r.color}"></span>${r.name}</th>`; });
      head+='<th>Rekomendasi Engineer</th></tr>';

      let body='';
      faultRows.forEach((row,ri)=>{
        body+=`<tr><td><b>${(+row.I).toLocaleString()} A</b></td><td class="k-lab">${row.label||'--'}</td>`;
        act.forEach(r=>{
          const s=isO?r.ocr:r.gfr, res=calcTime(s,+row.I);
          if(!res){ body+='<td class="k-inf">&lt; I&gt;</td>'; }
          else{
            let tag='', cls='';
            if(res.stage===3){ tag='I&gt;&gt;&gt;'; cls='k-s3'; }
            else if(res.stage===2){ tag='I&gt;&gt;'; cls='k-s2'; }
            else if(res.stage==='dt'){ tag='DT'; cls='k-dt'; }
            else { tag='TOC'; cls='k-toc'; }
            body+=`<td class="${cls}"><b>${res.t.toFixed(3)} s</b> <span class="k-tag">${tag}</span></td>`;
          }
        });
        const rec=(isO?row.recO:row.recG)||'&nbsp;';
        body+=`<td class="k-rec">${rec}</td></tr>`;
      });

      return `<div class="k-panel">
        <div class="k-phd ${isO?'k-phd-o':'k-phd-g'}">Analisa Waktu Trip — ${type}</div>
        <table class="k-tbl ${isO?'k-tbl-o':'k-tbl-g'}"><thead>${head}</thead><tbody>${body}</tbody></table>
      </div>`;
    };

    const legend=`<div class="k-leg"><b>Legenda:</b>
      <span class="k-tag k-toc">TOC</span>
      <span class="k-tag k-dt">DT</span>
      <span class="k-tag k-s2">I&gt;&gt; / Io&gt;&gt;</span>
      <span class="k-tag k-s3">I&gt;&gt;&gt; / Io&gt;&gt;&gt;</span>
      <span class="k-tag k-inf">&lt; I&gt; (bawah pickup)</span>
    </div>`;

    sections+=`<h3>${rom()}. Kurva TCC &amp; Analisa Waktu Trip</h3>
      ${chartHtml}${ovHtml}
      ${mkAnalisa('OCR')}
      ${mkAnalisa('GFR')}
      ${legend}`;
  }

  // IV. Validator
  if(baChecklist.validator){
    const ngr_I=fv('ngr-io')||300;
    const relResults=runValidationOn(relays,ngr_I,0.30);
    const engArr=engineToRelaysArr();
    const engVResults=engArr?runValidationOn(engArr,ngr_I,0.30):[];
    const mkTbl=(results,src)=>{
      if(!results.length)return `<p style="font-size:9pt;color:#888">${src}: tidak ada hasil</p>`;
      let h=`<b style="font-size:9pt;color:#003087">${src}:</b><table class="tg"><thead><tr><th>Pasangan</th><th>Rule</th><th>Status</th><th>Detail</th></tr></thead><tbody>`;
      results.forEach(r=>{
        const col=r.status==='FAIL'?'#b91c1c':r.status==='WARN'?'#a16207':r.status==='PASS'?'#166534':'#64748b';
        h+=`<tr><td>${r.pair}</td><td>${r.rule}</td><td style="color:${col};font-weight:700">${r.status}</td><td style="text-align:left">${r.detail}</td></tr>`;
      });
      h+='</tbody></table>';
      return h;
    };
    sections+=`<h3>${rom()}. Hasil Validator Koordinasi (Dual)</h3>
      ${mkTbl(relResults,'Setting Rele (Nilai Aktual)')}
      ${mkTbl(engVResults,'Setting Engine (Kalkulasi)')}`;
  }

  // V. TFC
  if(baChecklist.tfc){
    const mvaVal=parseInt(mva)||60;
    const {k}=getTFCK(mvaVal);
    const evs=tfcEvents.filter(e=>e.mva===mvaVal);
    let D_sum=0;evs.forEach(e=>D_sum+=e.D_event);
    const tfcStatus=D_sum>0.8?'🔴 KRITIS':D_sum>0.5?'⚠️ PERHATIAN':'✅ AMAN';
    let evtTbl='';
    if(evs.length){
      let cum=0; evs.forEach((e,i)=>{cum+=e.D_event;
        evtTbl+=`<tr><td>${i+1}</td><td>${e.tanggal}</td><td>${e.I_A.toLocaleString()}</td><td>${e.t_s}</td><td>${e.zona}</td><td>${e.jenis}</td><td>${e.D_event.toFixed(6)}</td><td>${(cum*100).toFixed(2)}%</td></tr>`;
      });
    }
    sections+=`<h3>${rom()}. Analisis TFC — Ketahanan Termal Trafo (IEEE C57.109)</h3>
      <div class="info-grid">
        <div><div class="info-row"><span class="info-lbl">Status Trafo:</span><span class="info-val"><b>${tfcStatus}</b></span></div>
        <div class="info-row"><span class="info-lbl">Damage Kumulatif:</span><span class="info-val">${(D_sum*100).toFixed(2)}%</span></div></div>
        <div><div class="info-row"><span class="info-lbl">Total Event:</span><span class="info-val">${evs.length} kali</span></div>
        <div class="info-row"><span class="info-lbl">k constant (${mva} MVA):</span><span class="info-val">${k}</span></div></div>
      </div>`;
    if(evtTbl){
      sections+=`<table class="tg"><thead><tr><th>#</th><th>Tanggal</th><th>I (A)</th><th>t trip (s)</th><th>Zona</th><th>Jenis</th><th>D_event</th><th>D_kumulatif</th></tr></thead><tbody>${evtTbl}</tbody></table>`;
    }
  }

  // Pecah 'sections' per bab (setiap h3 = bab baru) — masing-masing 1 halaman
  const parts = sections ? sections.split(/(?=<h3>)/).filter(p=>p.trim()) : [];
  const babbedSections = parts.map(p=>`<section class="bab">${p}</section>`).join('');

  // ===== TOC (Daftar Bab) dengan dot leaders — format: Romawi + Judul ......... halaman =====
  // Halaman 1 = Cover (+ catatan + tanda tangan). Bab I mulai halaman 2, dst.
  const ROMAN=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
  const tocRows = parts.map((p,i)=>{
    const m=p.match(/<h3>([^<]+)<\/h3>/);
    // Strip existing "I. " / "II. " prefix dari judul karena kita pakai kolom Romawi sendiri
    let judul = m ? m[1].replace(/&amp;/g,'&').replace(/^\s*[IVX]+\.\s*/,'').trim() : '';
    const pg = i+2; // cover = 1 → bab pertama = 2
    return `<div class="toc-item"><span class="toc-rom">${ROMAN[i]||(i+1)}.</span><span class="toc-lbl">${judul}</span><span class="toc-dots"></span><span class="toc-pg">${pg}</span></div>`;
  }).join('');

  const coverBab = `<section class="bab">
    <h2>BERITA ACARA SETTING RELE PROTEKSI 20 kV</h2>
    <div class="sub">Nomor: ${baNo} | Tanggal: ${tgl}</div>
    <div class="info-grid">
      <div><div class="info-row"><span class="info-lbl">Unit UPT:</span><span class="info-val">${upt}</span></div>
      <div class="info-row"><span class="info-lbl">Unit ULTG:</span><span class="info-val">${ultg}</span></div>
      <div class="info-row"><span class="info-lbl">GI / Lokasi:</span><span class="info-val">${gi}</span></div>
      <div class="info-row"><span class="info-lbl">Bay / Trafo:</span><span class="info-val">${nm}</span></div>
      <div class="info-row"><span class="info-lbl">Kapasitas Trafo:</span><span class="info-val">${mva} MVA</span></div>
      <div class="info-row"><span class="info-lbl">Tegangan HV:</span><span class="info-val">${vhv} kV</span></div></div>
      <div><div class="info-row"><span class="info-lbl">Tegangan LV:</span><span class="info-val">${vlv} kV</span></div>
      <div class="info-row"><span class="info-lbl">In Trafo 20kV:</span><span class="info-val">${In} A</span></div>
      <div class="info-row"><span class="info-lbl">NGR:</span><span class="info-val">${$('ngr-r')?.value||40} Ω / ${$('ngr-t')?.value||10} s</span></div>
      <div class="info-row"><span class="info-lbl">Tim Setting:</span><span class="info-val">${tim}</span></div></div>
    </div>
    <div style="margin-top:8px;padding:8px 11px;background:#fff;border:1px solid #d4dbe3;border-radius:4px;font-size:9pt;line-height:1.5">
      Pada hari <b>${tgl}</b> telah dilaksanakan setting rele proteksi untuk bay <b>${nm}</b> di <b>${gi}</b>. Dokumen ini memuat hasil kalkulasi <i>Setting Engine</i>, nilai setting aktual yang diinjeksikan ke rele, kurva TCC, analisa waktu trip, validasi koordinasi, serta analisis ketahanan termal trafo (TFC).
    </div>

    <div class="toc-wrap">
      <div class="toc-title">Daftar Bab</div>
      ${tocRows}
    </div>

    <div class="catatan-wrap">
      <div class="catatan-title">Catatan &amp; Rekomendasi</div>
      <p>Setting dihitung berdasarkan <b>Standard Rules</b> — Kesepakatan Bersama UID Kalbar/Kalselteng/Kaltimra, standar IEC 60255 (kurva inverse), IEEE C37.112 (ANSI), dan IEEE C57.109 (ketahanan termal trafo).</p>
      <p>Koordinasi waktu trip menggunakan margin <b>Δt ≥ 0.30 s</b> antar rele bertingkat. Aktifnya Stage 3 (I&gt;&gt;&gt; atau Io&gt;&gt;&gt;) menandakan kebijakan <b>DILARANG RECLOSE</b> pada rele hilir untuk jenis gangguan yang terasosiasi dengannya.</p>
    </div>

    <div class="cover-spacer"></div>
    <div class="sig-wrap">
      <div class="sig-title">Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</div>
      <div class="sig-grid">
        <div class="sig-box">
          <div class="sig-role">Dibuat oleh</div>
          <div class="sig-jab">${sig1Jab}</div>
          <div class="sig-space"></div>
          <div class="sig-line"></div>
          <div class="sig-name"><b>${sig1Nm}</b></div>
        </div>
        <div class="sig-box">
          <div class="sig-role">Diperiksa oleh</div>
          <div class="sig-jab">${sig2Jab}</div>
          <div class="sig-space"></div>
          <div class="sig-line"></div>
          <div class="sig-name"><b>${sig2Nm}</b></div>
        </div>
        <div class="sig-box">
          <div class="sig-role">Disetujui oleh</div>
          <div class="sig-jab">${sig3Jab}</div>
          <div class="sig-space"></div>
          <div class="sig-line"></div>
          <div class="sig-name"><b>${sig3Nm}</b></div>
        </div>
      </div>
      <p style="margin-top:6px;font-size:7pt;color:#888;text-align:center">Dibuat dengan SIMCOR v8.0 | PLN Engineer Tool | ${new Date().toLocaleString('id-ID')}</p>
    </div>
  </section>`;

  return coverBab + babbedSections;
}

// ===== PRINT (existing + enhanced) =====
function doPrint(){
  const u1=$('cv-o').toDataURL('image/png',1),u2=$('cv-g').toDataURL('image/png',1);
  const nm=$('sys-name').value,gi=$('sys-gi').value,mva=$('sys-mva').value;
  const vhv=$('sys-vhv').value,vlv=$('sys-vlv').value,In=inT().toFixed(2);
  // Unit UPT / Unit ULTG dari row DB yang sedang di-load
  const upt  = (loadedGIRow && loadedGIRow[0]) ? String(loadedGIRow[0]) : '—';
  const ultg = (loadedGIRow && loadedGIRow[1]) ? String(loadedGIRow[1]) : '—';
  let setRows='';
  relays.forEach(r=>{
    ['ocr','gfr'].forEach(ti=>{
      const s=ti==='ocr'?r.ocr:r.gfr;if(!s.en)return;
      const type=ti.toUpperCase();
      setRows+='<tr><td>'+r.name+'</td><td>'+type+'</td>'
        +'<td>'+(r.merk||'--')+'</td><td>'+(r.tipe||'--')+'</td><td>'+(r.sn||'--')+'</td>'
        +'<td>'+s.ctP+'/'+s.ctS+'</td><td>'+s.vRef+'</td>'
        +'<td>'+(CURVES[s.char]?.label||s.char)+'</td>'
        +'<td>'+s.Is+'</td><td>'+s.TMS+'</td>'
        +'<td>'+(s.Iinst||'--')+'</td><td>'+(s.tInst||'--')+'</td>'
        +'<td>'+(s.Iinst2||'--')+'</td><td>'+(s.tInst2||'--')+'</td></tr>';
    });
  });
  const actO=relays.filter(r=>r.ocr.en&&r.ocr.char!=='OFF');
  const actG=relays.filter(r=>r.gfr.en&&r.gfr.char!=='OFF');
  const tH=act=>'<th>Arus (A)</th><th>Keterangan</th>'+act.map(r=>'<th><span class="k-dot" style="background:'+r.color+'"></span>'+r.name+'</th>').join('')+'<th>Rekomendasi Engineer</th>';
  const tR=(act,isO)=>faultRows.map(row=>{
    let c='<td><b>'+(+row.I).toLocaleString()+' A</b></td><td class="k-lab">'+(row.label||'--')+'</td>';
    act.forEach(r=>{
      const res=calcTime(isO?r.ocr:r.gfr,+row.I);
      if(!res){ c+='<td class="k-inf">&lt; I&gt;</td>'; }
      else{
        let tag='',cls='';
        if(res.stage===3){tag='I&gt;&gt;&gt;';cls='k-s3';}
        else if(res.stage===2){tag='I&gt;&gt;';cls='k-s2';}
        else if(res.stage==='dt'){tag='DT';cls='k-dt';}
        else{tag='TOC';cls='k-toc';}
        c+='<td class="'+cls+'"><b>'+res.t.toFixed(3)+' s</b> <span class="k-tag">'+tag+'</span></td>';
      }
    });
    c+='<td class="k-rec">'+((isO?row.recO:row.recG)||'&nbsp;')+'</td>';
    return'<tr>'+c+'</tr>';
  }).join('');
  const ovStat='Overlay aktif: Trafo: '+(ovs.trafo?'ON':'OFF')+' | Inrush: '+(ovs.inrush?'ON':'OFF')+' | NGR: '+(ovs.ngr?'ON':'OFF')+' | Marker: '+(ovs.marker?'ON':'OFF');
  const legend='<div class="k-leg"><b>Legenda:</b>'
    +'<span class="k-tag k-toc">TOC</span>'
    +'<span class="k-tag k-dt">DT</span>'
    +'<span class="k-tag k-s2">I&gt;&gt; / Io&gt;&gt;</span>'
    +'<span class="k-tag k-s3">I&gt;&gt;&gt; / Io&gt;&gt;&gt;</span>'
    +'<span class="k-tag k-inf">&lt; I&gt; (bawah pickup)</span>'
    +'</div>';
  const w=window.open('','_blank');
  w.document.write('<!DOCTYPE html><html><head><title>SIMCOR Print</title>'
    +'<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Segoe UI,sans-serif;font-size:8.5pt;background:#fff;color:#111}'
    +'@page{size:A4;margin:10mm 10mm}'
    +'.page{padding:14px 18px;page-break-after:always;break-after:page;page-break-inside:avoid}'
    +'.page:last-child{page-break-after:auto;break-after:auto}'
    +'h2{font-size:12pt;color:#003087;margin-bottom:3px}.sub{font-size:7.5pt;color:#555;margin-bottom:8px}'
    +'.info{display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:7px;background:#f0f4f8;border-radius:5px;margin-bottom:9px;page-break-inside:avoid}'
    +'.info div{font-size:7.5pt}.info b{display:block;font-size:8pt;color:#003087}'
    +'table{width:100%;border-collapse:collapse;margin-bottom:9px;font-size:7.5pt;page-break-inside:avoid;break-inside:avoid}'
    +'thead{display:table-header-group}'
    +'tr{page-break-inside:avoid;break-inside:avoid}'
    +'thead th{background:#003087;color:#fff;padding:4px 5px;text-align:center;white-space:nowrap}'
    +'.tg thead th{background:#15803d}'
    +'tbody td{padding:3px 5px;text-align:center;border-bottom:1px solid #dde3ec}'
    +'tbody tr:nth-child(even){background:#f8fafc}'
    +'.dc{display:flex;gap:8px;margin-bottom:9px}.cp{flex:1}'
    +'.ct{font-size:8pt;font-weight:700;padding:3px 7px;border-radius:3px;margin-bottom:4px;display:block}'
    +'.oc{background:#eff6ff;color:#1d4ed8}.gc{background:#f0fdf4;color:#15803d}'
    +'img{max-width:100%;border:1px solid #dde3ec;border-radius:3px;display:block}'
    +'h3{font-size:9pt;color:#003087;margin:6px 0 4px;border-bottom:1px solid #dde3ec;padding-bottom:3px}'
    +'.k-charts{display:flex;gap:8px;margin:6px 0 8px}'
    +'.k-panel{flex:1;border:1px solid #d4dbe3;border-radius:4px;margin-bottom:8px;background:#fff;overflow:hidden;page-break-inside:avoid}'
    +'.k-phd{font-size:9pt;font-weight:700;color:#fff;padding:4px 8px;letter-spacing:.3px}'
    +'.k-phd-o{background:#1d4ed8}.k-phd-g{background:#15803d}'
    +'.k-img{width:100%;display:block;border-top:1px solid #d4dbe3}'
    +'.k-ov{font-size:7.5pt;color:#475569;margin:4px 0 8px;padding:4px 8px;background:#f1f5f9;border-radius:3px;border-left:3px solid #003087}'
    +'.k-tbl{width:100%;border-collapse:collapse;font-size:7.5pt;margin:0}'
    +'.k-tbl thead th{color:#fff;padding:4px 5px;text-align:center;font-weight:700;font-size:7.5pt;border:1px solid #fff}'
    +'.k-tbl-o thead th{background:#1d4ed8}.k-tbl-g thead th{background:#15803d}'
    +'.k-tbl tbody td{padding:3px 5px;border:1px solid #cbd5e1;text-align:center;vertical-align:middle}'
    +'.k-tbl tbody tr:nth-child(even) td{background:#f8fafc}'
    +'.k-dot{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:3px;vertical-align:middle;border:1px solid rgba(0,0,0,.15)}'
    +'.k-lab{color:#475569;font-size:7pt;text-align:left !important}'
    +'.k-rec{text-align:left !important;font-size:7pt;color:#334155;min-width:90px}'
    +'.k-tag{display:inline-block;padding:1px 5px;border-radius:3px;font-size:6.5pt;font-weight:700;margin-left:2px;letter-spacing:.3px}'
    +'.k-toc .k-tag,.k-tag.k-toc{background:#dcfce7;color:#166534}'
    +'.k-dt .k-tag,.k-tag.k-dt{background:#e0f2fe;color:#075985}'
    +'.k-s2 .k-tag,.k-tag.k-s2{background:#fee2e2;color:#991b1b}'
    +'.k-s3 .k-tag,.k-tag.k-s3{background:#fce7f3;color:#9d174d}'
    +'.k-inf,.k-tag.k-inf{color:#94a3b8;font-style:italic;font-weight:400;background:#f1f5f9}'
    +'.k-leg{margin:6px 0 10px;padding:5px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;font-size:7.5pt;color:#334155}'
    +'.k-leg .k-tag{margin-left:5px}'
    +'@media print{.page{padding:10px 14px}}'
    +'</style></head><body>'
    +'<div class="page">'
    +'<h2>SIMCOR v7.0 — SETTING RELE PROTEKSI</h2>'
    +'<div class="sub">'+nm+' | '+gi+' | Dicetak: '+new Date().toLocaleString('id-ID')+'</div>'
    +'<div class="info">'
    +'<div><b>Unit UPT</b>'+upt+'</div>'
    +'<div><b>Unit ULTG</b>'+ultg+'</div>'
    +'<div><b>GI / Lokasi</b>'+gi+'</div>'
    +'<div><b>Proyek / Bay</b>'+nm+'</div>'
    +'<div><b>Kapasitas Trafo</b>'+mva+' MVA</div>'
    +'<div><b>Tegangan HV</b>'+vhv+' kV</div>'
    +'<div><b>Tegangan LV</b>'+vlv+' kV</div>'
    +'<div><b>In Trafo</b>'+In+' A</div>'
    +'<div><b>Io Maks NGR</b>'+$('ngr-io').value+' A</div>'
    +'<div><b>NGR</b>'+$('ngr-r').value+' Ohm / '+$('ngr-t').value+' s</div>'
    +'</div>'
    +'<h3>Rekapitulasi Setting Rele</h3>'
    +'<table><thead><tr><th>Nama Rele</th><th>Jenis</th><th>Merk</th><th>Tipe / Model</th><th>Serial Number</th><th>CT (P/S)</th><th>Vref (kV)</th><th>Karakteristik</th><th>I> / Io> (A)</th><th>TMS</th><th>I>>/Io>> (A)</th><th>TD>> (s)</th><th>I>>>/Io>>> (A)</th><th>TD>>> (s)</th></tr></thead>'
    +'<tbody>'+setRows+'</tbody></table></div>'
    +'<div class="page">'
    +'<h2>SIMCOR v8.0 — KURVA TCC &amp; ANALISA WAKTU TRIP</h2>'
    +'<div class="sub">'+nm+' | '+gi+' | Dicetak: '+new Date().toLocaleString('id-ID')+'</div>'
    +'<div class="k-charts">'
    +  '<div class="k-panel"><div class="k-phd k-phd-o">OCR — Over Current Relay</div><img src="'+u1+'" class="k-img"></div>'
    +  '<div class="k-panel"><div class="k-phd k-phd-g">GFR — Ground Fault Relay</div><img src="'+u2+'" class="k-img"></div>'
    +'</div>'
    +'<div class="k-ov">'+ovStat+'</div>'
    +'<div class="k-panel"><div class="k-phd k-phd-o">Analisa Waktu Trip — OCR</div>'
    +(actO.length&&faultRows.length
       ?'<table class="k-tbl k-tbl-o"><thead><tr>'+tH(actO)+'</tr></thead><tbody>'+tR(actO,true)+'</tbody></table>'
       :'<div style="padding:10px;text-align:center;color:#888;font-style:italic;font-size:8pt">'+(!actO.length?'Tidak ada rele OCR aktif':'Belum ada arus gangguan')+'</div>')
    +'</div>'
    +'<div class="k-panel"><div class="k-phd k-phd-g">Analisa Waktu Trip — GFR</div>'
    +(actG.length&&faultRows.length
       ?'<table class="k-tbl k-tbl-g"><thead><tr>'+tH(actG)+'</tr></thead><tbody>'+tR(actG,false)+'</tbody></table>'
       :'<div style="padding:10px;text-align:center;color:#888;font-style:italic;font-size:8pt">'+(!actG.length?'Tidak ada rele GFR aktif':'Belum ada arus gangguan')+'</div>')
    +'</div>'
    +legend
    +'</div></body></html>');
  w.document.close();setTimeout(()=>w.print(),700);
}

function togOv(k){ovs[k]=!ovs[k];const b=$('btn-'+k);if(b)b.classList.toggle('on',ovs[k]);refreshAll();}
function refreshAll(){
  _scheduleRelayConfigSave();renderCharts();renderAnalysis();}

function setChartH(){
  const pane=$('pane-ca');
  if(!pane||!pane.classList.contains('on'))return;
  const tb=document.querySelector('.ca-tb');
  const faultCard=document.querySelector('.fault-card');
  const tbH=tb?.offsetHeight||40;
  const fcH=faultCard?.offsetHeight||62;
  const avail=pane.clientHeight-tbH-8;
  const chartH=Math.min(Math.max(Math.floor(avail*.42),200),420);
  document.querySelectorAll('.cv-wrap').forEach(el=>el.style.height=chartH+'px');
  $('ca-charts').style.height=(chartH+62)+'px';
  const tblH=avail-chartH-62-fcH-20;
  document.querySelectorAll('.tbl-sc').forEach(el=>el.style.maxHeight=Math.max(tblH,120)+'px');
}

function showTab(name){
  // Urutan tab v8: stdrules → engine → settings → ca → validator → tfc → tms → report → db → manual
  const names=['stdrules','engine','settings','ca','validator','tfc','tms','report','db','manual'];
  document.querySelectorAll('.tab').forEach((t,i)=>t.classList.toggle('on',names[i]===name));
  document.querySelectorAll('.pane').forEach(p=>p.classList.remove('on'));
  const pn=$('pane-'+name); if(pn)pn.classList.add('on');
  if(name==='ca')setTimeout(()=>{setChartH();refreshAll();},60);
  if(name==='db'){renderGIDB();}
  if(name==='tfc')renderTFCHealth();
  if(name==='validator'){initValPairs();renderValPairs();}
  if(name==='stdrules'){renderStdSummary();renderStdBays();}
  if(name==='settings'){updateReleModeUI();}
}

function notify(msg,isErr){
  const el=document.createElement('div');el.className='notif';
  el.style.cssText='background:'+(isErr?'var(--err)':'var(--ok)')+';color:#fff';
  el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),2700);
}

window.addEventListener('load',()=>{
  // Apply relay config from server if available
  const rc=window.__SIMCOR_DATA&&window.__SIMCOR_DATA.relayConfig;
  if(rc){
    if(rc.sys) ['name','gi','mva','vhv','vlv','vbase'].forEach(k=>{const el=$('sys-'+k);if(el&&rc.sys[k]!=null)el.value=rc.sys[k];});
    if(rc.ngr) ['io','v','r','t'].forEach(k=>{const el=$('ngr-'+k);if(el&&rc.ngr[k]!=null)el.value=rc.ngr[k];});
    if(rc.relays&&Array.isArray(rc.relays)) relays=rc.relays.map(r=>({merk:'',tipe:'',sn:'',...r}));
    if(rc.faultRows&&Array.isArray(rc.faultRows)) faultRows=rc.faultRows.map(r=>({...r,recO:r.recO||'',recG:r.recG||''}));
    if(rc.tfcEvents&&Array.isArray(rc.tfcEvents)) tfcEvents=rc.tfcEvents;
  } else { applyDefSys(); }
  recalcIn();
  renderCards();renderFaultRows();
  populateTMSsel();buildFormulaTable();
  initValPairs();renderValPairs();
  loadGIDBfromStorage();
  loadStdRulesFromStorage();
  renderGIDB();
  renderStdSummary(); renderStdBays();
  updateReleModeUI();
  if(rc&&rc.tfcEvents) renderTFCHealth();
  // Set default BA date + restore form
  const bd=$('ba-date');if(bd&&!(window.__SIMCOR_DATA&&window.__SIMCOR_DATA.baFields&&window.__SIMCOR_DATA.baFields['ba-date']))bd.value=new Date().toISOString().slice(0,10);
  loadBaForm();
  window.addEventListener('resize',()=>{if($('pane-ca').classList.contains('on'))setChartH();});
  setTimeout(()=>showTab('settings'),100);
});

// ================================================================
// ================ v8 NEW MODULES ================================
// ================================================================

// ===== WILAYAH AUTO-DETECT BY NAME =====
const WILAYAH_KEYWORDS = {
  KALBAR: ['MAMBONG','BENGKAYANG','CENDANA','IPP','KOTA_BARU','NGABANG','PARIT_BARU','PLTU_2','PLTU_3','SAMBAS','SANGGAU','SEI_RAYA','SEKADAU','SEMPARUK','SENGGIRING','SIANTAN','SINGKAWANG','SINTANG','KETAPANG','KENDAWANGAN','SUKADANA','SANDAI','MINITN','PONTIANAK'],
  KALSELTENG: ['PULANG_PISAU','SEBANGAU','PALANGKARAYA','KASONGAN','SUDAN','PARENGGEAN','_SKS','KUALA_KURUN','SAMPIT','BAGENDANG','KUALA_PAMBUANG','PANGKALAN_BANTENG','PANGKALAN_BUN','SUKAMARA','NANGA_BULIK','MUARA_TEWEH','BUNTOK','BANGKANAI','PURUK_CAHU','BATULICIN','SATUI','LANGADAI','PULAU_LAUT','PLTA','ASAM_ASAM','PELAIHARI','CEMPAKA','BANDARA','MANTUIL','ULIN','TRISAKTI','KAYUTANGI','SELAT','SEBERANG_BARITO','SEITABUK','RANTAU','BARIKIN','TANJUNG_TD','AMUNTAI','PARINGIN','KANDANGAN','MANGGARSARI','BANJAR'],
  KALTIMRA: ['KARANG_JOANG','SENIPAH','INDUSTRI','NEW_BALIK','KARIANGAU','TANJUNG_SELOR','TANJUNG_REDEP','SAMBUTAN','MUARA_BADAK','TELUK_PANDAN','SANGATTA','NEW_SAMARINDA','BONTANG','MALOY','HARAPAN_BARU','BUKUAN','EMBALUT','BUKIT_BIRU','TENGKAWANG','MUARA_JAWA','KOTA_BANGUN','PETUNG','LONGIKIS','KUARO','GROGOT','MUARA_KOMAM','IKN','SAMARINDA','BALIKPAPAN']
};
function guessWilayah(name){
  const up=(name||'').toUpperCase();
  for(const reg in WILAYAH_KEYWORDS){
    if(WILAYAH_KEYWORDS[reg].some(k=>up.includes(k)))return reg;
  }
  return 'LAINNYA';
}

// ===== STANDARD RULES — DASAR SETTING ENGINE =====
// Setiap bay: Stage 1 (TOC), Stage 2 (I>>/Io>>), Stage 3 (I>>>), + reclose flag.
// Referensi derived: Inom_HV, Inom_LV, IHS_trafo_PhPh_HV, IHS_trafo_PhPh_LV, IHS_150_1Ph,
//                    IHS_3Ph_LV_sys, IHS_trafo, I_NGR, I_beban, KHA, KHA_couple, In, In_150.
// (default berasal dari SIMCOR_StdRules_MASTER.json — Kesepakatan Bersama UID Kalbar/Kalselteng/Kaltimra)
const STD_RULES_DEFAULT = {
  BPU_HV:{ label:'BPU HV (150kV)', color:'#e53e3e', note:'Bay Pengaman Utama sisi 150kV trafo tenaga',
    char:'C_SI', char_gfr:'C_SI', ctP:600, ctS:5, vRef:150, enable_gfr:true,
    ocr:{Is_mult:1.2, Is_ref:'Inom_HV', t_target:1.3, t_ref:'IHS_trafo_PhPh_HV', t_ref_mult:1.0,
         Iinst_mult:0.52, Iinst_ref:'IHS_trafo_PhPh_HV', TD_inst:0.9,
         Iinst2_mult:0, Iinst2_ref:'IHS_trafo_PhPh_HV', TD_inst2:0, reclose:false},
    gfr:{Is_mult:1.25, Is_ref:'I_NGR', t_target:0.2, t_ref:'IHS_150_1Ph', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'I_NGR', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:false} },
  INCOMING:{ label:'INCOMING (20kV)', color:'#df20d9', note:'Incoming 20kV dari sekunder trafo',
    char:'C_SI', char_gfr:'C_SI', ctP:600, ctS:5, vRef:20, enable_gfr:true,
    ocr:{Is_mult:1.2, Is_ref:'Inom_LV', t_target:1.0, t_ref:'IHS_trafo_PhPh_LV', t_ref_mult:1.0,
         Iinst_mult:0.5, Iinst_ref:'IHS_trafo_PhPh_LV', TD_inst:0.6,
         Iinst2_mult:0, Iinst2_ref:'IHS_trafo', TD_inst2:0, reclose:false},
    gfr:{Is_mult:0.125, Is_ref:'I_NGR', t_target:1.4, t_ref:'I_NGR', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'I_NGR', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:false} },
  OUTGOING:{ label:'OUTGOING (Penyulang)', color:'#3182ce', note:'Penyulang 20kV — TMS = t_target×((t_ref_mult×t_ref/Iset)^0.02−1)/0.14',
    char:'C_SI', char_gfr:'C_SI', ctP:300, ctS:5, vRef:20, enable_gfr:true,
    ocr:{Is_mult:1.2, Is_ref:'KHA', t_target:1.0, t_ref:'IHS_trafo_PhPh_LV', t_ref_mult:0.2,
         Iinst_mult:0.4, Iinst_ref:'IHS_3Ph_LV_sys', TD_inst:0.2,
         Iinst2_mult:0.5, Iinst2_ref:'IHS_trafo_PhPh_LV', TD_inst2:0.0001, reclose:true},
    gfr:{Is_mult:0.104, Is_ref:'I_NGR', t_target:0.9, t_ref:'I_NGR', t_ref_mult:1.0,
         Iinst_mult:1.0, Iinst_ref:'I_NGR', TD_inst:0.3,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:true} },
  COUPLE_20:{ label:'COUPLER 20kV', color:'#38a169', note:'Kopel 20kV antar busbar',
    char:'C_SI', char_gfr:'C_SI', ctP:600, ctS:5, vRef:20, enable_gfr:true,
    ocr:{Is_mult:1.2, Is_ref:'Inom_LV', t_target:0.7, t_ref:'IHS_trafo_PhPh_LV', t_ref_mult:1.0,
         Iinst_mult:0.45, Iinst_ref:'IHS_trafo', TD_inst:0.3,
         Iinst2_mult:0, Iinst2_ref:'IHS_trafo', TD_inst2:0, reclose:false},
    gfr:{Is_mult:0.125, Is_ref:'I_NGR', t_target:1.1, t_ref:'I_NGR', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'I_NGR', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:false} },
  SBEF_1:{ label:'SBEF Stage 1', color:'#333333', note:'Stand By Earth Fault Stage 1 (LTI)',
    char:'C_SI', char_gfr:'C_LTI', ctP:300, ctS:5, vRef:20, enable_gfr:true,
    ocr:{Is_mult:0, Is_ref:'In', t_target:0, t_ref:'IHS_trafo', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'IHS_trafo', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'IHS_trafo', TD_inst2:0, reclose:false},
    gfr:{Is_mult:0.125, Is_ref:'I_NGR', t_target:5.0, t_ref:'I_NGR', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'I_NGR', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:false} },
  SBEF_2:{ label:'SBEF Stage 2', color:'#6b5c00', note:'Stand By Earth Fault Stage 2 (LTI)',
    char:'C_SI', char_gfr:'C_LTI', ctP:300, ctS:5, vRef:20, enable_gfr:true,
    ocr:{Is_mult:0, Is_ref:'In', t_target:0, t_ref:'IHS_trafo', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'IHS_trafo', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'IHS_trafo', TD_inst2:0, reclose:false},
    gfr:{Is_mult:0.125, Is_ref:'I_NGR', t_target:5.5, t_ref:'I_NGR', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'I_NGR', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:false} },
  SBEF_3:{ label:'SBEF Stage 3', color:'#7c3aed', note:'Stand By Earth Fault Stage 3 (cadangan)',
    char:'C_SI', char_gfr:'C_LTI', ctP:300, ctS:5, vRef:20, enable_gfr:true,
    ocr:{Is_mult:0, Is_ref:'In', t_target:0, t_ref:'IHS_trafo', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'IHS_trafo', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'IHS_trafo', TD_inst2:0, reclose:false},
    gfr:{Is_mult:0.125, Is_ref:'I_NGR', t_target:99, t_ref:'I_NGR', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'I_NGR', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:false} },
  COUPLE_PLTD:{ label:'COUPLE PLTD', color:'#f59e0b', note:'Kopel arah PLTD — setting khusus sinkronisasi',
    char:'C_SI', char_gfr:'C_SI', ctP:600, ctS:5, vRef:20, enable_gfr:true,
    ocr:{Is_mult:1.2, Is_ref:'KHA_couple', t_target:0.5, t_ref:'IHS_trafo_PhPh_LV', t_ref_mult:1.0,
         Iinst_mult:3.0, Iinst_ref:'KHA_couple', TD_inst:0.0001,
         Iinst2_mult:0, Iinst2_ref:'IHS_trafo', TD_inst2:0, reclose:false},
    gfr:{Is_mult:0.125, Is_ref:'I_NGR', t_target:1.1, t_ref:'I_NGR', t_ref_mult:1.0,
         Iinst_mult:0, Iinst_ref:'I_NGR', TD_inst:0,
         Iinst2_mult:0, Iinst2_ref:'I_NGR', TD_inst2:0, reclose:false} }
};
let stdRules=JSON.parse(JSON.stringify(STD_RULES_DEFAULT));
// Available reference variables
// Reference variables — pulled from selected GI DB row + operational inputs.
// Legacy aliases preserved for backward compatibility with existing Standard Rules.
const STD_REFS=[
  // === From DB (12 elektrik + 12 CT ratio = 24 fields) ===
  'IHS_150_3Ph','IHS_150_1Ph','KHA_couple','KHA','Inom_HV','Inom_LV',
  'IHS_150_MVA','IHS_trafo_PhPh_HV','IHS_trafo_PhG_HV','IHS_trafo_PhPh_LV','IHS_trafo_PhG_LV','IHS_3Ph_LV_sys',
  'CT_HV_PRIM','CT_HV_SEC','CT_LV_PRIM','CT_LV_SEC','CT_OGF_PRIM','CT_OGF_SEC',
  'CT_COUP_PRIM','CT_COUP_SEC','CT_SBEF_PRIM','CT_SBEF_SEC','CT_PLTD_PRIM','CT_PLTD_SEC',
  // === Operational (from DOM / derived) ===
  'I_beban','I_NGR',
  // === Legacy aliases (for backward compat — map to new DB fields) ===
  'In','In_150','IHS_trafo','IHS_trafo_PhN','IHS_20kV','IHS_trafo_40pct'
];
const STD_CURVES=['C_SI','C_VI','C_EI','C_LTI','C_STI','A_MI','A_VI','A_EI','DT'];

function loadStdRulesFromStorage(){
  const d=window.__SIMCOR_DATA&&window.__SIMCOR_DATA.stdRules;
  if(d&&typeof d==='object'&&Object.keys(d).length>0){stdRules=d;}
}
function saveStdRulesToStorage(){
  _apiSave('/api/simcor/std-rules', stdRules);
}
function renderStdSummary(){
  const el=$('std-summary'); if(!el)return;
  const baysCount=Object.keys(stdRules).length;
  const activeOCR=Object.values(stdRules).filter(b=>b.ocr.Is_mult>0).length;
  const activeGFR=Object.values(stdRules).filter(b=>b.enable_gfr&&b.gfr.Is_mult>0).length;
  const totalReclose=Object.values(stdRules).filter(b=>b.ocr.reclose||b.gfr.reclose).length;
  el.innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:6px;margin-bottom:6px">
      <div class="result-box"><div class="lbl">Total Bay</div><div class="val" style="color:#be185d">${baysCount}</div></div>
      <div class="result-box"><div class="lbl">OCR Aktif</div><div class="val" style="color:var(--ocr)">${activeOCR}</div></div>
      <div class="result-box"><div class="lbl">GFR Aktif</div><div class="val" style="color:var(--gfr)">${activeGFR}</div></div>
      <div class="result-box"><div class="lbl">Reclose-Allowed</div><div class="val" style="color:var(--ok)">${totalReclose}</div></div>
    </div>`;
}
function stdCharOpts(sel){
  return STD_CURVES.map(c=>`<option value="${c}" ${c===sel?'selected':''}>${CURVES[c]?.label||c}</option>`).join('');
}
// Build dropdown options grouped by origin. Labels inlined (must be available before GIDB_FIELDS declaration).
const STD_REF_LABELS = {
  // DB-sourced (must match GIDB_FIELDS labels for fields with inStdRefs:true)
  'IHS_150_3Ph':'IHS 150kV 3Φ (A)',
  'IHS_150_1Ph':'IHS 150kV 1Φ (A)',
  'KHA_couple':'KHA Couple (A)',
  'KHA':'KHA OGF (A)',
  'Inom_HV':'Inom HV (A)',
  'Inom_LV':'Inom LV (A)',
  'IHS_150_MVA':'IHS 150kV (MVA)',
  'IHS_trafo_PhPh_HV':'IHS Trafo Ph-Ph HV (A)',
  'IHS_trafo_PhG_HV':'IHS Trafo Ph-G HV (A)',
  'IHS_trafo_PhPh_LV':'IHS Trafo Ph-Ph LV (A)',
  'IHS_trafo_PhG_LV':'IHS Trafo Ph-G LV (A)',
  'IHS_3Ph_LV_sys':'IHS 3Φ LV Sistem (A)',
  // CT Ratio (12 fields)
  'CT_HV_PRIM':'CT HV Primer (A)',
  'CT_HV_SEC':'CT HV Sekunder (A)',
  'CT_LV_PRIM':'CT LV Primer (A)',
  'CT_LV_SEC':'CT LV Sekunder (A)',
  'CT_OGF_PRIM':'CT OGF Primer (A)',
  'CT_OGF_SEC':'CT OGF Sekunder (A)',
  'CT_COUP_PRIM':'CT Coupler Primer (A)',
  'CT_COUP_SEC':'CT Coupler Sekunder (A)',
  'CT_SBEF_PRIM':'CT SBEF Primer (A)',
  'CT_SBEF_SEC':'CT SBEF Sekunder (A)',
  'CT_PLTD_PRIM':'CT PLTD Primer (A)',
  'CT_PLTD_SEC':'CT PLTD Sekunder (A)',
  // Operational
  'I_beban':'I beban (A)',
  'I_NGR':'I NGR (A)',
  // Legacy aliases
  'In':'In (A) — alias Inom LV',
  'In_150':'In 150 (A) — alias Inom HV',
  'IHS_trafo':'IHS Trafo (A) — alias IHS Ph-Ph LV',
  'IHS_trafo_PhN':'IHS Trafo Ph-N — alias IHS Ph-Ph HV',
  'IHS_20kV':'IHS 20kV — alias IHS Sistem LV',
  'IHS_trafo_40pct':'IHS Trafo 40% (A)'
};
function stdRefOpts(sel){
  // 3 grouped sections: DB / Operational / Legacy
  const DB_KEYS = [
    'IHS_150_3Ph','IHS_150_1Ph','KHA_couple','KHA','Inom_HV','Inom_LV',
    'IHS_150_MVA','IHS_trafo_PhPh_HV','IHS_trafo_PhG_HV','IHS_trafo_PhPh_LV','IHS_trafo_PhG_LV','IHS_3Ph_LV_sys',
    'CT_HV_PRIM','CT_HV_SEC','CT_LV_PRIM','CT_LV_SEC','CT_OGF_PRIM','CT_OGF_SEC',
    'CT_COUP_PRIM','CT_COUP_SEC','CT_SBEF_PRIM','CT_SBEF_SEC','CT_PLTD_PRIM','CT_PLTD_SEC'
  ];
  const OP_KEYS = ['I_beban','I_NGR'];
  const LG_KEYS = ['In','In_150','IHS_trafo','IHS_trafo_PhN','IHS_20kV','IHS_trafo_40pct'];
  const mk=k=>`<option value="${k}" ${k===sel?'selected':''}>${STD_REF_LABELS[k]||k}</option>`;
  return `<optgroup label="— Dari Database GI (54 kolom) —">${DB_KEYS.map(mk).join('')}</optgroup>`+
         `<optgroup label="— Operasional —">${OP_KEYS.map(mk).join('')}</optgroup>`+
         `<optgroup label="— Alias Legacy (kompatibilitas) —">${LG_KEYS.map(mk).join('')}</optgroup>`;
}
function renderStdBays(){
  const wrap=$('std-bays-wrap'); if(!wrap)return;
  let html='';
  Object.entries(stdRules).forEach(([key,b])=>{
    html+=`<div class="std-bay-card" id="stdb-${key}" style="border-left:4px solid ${b.color}">
      <div class="std-bay-hdr" onclick="togStdBay('${key}')">
        <span class="std-bay-dot" style="background:${b.color}"></span>
        <span class="std-bay-name">${b.label}</span>
        <span class="std-bay-func">${b.enable_gfr?'OCR+GFR':'OCR'}</span>
        <span style="font-size:.58rem;color:var(--muted);flex:1;margin-left:5px">${b.note||''}</span>
        <span class="std-arr">&#9660;</span>
      </div>
      <div class="std-bay-body">
        <div class="fgrid" style="margin-bottom:6px">
          <div class="fg"><label>CT Primer (A)</label><input type="number" value="${b.ctP}" step="any" onchange="stdRules['${key}'].ctP=+this.value;saveStdRulesToStorage()"></div>
          <div class="fg"><label>CT Sekunder (A)</label><input type="number" value="${b.ctS}" step="any" onchange="stdRules['${key}'].ctS=+this.value;saveStdRulesToStorage()"></div>
          <div class="fg"><label>Vref (kV)</label><input type="number" value="${b.vRef}" step="any" onchange="stdRules['${key}'].vRef=+this.value;saveStdRulesToStorage()"></div>
          <div class="fg"><label>Karakteristik OCR</label><select onchange="stdRules['${key}'].char=this.value;saveStdRulesToStorage()">${stdCharOpts(b.char)}</select></div>
          <div class="fg"><label>Karakteristik GFR</label><select onchange="stdRules['${key}'].char_gfr=this.value;saveStdRulesToStorage()">${stdCharOpts(b.char_gfr)}</select></div>
          <div class="fg"><label>Enable GFR</label><select onchange="stdRules['${key}'].enable_gfr=this.value==='true';saveStdRulesToStorage()">
            <option value="true" ${b.enable_gfr?'selected':''}>Aktif</option>
            <option value="false" ${!b.enable_gfr?'selected':''}>Nonaktif</option>
          </select></div>
        </div>
        ${stdStageTable(key,'ocr',b.ocr,'OCR — Over Current')}
        ${stdStageTable(key,'gfr',b.gfr,'GFR — Ground Fault')}
      </div>
    </div>`;
  });
  wrap.innerHTML=html;
}
function stdStageTable(key,fn,stg,title){
  const col=fn==='ocr'?'var(--ocr)':'var(--gfr)';
  return `<div style="background:#f8fafc;border:1px solid var(--bdr);border-radius:6px;padding:7px;margin-top:5px">
    <div style="font-size:.63rem;font-weight:700;color:${col};margin-bottom:5px">${title}</div>
    <table class="std-tbl">
      <thead><tr>
        <th>Stage</th><th>Multiplier</th><th>Referensi (x)</th><th>TD / t_target (s)</th><th>t_ref (at)</th><th title="Koefisien koordinasi: M = t_ref_mult × t_ref / Iset. Default 1.0; OCR Outgoing standar PLN = 0.2">t_ref mult</th><th>Reclose</th>
      </tr></thead>
      <tbody>
        <tr>
          <td style="background:#dbeafe;color:#1e40af;font-weight:700">Stage 1<br><span style="font-size:.55rem">TOC</span></td>
          <td><input type="number" value="${stg.Is_mult}" step="0.001" onchange="stdRules['${key}'].${fn}.Is_mult=+this.value;saveStdRulesToStorage()"></td>
          <td><select onchange="stdRules['${key}'].${fn}.Is_ref=this.value;saveStdRulesToStorage()">${stdRefOpts(stg.Is_ref)}</select></td>
          <td><input type="number" value="${stg.t_target}" step="any" onchange="stdRules['${key}'].${fn}.t_target=+this.value;saveStdRulesToStorage()"></td>
          <td><select onchange="stdRules['${key}'].${fn}.t_ref=this.value;saveStdRulesToStorage()">${stdRefOpts(stg.t_ref)}</select></td>
          <td><input type="number" value="${(typeof stg.t_ref_mult==='number'&&stg.t_ref_mult>0)?stg.t_ref_mult:1.0}" step="0.01" min="0.01" title="Koefisien koordinasi untuk TMS: M = t_ref_mult × t_ref / Iset" onchange="stdRules['${key}'].${fn}.t_ref_mult=+this.value;saveStdRulesToStorage()"></td>
          <td><input type="checkbox" ${stg.reclose?'checked':''} onchange="stdRules['${key}'].${fn}.reclose=this.checked;saveStdRulesToStorage()"></td>
        </tr>
        <tr>
          <td style="background:#fef3c7;color:#92400e;font-weight:700">Stage 2<br><span style="font-size:.55rem">I&gt;&gt;</span></td>
          <td><input type="number" value="${stg.Iinst_mult}" step="0.001" onchange="stdRules['${key}'].${fn}.Iinst_mult=+this.value;saveStdRulesToStorage()"></td>
          <td><select onchange="stdRules['${key}'].${fn}.Iinst_ref=this.value;saveStdRulesToStorage()">${stdRefOpts(stg.Iinst_ref)}</select></td>
          <td><input type="number" value="${stg.TD_inst}" step="any" onchange="stdRules['${key}'].${fn}.TD_inst=+this.value;saveStdRulesToStorage()"></td>
          <td style="color:#94a3b8;font-size:.58rem">fixed time</td>
          <td style="color:#94a3b8;font-size:.58rem">—</td>
          <td style="color:#94a3b8;font-size:.58rem">—</td>
        </tr>
        <tr>
          <td style="background:#fee2e2;color:#b91c1c;font-weight:700">Stage 3<br><span style="font-size:.55rem">I&gt;&gt;&gt;</span></td>
          <td><input type="number" value="${stg.Iinst2_mult}" step="0.001" onchange="stdRules['${key}'].${fn}.Iinst2_mult=+this.value;saveStdRulesToStorage()"></td>
          <td><select onchange="stdRules['${key}'].${fn}.Iinst2_ref=this.value;saveStdRulesToStorage()">${stdRefOpts(stg.Iinst2_ref)}</select></td>
          <td><input type="number" value="${stg.TD_inst2}" step="any" onchange="stdRules['${key}'].${fn}.TD_inst2=+this.value;saveStdRulesToStorage()"></td>
          <td style="color:#94a3b8;font-size:.58rem">fixed time</td>
          <td style="color:#94a3b8;font-size:.58rem">—</td>
          <td style="color:#b91c1c;font-size:.58rem;font-weight:700">⚠ reclose DILARANG</td>
        </tr>
      </tbody>
    </table>
  </div>`;
}
function togStdBay(key){ $('stdb-'+key)?.classList.toggle('exp'); }
function expandAllStdBays(expand){
  document.querySelectorAll('.std-bay-card').forEach(c=>{
    if(expand)c.classList.add('exp'); else c.classList.remove('exp');
  });
}
function exportStdRules(){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([JSON.stringify(stdRules,null,2)],{type:'application/json'}));
  a.download='SIMCOR_StdRules_'+new Date().toISOString().slice(0,10)+'.json';
  a.click(); notify('✅ Standard Rules diekspor');
}
function importStdRules(inp){
  const f=inp.files[0]; if(!f)return;
  const rd=new FileReader();
  rd.onload=e=>{
    try{
      const d=JSON.parse(e.target.result);
      if(d&&typeof d==='object'){
        stdRules=d; saveStdRulesToStorage(); renderStdBays(); renderStdSummary();
        notify('✅ Standard Rules berhasil diimport');
      }
    }catch(err){notify('Gagal: '+err.message,true);}
  };
  rd.readAsText(f); inp.value='';
}
function resetStdRules(){
  if(!confirm('Reset Standard Rules ke nilai default?'))return;
  stdRules=JSON.parse(JSON.stringify(STD_RULES_DEFAULT));
  saveStdRulesToStorage(); renderStdBays(); renderStdSummary();
  notify('↺ Standard Rules direset ke default');
}

// ===== SETTING ENGINE v9 — MENGGUNAKAN STANDARD RULES + DB 54-FIELD (schema v12) =====
// `loadedGIRow` holds the full 54-field DB row currently loaded; updated by loadEngGI / loadGItoEngine.
// Schema: idx 0=Unit_UPT, 1=Unit_ULTG, 2=name, 3..23=elektrik, 24..35=CT, 36..53=identitas rele.
// Manual UI inputs (eng-mva/xt/vlv/ngr/ibeban/kha/kha-couple) override fields when user edits them.
let loadedGIRow=null;
function computeDerivedParams(){
  // Start from loaded DB row (or a blank template when nothing loaded)
  const row = Array.isArray(loadedGIRow) ? loadedGIRow : [];
  const num = (i, dflt) => {
    const v = row[i];
    return (v!=null && v!=='' && isFinite(+v)) ? +v : dflt;
  };

  // === DB-sourced fields (schema v12: idx 0=Unit_UPT, 1=Unit_ULTG, 2=name, 3..23=elektrik, 24..35=CT) ===
  // (fallback to sensible defaults when empty)
  const name              = row[2] || '';
  const IHS_150_3Ph       = num( 3, 8100);
  const IHS_150_1Ph       = num( 4, IHS_150_3Ph*0.85);
  const MVA               = num( 5, 60);
  const Xt                = num( 6, 12.5);
  const KHA_couple        = num( 7, 1000);
  const KHA               = num( 8, 400);
  const Inom_HV           = num( 9, (MVA*1000)/(Math.sqrt(3)*150));
  const Inom_LV           = num(10, (MVA*1000)/(Math.sqrt(3)*20));
  const Xt_beban100       = num(11, 13.333);
  const Xt_trafo_beban100 = num(12, Xt_beban100*(Xt/100));
  const Vnom_HV           = num(13, 150);
  const Vnom_LV           = num(14, 20);
  const IHS_150_MVA       = num(15, Math.sqrt(3)*150*(IHS_150_3Ph/1000));
  const IHS_trafo_PhPh_HV = num(16, Inom_HV/(Xt/100));
  const IHS_trafo_PhG_HV  = num(17, IHS_trafo_PhPh_HV*(Math.sqrt(3)/3));
  const IHS_trafo_PhPh_LV = num(18, Inom_LV/(Xt/100));
  const IHS_trafo_PhG_LV  = num(19, IHS_trafo_PhPh_LV*(Math.sqrt(3)/3));
  const NGR_ohm           = num(20, 40);
  const Z_HV              = num(21, (Vnom_HV*Vnom_HV)/IHS_150_MVA);
  const Z_LV              = num(22, Math.pow(Vnom_LV/Vnom_HV,2)*Z_HV);
  const IHS_3Ph_LV_sys    = num(23, (Vnom_LV*1000/Math.sqrt(3))/(Xt_trafo_beban100+Z_LV));

  // === 12 RASIO CT (kolom 24-35) — UI override > DB fallback > 0 ===
  // Field DOM (eng-ct-*) di-isi otomatis oleh _engineApplyRow saat Load GI.
  // Edit manual oleh user akan otomatis menjadi nilai aktif (UI > DB).
  const numCT = (idx, fld) => {
    const ui = fv(fld);
    if (ui > 0) return ui;
    return num(idx, 0);
  };
  const CT_HV_PRIM    = numCT(24, 'eng-ct-hv-prim');
  const CT_HV_SEC     = numCT(25, 'eng-ct-hv-sec');
  const CT_LV_PRIM    = numCT(26, 'eng-ct-lv-prim');
  const CT_LV_SEC     = numCT(27, 'eng-ct-lv-sec');
  const CT_OGF_PRIM   = numCT(28, 'eng-ct-ogf-prim');
  const CT_OGF_SEC    = numCT(29, 'eng-ct-ogf-sec');
  const CT_COUP_PRIM  = numCT(30, 'eng-ct-coup-prim');
  const CT_COUP_SEC   = numCT(31, 'eng-ct-coup-sec');
  const CT_SBEF_PRIM  = numCT(32, 'eng-ct-sbef-prim');
  const CT_SBEF_SEC   = numCT(33, 'eng-ct-sbef-sec');
  const CT_PLTD_PRIM  = numCT(34, 'eng-ct-pltd-prim');
  const CT_PLTD_SEC   = numCT(35, 'eng-ct-pltd-sec');

  // === UI OVERRIDES (manual Setting Engine inputs override DB fields) ===
  const uiMVA   = fv('eng-mva');    const mva    = (uiMVA>0)   ? uiMVA   : MVA;
  const uiXt    = fv('eng-xt');     const xt_pct = (uiXt>0)    ? uiXt    : Xt;
  const uiVlv   = fv('eng-vlv');    const vlv    = (uiVlv>0)   ? uiVlv   : Vnom_LV;
  const uiNgr   = fv('eng-ngr');    const ngr_ohm= (uiNgr>0)   ? uiNgr   : NGR_ohm;
  const uiKha   = fv('eng-kha');    const kha    = (uiKha>0)   ? uiKha   : KHA;
  const uiKhaC  = fv('eng-kha-couple'); const kha_couple=(uiKhaC>0)?uiKhaC:KHA_couple;
  const i_beban = fv('eng-ibeban')||200;
  const uiIhs150= fv('eng-ihs150'); // value in kA
  const ihs_150kv_kA = (uiIhs150>0) ? uiIhs150 : (IHS_150_3Ph/1000);

  // === Operational derived ===
  const I_NGR = (vlv*1000/Math.sqrt(3)) / (ngr_ohm||1);

  // === Legacy aliases (map old names → new DB fields) ===
  const In            = Inom_LV;
  const In_150        = Inom_HV;
  const IHS_trafo     = IHS_trafo_PhPh_LV;
  const IHS_trafo_PhN = IHS_trafo_PhPh_HV; // HV-side reflected fault current
  const IHS_20kV      = IHS_3Ph_LV_sys;
  const IHS_trafo_40pct = 0.4 * IHS_trafo_PhPh_LV;

  return {
    // === Core system params (used by renderer / UI) ===
    mva, xt_pct, vlv, ngr_ohm, ihs_150kv_kA, i_beban, kha, kha_couple, name,
    // === 21 DB elektrik fields (STD_REFS — case-sensitive, must match dropdown) ===
    IHS_150_3Ph, IHS_150_1Ph, MVA, Xt, KHA_couple, KHA,
    Inom_HV, Inom_LV, Xt_beban100, Xt_trafo_beban100, Vnom_HV, Vnom_LV,
    IHS_150_MVA, IHS_trafo_PhPh_HV, IHS_trafo_PhG_HV, IHS_trafo_PhPh_LV, IHS_trafo_PhG_LV,
    NGR_ohm, Z_HV, Z_LV, IHS_3Ph_LV_sys,
    // === 12 Rasio CT per Bay (kolom 24-35) ===
    CT_HV_PRIM, CT_HV_SEC, CT_LV_PRIM, CT_LV_SEC,
    CT_OGF_PRIM, CT_OGF_SEC, CT_COUP_PRIM, CT_COUP_SEC,
    CT_SBEF_PRIM, CT_SBEF_SEC, CT_PLTD_PRIM, CT_PLTD_SEC,
    // === Operational ===
    I_beban:i_beban, I_NGR,
    // === Legacy aliases ===
    In, In_150, IHS_trafo, IHS_trafo_PhN, IHS_20kV, IHS_trafo_40pct
  };
}
function refVal(name,derived){
  const v=derived[name];
  return (typeof v==='number'&&isFinite(v))?v:0;
}
function computeStageFromRule(stg,derived,char){
  // Stage 1 (TOC)
  // Rumus umum: TMS = t_target × ((t_ref_mult × t_ref / Iset)^α − 1) / k
  // Default t_ref_mult = 1.0 (backward compatible). Untuk OCR Outgoing standar PLN dipakai 0.2.
  const Is_base=refVal(stg.Is_ref,derived);
  const Is=Math.round(stg.Is_mult*Is_base);
  const t_ref_val=refVal(stg.t_ref,derived);
  const t_ref_mult=(typeof stg.t_ref_mult==='number'&&stg.t_ref_mult>0)?stg.t_ref_mult:1.0;
  let TMS=0;
  if(Is>0&&t_ref_val>0&&stg.t_target>0){
    const c=CURVES[char]||CURVES.C_SI;
    if(c.type==='dt')TMS=stg.t_target;
    else{
      const M=(t_ref_mult*t_ref_val)/Is;
      if(M>1){
        const d=Math.pow(M,c.al)-1;
        if(d>0)TMS=c.type==='iec'?(stg.t_target*d/c.k):((stg.t_target-c.B)*d/c.k);
      }
      TMS=Math.max(0.02,Math.round(TMS*10000)/10000);
    }
  }
  // Stage 2
  const Iinst=stg.Iinst_mult>0?Math.round(stg.Iinst_mult*refVal(stg.Iinst_ref,derived)):0;
  const tInst=stg.TD_inst||0;
  // Stage 3
  const Iinst2=stg.Iinst2_mult>0?Math.round(stg.Iinst2_mult*refVal(stg.Iinst2_ref,derived)):0;
  const tInst2=stg.TD_inst2||0;
  return {Is,TMS,Iinst,tInst,Iinst2,tInst2,char};
}

// Override runSettingEngine() to use Standard Rules
function runSettingEngine(){
  const der=computeDerivedParams();
  const char_ocr=$('eng-char-ocr').value;
  const char_gfr=$('eng-char-gfr').value;
  // Override char ocr/gfr into stdRules per-bay? No: use bay's own char unless user picks override in UI.
  // We keep bay char from standard rules.
  const engBays={};
  Object.entries(stdRules).forEach(([key,b])=>{
    const ocrPack=computeStageFromRule(b.ocr,der,b.char||char_ocr);
    const gfrPack=b.enable_gfr?computeStageFromRule(b.gfr,der,b.char_gfr||char_gfr):null;
    engBays[key]={
      label:b.label,color:b.color,
      ocr:{...ocrPack,en:b.ocr.Is_mult>0,ctP:b.ctP,ctS:b.ctS,vRef:b.vRef,char:b.char||char_ocr,reclose:b.ocr.reclose},
      gfr:b.enable_gfr?{...gfrPack,en:b.gfr.Is_mult>0,ctP:b.ctP,ctS:b.ctS,vRef:b.vRef,char:b.char_gfr||char_gfr,reclose:b.gfr.reclose}:null
    };
  });
  engResults={...der, bays:engBays,
    // Backward-compat pointers (used by applyEngineToRelays / BA / etc)
    BPU:engBays.BPU_HV,
    INCOMING:engBays.INCOMING,
    COUPLER:engBays.COUPLE_20,
    OUTGOING:engBays.OUTGOING,
    SBEF:{gfr1:engBays.SBEF_1?.gfr,gfr2:engBays.SBEF_2?.gfr,gfr3:engBays.SBEF_3?.gfr},
    t_SBEF:engBays.SBEF_1?.gfr?calcTOCDirect(engBays.SBEF_1.gfr.Is,engBays.SBEF_1.gfr.TMS,engBays.SBEF_1.gfr.char,der.I_NGR):0,
    t_GFR_INC:engBays.INCOMING?.gfr?calcTOCDirect(engBays.INCOMING.gfr.Is,engBays.INCOMING.gfr.TMS,engBays.INCOMING.gfr.char,der.I_NGR):0
  };
  renderEngResultsV8();
  notify('✅ Setting Engine v8 selesai (berbasis Standard Rules)');
}
function renderEngResultsV8(){
  if(!engResults)return;
  const r=engResults;
  const panel=$('eng-results'); if(panel)panel.style.display='block';
  if($('eng-sys-info'))$('eng-sys-info').innerHTML=`
    <div class="result-box"><div class="lbl">In 20kV</div><div class="val">${r.In.toFixed(0)} A</div><div class="sub">${r.mva} MVA / ${r.vlv} kV</div></div>
    <div class="result-box hi"><div class="lbl">IHS Trafo</div><div class="val">${r.IHS_trafo.toFixed(0)} A</div><div class="sub">In/Xt(${r.xt_pct}%)</div></div>
    <div class="result-box"><div class="lbl">IHS Sistem 20kV</div><div class="val">${r.IHS_20kV.toFixed(0)} A</div><div class="sub">incl. Z upstream</div></div>
    <div class="result-box"><div class="lbl">IHS Trafo Ph-N</div><div class="val">${r.IHS_trafo_PhN.toFixed(0)} A</div><div class="sub">IHS/7.5</div></div>
    <div class="result-box"><div class="lbl">I NGR</div><div class="val">${r.I_NGR.toFixed(0)} A</div><div class="sub">${r.vlv}kV/(√3×${r.ngr_ohm}Ω)</div></div>
    <div class="result-box"><div class="lbl">IHS 150kV</div><div class="val">${r.ihs_150kv_kA} kA</div><div class="sub">sistem primer</div></div>`;

  let html='<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:.67rem">'
    +'<thead><tr style="background:var(--pln);color:#fff">'
    +'<th style="padding:6px 8px;text-align:left">Bay / Rele</th>'
    +'<th style="padding:6px 8px;text-align:left">Fungsi</th>'
    +'<th style="padding:6px 8px;text-align:right">Is / Io&gt; (A)</th>'
    +'<th style="padding:6px 8px;text-align:right">TMS</th>'
    +'<th style="padding:6px 8px;text-align:right">I&gt;&gt; / Io&gt;&gt; (A)</th>'
    +'<th style="padding:6px 8px;text-align:right">TD&gt;&gt; (s)</th>'
    +'<th style="padding:6px 8px;text-align:right">I&gt;&gt;&gt; (A)</th>'
    +'<th style="padding:6px 8px;text-align:right">TD&gt;&gt;&gt; (s)</th>'
    +'<th style="padding:6px 8px;text-align:center">Kurva</th>'
    +'<th style="padding:6px 8px;text-align:center">Reclose</th>'
    +'</tr></thead><tbody>';
  let idx=0;
  Object.entries(r.bays||{}).forEach(([key,b])=>{
    const rowFunc=(tag,s,col)=>{
      if(!s||!s.en)return '';
      const bg=idx%2===0?'#fff':'#f8fafc'; idx++;
      const rec=s.reclose?'<span style="color:var(--ok);font-weight:700">✅</span>':'<span style="color:var(--err);font-weight:700">🚫</span>';
      return `<tr style="background:${bg}">
        <td style="padding:5px 8px;border-left:3px solid ${b.color};font-weight:700;color:${b.color}">${b.label}</td>
        <td style="padding:5px 8px;font-size:.6rem;color:${col};font-weight:700">${tag}</td>
        <td style="padding:5px 8px;text-align:right"><b>${s.Is?s.Is.toLocaleString():'—'}</b></td>
        <td style="padding:5px 8px;text-align:right"><b>${s.TMS||'—'}</b></td>
        <td style="padding:5px 8px;text-align:right">${s.Iinst>0?'<b>'+s.Iinst.toLocaleString()+'</b>':'<span style="color:#94a3b8">—</span>'}</td>
        <td style="padding:5px 8px;text-align:right">${s.tInst>0?s.tInst:'<span style="color:#94a3b8">—</span>'}</td>
        <td style="padding:5px 8px;text-align:right">${s.Iinst2>0?'<b>'+s.Iinst2.toLocaleString()+'</b>':'<span style="color:#94a3b8">—</span>'}</td>
        <td style="padding:5px 8px;text-align:right">${s.tInst2>0?s.tInst2:'<span style="color:#94a3b8">—</span>'}</td>
        <td style="padding:5px 8px;text-align:center;font-size:.6rem;color:var(--muted)">${CURVES[s.char]?.label||s.char}</td>
        <td style="padding:5px 8px;text-align:center">${s.Iinst2>0||s.Iinst>0?rec:'<span style="color:#94a3b8">—</span>'}</td>
      </tr>`;
    };
    html+=rowFunc('OCR',b.ocr,'var(--ocr)');
    html+=rowFunc('GFR',b.gfr,'var(--gfr)');
  });
  html+='</tbody></table></div>';
  if($('eng-relay-results'))$('eng-relay-results').innerHTML=html;
}
// Override applyEngineToRelays to also map 8 bays from Standard Rules into the 10 relay slots
function applyEngineToRelays(){
  if(!engResults){notify('Jalankan Hitung Otomatis dulu!',true);return;}
  const r=engResults;
  const bayToSlot={BPU_HV:0, INCOMING:1, COUPLE_20:2, OUTGOING:3, SBEF_1:4, SBEF_2:5, SBEF_3:6, COUPLE_PLTD:7};
  Object.entries(bayToSlot).forEach(([key,slot])=>{
    const b=r.bays?.[key]; if(!b||!relays[slot])return;
    relays[slot].name=b.label||relays[slot].name;
    relays[slot].color=b.color||relays[slot].color;
    if(b.ocr){
      Object.assign(relays[slot].ocr,{
        Is:b.ocr.Is,TMS:b.ocr.TMS,Iinst:b.ocr.Iinst,tInst:b.ocr.tInst,
        Iinst2:b.ocr.Iinst2,tInst2:b.ocr.tInst2,char:b.ocr.char,
        ctP:b.ocr.ctP,ctS:b.ocr.ctS,vRef:b.ocr.vRef,en:!!b.ocr.en});
    }else{relays[slot].ocr.en=false;}
    if(b.gfr){
      Object.assign(relays[slot].gfr,{
        Is:b.gfr.Is,TMS:b.gfr.TMS,Iinst:b.gfr.Iinst,tInst:b.gfr.tInst,
        Iinst2:b.gfr.Iinst2,tInst2:b.gfr.tInst2,char:b.gfr.char,
        ctP:b.gfr.ctP,ctS:b.gfr.ctS,vRef:b.gfr.vRef,en:!!b.gfr.en});
    }else{relays[slot].gfr.en=false;}
  });
  renderCards();refreshAll();
  notify('✅ Setting Engine diterapkan ke Setting Rele (10 slot)');
  // Tampilkan Setting Rele agar user bisa verifikasi
  showTab('settings');
}

// ===== SETTING RELE MODE (MANUAL / IMPORT FROM ENGINE) =====
let releMode='manual';
function setReleMode(mode){
  releMode=mode;
  if(mode==='import'){
    if(!engResults){notify('⚠️ Jalankan Setting Engine terlebih dahulu',true); releMode='manual'; updateReleModeUI(); return;}
    // Copy engine values ke relays (tetap bisa diedit manual jika keluar mode)
    applyEngineToRelays();
  }
  updateReleModeUI();
}
function updateReleModeUI(){
  const ml=$('mode-manual-lbl'), il=$('mode-import-lbl'), info=$('mode-info-txt');
  const grid=$('relay-grid');
  const settingsPane=$('pane-settings');
  if(ml)ml.classList.toggle('on',releMode==='manual');
  if(il)il.classList.toggle('on',releMode==='import');
  if(info)info.innerHTML=releMode==='manual'
    ? 'Mode <b>Manual</b> — user dapat mengisi nilai secara bebas.'
    : 'Mode <b>Import from Setting Engine</b> — nilai di-copy dari hasil kalkulasi engine. Ubah ke Manual untuk edit bebas.';
  if(settingsPane){
    settingsPane.classList.toggle('mode-import-lock',releMode==='import');
  }
  // Apply radio state
  const rM=document.querySelector('input[name=\"rele-mode\"][value=\"manual\"]');
  const rI=document.querySelector('input[name=\"rele-mode\"][value=\"import\"]');
  if(rM)rM.checked=releMode==='manual';
  if(rI)rI.checked=releMode==='import';
}

// ===== DUAL VALIDATOR — RELE + ENGINE =====
// Build relay-like array dari engResults untuk validator
function engineToRelaysArr(){
  if(!engResults||!engResults.bays)return null;
  const arr=JSON.parse(JSON.stringify(relays)); // clone struktur slot
  const bayToSlot={BPU_HV:0,INCOMING:1,COUPLE_20:2,OUTGOING:3,SBEF_1:4,SBEF_2:5,SBEF_3:6,COUPLE_PLTD:7};
  Object.entries(bayToSlot).forEach(([key,slot])=>{
    const b=engResults.bays[key]; if(!b||!arr[slot])return;
    arr[slot].name=b.label||arr[slot].name;
    if(b.ocr)Object.assign(arr[slot].ocr,{Is:b.ocr.Is,TMS:b.ocr.TMS,Iinst:b.ocr.Iinst,tInst:b.ocr.tInst,Iinst2:b.ocr.Iinst2,tInst2:b.ocr.tInst2,char:b.ocr.char,ctP:b.ocr.ctP,ctS:b.ocr.ctS,vRef:b.ocr.vRef,en:!!b.ocr.en});
    else arr[slot].ocr.en=false;
    if(b.gfr)Object.assign(arr[slot].gfr,{Is:b.gfr.Is,TMS:b.gfr.TMS,Iinst:b.gfr.Iinst,tInst:b.gfr.tInst,Iinst2:b.gfr.Iinst2,tInst2:b.gfr.tInst2,char:b.gfr.char,ctP:b.gfr.ctP,ctS:b.gfr.ctS,vRef:b.gfr.vRef,en:!!b.gfr.en});
    else arr[slot].gfr.en=false;
  });
  return arr;
}
function runValidationOn(relArr,ngr_I,dt_min){
  const results=[];
  valPairs.forEach(p=>{
    const us=relArr[p.us],ds=relArr[p.ds];
    if(!us||!ds)return;
    const sus=p.type==='OCR'?us.ocr:us.gfr;
    const sds=p.type==='OCR'?ds.ocr:ds.gfr;
    const checkI=sds.Iinst>0?sds.Iinst*(sds.vRef/vb()):sds.Is*10;
    const t_us=calcTime(sus,checkI),t_ds=calcTime(sds,checkI);
    const dt=t_us&&t_ds?t_us.t-t_ds.t:null;
    results.push({pair:p.label,rule:'V-01',status:dt===null?'NA':dt>=dt_min?'PASS':dt>=dt_min-0.05?'WARN':'FAIL',
      detail:`Δt = ${dt!==null?dt.toFixed(3):'N/A'} s (min ${dt_min} s) @ I=${checkI.toFixed(0)} A`});
    const ratio_s=sus.Is>0&&sds.Is>0?sus.Is/sds.Is:null;
    results.push({pair:p.label,rule:'V-02',status:ratio_s===null?'NA':ratio_s>=1.2?'PASS':ratio_s>=1.1?'WARN':'FAIL',
      detail:`Is_US/Is_DS = ${ratio_s?ratio_s.toFixed(3):'N/A'} (min 1.2)`});
    if(sus.Iinst2>0&&sds.Iinst2>0){
      const ok=sds.Iinst2<sus.Iinst2*0.8;
      results.push({pair:p.label,rule:'V-03',status:ok?'PASS':'FAIL',
        detail:`Iinst2_DS=${sds.Iinst2} A vs 0.8×Iinst2_US=${(sus.Iinst2*0.8).toFixed(0)} A`});
    }else{results.push({pair:p.label,rule:'V-03',status:'NA',detail:'Stage 3 tidak aktif di salah satu sisi'});}
    results.push({pair:p.label,rule:'V-04',status:sds.Iinst2>0?'WARN':'INFO',
      detail:`Stage 3 downstream: ${sds.Iinst2>0?'AKTIF — DILARANG RECLOSE':'Tidak aktif'}`});
  });
  // V-05 & V-06 GFR INCOMING ↔ SBEF-1
  const incGFR=relArr[1]?.gfr,sbef1GFR=relArr[4]?.gfr;
  if(incGFR&&sbef1GFR&&incGFR.en&&sbef1GFR.en){
    const tInc=calcTime(incGFR,ngr_I),tSBEF=calcTime(sbef1GFR,ngr_I);
    const dtGFR=tInc&&tSBEF?tInc.t-tSBEF.t:null;
    results.push({pair:'GFR INCOMING ↔ SBEF-1',rule:'V-05',status:dtGFR===null?'NA':dtGFR>=dt_min?'PASS':dtGFR>=dt_min-0.05?'WARN':'FAIL',
      detail:`Δt GFR = ${dtGFR!==null?dtGFR.toFixed(3):'N/A'} s @ Io_NGR=${ngr_I} A`});
    const t06=tSBEF?.t;
    results.push({pair:'SBEF-1',rule:'V-06',status:(t06==null)?'NA':t06<=10?'PASS':t06<=12?'WARN':'FAIL',
      detail:`t_SBEF @ I_NGR = ${t06!=null?t06.toFixed(3):'N/A'} s (max 10 s)`});
  }
  return results;
}
function renderValidationCol(results,matrixId,detailId,sourceLabel){
  const mw=$(matrixId); const dw=$(detailId);
  if(!mw||!dw)return;
  if(!results.length){
    mw.innerHTML='<p class="empty">Belum ada hasil — klik <b>Jalankan Dual Validasi</b></p>';
    dw.innerHTML=''; return;
  }
  const pairs=[...new Set(results.map(r=>r.pair))];
  const rules=[...new Set(results.map(r=>r.rule))];
  let html='<table class="val-matrix"><thead><tr><th>Pasangan</th>';
  rules.forEach(r=>html+=`<th>${r}</th>`);
  html+='</tr></thead><tbody>';
  pairs.forEach(p=>{
    html+=`<tr><td style="text-align:left;font-weight:600;font-size:.62rem">${p}</td>`;
    rules.forEach(r=>{
      const res=results.find(x=>x.pair===p&&x.rule===r);
      if(!res){html+='<td class="v-na">—</td>';return;}
      const icon=res.status==='PASS'?'✅':res.status==='FAIL'?'❌':res.status==='WARN'?'⚠️':res.status==='INFO'?'ℹ️':'—';
      html+=`<td title="${res.detail}" class="${res.status==='PASS'?'v-pass':res.status==='FAIL'?'v-fail':res.status==='WARN'?'v-warn':'v-na'}">${icon}</td>`;
    });
    html+='</tr>';
  });
  html+='</tbody></table>';
  mw.innerHTML=html;

  const fails=results.filter(r=>r.status==='FAIL'||r.status==='WARN');
  if(!fails.length){
    dw.innerHTML='<div class="detail-card detail-pass"><b>✅ '+sourceLabel+': Semua rules PASS</b></div>';
    return;
  }
  let dhtml='';
  fails.forEach(f=>{
    const cls=f.status==='FAIL'?'detail-fail':'detail-warn';
    dhtml+=`<div class="detail-card ${cls}"><b>${f.status==='FAIL'?'❌':'⚠️'} ${f.rule} — ${f.pair}:</b> ${f.detail}</div>`;
  });
  dw.innerHTML=dhtml;
}
// Override runValidation: run BOTH sides
function runValidation(){
  initValPairs();
  const ngr_I=fv('ngr-io')||300, dt_min=0.30;
  // Setting Rele side (existing relays[])
  const releResults=runValidationOn(relays,ngr_I,dt_min);
  renderValidationCol(releResults,'val-matrix-wrap-rele','val-details-rele','Setting Rele');
  // Setting Engine side
  const engArr=engineToRelaysArr();
  if(engArr){
    const engResultsArr=runValidationOn(engArr,ngr_I,dt_min);
    renderValidationCol(engResultsArr,'val-matrix-wrap-eng','val-details-eng','Setting Engine');
  }else{
    if($('val-matrix-wrap-eng'))$('val-matrix-wrap-eng').innerHTML='<p class="empty">Setting Engine belum dijalankan — buka tab Setting Engine → klik Hitung Otomatis</p>';
    if($('val-details-eng'))$('val-details-eng').innerHTML='';
  }
  // Backward compat for autoFixSuggestions()
  window.__lastValidationResults=releResults;
}
// Override autoFixSuggestions → hanya tampilkan rekomendasi, TIDAK overwrite
function autoFixSuggestions(){
  initValPairs();
  const ngr_I=fv('ngr-io')||300, dt_min=0.30;
  const fixes=[];
  valPairs.forEach(p=>{
    const us=relays[p.us],ds=relays[p.ds]; if(!us||!ds)return;
    const sus=p.type==='OCR'?us.ocr:us.gfr, sds=p.type==='OCR'?ds.ocr:ds.gfr;
    if(!sus.en||!sds.en)return;
    const checkI=sds.Iinst>0?sds.Iinst*(sds.vRef||20)/(+($('sys-vbase').value)||20):sds.Is*10;
    const t_us=calcTime(sus,checkI),t_ds=calcTime(sds,checkI);
    if(t_us&&t_ds&&(t_us.t-t_ds.t)<dt_min){
      const t_needed=t_ds.t+dt_min;
      const c=CURVES[sus.char]; if(!c||c.type==='off'||c.type==='dt')return;
      const Ir=checkI*(sus.vRef||20)/(+($('sys-vbase').value)||20);
      const M=Ir/sus.Is; if(M<=1)return;
      const d=Math.pow(M,c.al)-1; if(d<=0)return;
      let newTMS=c.type==='iec'?t_needed*d/c.k:(t_needed-c.B)*d/c.k;
      newTMS=Math.ceil(Math.max(0.02,newTMS)*1000)/1000;
      fixes.push({relay:p.us,name:us.name,type:p.type,field:'TMS',oldVal:sus.TMS,newVal:newTMS,
        desc:`${us.name} (${p.type}) — V-01: TMS ${sus.TMS} → <b>${newTMS}</b> (target ${t_needed.toFixed(3)}s @ I=${checkI.toFixed(0)}A)`});
    }
  });
  const incGFR=relays[1]?.gfr,sbef1GFR=relays[4]?.gfr;
  if(incGFR&&sbef1GFR&&incGFR.en&&sbef1GFR.en){
    const tInc=calcTime(incGFR,ngr_I),tSBEF=calcTime(sbef1GFR,ngr_I);
    if(tInc&&tSBEF&&(tInc.t-tSBEF.t)<dt_min){
      const t_needed=tSBEF.t+dt_min;
      const c=CURVES[incGFR.char];
      if(c&&c.type!=='off'&&c.type!=='dt'){
        const M=ngr_I/incGFR.Is;
        if(M>1){const d=Math.pow(M,c.al)-1;
          if(d>0){
            let newTMS=c.type==='iec'?t_needed*d/c.k:(t_needed-c.B)*d/c.k;
            newTMS=Math.ceil(Math.max(0.02,newTMS)*1000)/1000;
            fixes.push({relay:1,name:'INCOMING',type:'GFR',field:'TMS',oldVal:incGFR.TMS,newVal:newTMS,
              desc:`GFR INCOMING — V-05: TMS ${incGFR.TMS} → <b>${newTMS}</b> (target ${t_needed.toFixed(3)}s @ I_NGR=${ngr_I}A)`});
          }
        }
      }
    }
  }
  const wrap=$('val-fix-wrap'); if(!wrap)return;
  if(!fixes.length){
    wrap.innerHTML='<div class="detail-card detail-pass"><b>✅ Koordinasi sudah valid</b> — tidak ada rekomendasi perbaikan.</div>';
    return;
  }
  let html='<div class="detail-card detail-warn" style="background:#fffbeb">'
    +'<b>🔧 Rekomendasi Perbaikan ('+fixes.length+' item) — TIDAK di-apply otomatis:</b>';
  fixes.forEach((f,i)=>{
    html+=`<div style="margin-top:5px;padding:5px 8px;background:#fff;border:1px solid #fde68a;border-radius:4px;font-size:.64rem">
      <div>${f.desc}</div>
      <button class="btn btn-sm btn-warn" style="margin-top:4px" onclick="applyFixItem(${i})">✔ Terapkan item ini</button>
    </div>`;
  });
  html+=`<div style="margin-top:6px"><button class="btn btn-warn btn-sm" onclick="applyAllFixes()">✔ Terapkan Semua Rekomendasi</button>
    <span style="font-size:.6rem;color:var(--muted);margin-left:5px">Setelah apply, jalankan ulang validasi untuk konfirmasi.</span></div>`;
  html+='</div>';
  wrap.innerHTML=html;
  window.__pendingFixes=fixes;
}
function applyFixItem(i){
  const fixes=window.__pendingFixes||[]; const f=fixes[i]; if(!f)return;
  const s=(f.type==='OCR'||f.type==='ocr')?relays[f.relay].ocr:relays[f.relay].gfr;
  s[f.field]=f.newVal; renderCards(); refreshAll();
  notify(`✔ Perbaikan ${f.name} diterapkan`);
  autoFixSuggestions();
}
function applyAllFixes(){
  const fixes=window.__pendingFixes||[]; if(!fixes.length)return;
  fixes.forEach(f=>{
    const s=(f.type==='OCR'||f.type==='ocr')?relays[f.relay].ocr:relays[f.relay].gfr;
    s[f.field]=f.newVal;
  });
  renderCards(); refreshAll();
  notify(`✔ ${fixes.length} perbaikan diterapkan`);
  autoFixSuggestions();
}

// ===== BA CHECKLIST STATE =====
const baChecklist={engine:true,rele:true,curve:true,validator:true,tfc:true};
function toggleBaChk(k){
  const cb=$('ba-chk-'+k); if(!cb)return;
  baChecklist[k]=cb.checked;
  const lbl=$('ba-chk-'+k+'-lbl'); if(lbl)lbl.classList.toggle('on',cb.checked);
}
function toggleAllBaChk(v){
  ['engine','rele','curve','validator','tfc'].forEach(k=>{
    baChecklist[k]=v;
    const cb=$('ba-chk-'+k); if(cb)cb.checked=v;
    const lbl=$('ba-chk-'+k+'-lbl'); if(lbl)lbl.classList.toggle('on',v);
  });
}

// ===== BA FORM PERSIST (nomor, tanggal, 3 pasang tanda tangan) =====
const BA_FIELDS=['ba-nomor','ba-date','ba-sig1-jab','ba-sig1-nm','ba-sig2-jab','ba-sig2-nm','ba-sig3-jab','ba-sig3-nm'];
function saveBaForm(){
  const o={}; BA_FIELDS.forEach(id=>{const el=$(id); if(el)o[id]=el.value;});
  _apiSave('/api/simcor/ba-fields', o);
}
function loadBaForm(){
  const o=window.__SIMCOR_DATA&&window.__SIMCOR_DATA.baFields;
  if(!o)return;
  BA_FIELDS.forEach(id=>{const el=$(id); if(el&&o[id]!==undefined)el.value=o[id];});
}

// ============ GI DATABASE SCHEMA v9 (34-FIELD: 22 from DATABASE.csv + 12 CT ratios) ============
// Wilayah is derived from name (guessWilayah). I_beban is operational (DOM input).
const GIDB_FIELDS = [
  // ===== Unit Organisasi (text, idx 0-1) — TIDAK masuk Standard Rules =====
  {key:'Unit_UPT',          idx:0,  label:'Unit UPT',               type:'text', inStdRefs:false, hdr:'Unit<br>UPT',               step:''},
  {key:'Unit_ULTG',         idx:1,  label:'Unit ULTG',              type:'text', inStdRefs:false, hdr:'Unit<br>ULTG',              step:''},
  // ===== Identitas GI =====
  {key:'name',              idx:2,  label:'Nama GI / Trafo',        type:'text', inStdRefs:false, hdr:'Nama GI / Trafo',          step:''},
  // ===== Parameter Elektrik (idx 3-23, shift +2 dari skema lama) =====
  {key:'IHS_150_3Ph',       idx:3,  label:'IHS 150kV 3Φ (A)',       type:'num',  inStdRefs:true,  hdr:'IHS 150kV<br>3Φ (A)',       step:'0.001'},
  {key:'IHS_150_1Ph',       idx:4,  label:'IHS 150kV 1Φ (A)',       type:'num',  inStdRefs:true,  hdr:'IHS 150kV<br>1Φ (A)',       step:'0.001'},
  {key:'MVA',               idx:5,  label:'MVA Trafo',              type:'num',  inStdRefs:false, hdr:'MVA',                       step:'1'},
  {key:'Xt',                idx:6,  label:'Xt Trafo (%)',           type:'num',  inStdRefs:false, hdr:'Xt (%)',                    step:'0.001'},
  {key:'KHA_couple',        idx:7,  label:'KHA Couple (A)',         type:'num',  inStdRefs:true,  hdr:'KHA<br>Couple (A)',         step:'1'},
  {key:'KHA',               idx:8,  label:'KHA OGF (A)',            type:'num',  inStdRefs:true,  hdr:'KHA<br>OGF (A)',            step:'1'},
  {key:'Inom_HV',           idx:9,  label:'Inom HV (A)',            type:'num',  inStdRefs:true,  hdr:'Inom<br>HV (A)',            step:'0.001'},
  {key:'Inom_LV',           idx:10, label:'Inom LV (A)',            type:'num',  inStdRefs:true,  hdr:'Inom<br>LV (A)',            step:'0.001'},
  {key:'Xt_beban100',       idx:11, label:'Xt beban 100%',          type:'num',  inStdRefs:false, hdr:'Xt beban<br>100%',          step:'0.001'},
  {key:'Xt_trafo_beban100', idx:12, label:'Xt Trafo beban 100%',    type:'num',  inStdRefs:false, hdr:'Xt Trafo<br>beban 100%',    step:'0.001'},
  {key:'Vnom_HV',           idx:13, label:'Vnom HV (kV)',           type:'num',  inStdRefs:false, hdr:'Vnom<br>HV (kV)',           step:'1'},
  {key:'Vnom_LV',           idx:14, label:'Vnom LV (kV)',           type:'num',  inStdRefs:false, hdr:'Vnom<br>LV (kV)',           step:'1'},
  {key:'IHS_150_MVA',       idx:15, label:'IHS 150kV (MVA)',        type:'num',  inStdRefs:true,  hdr:'IHS 150kV<br>(MVA)',        step:'0.001'},
  {key:'IHS_trafo_PhPh_HV', idx:16, label:'IHS Trafo Ph-Ph HV (A)', type:'num',  inStdRefs:true,  hdr:'IHS Trafo<br>Ph-Ph HV (A)', step:'0.001'},
  {key:'IHS_trafo_PhG_HV',  idx:17, label:'IHS Trafo Ph-G HV (A)',  type:'num',  inStdRefs:true,  hdr:'IHS Trafo<br>Ph-G HV (A)',  step:'0.001'},
  {key:'IHS_trafo_PhPh_LV', idx:18, label:'IHS Trafo Ph-Ph LV (A)', type:'num',  inStdRefs:true,  hdr:'IHS Trafo<br>Ph-Ph LV (A)', step:'0.001'},
  {key:'IHS_trafo_PhG_LV',  idx:19, label:'IHS Trafo Ph-G LV (A)',  type:'num',  inStdRefs:true,  hdr:'IHS Trafo<br>Ph-G LV (A)',  step:'0.001'},
  {key:'NGR_ohm',           idx:20, label:'NGR (Ω)',                type:'num',  inStdRefs:false, hdr:'NGR<br>(Ω)',                step:'0.001'},
  {key:'Z_HV',              idx:21, label:'Z HV (Ω)',               type:'num',  inStdRefs:false, hdr:'Z HV<br>(Ω)',               step:'0.001'},
  {key:'Z_LV',              idx:22, label:'Z LV (Ω)',               type:'num',  inStdRefs:false, hdr:'Z LV<br>(Ω)',               step:'0.001'},
  {key:'IHS_3Ph_LV_sys',    idx:23, label:'IHS 3Φ LV Sistem (A)',   type:'num',  inStdRefs:true,  hdr:'IHS 3Φ LV<br>Sistem (A)',   step:'0.001'},
  // ===== CT Ratio per bay (idx 24-35, shift +2) =====
  {key:'CT_HV_PRIM',        idx:24, label:'CT HV Primer (A)',       type:'num',  inStdRefs:true,  hdr:'CT HV<br>Primer (A)',       step:'1'},
  {key:'CT_HV_SEC',         idx:25, label:'CT HV Sekunder (A)',     type:'num',  inStdRefs:true,  hdr:'CT HV<br>Sek (A)',          step:'1'},
  {key:'CT_LV_PRIM',        idx:26, label:'CT LV Primer (A)',       type:'num',  inStdRefs:true,  hdr:'CT LV<br>Primer (A)',       step:'1'},
  {key:'CT_LV_SEC',         idx:27, label:'CT LV Sekunder (A)',     type:'num',  inStdRefs:true,  hdr:'CT LV<br>Sek (A)',          step:'1'},
  {key:'CT_OGF_PRIM',       idx:28, label:'CT OGF Primer (A)',      type:'num',  inStdRefs:true,  hdr:'CT OGF<br>Primer (A)',      step:'1'},
  {key:'CT_OGF_SEC',        idx:29, label:'CT OGF Sekunder (A)',    type:'num',  inStdRefs:true,  hdr:'CT OGF<br>Sek (A)',         step:'1'},
  {key:'CT_COUP_PRIM',      idx:30, label:'CT Coupler Primer (A)',  type:'num',  inStdRefs:true,  hdr:'CT Coup<br>Primer (A)',     step:'1'},
  {key:'CT_COUP_SEC',       idx:31, label:'CT Coupler Sekunder (A)',type:'num',  inStdRefs:true,  hdr:'CT Coup<br>Sek (A)',        step:'1'},
  {key:'CT_SBEF_PRIM',      idx:32, label:'CT SBEF Primer (A)',     type:'num',  inStdRefs:true,  hdr:'CT SBEF<br>Primer (A)',     step:'1'},
  {key:'CT_SBEF_SEC',       idx:33, label:'CT SBEF Sekunder (A)',   type:'num',  inStdRefs:true,  hdr:'CT SBEF<br>Sek (A)',        step:'1'},
  {key:'CT_PLTD_PRIM',      idx:34, label:'CT PLTD Primer (A)',     type:'num',  inStdRefs:true,  hdr:'CT PLTD<br>Primer (A)',     step:'1'},
  {key:'CT_PLTD_SEC',       idx:35, label:'CT PLTD Sekunder (A)',   type:'num',  inStdRefs:true,  hdr:'CT PLTD<br>Sek (A)',        step:'1'},
  // ===== Identitas Rele per Bay (idx 36-53, shift +2; 18 kolom: Merk/Tipe/SN × 6 set) =====
  // SBEF dipakai bersama untuk SBEF-1, SBEF-2, SBEF-3 (1 set data)
  {key:'BPU_HV_Merk',       idx:36, label:'BPU HV — Merk',          type:'text', inStdRefs:false, hdr:'BPU HV<br>Merk',            step:''},
  {key:'BPU_HV_Tipe',       idx:37, label:'BPU HV — Tipe/Model',    type:'text', inStdRefs:false, hdr:'BPU HV<br>Tipe',            step:''},
  {key:'BPU_HV_SN',         idx:38, label:'BPU HV — Serial Number', type:'text', inStdRefs:false, hdr:'BPU HV<br>SN',              step:''},
  {key:'INC_Merk',          idx:39, label:'INCOMING — Merk',        type:'text', inStdRefs:false, hdr:'INC<br>Merk',               step:''},
  {key:'INC_Tipe',          idx:40, label:'INCOMING — Tipe/Model',  type:'text', inStdRefs:false, hdr:'INC<br>Tipe',               step:''},
  {key:'INC_SN',            idx:41, label:'INCOMING — Serial Number',type:'text',inStdRefs:false, hdr:'INC<br>SN',                 step:''},
  {key:'COUP_Merk',         idx:42, label:'COUPLER — Merk',         type:'text', inStdRefs:false, hdr:'COUP<br>Merk',              step:''},
  {key:'COUP_Tipe',         idx:43, label:'COUPLER — Tipe/Model',   type:'text', inStdRefs:false, hdr:'COUP<br>Tipe',              step:''},
  {key:'COUP_SN',           idx:44, label:'COUPLER — Serial Number',type:'text', inStdRefs:false, hdr:'COUP<br>SN',                step:''},
  {key:'OGF_Merk',          idx:45, label:'OUTGOING — Merk',        type:'text', inStdRefs:false, hdr:'OGF<br>Merk',               step:''},
  {key:'OGF_Tipe',          idx:46, label:'OUTGOING — Tipe/Model',  type:'text', inStdRefs:false, hdr:'OGF<br>Tipe',               step:''},
  {key:'OGF_SN',            idx:47, label:'OUTGOING — Serial Number',type:'text',inStdRefs:false, hdr:'OGF<br>SN',                 step:''},
  {key:'SBEF_Merk',         idx:48, label:'SBEF (1/2/3) — Merk',    type:'text', inStdRefs:false, hdr:'SBEF<br>Merk',              step:''},
  {key:'SBEF_Tipe',         idx:49, label:'SBEF (1/2/3) — Tipe/Model',type:'text',inStdRefs:false,hdr:'SBEF<br>Tipe',              step:''},
  {key:'SBEF_SN',           idx:50, label:'SBEF (1/2/3) — Serial Number',type:'text',inStdRefs:false,hdr:'SBEF<br>SN',             step:''},
  {key:'PLTD_Merk',         idx:51, label:'COUPLE PLTD — Merk',     type:'text', inStdRefs:false, hdr:'PLTD<br>Merk',              step:''},
  {key:'PLTD_Tipe',         idx:52, label:'COUPLE PLTD — Tipe/Model',type:'text',inStdRefs:false, hdr:'PLTD<br>Tipe',              step:''},
  {key:'PLTD_SN',           idx:53, label:'COUPLE PLTD — Serial Number',type:'text',inStdRefs:false,hdr:'PLTD<br>SN',              step:''}
];
const GIDB_COLS = 54;

const GI_DB_DEFAULT = [
  ["Mambong TD1",8100,7.899,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,2104.442,923.788,533.349,6928.406,288.675,40,10.692,0.19,6218.965],
  ["Bengkayang TD1",9300,7.786,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,2416.211,923.788,533.349,6928.406,288.675,40,9.312,0.166,6302.21],
  ["Bengkayang TD2",9300,7.786,30,12.321,1000,200,115.47,866.025,13.333,1.643,150,20,2416.211,937.208,541.097,7029.063,288.675,40,9.312,0.166,6385.387],
  ["Cendana TD1",5700,4.304,30,12.461,1000,200,115.47,866.025,13.333,1.661,150,20,1480.903,926.679,535.018,6950.091,288.675,40,15.193,0.27,5978.035],
  ["IPP TD1",9800,5.605,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,2546.115,1847.575,1066.698,13856.813,288.675,40,8.837,0.157,11658.514],
  ["Kota Baru TD1",2500,2076,60,12.038,2000,200,230.94,1732.051,6.667,0.803,150,20,649.519,1918.482,1107.636,14388.616,288.675,40,34.641,0.616,8141.018],
  ["Kota Baru TD2",2500,2076,30,12.5,2000,200,115.47,866.025,13.333,1.667,150,20,649.519,923.788,533.349,6928.406,288.675,40,34.641,0.616,5058.914],
  ["Kota Baru TD3",2500,2076,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,649.519,1847.575,1066.698,13856.813,288.675,40,34.641,0.616,7967.993],
  ["Ngabang TD1",6880,3.061,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1787.476,923.788,533.349,6928.406,288.675,40,12.588,0.224,6108.086],
  ["Ngabang TD2",6880,3.061,30,12.206,1000,200,115.47,866.025,13.333,1.627,150,20,1787.476,946.038,546.195,7095.288,288.675,40,12.588,0.224,6237.424],
  ["Parit Baru TD1",4300,7.892,30,12.291,1000,200,115.47,866.025,13.333,1.639,150,20,1117.173,939.496,542.418,7046.219,288.675,40,20.14,0.358,5782.62],
  ["Parit Baru TD2",4300,7.892,30,12.385,1000,200,115.47,866.025,13.333,1.651,150,20,1117.173,932.365,538.301,6992.74,288.675,40,20.14,0.358,5746.551],
  ["PLTU 2 TD1",7700,6.857,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,2000.519,923.788,533.349,6928.406,288.675,40,11.247,0.2,6186.068],
  ["PLTU 3 TD1",7700,6.996,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,2000.519,923.788,533.349,6928.406,288.675,40,11.247,0.2,6186.068],
  ["Sambas TD1",4000,2.567,30,12.464,1000,200,115.47,866.025,13.333,1.662,150,20,1039.23,926.456,534.889,6948.418,288.675,40,21.651,0.385,5641.583],
  ["Sambas TD2",4000,2.567,30,11.916,1000,200,115.47,866.025,13.333,1.589,150,20,1039.23,969.062,559.488,7267.966,288.675,40,21.651,0.385,5850.435],
  ["Sambas TD3",4000,2.567,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,1039.23,1847.575,1066.698,13856.813,288.675,40,21.651,0.385,9478.483],
  ["Sanggau TD1",3900,2.182,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1013.25,923.788,533.349,6928.406,288.675,40,22.206,0.395,5601.438],
  ["Sanggau TD2",3900,2.182,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1013.25,923.788,533.349,6928.406,288.675,40,22.206,0.395,5601.438],
  ["Sei Raya TD1",4900,4.938,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1273.057,923.788,533.349,6928.406,288.675,40,17.674,0.314,5829.257],
  ["Sei Raya TD2",4900,4.938,60,12.5,1000,200,230.94,1732.051,6.667,0.833,150,20,1273.057,1847.575,1066.698,13856.813,288.675,40,17.674,0.314,10062.42],
  ["Sekadau TD1",3300,1.798,30,12.911,1000,200,115.47,866.025,13.333,1.721,150,20,857.365,894.38,516.371,6707.852,288.675,40,26.243,0.467,5277.395],
  ["Semparuk TD1",4200,2.703,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1091.192,923.788,533.349,6928.406,288.675,40,20.62,0.367,5679.121],
  ["Senggiring TD1",7120,5.449,30,11.956,1000,200,115.47,866.025,13.333,1.594,150,20,1849.83,965.82,557.616,7243.65,288.675,40,12.163,0.216,6378.259],
  ["Senggiring TD2",7120,5.449,30,11.866,1000,200,115.47,866.025,13.333,1.582,150,20,1849.83,973.145,561.846,7298.591,288.675,40,12.163,0.216,6420.82],
  ["Senggiring TD3",7120,5.449,60,12.055,2000,200,230.94,1732.051,6.667,0.804,150,20,1849.83,1915.777,1106.074,14368.325,288.675,40,12.163,0.216,11321.673],
  ["Siantan TD1",5800,6.846,60,12.03,2000,200,230.94,1732.051,6.667,0.802,150,20,1506.884,1919.758,1108.373,14398.185,288.675,40,14.931,0.265,10817.39],
  ["Siantan TD2",5800,6.846,60,11.98,2000,200,230.94,1732.051,6.667,0.799,150,20,1506.884,1927.77,1112.999,14458.277,288.675,40,14.931,0.265,10851.275],
  ["Singkawang TD1",10100,6.872,60,12.67,2000,200,230.94,1732.051,6.667,0.845,150,20,2624.057,1822.785,1052.386,13670.889,288.675,40,8.575,0.152,11580.561],
  ["Singkawang TD2",10100,6.872,60,12.09,2000,200,230.94,1732.051,6.667,0.806,150,20,2624.057,1910.231,1102.872,14326.73,288.675,40,8.575,0.152,12047.762],
  ["Singkawang TD3",10100,6.872,30,12.385,1000,200,115.47,866.025,13.333,1.651,150,20,2624.057,932.365,538.301,6992.74,288.675,40,8.575,0.152,6401.599],
  ["Sintang TD1",2700,1.455,60,12.826,2000,200,230.94,1732.051,6.667,0.855,150,20,701.481,1800.615,1039.586,13504.613,288.675,40,32.075,0.57,8101.518],
  ["Ketapang TD1",1830,0.727,60,12.11,1000,200,230.94,1732.051,6.667,0.807,150,20,475.448,1907.076,1101.051,14303.069,288.675,40,47.324,0.841,7003.936],
  ["Kendawangan TD1",1860,0.655,30,12.1,1000,200,115.47,866.025,13.333,1.613,150,20,483.242,954.326,550.98,7157.445,288.675,40,46.561,0.828,4730.294],
  ["Sukadana TD1",1380,0.732,30,12.6,1000,200,115.47,866.025,13.333,1.68,150,20,358.535,916.456,529.116,6873.419,288.675,40,62.755,1.116,4130.343],
  ["Sandai TD1",1350,0.89,30,12.12,1000,200,115.47,866.025,13.333,1.616,150,20,350.74,952.751,550.071,7145.634,288.675,40,64.15,1.14,4189.093],
  ["Trafo TFT Minitn",5380,7.215,30,12.111,1000,200,115.47,866.025,13.333,1.615,150,20,1397.765,953.459,550.48,7150.944,288.675,40,16.097,0.286,6074.267],
  ["Pulang Pisau TD1",6015,5343,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1562.743,923.788,533.349,6928.406,288.675,40,14.398,0.256,6005.848],
  ["Sebangau TD1",4678,3134,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,1215.38,1847.575,1066.698,13856.813,288.675,40,18.513,0.329,9933.348],
  ["Palangkaraya TD1",6289,4268,60,12.016,2000,200,230.94,1732.051,6.667,0.801,150,20,1633.93,1921.995,1109.664,14414.96,288.675,40,13.77,0.245,11040.52],
  ["Palangkaraya TD2",6289,4268,30,12.18,1000,200,115.47,866.025,13.333,1.624,150,20,1633.93,948.058,547.361,7110.434,288.675,40,13.77,0.245,6178.806],
  ["Kasongan TD1",6032,4652,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1567.16,923.788,533.349,6928.406,288.675,40,14.357,0.255,6008.103],
  ["Kasongan TD2",6032,4652,60,12.52,2000,200,230.94,1732.051,6.667,0.835,150,20,1567.16,1844.624,1064.994,13834.677,288.675,40,14.357,0.255,10594.501],
  ["Sudan TD1",3547,2379,30,12.31,1000,200,115.47,866.025,13.333,1.641,150,20,921.538,938.046,541.581,7035.344,288.675,40,24.416,0.434,5563.775],
  ["Parenggean TD1",3127,2050,30,12.11,1000,200,115.47,866.025,13.333,1.615,150,20,812.418,953.538,550.525,7151.534,288.675,40,27.695,0.492,5480.244],
  ["Trafo TFT SKS",5800,6.254,30,12.51,1000,200,115.47,866.025,13.333,1.668,150,20,1506.884,923.049,532.923,6922.868,288.675,40,14.931,0.265,5972.234],
  ["Kuala Kurun TD1",4505,4065,30,12.02,1000,200,115.47,866.025,13.333,1.603,150,20,1170.433,960.678,554.647,7205.082,288.675,40,19.224,0.342,5938.533],
  ["Sampit TD1",3039,1930,30,12.395,1000,200,115.47,866.025,13.333,1.653,150,20,789.555,931.613,537.867,6987.098,288.675,40,28.497,0.507,5347.616],
  ["Sampit TD2",3039,1930,30,12.076,1000,200,115.47,866.025,13.333,1.61,150,20,789.555,956.223,552.075,7171.669,288.675,40,28.497,0.507,5455.07],
  ["Sampit TD3",3039,1930,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,789.555,1847.575,1066.698,13856.813,288.675,40,28.497,0.507,8617.505],
  ["Bagendang TD1",2387,1485,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,620.161,923.788,533.349,6928.406,288.675,40,36.281,0.645,4995.113],
  ["Kuala Pambuang TD1",1501,915,30,12.39,1000,200,115.47,866.025,13.333,1.652,150,20,389.971,931.989,538.084,6989.918,288.675,40,57.697,1.026,4312.258],
  ["Pangkalan Banteng TD1",1922,1170,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,499.35,923.788,533.349,6928.406,288.675,40,45.059,0.801,4679.244],
  ["Pangkalan Bun TD1",1891,1142,60,12.5,1000,200,230.94,1732.051,6.667,0.833,150,20,491.296,1847.575,1066.698,13856.813,288.675,40,45.797,0.814,7008.778],
  ["Pangkalan Bun TD2",1891,1142,60,12.5,1000,200,230.94,1732.051,6.667,0.833,150,20,491.296,1847.575,1066.698,13856.813,288.675,40,45.797,0.814,7008.778],
  ["Sukamara TD1",1466,882,30,12.514,1000,200,115.47,866.025,13.333,1.669,150,20,380.878,922.754,532.752,6920.655,288.675,40,59.074,1.05,4247.192],
  ["Nanga Bulik TD1",1470,884,30,12.39,1000,200,115.47,866.025,13.333,1.652,150,20,381.917,931.989,538.084,6989.918,288.675,40,58.913,1.047,4277.703],
  ["Muara Teweh TD1",6896,5961,30,12.415,1000,200,115.47,866.025,13.333,1.655,150,20,1791.633,930.112,537.001,6975.842,288.675,40,12.558,0.223,6146.623],
  ["Buntok TD1",7430,5527,30,12.48,1000,200,115.47,866.025,13.333,1.664,150,20,1930.371,925.268,534.204,6939.51,288.675,40,11.656,0.207,6170.863],
  ["Trafo TFT Bangkanai",7907,9029,10,10.4,null,200,38.49,288.675,40,4.16,150,20,2054.299,370.107,213.681,2775.804,288.675,40,10.953,0.195,2651.611],
  ["Puruk Cahu TD1",4673,3532,30,12.3,1000,200,115.47,866.025,13.333,1.64,150,20,1214.081,938.808,542.021,7041.063,288.675,40,18.533,0.329,5863.009],
  ["Batulicin TD1",3459,3321,30,12.373,1000,200,115.47,866.025,13.333,1.65,150,20,898.675,933.27,538.823,6999.522,288.675,40,25.037,0.445,5512.136],
  ["Batulicin TD2",3459,3321,30,12.242,1000,200,115.47,866.025,13.333,1.632,150,20,898.675,943.256,544.589,7074.423,288.675,40,25.037,0.445,5558.482],
  ["Satui TD1",6437,5614,30,12.526,1000,200,115.47,866.025,13.333,1.67,150,20,1672.382,921.87,532.242,6914.025,288.675,40,13.454,0.239,6047.727],
  ["Langadai TD1",2912,3045,30,12.16,1000,200,115.47,866.025,13.333,1.621,150,20,756.56,949.617,548.262,7122.128,288.675,40,29.74,0.529,5370.594],
  ["Pulau Laut TD1",2900,null,30,12.076,1000,200,115.47,866.025,13.333,1.61,150,20,753.442,956.223,552.075,7171.669,288.675,40,29.863,0.531,5393.201],
  ["PLTA TD1",2600,null,6,6.62,null,200,23.094,173.205,66.667,4.413,150,20,675.5,348.862,201.416,2616.468,288.675,40,33.309,0.592,2306.869],
  ["Asam Asam TD1",12808,14883,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,3327.616,1847.575,1066.698,13856.813,288.675,40,6.762,0.12,12109.624],
  ["Asam Asam TD2",12808,14883,30,12.24,1000,200,115.47,866.025,13.333,1.632,150,20,3327.616,943.41,544.678,7075.578,288.675,40,6.762,0.12,6589.981],
  ["Pelaihari TD1",6022,4401,30,12.242,1000,200,115.47,866.025,13.333,1.632,150,20,1564.561,943.256,544.589,7074.423,288.675,40,14.381,0.256,6116.227],
  ["Pelaihari TD2",6022,4401,30,10.24,null,200,115.47,866.025,13.333,1.365,150,20,1564.561,1127.67,651.061,8457.527,288.675,40,14.381,0.256,7123.401],
  ["Pelaihari TD3",6022,4401,30,12.409,1000,200,115.47,866.025,13.333,1.655,150,20,1564.561,930.562,537.26,6979.215,288.675,40,14.381,0.256,6044.932],
  ["Cempaka 70 kV TD3",10165,8690,10,10.2,null,200,38.49,288.675,40,4.08,150,20,2640.944,377.364,217.871,2830.231,288.675,40,8.52,0.151,2728.846],
  ["Cempaka 70 kV TD4",10165,8690,10,9.73,null,200,38.49,288.675,40,3.892,150,20,2640.944,395.592,228.395,2966.944,288.675,40,8.52,0.151,2855.723],
  ["IBT 1 Cempaka 70 kV",10165,8690,31,12.1,null,200,119.319,894.893,12.903,1.561,150,20,2640.944,986.137,569.346,7396.026,288.675,40,8.52,0.151,6741.788],
  ["Cempaka 150 kV TD5",10165,8690,30,12.21,1000,200,115.47,866.025,13.333,1.628,150,20,2640.944,945.728,546.017,7092.963,288.675,40,8.52,0.151,6489.047],
  ["Cempaka 150 kV TD6",10165,8690,60,12.36,2000,200,230.94,1732.051,6.667,0.824,150,20,2640.944,1868.502,1078.78,14013.767,288.675,40,8.52,0.151,11837.486],
  ["Cempaka 150 kV TD7",10165,8690,60,12.076,2000,200,230.94,1732.051,6.667,0.805,150,20,2640.944,1912.445,1104.151,14343.339,288.675,40,8.52,0.151,12071.795],
  ["Bandara TD1",10355,8843,60,12.076,2000,200,230.94,1732.051,6.667,0.805,150,20,2690.308,1912.445,1104.151,14343.339,288.675,40,8.363,0.149,12106.971],
  ["Mantuil TD1",11079,9697,30,12.7,1000,200,115.47,866.025,13.333,1.693,150,20,2878.409,909.24,524.95,6819.298,288.675,40,7.817,0.139,6301.922],
  ["Mantuil TD2",11079,9697,20,12.22,null,200,76.98,577.35,20,2.444,150,20,2878.409,629.97,363.713,4724.773,288.675,40,7.817,0.139,4470.445],
  ["Mantuil TD3",11079,9697,60,12.076,2000,200,230.94,1732.051,6.667,0.805,150,20,2878.409,1912.445,1104.151,14343.339,288.675,40,7.817,0.139,12231.578],
  ["Ulin TD1",2147,1623,30,12.24,1000,200,115.47,866.025,13.333,1.632,150,20,557.807,943.41,544.678,7075.578,288.675,40,40.337,0.717,4915.514],
  ["Trafo Mobile Ulin",2147,1623,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,557.807,923.788,533.349,6928.406,288.675,40,40.337,0.717,4844.029],
  ["Ulin TD5",2147,1623,20,12.064,null,200,76.98,577.35,20,2.413,150,20,557.807,638.116,368.416,4785.869,288.675,40,40.337,0.717,3689.264],
  ["GIS Ulin TD1",8569,6884,60,11.85,2000,200,230.94,1732.051,6.667,0.79,150,20,2226.292,1948.919,1125.209,14616.891,288.675,40,10.106,0.18,11908.168],
  ["GIS Ulin TD2",8569,6884,60,11.85,2000,200,230.94,1732.051,6.667,0.79,150,20,2226.292,1948.919,1125.209,14616.891,288.675,40,10.106,0.18,11908.168],
  ["Trisakti 70 kV TD3",10823,9542,6,6.6,null,200,23.094,173.205,66.667,4.4,150,20,2811.898,349.92,202.026,2624.396,288.675,40,8.002,0.142,2542.132],
  ["Trisakti 70 kV TD4",10823,9542,27,6,null,200,103.923,779.423,14.815,0.889,150,20,2811.898,1732.102,1000.029,12990.762,288.675,40,8.002,0.142,11198.274],
  ["Trisakti 70 kV TD5",10823,9542,10,6,null,200,38.49,288.675,40,2.4,150,20,2811.898,641.519,370.381,4811.393,288.675,40,8.002,0.142,4542.037],
  ["Trisakti 70 kV TD6",10823,9542,10,6,null,200,38.49,288.675,40,2.4,150,20,2811.898,641.519,370.381,4811.393,288.675,40,8.002,0.142,4542.037],
  ["Trisakti 70 kV TD7",10823,9542,15,5.65,null,200,57.735,433.013,26.667,1.507,150,20,2811.898,1021.889,589.988,7664.166,288.675,40,8.002,0.142,7002.772],
  ["Trisakti 70 kV TD8",10823,9542,6,6.6,null,200,23.094,173.205,66.667,4.4,150,20,2811.898,349.92,202.026,2624.396,288.675,40,8.002,0.142,2542.132],
  ["Trisakti 150 kV TD5",10823,9542,60,12.27,2000,200,230.94,1732.051,6.667,0.818,150,20,2811.898,1882.208,1086.693,14116.558,288.675,40,8.002,0.142,12024.966],
  ["Trisakti 150 kV TD6",10823,9542,60,12.076,2000,200,230.94,1732.051,6.667,0.805,150,20,2811.898,1912.445,1104.151,14343.339,288.675,40,8.002,0.142,12189.137],
  ["IBT 1 Trisakti 150 kV",10823,9542,31,12,null,200,119.319,894.893,12.903,1.548,150,20,2811.898,994.355,574.091,7457.66,288.675,40,8.002,0.142,6829.962],
  ["IBT 2 Trisakti 150 kV",10823,9542,31,12.07,null,200,119.319,894.893,12.903,1.557,150,20,2811.898,988.588,570.761,7414.409,288.675,40,8.002,0.142,6793.667],
  ["Kayutangi TD1",8844,6693,30,12.4,1000,200,115.47,866.025,13.333,1.653,150,20,2297.739,931.237,537.65,6984.281,288.675,40,9.792,0.174,6318.756],
  ["Kayutangi TD2",8844,6693,60,12.07,2000,200,230.94,1732.051,6.667,0.805,150,20,2297.739,1913.396,1104.7,14350.469,288.675,40,9.792,0.174,11797.696],
  ["Selat TD1",6716,5077,20,13.281,null,200,76.98,577.35,20,2.656,150,20,1744.868,579.642,334.657,4347.317,288.675,40,12.895,0.229,4001.813],
  ["Selat TD2",6716,5077,30,12.98,1000,200,115.47,866.025,13.333,1.731,150,20,1744.868,889.626,513.626,6672.194,288.675,40,12.895,0.229,5891.599],
  ["Seberang Barito TD1",10354,8539,20,10.77,null,200,76.98,577.35,20,2.154,150,20,2690.048,714.785,412.681,5360.884,288.675,40,8.364,0.149,5014.559],
  ["Seberang Barito TD2",10354,8539,20,10.76,null,200,76.98,577.35,20,2.152,150,20,2690.048,715.449,413.065,5365.866,288.675,40,8.364,0.149,5018.918],
  ["Seitabuk TD1",6300,4435,60,12.71,2000,200,230.94,1732.051,6.667,0.847,150,20,1636.788,1817.049,1049.074,13627.865,288.675,40,13.746,0.244,10576.947],
  ["Rantau TD1",5285,3572,30,12.29,1000,200,115.47,866.025,13.333,1.639,150,20,1373.083,939.572,542.462,7046.793,288.675,40,16.386,0.291,5982.961],
  ["Rantau TD2",5285,3572,30,12.45,1000,200,115.47,866.025,13.333,1.66,150,20,1373.083,927.498,535.491,6956.231,288.675,40,16.386,0.291,5917.55],
  ["Barikin TD1",10478,8005,30,12.4,1000,200,115.47,866.025,13.333,1.653,150,20,2722.264,931.237,537.65,6984.281,288.675,40,8.265,0.147,6414.041],
  ["Barikin TD2",10478,8005,30,12.77,1000,200,115.47,866.025,13.333,1.703,150,20,2722.264,904.256,522.072,6781.917,288.675,40,8.265,0.147,6242.964],
  ["Barikin TD3",10478,8005,60,11.93,2000,200,230.94,1732.051,6.667,0.795,150,20,2722.264,1935.85,1117.663,14518.874,288.675,40,8.265,0.147,12254.457],
  ["Tanjung TD1",13499,13450,60,12.35,2000,200,230.94,1732.051,6.667,0.823,150,20,3507.143,1870.015,1079.654,14025.114,288.675,40,6.415,0.114,12318.3],
  ["Tanjung TD2",13499,13450,60,12,2000,200,230.94,1732.051,6.667,0.8,150,20,3507.143,1924.557,1111.144,14434.18,288.675,40,6.415,0.114,12632.753],
  ["Amuntai TD1",6292,4266,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1634.71,923.788,533.349,6928.406,288.675,40,13.764,0.245,6041.256],
  ["Amuntai TD3",6292,4266,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,1634.71,1847.575,1066.698,13856.813,288.675,40,13.764,0.245,10711.258],
  ["Paringin TD1",9246,6977,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,2402.181,1847.575,1066.698,13856.813,288.675,40,9.366,0.167,11548.753],
  ["Kandangan TD1",7254,5090,30,12.44,1000,200,115.47,866.025,13.333,1.659,150,20,1884.644,928.243,535.921,6961.823,288.675,40,11.939,0.212,6171.871],
  ["Manggarsari TD1",11691,10161,20,11.03,null,200,76.98,577.35,20,2.206,150,20,3037.411,697.936,402.953,5234.517,288.675,40,7.408,0.132,4939.492],
  ["Manggarsari TD2",11691,10161,60,12.187,2000,200,230.94,1732.051,6.667,0.812,150,20,3037.411,1895.027,1094.094,14212.699,288.675,40,7.408,0.132,12229.953],
  ["Manggarsari TD3",11691,10161,30,12.34,1000,200,115.47,866.025,13.333,1.645,150,20,3037.411,935.765,540.264,7018.24,288.675,40,7.408,0.132,6497.944],
  ["Manggarsari TD4",11691,10161,60,12.3,2000,200,230.94,1732.051,6.667,0.82,150,20,3037.411,1877.617,1084.043,14082.127,288.675,40,7.408,0.132,12133.144],
  ["Karang Joang TD1",12942,11823,60,12.75,2000,200,230.94,1732.051,6.667,0.85,150,20,3362.43,1811.348,1045.782,13585.111,288.675,40,6.692,0.119,11916.887],
  ["Karang Joang TD2",12942,11823,30,14.57,1000,200,115.47,866.025,13.333,1.943,150,20,3362.43,792.542,457.575,5944.069,288.675,40,6.692,0.119,5600.915],
  ["Senipah TD1",12112,11718,60,12.314,2000,200,230.94,1732.051,6.667,0.821,150,20,3146.79,1875.482,1082.81,14066.117,288.675,40,7.15,0.127,12179.782],
  ["Industri TD1",9082,7216,60,12.43,2000,200,230.94,1732.051,6.667,0.829,150,20,2359.573,1857.98,1072.705,13934.848,288.675,40,9.536,0.17,11567.956],
  ["Industri TD2",9082,7216,60,12.1,2000,200,230.94,1732.051,6.667,0.807,150,20,2359.573,1908.652,1101.961,14314.889,288.675,40,9.536,0.17,11828.659],
  ["Industri TD3",9082,7216,30,12.08,1000,200,115.47,866.025,13.333,1.611,150,20,2359.573,955.906,551.893,7169.295,288.675,40,9.536,0.17,6486.393],
  ["New Balikpapan TD1",11450,10035,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,2974.797,1847.575,1066.698,13856.813,288.675,40,7.564,0.134,11931.236],
  ["New Balikpapan TD2",11450,10035,60,12.6,2000,200,230.94,1732.051,6.667,0.84,150,20,2974.797,1832.912,1058.232,13746.838,288.675,40,7.564,0.134,11849.61],
  ["Kariangau TD1",12615,11920,60,12.001,2000,200,230.94,1732.051,6.667,0.8,150,20,3277.473,1924.397,1111.051,14432.977,288.675,40,6.865,0.122,12522.347],
  ["Tanjung Selor TD1",13499,13450,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,3507.143,1847.575,1066.698,13856.813,288.675,40,6.415,0.114,12188.276],
  ["Tanjung Redep TD1",13499,13450,60,12.2,2000,200,230.94,1732.051,6.667,0.813,150,20,3507.143,1893.007,1092.928,14197.554,288.675,40,6.415,0.114,12451.128],
  ["Sambutan TD1",14349,12436,30,12.3,1000,200,115.47,866.025,13.333,1.64,150,20,3727.98,938.808,542.021,7041.063,288.675,40,6.035,0.107,6608.497],
  ["Sambutan TD2",14349,12436,60,12.09,2000,200,230.94,1732.051,6.667,0.806,150,20,3727.98,1910.231,1102.872,14326.73,288.675,40,6.035,0.107,12643.213],
  ["Muara Badak TD1",14637,12922,30,12.5,800,200,115.47,866.025,13.333,1.667,150,20,3802.804,923.788,533.349,6928.406,288.675,40,5.917,0.105,6516.912],
  ["Muara Badak TD2",14637,12922,30,12.5,800,200,115.47,866.025,13.333,1.667,150,20,3802.804,923.788,533.349,6928.406,288.675,40,5.917,0.105,6516.912],
  ["Teluk Pandan TD1",10825,10231,30,12,1000,200,115.47,866.025,13.333,1.6,150,20,2812.417,962.279,555.572,7217.09,288.675,40,8,0.142,6627.73],
  ["Teluk Pandan TD2",10825,10231,20,12.5,null,200,76.98,577.35,20,2.5,150,20,2812.417,615.858,355.566,4618.938,288.675,40,8,0.142,4370.18],
  ["Teluk Pandan TD3",10825,10231,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,2812.417,1847.575,1066.698,13856.813,288.675,40,8,0.142,11836.287],
  ["Sangatta TD1",7142,5700,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1855.546,923.788,533.349,6928.406,288.675,40,12.126,0.216,6134.726],
  ["Sangatta TD2",7142,5700,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1855.546,923.788,533.349,6928.406,288.675,40,12.126,0.216,6134.726],
  ["New Samarinda TD1",15046,13680,60,12.1,2000,200,230.94,1732.051,6.667,0.807,150,20,3909.065,1908.652,1101.961,14314.889,288.675,40,5.756,0.102,12703.075],
  ["Bontang Lestari TD1",9889,10331,30,12.4,1000,200,115.47,866.025,13.333,1.653,150,20,2569.238,931.237,537.65,6984.281,288.675,40,8.757,0.156,6383.012],
  ["Maloy TD1",4240,3118,30,12.313,1000,200,115.47,866.025,13.333,1.642,150,20,1101.584,937.817,541.449,7033.63,288.675,40,20.425,0.363,5759.545],
  ["Harapan Baru TD1",16084,14490,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,4178.746,1847.575,1066.698,13856.813,288.675,40,5.384,0.096,12428.753],
  ["Harapan Baru TD2",16084,14490,30,11.83,1000,200,115.47,866.025,13.333,1.577,150,20,4178.746,976.107,563.556,7320.801,288.675,40,5.384,0.096,6901.745],
  ["Bukuan TD1 (New 2026)",15058,13403,30,12.12,1000,200,115.47,866.025,13.333,1.616,150,20,3912.183,952.751,550.071,7145.634,288.675,40,5.751,0.102,6720.233],
  ["Bukuan TD3",15058,13403,60,12.074,2000,200,230.94,1732.051,6.667,0.805,150,20,3912.183,1912.762,1104.334,14345.715,288.675,40,5.751,0.102,12728.489],
  ["Embalut TD1",17543,18279,30,12.48,1000,200,115.47,866.025,13.333,1.664,150,20,4557.805,925.268,534.204,6939.51,288.675,40,4.937,0.088,6591.654],
  ["Embalut TD2",17543,18279,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,4557.805,923.788,533.349,6928.406,288.675,40,4.937,0.088,6581.635],
  ["Bukit Biru TD1",9788,7671,30,12.106,1000,200,115.47,866.025,13.333,1.614,150,20,2542.997,953.853,550.707,7153.897,288.675,40,8.848,0.157,6518.473],
  ["Bukit Biru TD2",9788,7671,30,12.451,1000,200,115.47,866.025,13.333,1.66,150,20,2542.997,927.423,535.448,6955.673,288.675,40,8.848,0.157,6353.487],
  ["Tengkawang TD1",16223,14887,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,4214.859,923.788,533.349,6928.406,288.675,40,5.338,0.095,6554.955],
  ["Tengkawang TD2",16223,14887,30,11.86,1000,200,115.47,866.025,13.333,1.581,150,20,4214.859,973.638,562.13,7302.283,288.675,40,5.338,0.095,6888.653],
  ["Tengkawang TD3",16223,14887,60,12.373,2000,200,230.94,1732.051,6.667,0.825,150,20,4214.859,1866.539,1077.647,13999.043,288.675,40,5.338,0.095,12554.245],
  ["Tengkawang TD4",16223,14887,60,11.91,2000,200,230.94,1732.051,6.667,0.794,150,20,4214.859,1939.101,1119.54,14543.255,288.675,40,5.338,0.095,12990.184],
  ["Muara Jawa TD1",12598,11314,30,12.448,1000,200,115.47,866.025,13.333,1.66,150,20,3273.056,927.647,535.577,6957.349,288.675,40,6.874,0.122,6480.007],
  ["Kota Bangun TD1",5452,3765,30,12.367,1000,200,115.47,866.025,13.333,1.649,150,20,1416.471,933.722,539.085,7002.918,288.675,40,15.885,0.282,5978.799],
  ["Petung TD1",7475,5178,30,12.093,1000,200,115.47,866.025,13.333,1.612,150,20,1942.062,954.878,551.299,7161.588,288.675,40,11.586,0.206,6350.207],
  ["Petung TD2",7475,5178,60,12.5,2000,200,230.94,1732.051,6.667,0.833,150,20,1942.062,1847.575,1066.698,13856.813,288.675,40,11.586,0.206,11110.368],
  ["Longikis TD1",7016,4780,30,12.04,1000,200,115.47,866.025,13.333,1.605,150,20,1822.81,959.082,553.726,7193.113,288.675,40,12.344,0.219,6327.907],
  ["Kuaro TD1",7179,4944,20,12.34,null,200,76.98,577.35,20,2.468,150,20,1865.159,623.844,360.176,4678.827,288.675,40,12.063,0.214,4304.635],
  ["Grogot TD1",6320,4278,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1641.984,923.788,533.349,6928.406,288.675,40,13.703,0.244,6044.684],
  ["Grogot TD2",6320,4278,30,12.5,1000,200,115.47,866.025,13.333,1.667,150,20,1641.984,923.788,533.349,6928.406,288.675,40,13.703,0.244,6044.684],
  ["Muara Komam TD1",7594,5339,30,12.369,1000,200,115.47,866.025,13.333,1.649,150,20,1972.979,933.571,538.998,7001.785,288.675,40,11.404,0.203,6235.089],
  ["GIS Mobile IKN TD1",9400,null,30,12.478,1000,200,115.47,866.025,13.333,1.664,150,20,2442.192,925.416,534.289,6940.622,288.675,40,9.213,0.164,6318.399],
  ["GIS Mobile IKN TD2",9400,null,30,13.007,1000,200,115.47,866.025,13.333,1.734,150,20,2442.192,887.779,512.56,6658.344,288.675,40,9.213,0.164,6083.602],
  ["GIS 4 IKN TD1",0,0,60,12.07,2000,200,230.94,1732.051,6.667,0.805,150,20,0,1913.396,1104.7,14350.469,288.675,40,null,null,null],
  ["GIS 4 IKN TD2",0,0,60,12.05,2000,200,230.94,1732.051,6.667,0.803,150,20,0,1916.572,1106.533,14374.287,288.675,40,null,null,null],
  ["New Bontang Lestari TD1",9900,10331,60,12.4,2000,200,230.94,1732.051,6.667,0.827,150,20,2572.095,1862.475,1075.3,13968.561,288.675,40,8.748,0.156,11756.484]
];
let giDatabase = JSON.parse(JSON.stringify(GI_DB_DEFAULT));
// Migrasi default rows ke schema v12 (54 kolom):
//   - Schema lama: name di idx 0 → tambah 2 null di awal sehingga UPT(idx 0)=null, ULTG(idx 1)=null, name(idx 2)
//   - Schema v12 (54 elemen): biarkan apa adanya
// Pad sisa kolom (CT/identitas) dengan null hingga panjang = GIDB_COLS.
giDatabase = giDatabase.map(r=>{
  const arr = Array.isArray(r) ? [...r] : [];
  if(arr.length < GIDB_COLS){
    arr.unshift(null, null);             // shift name dari idx 0 → idx 2
    while(arr.length < GIDB_COLS) arr.push(null);
  }
  if(arr.length > GIDB_COLS) arr.length = GIDB_COLS;
  return arr;
});

function loadGIDBfromStorage(){
  const d=window.__SIMCOR_DATA&&window.__SIMCOR_DATA.giDatabase;
  if(Array.isArray(d)&&d.length>0){
    const _pad=(arr)=>{const a=[...arr];while(a.length<GIDB_COLS)a.push(null);if(a.length>GIDB_COLS)a.length=GIDB_COLS;return a;};
    giDatabase=d.map(_pad);
  }
}
function saveGIDBtoStorage(){
  _apiSave('/api/simcor/gi-database', giDatabase);
}

// ===== GI SELECTOR FOR SETTING ENGINE =====
// Label format: "[ULTG] Name (MVA · IHS 150kV kA)"  — uses idx 2 for nama, idx 5 untuk MVA, idx 3 untuk IHS_150_3Ph (A)
function _giLabel(g){
  const nm=g[2]||'—', mva=g[5]||'—';
  const ultg=(g[1]||'').toString().trim();
  const ihsA=+g[3]||0; const ihsKA=ihsA>=100?(ihsA/1000).toFixed(2):ihsA.toFixed(2);
  const prefix = ultg ? '['+ultg+'] ' : '';
  return `${prefix}${nm} (${mva} MVA · IHS 150=${ihsKA} kA)`;
}
function populateEngGISelect(){
  const sel=$('eng-gi-select');
  if(!sel)return;
  while(sel.options.length>1)sel.remove(1);
  giDatabase.forEach((g,i)=>{
    const opt=document.createElement('option');
    opt.value=i; opt.textContent=_giLabel(g);
    sel.appendChild(opt);
  });
}
function filterEngGISelect(){
  const q=($('eng-gi-search')?.value||'').toLowerCase();
  const sel=$('eng-gi-select');if(!sel)return;
  while(sel.options.length>1)sel.remove(1);
  giDatabase.forEach((g,i)=>{
    // Cari di nama, UPT, dan ULTG
    const blob = ((g[0]||'')+' '+(g[1]||'')+' '+(g[2]||'')).toLowerCase();
    if(blob.includes(q)){
      const opt=document.createElement('option');
      opt.value=i; opt.textContent=_giLabel(g);
      sel.appendChild(opt);
    }
  });
}

// Helper: ekstrak nama lokasi dari nama GI penuh dengan menghapus suffix " TD<n>".
// Contoh: "Mambong TD1" → "Mambong", "Bukit Asam TD2" → "Bukit Asam".
// Jika pola tidak ditemukan, kembalikan nama lengkap apa adanya.
function extractLocationName(fullName){
  const s = String(fullName||'').trim();
  if(!s) return '';
  return s.replace(/\s*TD\d*$/i,'').trim() || s;
}

// Fill Setting Engine hidden UI inputs from a DB row (54 fields, schema v12), and set loadedGIRow.
function _engineApplyRow(i){
  const g=giDatabase[i]; if(!g)return null;
  loadedGIRow = [...g];
  // idx 0,1 = Unit UPT / Unit ULTG (text); idx 2 = nama GI/Trafo
  const unitUPT  = (g[0]==null?'':String(g[0]));
  const unitULTG = (g[1]==null?'':String(g[1]));
  const name=g[2]||'';
  const ihs150_A=+g[3]||0;      const ihs150_kA = ihs150_A/1000;
  const mva=+g[5]||60;
  const xt=+g[6]||12.5;
  const kha_cpl=+g[7]||1000;
  const kha_out=+g[8]||300;
  const ngr=+g[20]||40;
  const vlv=+g[14]||20;
  const ibeban=200; // operational — not in DB, keep DOM value if any
  const setVal=(id,v)=>{const el=$(id);if(el)el.value=v;};
  setVal('eng-mva',mva);
  setVal('eng-xt',xt);
  setVal('eng-vlv',vlv);
  setVal('eng-ngr',ngr);
  setVal('eng-ihs150',+ihs150_kA.toFixed(4));
  setVal('eng-kha-couple',kha_cpl);
  setVal('eng-kha',kha_out);
  const eb=$('eng-ibeban'); if(eb && !eb.value) eb.value=ibeban;
  const eop=$('eng-ngr-op'); if(eop) eop.value=ngr;
  // CT auto (legacy hidden inputs)
  const In=Math.round((mva*1000)/(Math.sqrt(3)*vlv));
  const ct_inc=In<600?800:In<1200?1200:In<1800?2000:2500;
  setVal('eng-ct-p',ct_inc);
  setVal('eng-ct-op',kha_out>0?Math.min(kha_out,800):600);
  // Auto-fill 12 rasio CT dari DB (kolom 24-35). Kosongkan field jika DB null/empty.
  const ctIds=['eng-ct-hv-prim','eng-ct-hv-sec','eng-ct-lv-prim','eng-ct-lv-sec',
               'eng-ct-ogf-prim','eng-ct-ogf-sec','eng-ct-coup-prim','eng-ct-coup-sec',
               'eng-ct-sbef-prim','eng-ct-sbef-sec','eng-ct-pltd-prim','eng-ct-pltd-sec'];
  ctIds.forEach((id,k)=>{
    const v=g[24+k];
    setVal(id,(v==null||v==='')?'':v);
  });
  const sm=$('sys-mva'); if(sm)sm.value=mva;
  // Auto-fill GI/Bay info di pane Setting Rele (header BA / laporan)
  const rawName = String(g[2]||'');
  const location = extractLocationName(rawName);
  const sg=$('sys-gi');   if(sg)sg.value   = rawName ? ('GI ' + location) : '';
  const sn=$('sys-name'); if(sn)sn.value = rawName ? ('Trafo ' + rawName) : '';
  const nr=$('ngr-r'); if(nr)nr.value=ngr;
  // === Auto-fill Identitas Rele (Merk/Tipe/SN) dari DB kolom 36-53 ke array `relays` ===
  // Mapping by-index: SBEF (idx 48-50) di-share ke relays[4], [5], [6]; PLTD (51-53) ke [7]
  const _str = v => (v==null||v==='') ? '' : String(v);
  const RELAY_ID_MAP = [
    {ri:0, m:36, t:37, s:38}, // BPU HV
    {ri:1, m:39, t:40, s:41}, // INCOMING
    {ri:2, m:42, t:43, s:44}, // COUPLER
    {ri:3, m:45, t:46, s:47}, // OUTGOING
    {ri:4, m:48, t:49, s:50}, // SBEF-1  (share)
    {ri:5, m:48, t:49, s:50}, // SBEF-2  (share)
    {ri:6, m:48, t:49, s:50}, // SBEF-3  (share)
    {ri:7, m:51, t:52, s:53}  // COUPLE PLTD
  ];
  if(Array.isArray(relays)){
    RELAY_ID_MAP.forEach(({ri,m,t,s})=>{
      if(relays[ri]){
        relays[ri].merk = _str(g[m]);
        relays[ri].tipe = _str(g[t]);
        relays[ri].sn   = _str(g[s]);
      }
    });
  }
  // === Auto-fill Rasio CT (Primer/Sekunder) per slot rele dari DB CT columns (24-35) ===
  // Mapping bay → CT pair:
  //   BPU HV (slot 0)  → CT_HV  (idx 24,25)
  //   INCOMING (slot 1)→ CT_LV  (idx 26,27)
  //   COUPLER  (slot 2)→ CT_COUP(idx 30,31)
  //   OUTGOING (slot 3)→ CT_OGF (idx 28,29)
  //   SBEF 1/2/3 (4-6) → CT_SBEF(idx 32,33) shared
  //   COUPLE PLTD (7)  → CT_PLTD(idx 34,35)
  // DB value > 0 → overwrite kartu Setting Rele (OCR & GFR). Jika null/0, kartu tetap pakai nilai sebelumnya.
  const RELAY_CT_MAP = [
    {ri:0, p:24, s:25}, // BPU HV
    {ri:1, p:26, s:27}, // INCOMING (LV)
    {ri:2, p:30, s:31}, // COUPLER 20 kV
    {ri:3, p:28, s:29}, // OUTGOING (OGF)
    {ri:4, p:32, s:33}, // SBEF-1 (share)
    {ri:5, p:32, s:33}, // SBEF-2 (share)
    {ri:6, p:32, s:33}, // SBEF-3 (share)
    {ri:7, p:34, s:35}  // COUPLE PLTD
  ];
  if(Array.isArray(relays)){
    RELAY_CT_MAP.forEach(({ri,p,s})=>{
      if(!relays[ri]) return;
      const ctP = +g[p], ctS = +g[s];
      if(isFinite(ctP) && ctP > 0){
        if(relays[ri].ocr) relays[ri].ocr.ctP = ctP;
        if(relays[ri].gfr) relays[ri].gfr.ctP = ctP;
      }
      if(isFinite(ctS) && ctS > 0){
        if(relays[ri].ocr) relays[ri].ocr.ctS = ctS;
        if(relays[ri].gfr) relays[ri].gfr.ctS = ctS;
      }
    });
  }
  try{recalcIn();}catch(e){}
  return {name,ihs150_kA,mva,xt,kha_cpl,kha_out,ngr,vlv,In,unitUPT,unitULTG};
}

function loadEngGI(){
  const sel=$('eng-gi-select');
  if(!sel||sel.value==='')return;
  const i=parseInt(sel.value);
  const r=_engineApplyRow(i); if(!r)return;
  // Info panel — use DB-precomputed values where available
  const g=giDatabase[i];
  const IHS_trafo = +g[18] || ((r.mva*1000)/(Math.sqrt(3)*r.vlv)/(r.xt/100));
  const IHS_20kV  = +g[23] || 0;
  const I_NGR     = (r.vlv*1000/Math.sqrt(3))/(r.ngr||1);
  const info=$('eng-gi-info');if(info)info.style.display='block';
  const sv=(id,v)=>{const el=$(id);if(el)el.textContent=v;};
  sv('ei-name',r.name);
  sv('ei-ihs',r.ihs150_kA>0?r.ihs150_kA.toFixed(3):'—');
  sv('ei-mva',r.mva);
  sv('ei-xt',r.xt);
  sv('ei-kha',r.kha_cpl||'—');
  sv('ei-kha-out',r.kha_out||'—');
  sv('ei-ibeban',($('eng-ibeban')?.value||200));
  sv('ei-in',r.In.toLocaleString());
  sv('ei-ihst',Math.round(IHS_trafo).toLocaleString());
  sv('ei-ihs20',Math.round(IHS_20kV).toLocaleString());
  sv('ei-ingr',Math.round(I_NGR).toLocaleString());
  // Refresh tampilan kartu rele (agar Merk/Tipe/SN baru terlihat)
  try{renderCards();}catch(e){}
  notify('✅ Data GI "'+r.name+'" dimuat ke Setting Engine');
}

function loadGItoEngine(i){
  const r=_engineApplyRow(i); if(!r)return;
  showTab('engine');
  // Select in dropdown + refresh info panel
  try{
    const sel=$('eng-gi-select'); if(sel){sel.value=i; loadEngGI();}
  }catch(e){}
  // Pastikan kartu rele di-render ulang (loadEngGI sudah memanggil; redundant safe-call)
  try{renderCards();}catch(e){}
  notify('✅ Data GI "'+r.name+'" dimuat ke Setting Engine');
}

// Ensure each row has exactly GIDB_COLS elements (pad null). Coerce angka di kolom 'num' saja —
// kolom 'text' (Unit UPT/ULTG, Nama GI, Merk/Tipe/SN) dipertahankan apa adanya.
function normalizeGIDB(){
  // Build idx → type map sekali (lebih cepat)
  const typeByIdx={}; GIDB_FIELDS.forEach(f=>{typeByIdx[f.idx]=f.type;});
  giDatabase=giDatabase.map(g=>{
    const arr=Array.isArray(g)?[...g]:[];
    while(arr.length<GIDB_COLS)arr.push(null);
    if(arr.length>GIDB_COLS)arr.length=GIDB_COLS;
    // Coerce semua kolom: text → string|null, num → number|null. Loop dari 0 karena idx 0 kini bertipe 'text'.
    for(let k=0;k<GIDB_COLS;k++){
      const t = typeByIdx[k] || 'num';
      if(t==='text'){
        if(arr[k]==null || arr[k]==='') arr[k]=null;
        else arr[k]=String(arr[k]);
      } else {
        if(arr[k]!=null && arr[k]!=='' && isFinite(+arr[k])) arr[k]=+arr[k];
      }
    }
    if(!arr[2])arr[2]='GI BARU';      // nama default kalau kosong (idx 2)
    return arr;
  });
}

// Wilayah is derived from name (for filter UI). Nama GI sekarang di idx 2.
function _rowWilayah(row){ return guessWilayah(row[2]||''); }

function _renderGIDBHeader(){
  const thead=$('gi-thead'); if(!thead)return;
  let h = `<tr>
    <th style="width:30px">#</th>
    <th style="width:70px">Wilayah</th>`;
  GIDB_FIELDS.forEach(f=>{
    const bg = f.inStdRefs ? 'background:#ecfeff;color:#0e7490' : '';
    h += `<th style="min-width:90px;${bg}" title="${f.label}${f.inStdRefs?'  · tersedia di Standard Rules':''}">${f.hdr}${f.inStdRefs?' <span style="color:#0891b2;font-size:.7em">⚙︎</span>':''}</th>`;
  });
  h += `<th style="width:80px">Load</th><th style="width:38px">✕</th></tr>`;
  thead.innerHTML=h;
}
function renderGIDB(){
  normalizeGIDB();
  _renderGIDBHeader();
  populateEngGISelect();
  const q=($('db-search')?.value||'').toLowerCase();
  const reg=($('db-filter-region')?.value||'');
  const filtered=giDatabase.map((g,i)=>({g,i,wil:_rowWilayah(g)}))
    .filter(({g,wil})=>{
      // Search across name (idx 2), Unit UPT (idx 0) & Unit ULTG (idx 1)
      const hay=((g[2]||'')+' '+(g[0]||'')+' '+(g[1]||'')).toLowerCase();
      return hay.includes(q) && (!reg||wil===reg);
    });
  const tbody=$('gi-tbody'); if(!tbody)return;
  const TCOL = GIDB_COLS + 3; // # + wil + Load + Del = +4 ; but using # at start & Load/Del at end → header count = 1 + 22 + 1 (wil) + 2 (Load/Del) = 26
  if($('db-count'))$('db-count').textContent=`${filtered.length} / ${giDatabase.length} entri`;
  tbody.innerHTML='';
  if(!filtered.length){
    tbody.innerHTML=`<tr><td colspan="${1+GIDB_COLS+3}" style="padding:20px;text-align:center;color:var(--muted)">Tidak ada data — coba hapus filter atau klik <b>↺ Reset Default</b></td></tr>`;
    return;
  }
  const rColor={KALBAR:'#be185d',KALSELTENG:'#0891b2',KALTIMRA:'#15803d',LAINNYA:'#64748b'};
  filtered.forEach(({g,i,wil})=>{
    const wCol=rColor[wil]||'#64748b';
    let html = `<td style="color:var(--muted);font-size:.6rem">${i+1}</td>`;
    // Col 1 = Wilayah (derived, read-only badge)
    html += `<td><span style="padding:1px 5px;border-radius:3px;font-size:.55rem;background:${wCol};color:#fff;font-weight:700">${wil}</span></td>`;
    // 22 data cols
    GIDB_FIELDS.forEach(f=>{
      const v = g[f.idx];
      const dispV = (v==null||v==='') ? '' : v;
      if(f.type==='text'){
        html += `<td><input type="text" value="${String(dispV).replace(/"/g,'&quot;')}" style="min-width:130px" onchange="giDatabase[${i}][${f.idx}]=this.value;saveGIDBtoStorage();renderGIDB()"></td>`;
      } else {
        html += `<td><input type="number" value="${dispV}" step="${f.step||'any'}" style="text-align:right;min-width:72px" onchange="giDatabase[${i}][${f.idx}]=(this.value===''?null:+this.value);saveGIDBtoStorage()"></td>`;
      }
    });
    html += `<td><button class="btn btn-sm" style="background:#0891b2;color:#fff;white-space:nowrap" onclick="loadGItoEngine(${i})">→ Load</button></td>
             <td><button class="btn btn-sm btn-err" onclick="deleteGIRow(${i})">✕</button></td>`;
    const tr=document.createElement('tr');
    tr.innerHTML=html;
    tbody.appendChild(tr);
  });
}
function filterGIDB(){renderGIDB();}
function addGIRow(){
  // 54-field template — sensible 60 MVA / 20 kV defaults; CT & Identitas Rele biarkan null
  // idx 0 = Unit UPT, idx 1 = Unit ULTG, idx 2 = Nama GI; data elektrik 3..23; CT 24..35; identitas 36..53
  const row=new Array(GIDB_COLS).fill(null);
  row[0]='';       // Unit UPT (text)
  row[1]='';       // Unit ULTG (text)
  row[2]='GI BARU';
  row[3]=0;        // IHS_150_3Ph
  row[4]=0;        // IHS_150_1Ph
  row[5]=60;       // MVA
  row[6]=12.5;     // Xt
  row[7]=2000;     // KHA_couple
  row[8]=300;      // KHA
  row[9]=230.94;   // Inom_HV @150 kV
  row[10]=1732.051;// Inom_LV @20 kV
  row[13]=150;     // Vnom_HV
  row[14]=20;      // Vnom_LV
  row[20]=40;      // NGR ohm
  row[23]=null;    // IHS_3Ph_LV_sys
  // CT Ratio (idx 24-35) + Identitas Rele (idx 36-53) — biarkan null, engineer mengisi sesuai bay
  for(let i=24;i<GIDB_COLS;i++) row[i]=null;
  giDatabase.push(row);
  saveGIDBtoStorage();renderGIDB();
  notify('Entri GI baru ditambahkan');
}
function deleteGIRow(i){
  if(!confirm('Hapus entri: '+(giDatabase[i]?.[2]||'?')+'?'))return;
  giDatabase.splice(i,1);saveGIDBtoStorage();renderGIDB();
}

// ===== CSV I/O (European format: `;` delimiter, `,` decimal) =====
function _csvQuote(s){
  if(s==null)return '';
  const str=String(s);
  return /[";\r\n]/.test(str) ? '"'+str.replace(/"/g,'""')+'"' : str;
}
function _num2eu(v){
  if(v==null||v==='')return '';
  if(!isFinite(+v))return '';
  // Preserve original precision when possible
  return String(+v).replace('.',',');
}
function exportGIDB(){
  normalizeGIDB();
  const header = GIDB_FIELDS.map(f=>f.label).join(';');
  const rows = giDatabase.map(g=>
    GIDB_FIELDS.map(f=> f.type==='text' ? _csvQuote(g[f.idx]) : _num2eu(g[f.idx])).join(';')
  );
  // Prepend UTF-8 BOM so Excel auto-detects encoding
  const csv = '\uFEFF' + header + '\n' + rows.join('\n') + '\n';
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download='SIMCOR_GI_Database_'+new Date().toISOString().slice(0,10)+'.csv';
  a.click();notify('✅ Database GI diekspor sebagai CSV ('+giDatabase.length+' entri)');
}
function importGIDBFile(){$('gi-import-file').click();}
function _parseCSVLine(line, sep){
  const out=[]; let cur=''; let inQ=false;
  for(let i=0;i<line.length;i++){
    const c=line[i];
    if(inQ){
      if(c==='"' && line[i+1]==='"'){cur+='"'; i++;}
      else if(c==='"'){inQ=false;}
      else cur+=c;
    } else {
      if(c==='"')inQ=true;
      else if(c===sep){out.push(cur); cur='';}
      else cur+=c;
    }
  }
  out.push(cur);
  return out;
}
function importGIDB(inp){
  const f=inp.files[0]; if(!f)return;
  const rd=new FileReader();
  rd.onload=e=>{
    try{
      let txt=e.target.result;
      // Strip BOM
      if(txt.charCodeAt(0)===0xFEFF) txt=txt.slice(1);
      // Try JSON first (backward compat)
      if(txt.trim().startsWith('[')){
        const data=JSON.parse(txt);
        if(Array.isArray(data)&&data.length>0){
          giDatabase=data; normalizeGIDB(); saveGIDBtoStorage(); renderGIDB();
          notify('✅ '+data.length+' entri GI diimport (JSON)');
          return;
        }
      }
      // CSV path — detect separator (prefer `;`, fallback `,`)
      const lines=txt.split(/\r?\n/).filter(l=>l.trim().length>0);
      if(lines.length<2) throw new Error('CSV kosong / header saja');
      const firstLine=lines[0];
      const sep = (firstLine.split(';').length > firstLine.split(',').length) ? ';' : ',';
      const isEU = (sep===';');
      const header=_parseCSVLine(lines[0],sep);
      if(header.length < 2) throw new Error('Header tidak valid');
      // Build mapping header → GIDB_FIELDS.idx (tolerant match)
      const norm=s=>(s||'').toString().toLowerCase().replace(/[^a-z0-9]/g,'');
      const fieldByNorm={};
      GIDB_FIELDS.forEach(f=>{ fieldByNorm[norm(f.label)]=f; fieldByNorm[norm(f.key)]=f; });
      // Aliases for common CSV headers
      const aliases={
        // Unit UPT / Unit ULTG (kolom baru di idx 0,1)
        'unitupt':'Unit_UPT','upt':'Unit_UPT','unituptpln':'Unit_UPT','namaupt':'Unit_UPT','uptpln':'Unit_UPT',
        'unitultg':'Unit_ULTG','ultg':'Unit_ULTG','namaultg':'Unit_ULTG','ultgpln':'Unit_ULTG',
        'namagi':'name','namagitrafo':'name','gi':'name','nama':'name',
        'bay':null, // ignored
        'ihs15030':'IHS_150_3Ph','ihs150kv30':'IHS_150_3Ph','ihs150kv3phasea':'IHS_150_3Ph',
        'ihs15010':'IHS_150_1Ph','ihs150kv10':'IHS_150_1Ph','ihs150kv1phasea':'IHS_150_1Ph',
        'mvatrafo':'MVA','mva':'MVA',
        'xttrafo':'Xt','xt':'Xt',
        'khacouple':'KHA_couple',
        'khaogf':'KHA','kha':'KHA',
        'inomhv':'Inom_HV','inhv':'Inom_HV',
        'inomlv':'Inom_LV','inlv':'Inom_LV',
        'xtbeban100':'Xt_beban100',
        'xttrafobeban100':'Xt_trafo_beban100',
        'vnomhv':'Vnom_HV','vnomphphhvkv':'Vnom_HV',
        'vnomlv':'Vnom_LV','vnomphphlvkv':'Vnom_LV',
        'ihs150mva':'IHS_150_MVA','ihs150kvmva':'IHS_150_MVA',
        'ihstrafophphhv':'IHS_trafo_PhPh_HV',
        'ihstrafophghv':'IHS_trafo_PhG_HV',
        'ihstrafophphlv':'IHS_trafo_PhPh_LV',
        'ihstrafophglv':'IHS_trafo_PhG_LV',
        'ngrohm':'NGR_ohm','ngr':'NGR_ohm',
        'zhv':'Z_HV','zhvohm':'Z_HV',
        'zlv':'Z_LV','zlvohm':'Z_LV',
        'ihs3phlvsistem':'IHS_3Ph_LV_sys','ihs3phlv':'IHS_3Ph_LV_sys','ihs3philvsistema':'IHS_3Ph_LV_sys',
        // ===== CT Ratio aliases (12 kolom baru) =====
        'cthvprimer':'CT_HV_PRIM','cthvprim':'CT_HV_PRIM','cthvprimera':'CT_HV_PRIM','cthv1':'CT_HV_PRIM',
        'cthvsekunder':'CT_HV_SEC','cthvsek':'CT_HV_SEC','cthvsec':'CT_HV_SEC','cthv2':'CT_HV_SEC','cthvsekundera':'CT_HV_SEC',
        'ctlvprimer':'CT_LV_PRIM','ctlvprim':'CT_LV_PRIM','ctlvprimera':'CT_LV_PRIM','ctlv1':'CT_LV_PRIM',
        'ctlvsekunder':'CT_LV_SEC','ctlvsek':'CT_LV_SEC','ctlvsec':'CT_LV_SEC','ctlv2':'CT_LV_SEC','ctlvsekundera':'CT_LV_SEC',
        'ctogfprimer':'CT_OGF_PRIM','ctogfprim':'CT_OGF_PRIM','ctogfprimera':'CT_OGF_PRIM','ctogf1':'CT_OGF_PRIM','ctoutgoingprimer':'CT_OGF_PRIM','ctoutprimer':'CT_OGF_PRIM',
        'ctogfsekunder':'CT_OGF_SEC','ctogfsek':'CT_OGF_SEC','ctogfsec':'CT_OGF_SEC','ctogf2':'CT_OGF_SEC','ctogfsekundera':'CT_OGF_SEC','ctoutgoingsekunder':'CT_OGF_SEC','ctoutsekunder':'CT_OGF_SEC',
        'ctcouplerprimer':'CT_COUP_PRIM','ctcoupprimer':'CT_COUP_PRIM','ctcoupleraprimera':'CT_COUP_PRIM','ctcouplerprim':'CT_COUP_PRIM','ctcoupprim':'CT_COUP_PRIM','ctcoup1':'CT_COUP_PRIM','ctkopelprimer':'CT_COUP_PRIM',
        'ctcouplersekunder':'CT_COUP_SEC','ctcoupsekunder':'CT_COUP_SEC','ctcouplersek':'CT_COUP_SEC','ctcoupsek':'CT_COUP_SEC','ctcouplersec':'CT_COUP_SEC','ctcoupsec':'CT_COUP_SEC','ctcoup2':'CT_COUP_SEC','ctkopelsekunder':'CT_COUP_SEC',
        'ctsbefprimer':'CT_SBEF_PRIM','ctsbefprim':'CT_SBEF_PRIM','ctsbefprimera':'CT_SBEF_PRIM','ctsbef1':'CT_SBEF_PRIM',
        'ctsbefsekunder':'CT_SBEF_SEC','ctsbefsek':'CT_SBEF_SEC','ctsbefsec':'CT_SBEF_SEC','ctsbef2':'CT_SBEF_SEC','ctsbefsekundera':'CT_SBEF_SEC',
        'ctpltdprimer':'CT_PLTD_PRIM','ctpltdprim':'CT_PLTD_PRIM','ctpltdprimera':'CT_PLTD_PRIM','ctpltd1':'CT_PLTD_PRIM',
        'ctpltdsekunder':'CT_PLTD_SEC','ctpltdsek':'CT_PLTD_SEC','ctpltdsec':'CT_PLTD_SEC','ctpltd2':'CT_PLTD_SEC','ctpltdsekundera':'CT_PLTD_SEC',
        // ===== Identitas Rele aliases (18 kolom: Merk/Tipe/SN × 6 set) =====
        'bpuhvmerk':'BPU_HV_Merk','bpumerk':'BPU_HV_Merk','merkbpuhv':'BPU_HV_Merk','merkbpu':'BPU_HV_Merk',
        'bpuhvtipe':'BPU_HV_Tipe','bpuhvtipemodel':'BPU_HV_Tipe','bputipe':'BPU_HV_Tipe','tipebpuhv':'BPU_HV_Tipe','bpuhvmodel':'BPU_HV_Tipe',
        'bpuhvsn':'BPU_HV_SN','bpusn':'BPU_HV_SN','snbpuhv':'BPU_HV_SN','bpuhvserialnumber':'BPU_HV_SN','bpuhvserial':'BPU_HV_SN',
        'incmerk':'INC_Merk','incomingmerk':'INC_Merk','merkincoming':'INC_Merk','merkinc':'INC_Merk',
        'inctipe':'INC_Tipe','incomingtipe':'INC_Tipe','incomingtipemodel':'INC_Tipe','tipeincoming':'INC_Tipe','incmodel':'INC_Tipe',
        'incsn':'INC_SN','incomingsn':'INC_SN','snincoming':'INC_SN','incomingserialnumber':'INC_SN','incomingserial':'INC_SN',
        'coupmerk':'COUP_Merk','couplermerk':'COUP_Merk','merkcoupler':'COUP_Merk','kopelmerk':'COUP_Merk','merkkopel':'COUP_Merk',
        'couptipe':'COUP_Tipe','couplertipe':'COUP_Tipe','couplertipemodel':'COUP_Tipe','tipecoupler':'COUP_Tipe','coupmodel':'COUP_Tipe','kopeltipe':'COUP_Tipe',
        'coupsn':'COUP_SN','couplersn':'COUP_SN','sncoupler':'COUP_SN','couplerserialnumber':'COUP_SN','couplerserial':'COUP_SN','kopelsn':'COUP_SN',
        'ogfmerk':'OGF_Merk','outgoingmerk':'OGF_Merk','merkoutgoing':'OGF_Merk','merkogf':'OGF_Merk','outmerk':'OGF_Merk',
        'ogftipe':'OGF_Tipe','outgoingtipe':'OGF_Tipe','outgoingtipemodel':'OGF_Tipe','tipeoutgoing':'OGF_Tipe','outtipe':'OGF_Tipe','ogfmodel':'OGF_Tipe',
        'ogfsn':'OGF_SN','outgoingsn':'OGF_SN','snoutgoing':'OGF_SN','outgoingserialnumber':'OGF_SN','outgoingserial':'OGF_SN','outsn':'OGF_SN',
        'sbefmerk':'SBEF_Merk','merksbef':'SBEF_Merk','sbef123merk':'SBEF_Merk','sbefall':'SBEF_Merk','sbefshare':'SBEF_Merk',
        'sbeftipe':'SBEF_Tipe','sbeftipemodel':'SBEF_Tipe','tipesbef':'SBEF_Tipe','sbefmodel':'SBEF_Tipe','sbef123tipe':'SBEF_Tipe',
        'sbefsn':'SBEF_SN','snsbef':'SBEF_SN','sbefserialnumber':'SBEF_SN','sbefserial':'SBEF_SN','sbef123sn':'SBEF_SN',
        'pltdmerk':'PLTD_Merk','merkpltd':'PLTD_Merk','couplepltdmerk':'PLTD_Merk','merkcouplepltd':'PLTD_Merk',
        'pltdtipe':'PLTD_Tipe','pltdtipemodel':'PLTD_Tipe','tipepltd':'PLTD_Tipe','pltdmodel':'PLTD_Tipe','couplepltdtipe':'PLTD_Tipe',
        'pltdsn':'PLTD_SN','snpltd':'PLTD_SN','pltdserialnumber':'PLTD_SN','pltdserial':'PLTD_SN','couplepltdsn':'PLTD_SN'
      };
      const colMap=header.map(h=>{
        const n=norm(h);
        if(fieldByNorm[n])return fieldByNorm[n];
        if(aliases[n]){const key=aliases[n]; return GIDB_FIELDS.find(f=>f.key===key)||null;}
        // Substring fallback
        for(const key in fieldByNorm){ if(n.includes(key)||key.includes(n)){return fieldByNorm[key];} }
        return null;
      });
      const hasName = colMap.some(f=>f&&f.key==='name');
      if(!hasName) throw new Error('Kolom "Nama GI" tidak ditemukan');
      const parsed=[];
      for(let li=1;li<lines.length;li++){
        const cells=_parseCSVLine(lines[li],sep);
        const row=new Array(GIDB_COLS).fill(null);
        cells.forEach((cell,ci)=>{
          const f=colMap[ci]; if(!f)return;
          const raw=String(cell).trim();
          if(f.type==='text'){
            row[f.idx]=raw;
          } else {
            if(raw===''||raw==='-'||raw.toLowerCase()==='null'||raw.includes('#')){row[f.idx]=null; return;}
            const numStr = isEU ? raw.replace(/\./g,'').replace(',','.') : raw;
            const n=+numStr;
            row[f.idx]=isFinite(n)?n:null;
          }
        });
        if(row[2]) parsed.push(row);  // baris valid jika punya Nama GI (idx 2)
      }
      if(parsed.length===0) throw new Error('Tidak ada baris data valid');
      giDatabase=parsed; normalizeGIDB(); saveGIDBtoStorage(); renderGIDB();
      notify('✅ '+parsed.length+' entri GI diimport (CSV '+(isEU?'EU':'EN')+')');
    }catch(err){notify('Gagal import: '+err.message,true);}
  };
  rd.readAsText(f,'utf-8'); inp.value='';
}
function resetGIDB(){
  if(confirm('Reset database ke nilai default ('+GI_DB_DEFAULT.length+' entri)?')){
    giDatabase=JSON.parse(JSON.stringify(GI_DB_DEFAULT));
    saveGIDBtoStorage();renderGIDB();notify('Database direset ke default.');
  }
}
// Expose CSV export alias for backward-compat with any HTML inline handler
function exportGIDBCSV(){ exportGIDB(); }
function exportGIDBJSON(){
  normalizeGIDB();
  const json=JSON.stringify(giDatabase,null,2);
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([json],{type:'application/json'}));
  a.download='SIMCOR_GI_Database_'+new Date().toISOString().slice(0,10)+'.json';
  a.click();notify('Database GI diekspor (JSON backup)');
}

