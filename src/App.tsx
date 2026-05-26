import { useState, useCallback } from "react";

const GEAR_TYPES = ["Spur","Helical","Bevel","Worm","Rack & Pinion","Planetary","Ring","Hypoid"];
const MATERIALS = ["Steel (AISI 1045)","Stainless Steel (304)","Alloy Steel (4140)","Cast Iron","Aluminum 6061","Brass","Nylon","Titanium Grade 5"];
const HEAT_TREATMENTS = ["None","Case Hardening","Through Hardening","Nitriding","Carburizing","Induction Hardening"];
const SURFACE_FINISHES = ["Machined","Ground","Lapped","Honed","Polished","Black Oxide","Zinc Plated","Nickel Plated"];
const QUALITY_GRADES = ["AGMA 5 (Commercial)","AGMA 7 (Precision)","AGMA 9 (High Precision)","AGMA 11 (Very High)","DIN 6","DIN 7","ISO 6","ISO 7"];
const PRESSURE_ANGLES = [14.5,20,25];
const CURRENCIES = [
  {code:"INR",symbol:"₹",name:"Indian Rupee"},
  {code:"USD",symbol:"$",name:"US Dollar"},
  {code:"EUR",symbol:"€",name:"Euro"},
  {code:"GBP",symbol:"£",name:"British Pound"},
  {code:"AED",symbol:"د.إ",name:"UAE Dirham"},
  {code:"SGD",symbol:"S$",name:"Singapore Dollar"},
  {code:"JPY",symbol:"¥",name:"Japanese Yen"},
];
const TAX_TYPES = {
  GST:{name:"GST (India)",rates:[5,12,18,28]},
  VAT:{name:"VAT (International)",rates:[5,10,15,20,25]},
  IGST:{name:"IGST (Inter-state India)",rates:[5,12,18,28]},
  NONE:{name:"No Tax",rates:[0]},
};

const STANDARD_GEARS_INITIAL = [
  {id:"SG001",name:"Spur Gear M1 Z20",type:"Spur",module:1,teeth:20,boreDia:6,material:"Steel (AISI 1045)",stock:150,pricing:[{minQty:1,maxQty:9,price:280},{minQty:10,maxQty:49,price:240},{minQty:50,maxQty:99,price:200},{minQty:100,maxQty:999,price:170}]},
  {id:"SG002",name:"Spur Gear M2 Z30",type:"Spur",module:2,teeth:30,boreDia:10,material:"Steel (AISI 1045)",stock:80,pricing:[{minQty:1,maxQty:9,price:480},{minQty:10,maxQty:49,price:420},{minQty:50,maxQty:99,price:360},{minQty:100,maxQty:999,price:310}]},
  {id:"SG003",name:"Helical Gear M2 Z40",type:"Helical",module:2,teeth:40,boreDia:14,material:"Alloy Steel (4140)",stock:60,pricing:[{minQty:1,maxQty:9,price:720},{minQty:10,maxQty:49,price:640},{minQty:50,maxQty:99,price:560},{minQty:100,maxQty:999,price:490}]},
  {id:"SG004",name:"Bevel Gear M3 Z20",type:"Bevel",module:3,teeth:20,boreDia:16,material:"Steel (AISI 1045)",stock:40,pricing:[{minQty:1,maxQty:9,price:950},{minQty:10,maxQty:49,price:840},{minQty:50,maxQty:99,price:730},{minQty:100,maxQty:999,price:640}]},
];
const SAMPLE_CUSTOMERS = [
  {id:"C001",name:"Ramesh Industries",email:"ramesh@rameshindustries.com",phone:"+91 9876543210",country:"India",currency:"INR",taxEnabled:true,taxType:"GST",taxRate:18,gstNumber:"27AABCU9603R1ZX",creditAllowed:true},
  {id:"C002",name:"TechGear GmbH",email:"orders@techgear.de",phone:"+49 30 12345678",country:"Germany",currency:"EUR",taxEnabled:true,taxType:"VAT",taxRate:19,gstNumber:"",creditAllowed:true},
  {id:"C003",name:"Precision Parts LLC",email:"procurement@precisionparts.com",phone:"+1 555 987 6543",country:"USA",currency:"USD",taxEnabled:false,taxType:"NONE",taxRate:0,gstNumber:"",creditAllowed:false},
];
const SAMPLE_INVOICES = [
  {id:"INV-2024-001",customerId:"C001",date:"2024-11-15",dueDate:"2024-12-15",items:[{name:"Spur Gear M1 Z20",qty:50,unitPrice:200,tax:18}],currency:"INR",paymentType:"credit",status:"overdue",total:11800},
  {id:"INV-2024-002",customerId:"C002",date:"2024-11-20",dueDate:"2024-12-20",items:[{name:"Custom Helical Gear",qty:10,unitPrice:85,tax:19}],currency:"EUR",paymentType:"cash",status:"paid",total:1011.5},
  {id:"INV-2024-003",customerId:"C003",date:"2024-12-01",dueDate:"2025-01-01",items:[{name:"Bevel Gear M3 Z20",qty:5,unitPrice:95,tax:0}],currency:"USD",paymentType:"credit",status:"pending",total:475},
];
const INVENTORY_INITIAL = [
  {id:"INV001",gearId:"SG001",gearName:"Spur Gear M1 Z20",type:"inward",qty:200,date:"2024-10-01",supplier:"Steel Works Ltd",batchNo:"BT-2410-001",notes:"Initial stock"},
  {id:"INV002",gearId:"SG001",gearName:"Spur Gear M1 Z20",type:"outward",qty:50,date:"2024-10-15",orderId:"INV-2024-001",notes:"Against order"},
  {id:"INV003",gearId:"SG002",gearName:"Spur Gear M2 Z30",type:"inward",qty:100,date:"2024-10-05",supplier:"Steel Works Ltd",batchNo:"BT-2410-002",notes:"Initial stock"},
];

function validateGearDesign(data) {
  const errors=[], warnings=[];
  const {gearType,module:mod,teeth,pressureAngle,faceWidth,boreDia,shaftDia,helixAngle,material,rpm,power,safetyFactor}=data;
  const m=parseFloat(mod),z=parseInt(teeth),fa=parseFloat(faceWidth),bd=parseFloat(boreDia),sd=parseFloat(shaftDia),pa=parseFloat(pressureAngle),ha=parseFloat(helixAngle)||0,r=parseFloat(rpm)||0,p=parseFloat(power)||0,sf=parseFloat(safetyFactor)||1.5;
  if(!gearType) errors.push({field:"gearType",message:"Gear type is required."});
  if(!mod||isNaN(m)||m<=0) errors.push({field:"module",message:"Module must be a positive number (e.g. 1, 1.5, 2, 2.5, 3)."});
  else if(![0.5,0.8,1,1.25,1.5,2,2.5,3,4,5,6,8,10,12,16,20].includes(m)) warnings.push({field:"module",message:`Module ${m} is non-standard. Non-standard modules may increase cost.`});
  if(!teeth||isNaN(z)||z<6) errors.push({field:"teeth",message:"Number of teeth must be at least 6."});
  else if(z<17&&pa===20) warnings.push({field:"teeth",message:`With ${z} teeth and 20° pressure angle, undercutting may occur. Consider profile shift.`});
  if(!pressureAngle||![14.5,20,25].includes(pa)) errors.push({field:"pressureAngle",message:"Pressure angle must be 14.5°, 20°, or 25°."});
  if(m&&z&&!isNaN(m)&&!isNaN(z)){
    const pd=m*z;
    if(fa&&!isNaN(fa)){
      if(fa<8*m) errors.push({field:"faceWidth",message:`Face width too small. Min recommended: ${8*m}mm (8×module).`});
      if(fa>16*m) warnings.push({field:"faceWidth",message:`Face width exceeds 16×module (${16*m}mm). Load distribution issues may occur.`});
    }
    if(bd&&!isNaN(bd)){
      const dd=pd-2.5*m;
      if(bd>=dd) errors.push({field:"boreDia",message:`Bore diameter (${bd}mm) exceeds root diameter (${dd.toFixed(1)}mm). Max allowable: ${(dd*0.7).toFixed(1)}mm.`});
      else if(bd>dd*0.7) warnings.push({field:"boreDia",message:`Bore close to root diameter. Recommended max: ${(dd*0.7).toFixed(1)}mm.`});
    }
  }
  if(sd&&bd&&!isNaN(sd)&&!isNaN(bd)&&sd>=bd) errors.push({field:"shaftDia",message:`Shaft diameter (${sd}mm) must be less than bore diameter (${bd}mm).`});
  if(gearType==="Helical"){
    if(!ha||isNaN(ha)||ha<=0) errors.push({field:"helixAngle",message:"Helix angle required for helical gears. Typical: 15°–30°."});
    else if(ha>45) errors.push({field:"helixAngle",message:`Helix angle ${ha}° too high. Max: 45°.`});
  }
  if(sf&&!isNaN(sf)&&sf<1.2) warnings.push({field:"safetyFactor",message:"Safety factor below 1.2 is very risky. Recommended minimum: 1.5."});
  return {errors,warnings,isValid:errors.length===0};
}

function fmtCur(amount,code){
  const cur=CURRENCIES.find(c=>c.code===code)||CURRENCIES[0];
  return `${cur.symbol}${parseFloat(amount||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
}
function getPriceForQty(pricing,qty){
  const tier=pricing.find(t=>qty>=t.minQty&&qty<=t.maxQty);
  return tier?tier.price:pricing[pricing.length-1]?.price||0;
}

// ─── Global styles ────────────────────────────────────────────────
const G = () => (
  <style>{`
    *{box-sizing:border-box;margin:0;padding:0}
    :root{
      --gold:#B8860B;--gold-lt:#D4A017;--gold-bg:#FDF8EE;
      --bg:#ffffff;--bg2:#F8F7F5;--bg3:#F1EFE8;
      --border:#E0DDD5;--border2:#C8C4BA;
      --text:#1A1A18;--text2:#4A4A45;--text3:#7A7A72;
      --red-bg:#FEF2F2;--red:#B91C1C;--red-border:#FECACA;
      --yellow-bg:#FFFBEB;--yellow:#92400E;--yellow-border:#FDE68A;
      --green-bg:#F0FDF4;--green:#166534;--green-border:#BBF7D0;
      --blue-bg:#EFF6FF;--blue:#1D4ED8;--blue-border:#BFDBFE;
    }
    body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--bg);color:var(--text);font-size:14px;line-height:1.5}
    a{color:var(--gold)}
    h1{font-size:clamp(22px,4vw,32px);font-weight:700;line-height:1.2}
    h2{font-size:clamp(18px,3vw,24px);font-weight:600}
    h3{font-size:16px;font-weight:600}
    p{color:var(--text2)}
    input,select,textarea{
      font-family:inherit;font-size:14px;
      background:var(--bg);border:1px solid var(--border2);color:var(--text);
      padding:9px 12px;border-radius:8px;width:100%;transition:border-color .15s,box-shadow .15s;
    }
    input:focus,select:focus,textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(184,134,11,.12)}
    label{display:block;font-size:12px;font-weight:500;color:var(--text2);margin-bottom:4px;letter-spacing:.01em}
    button{cursor:pointer;font-family:inherit;font-size:14px;border-radius:8px;transition:all .15s}
    /* btn variants */
    .btn-primary{background:var(--gold);color:#fff;border:none;padding:10px 20px;font-weight:600}
    .btn-primary:hover{background:var(--gold-lt)}
    .btn-secondary{background:var(--bg2);color:var(--text);border:1px solid var(--border);padding:9px 18px;font-weight:500}
    .btn-secondary:hover{background:var(--bg3);border-color:var(--border2)}
    .btn-danger{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border);padding:7px 14px;font-size:13px}
    .btn-danger:hover{background:#fee2e2}
    .btn-sm{padding:6px 12px;font-size:12px}
    .btn-icon{background:none;border:none;color:var(--text3);padding:4px 8px;font-size:13px}
    .btn-icon:hover{color:var(--text);background:var(--bg2)}
    /* layout */
    .card{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:20px}
    .card-sm{background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:14px}
    .section{padding:clamp(32px,5vw,60px) clamp(16px,4vw,48px)}
    .container{max-width:1200px;margin:0 auto}
    .grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
    .grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
    .grid4{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
    .form-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
    .form-row-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px}
    /* table */
    .tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--border);border-radius:10px}
    table{border-collapse:collapse;width:100%;min-width:500px}
    th{background:var(--bg2);color:var(--text2);text-align:left;padding:10px 14px;font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;white-space:nowrap}
    td{padding:10px 14px;border-bottom:1px solid var(--border);font-size:13px;vertical-align:middle}
    tr:last-child td{border-bottom:none}
    tr:hover td{background:var(--bg2)}
    /* badge */
    .badge{display:inline-flex;align-items:center;padding:3px 8px;border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap}
    .badge-green{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
    .badge-red{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border)}
    .badge-yellow{background:var(--yellow-bg);color:var(--yellow);border:1px solid var(--yellow-border)}
    .badge-blue{background:var(--blue-bg);color:var(--blue);border:1px solid var(--blue-border)}
    .badge-gray{background:var(--bg3);color:var(--text2);border:1px solid var(--border)}
    /* nav */
    .pub-nav{background:var(--bg);border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;padding:0 clamp(12px,3vw,40px)}
    .pub-nav-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:60px;gap:8px}
    .nav-links{display:flex;gap:2px;align-items:center;flex-wrap:wrap}
    .nav-link{background:none;border:none;color:var(--text2);font-size:13px;padding:6px 12px;border-radius:6px;font-weight:500;white-space:nowrap}
    .nav-link:hover{background:var(--bg2);color:var(--text)}
    .nav-link.active{background:var(--gold-bg);color:var(--gold);font-weight:600}
    /* mobile nav toggle */
    .mobile-menu{display:none;flex-direction:column;gap:18px;padding:16px;border-top:1px solid var(--border);background:var(--bg)}
    .mobile-menu.open{display:flex}
    /* notification */
    .notif{position:fixed;top:16px;right:16px;z-index:9999;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:500;max-width:340px;box-shadow:0 4px 12px rgba(0,0,0,.12);animation:slideIn .3s ease}
    @keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    .notif-success{background:var(--green-bg);color:var(--green);border:1px solid var(--green-border)}
    .notif-error{background:var(--red-bg);color:var(--red);border:1px solid var(--red-border)}
    /* hero */
    .hero{padding:clamp(40px,8vw,100px) clamp(16px,4vw,48px);max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr auto;gap:40px;align-items:center}
    @media(max-width:700px){.hero{grid-template-columns:1fr}.hero-visual{display:none}}
    .hero-stats{display:flex;gap:clamp(16px,4vw,40px);flex-wrap:wrap;margin-top:32px}
    /* feature cards */
    .feature-card{padding:24px;border-radius:12px;border:1px solid var(--border);background:var(--bg)}
    .feature-icon{width:44px;height:44px;border-radius:10px;background:var(--gold-bg);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:14px}
    /* gear steps */
    .step-bar{display:flex;align-items:center;gap:0;margin-bottom:32px;overflow-x:auto;padding-bottom:4px}
    .step-item{display:flex;align-items:center;gap:8px;flex-shrink:0}
    .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
    .step-dot.done{background:var(--green-bg);color:var(--green);border:2px solid var(--green-border)}
    .step-dot.active{background:var(--gold);color:#fff}
    .step-dot.pending{background:var(--bg3);color:var(--text3);border:1px solid var(--border)}
    .step-line{width:32px;height:2px;background:var(--border);flex-shrink:0}
    .step-line.done{background:var(--green-border)}
    /* admin sidebar */
    .admin-shell{display:flex;min-height:100vh}
    .admin-sidebar{width:220px;background:var(--bg);border-right:1px solid var(--border);padding:16px 0;flex-shrink:0;position:sticky;top:0;height:100vh;overflow-y:auto;display:flex;flex-direction:column}
    .admin-main{flex:1;padding:clamp(16px,3vw,32px);overflow-y:auto;max-height:100vh;background:var(--bg2)}
    @media(max-width:768px){.admin-shell{flex-direction:column}.admin-sidebar{width:100%;height:auto;position:static;flex-direction:row;flex-wrap:wrap;padding:8px;overflow-x:auto}.admin-sidebar-nav{display:flex;flex-direction:row;flex-wrap:wrap;gap:4px;width:100%}.admin-main{max-height:none}}
    .sidebar-nav-btn{display:flex;align-items:center;gap:10px;width:100%;padding:9px 16px;background:none;border:none;color:var(--text2);font-size:13px;text-align:left;border-radius:0;font-weight:500;border-left:3px solid transparent;transition:all .15s}
    .sidebar-nav-btn:hover{background:var(--bg2);color:var(--text)}
    .sidebar-nav-btn.active{background:var(--gold-bg);color:var(--gold);border-left-color:var(--gold);font-weight:600}
    @media(max-width:768px){.sidebar-nav-btn{border-radius:6px;border-left:none;padding:7px 12px;font-size:12px}.sidebar-nav-btn.active{border-left:none}}
    /* modal */
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:20px;overflow-y:auto}
    .modal-box{background:var(--bg);border:1px solid var(--border);border-radius:14px;width:100%;max-width:640px;padding:clamp(20px,3vw,32px);margin:auto}
    /* gear card */
    .gear-card{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:0;overflow:hidden;cursor:pointer;transition:border-color .2s,box-shadow .2s}
    .gear-card:hover{border-color:var(--gold);box-shadow:0 4px 16px rgba(184,134,11,.1)}
    .gear-card-img{background:var(--bg2);height:120px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--border)}
    .gear-card-body{padding:16px}
    /* stat card */
    .stat-card{background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:16px}
    /* alert boxes */
    .alert-error{background:var(--red-bg);border:1px solid var(--red-border);border-radius:8px;padding:12px 14px;margin-bottom:8px}
    .alert-warn{background:var(--yellow-bg);border:1px solid var(--yellow-border);border-radius:8px;padding:12px 14px;margin-bottom:8px}
    .alert-success{background:var(--green-bg);border:1px solid var(--green-border);border-radius:8px;padding:12px 14px;margin-bottom:8px}
    /* toggle */
    .toggle-wrap{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border:1px solid var(--border);border-radius:8px;background:var(--bg2)}
    .toggle-btn{width:40px;height:22px;border-radius:11px;border:none;position:relative;transition:background .2s;flex-shrink:0}
    .toggle-knob{position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
    /* calc display */
    .calc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px}
    .calc-item{background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px 12px}
    /* divider */
    .divider{height:1px;background:var(--border);margin:24px 0}
    /* page fade */
    .fade-in{animation:fadeIn .3s ease}
    @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
    /* scrollbar */
    ::-webkit-scrollbar{width:5px;height:5px}
    ::-webkit-scrollbar-thumb{background:var(--border2);border-radius:3px}
    /* overdue banner */
    .overdue-banner{background:var(--red-bg);border:1px solid var(--red-border);border-radius:8px;padding:12px 16px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
    /* gear svg */
    @keyframes gearSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    .spin{animation:gearSpin 8s linear infinite;transform-origin:center}
    /* ticker */
    @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
    .ticker-inner{display:flex;gap:32px;white-space:nowrap;animation:ticker 22s linear infinite}
    /* print invoice */
    .print-inv{background:#fff;color:#111}
    /* stripe */
    .section-alt{background:var(--bg2)}
    /* footer */
    footer{background:var(--bg);border-top:1px solid var(--border);padding:clamp(32px,5vw,60px) clamp(16px,4vw,48px) 24px}
    .footer-grid{display:grid;grid-template-columns:2fr repeat(3,1fr);gap:32px;margin-bottom:32px}
    @media(max-width:640px){.footer-grid{grid-template-columns:1fr 1fr}}
    @media(max-width:400px){.footer-grid{grid-template-columns:1fr}}
    .footer-label{font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px}
    .footer-link{display:block;font-size:13px;color:var(--text2);margin-bottom:7px;background:none;border:none;cursor:pointer;text-align:left;padding:0}
    .footer-link:hover{color:var(--gold)}
    /* cart badge */
    .cart-badge{position:absolute;top:-5px;right:-5px;background:var(--gold);color:#fff;border-radius:50%;width:17px;height:17px;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700}
    /* spacing utilities */
    .mb8{margin-bottom:8px}.mb12{margin-bottom:12px}.mb16{margin-bottom:16px}.mb20{margin-bottom:20px}.mb24{margin-bottom:24px}.mb32{margin-bottom:32px}
    .gap8{gap:8px}.gap12{gap:12px}.gap16{gap:16px}
    .flex{display:flex}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-between{justify-content:space-between}.flex-wrap{flex-wrap:wrap}
    .text-sm{font-size:12px}.text-xs{font-size:11px}.text-gold{color:var(--gold)}.text-muted{color:var(--text3)}.text-danger{color:var(--red)}.text-success{color:var(--green)}.fw600{font-weight:600}.fw700{font-weight:700}
    /* admin login */
    .admin-login-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg2);padding:16px}
    /* responsive table helpers */
    @media(max-width:600px){th:nth-child(n+5),td:nth-child(n+5){display:none}}
    @media(max-width:480px){th:nth-child(n+4),td:nth-child(n+4){display:none}}
  `}</style>
);

// ─── Gear SVG ────────────────────────────────────────────────────
function GearSVG({size=48,animate=false}){
  const r1=size*.38,r2=size*.26,r3=size*.1,cx=size/2,teeth=8;
  const pts=[];
  for(let i=0;i<teeth;i++){
    const a=((i*2*Math.PI)/teeth)-(Math.PI/(teeth));
    const b=a+(Math.PI/teeth)*.5;
    const c=b+(Math.PI/teeth)*.5;
    const d=c+(Math.PI/teeth)*.5;
    pts.push(`${cx+r1*Math.cos(a)},${cx+r1*Math.sin(a)}`);
    pts.push(`${cx+(r1+size*.08)*Math.cos(b)},${cx+(r1+size*.08)*Math.sin(b)}`);
    pts.push(`${cx+(r1+size*.08)*Math.cos(c)},${cx+(r1+size*.08)*Math.sin(c)}`);
    pts.push(`${cx+r1*Math.cos(d)},${cx+r1*Math.sin(d)}`);
  }
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      <g className={animate?"spin":""} style={animate?{transformOrigin:`${cx}px ${cx}px`}:{}}>
        <polygon points={pts.join(" ")} fill="#B8860B" opacity=".9"/>
        <circle cx={cx} cy={cx} r={r2} fill="var(--bg)"/>
        <circle cx={cx} cy={cx} r={r3} fill="#B8860B"/>
      </g>
    </svg>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("home");
  const [adminAuth,setAdminAuth]=useState(false);
  const [adminPage,setAdminPage]=useState("dashboard");
  const [notif,setNotif]=useState(null);
  const [cart,setCart]=useState([]);
  const [showCart,setShowCart]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const [standardGears,setStandardGears]=useState(STANDARD_GEARS_INITIAL);
  const [customers,setCustomers]=useState(SAMPLE_CUSTOMERS);
  const [invoices,setInvoices]=useState(SAMPLE_INVOICES);
  const [inventory,setInventory]=useState(INVENTORY_INITIAL);
  const [company,setCompany]=useState({name:"PrecisionGear India",email:"orders@precisiongear.in",phone:"+91 98765 43210",address:"Plot 45, Industrial Area Phase 2, Pune, Maharashtra 411019",gstin:"27AABCP9603R1ZX",adminPassword:"admin123"});
  const [customInquiries,setCustomInquiries]=useState([]);

  const notify=useCallback((msg,type="success")=>{
    setNotif({msg,type});
    setTimeout(()=>setNotif(null),4000);
  },[]);

  const addToCart=(item)=>{setCart(p=>[...p,{...item,cartId:Date.now()}]);notify(`${item.name} added to cart`);};
  const removeFromCart=(id)=>setCart(p=>p.filter(i=>i.cartId!==id));
  const overdueInvoices=invoices.filter(inv=>inv.paymentType==="credit"&&inv.status!=="paid"&&new Date(inv.dueDate)<new Date());

  const navTo=(p)=>{setPage(p);setMenuOpen(false);};

  return(
    <div>
      <G/>
      {notif&&<div className={`notif notif-${notif.type}`}>{notif.msg}</div>}

      {page==="admin"&&!adminAuth?(
        <AdminLogin company={company} onLogin={()=>{setAdminAuth(true);notify("Welcome, Admin");}}/>
      ):page==="admin"&&adminAuth?(
        <AdminDashboard
          page={adminPage} setPage={setAdminPage}
          standardGears={standardGears} setStandardGears={setStandardGears}
          customers={customers} setCustomers={setCustomers}
          invoices={invoices} setInvoices={setInvoices}
          inventory={inventory} setInventory={setInventory}
          company={company} setCompany={setCompany}
          customInquiries={customInquiries}
          overdueInvoices={overdueInvoices}
          notify={notify}
          onLogout={()=>{setAdminAuth(false);setPage("home");notify("Logged out");}}
        />
      ):(
        <>
          {/* NAV */}
          <nav className="pub-nav">
            <div className="pub-nav-inner">
              <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",flexShrink:0}} onClick={()=>navTo("home")}>
                <GearSVG size={36}/>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:"var(--gold)",lineHeight:1.1}}>PrecisionGear</div>
                  <div style={{fontSize:9,color:"var(--text3)",letterSpacing:".1em",lineHeight:1}}>INDIA</div>
                </div>
              </div>
              {/* Desktop links */}
              <div className="nav-links" style={{display:"flex"}} id="desktop-nav">
                {[["home","Home"],["custom","Custom Gears"],["standard","Catalog"],["contact","Contact"]].map(([id,lbl])=>(
                  <button key={id} className={`nav-link${page===id?" active":""}`} onClick={()=>navTo(id)}>{lbl}</button>
                ))}
                <div style={{position:"relative",marginLeft:4}}>
                  <button className="btn-secondary btn-sm" onClick={()=>setShowCart(true)} style={{display:"flex",alignItems:"center",gap:6}}>
                    🛒{cart.length>0&&<span className="cart-badge" style={{position:"static",width:"auto",height:"auto",borderRadius:"10px",padding:"1px 5px"}}>{cart.length}</span>}
                  </button>
                </div>
                <button className="btn-primary btn-sm" style={{marginLeft:4}} onClick={()=>navTo("register")}>Register</button>
                <button className="btn-icon" onClick={()=>navTo("admin")}>⚙</button>
              </div>
              {/* Mobile hamburger */}
              <button className="btn-icon" style={{fontSize:20,padding:"6px 8px"}} onClick={()=>setMenuOpen(o=>!o)}>☰</button>
            </div>
            {/* Mobile menu */}
            <div className={`mobile-menu${menuOpen?" open":""}`}>
              {[["home","Home"],["custom","Custom Gears"],["standard","Catalog"],["contact","Contact"],["register","Register"]].map(([id,lbl])=>(
                <button key={id} className={`nav-link${page===id?" active":""}`} style={{textAlign:"left",fontSize:15,padding:"10px 4px"}} onClick={()=>navTo(id)}>{lbl}</button>
              ))}
              <div style={{display:"flex",gap:8}}>
                <button className="btn-secondary" onClick={()=>{setShowCart(true);setMenuOpen(false);}}>🛒 Cart ({cart.length})</button>
                <button className="btn-icon" onClick={()=>navTo("admin")} style={{border:"1px solid var(--border)",borderRadius:6}}>Admin ⚙</button>
              </div>
            </div>
          </nav>

          {page==="home"&&<HomePage setPage={navTo}/>}
          {page==="custom"&&<CustomGearPage notify={notify} company={company} setCustomInquiries={setCustomInquiries}/>}
          {page==="standard"&&<StandardGearsPage gears={standardGears} addToCart={addToCart} notify={notify}/>}
          {page==="contact"&&<ContactPage company={company} notify={notify}/>}
          {page==="register"&&<CustomerRegisterPage customers={customers} setCustomers={setCustomers} setPage={navTo} notify={notify}/>}

          <PublicFooter company={company} setPage={navTo}/>
          {showCart&&<CartModal cart={cart} removeFromCart={removeFromCart} onClose={()=>setShowCart(false)} notify={notify} customers={customers} setInvoices={setInvoices} company={company}/>}
        </>
      )}
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────
function HomePage({setPage}){
  const features=[
    {icon:"⚙️",title:"Custom Gear Design",desc:"Submit precise specs and our engineers validate your design with real-time calculations."},
    {icon:"📦",title:"Standard Gear Catalog",desc:"Ready-stock gears with tier pricing. More you order, more you save."},
    {icon:"🔬",title:"ISO Certified Quality",desc:"Every gear manufactured to AGMA/DIN/ISO standards with full traceability."},
    {icon:"🌍",title:"Global Delivery",desc:"Shipping to 40+ countries. Multi-currency invoicing. GST & VAT compliant."},
    {icon:"⚡",title:"Fast Turnaround",desc:"Standard gears ship in 3–5 days. Custom gears in 10–21 days."},
    {icon:"🛡️",title:"Engineering Support",desc:"Free design review with every custom order. We catch errors before manufacturing."},
  ];
  return(
    <div className="fade-in">
      {/* HERO */}
      <div style={{background:"var(--bg)",borderBottom:"1px solid var(--border)"}}>
        <div className="hero">
          <div>
            <div style={{fontSize:11,fontWeight:700,color:"var(--gold)",letterSpacing:".12em",textTransform:"uppercase",marginBottom:12}}>Precision Engineering Since 1998</div>
            <h1 style={{marginBottom:16}}>Gears That Drive<br/><span style={{color:"var(--gold)"}}>the World</span> Forward</h1>
            <p style={{fontSize:16,maxWidth:460,marginBottom:28,lineHeight:1.7}}>From precision custom-designed gears to ready-stock standard gears — ISO-certified power transmission solutions to industries worldwide.</p>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              <button className="btn-primary" style={{padding:"12px 24px",fontSize:15}} onClick={()=>setPage("custom")}>Design Custom Gear →</button>
              <button className="btn-secondary" style={{padding:"12px 24px",fontSize:15}} onClick={()=>setPage("standard")}>Browse Catalog</button>
            </div>
            <div className="hero-stats">
              {[["500+","Gear Variants"],["25+","Years Exp."],["40+","Countries"],["ISO","9001 Certified"]].map(([n,l])=>(
                <div key={l}><div style={{fontSize:22,fontWeight:700,color:"var(--gold)"}}>{n}</div><div style={{fontSize:11,color:"var(--text3)",fontWeight:500}}>{l}</div></div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <GearSVG size={180} animate/>
          </div>
        </div>
      </div>
      {/* TICKER */}
      <div style={{background:"var(--bg2)",borderBottom:"1px solid var(--border)",padding:"12px 0",overflow:"hidden"}}>
        <div className="ticker-inner">
          {["Spur Gears","Helical Gears","Bevel Gears","Worm Gears","Rack & Pinion","Planetary Gears","Ring Gears","Hypoid Gears","Spur Gears","Helical Gears","Bevel Gears","Worm Gears","Rack & Pinion","Planetary Gears","Ring Gears","Hypoid Gears"].map((t,i)=>(
            <span key={i} style={{fontSize:12,color:"var(--text3)",fontWeight:600,letterSpacing:".08em"}}>◆ {t.toUpperCase()}</span>
          ))}
        </div>
      </div>
      {/* FEATURES */}
      <div className="section">
        <div className="container">
          <div style={{marginBottom:32,textAlign:"center"}}>
            <h2 style={{marginBottom:8}}>Why Choose PrecisionGear</h2>
            <p>Industry-leading precision, quality, and support</p>
          </div>
          <div className="grid2">
            {features.map(f=>(
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 style={{marginBottom:6}}>{f.title}</h3>
                <p style={{fontSize:14,lineHeight:1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* CTA */}
      <div style={{background:"var(--gold-bg)",borderTop:"1px solid #E8D49A",padding:"clamp(32px,6vw,64px) clamp(16px,4vw,48px)",textAlign:"center"}}>
        <h2 style={{marginBottom:10}}>Ready to Get Started?</h2>
        <p style={{marginBottom:28}}>Tell us your requirements and we'll engineer the perfect solution.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
          <button className="btn-primary" style={{padding:"12px 28px",fontSize:15}} onClick={()=>setPage("custom")}>Start Custom Design</button>
          <button className="btn-secondary" style={{padding:"12px 28px",fontSize:15}} onClick={()=>setPage("contact")}>Talk to an Engineer</button>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOM GEAR PAGE ─────────────────────────────────────────────
function CustomGearPage({notify,company,setCustomInquiries}){
  const [step,setStep]=useState(1);
  const emptyGear={gearType:"",module:"",teeth:"",pressureAngle:"",faceWidth:"",boreDia:"",shaftDia:"",helixAngle:"",material:"",heatTreatment:"None",surfaceFinish:"Machined",qualityGrade:"AGMA 7 (Precision)",qty:1,rpm:"",power:"",safetyFactor:1.5,tolerance:"",additionalNotes:""};
  const [gearData,setGearData]=useState(emptyGear);
  const [custData,setCustData]=useState({name:"",company:"",email:"",phone:"",country:"India"});
  const [validation,setValidation]=useState({errors:[],warnings:[],isValid:true});
  const [submitted,setSubmitted]=useState(false);
  const [submitting,setSubmitting]=useState(false);

  const handleGearChange=(field,val)=>{
    const u={...gearData,[field]:val};
    setGearData(u);
    if(step===1){const v=validateGearDesign(u);setValidation(v);}
  };
  const handleSubmit=async()=>{
    const v=validateGearDesign(gearData);
    if(!v.isValid){setValidation(v);setStep(1);notify("Fix gear errors first","error");return;}
    if(!custData.name||!custData.email){notify("Name and email required","error");return;}
    setSubmitting(true);
    await new Promise(r=>setTimeout(r,1200));
    const inq={id:`CG-${Date.now()}`,...gearData,...custData,date:new Date().toISOString(),status:"New"};
    setCustomInquiries(p=>[inq,...p]);
    setSubmitted(true);setSubmitting(false);
    notify("Inquiry submitted! Response within 24h.");
  };

  const pitchDia=(!isNaN(parseFloat(gearData.module))&&!isNaN(parseInt(gearData.teeth)))?parseFloat(gearData.module)*parseInt(gearData.teeth):null;

  if(submitted) return(
    <div style={{maxWidth:500,margin:"0 auto",padding:"clamp(32px,6vw,80px) 16px",textAlign:"center"}} className="fade-in">
      <div style={{fontSize:56,marginBottom:20}}>✅</div>
      <h2 style={{marginBottom:12}}>Inquiry Submitted!</h2>
      <p style={{marginBottom:28}}>Sent to <strong style={{color:"var(--gold)"}}>{company.email}</strong>. Our engineers respond within 24 hours.</p>
      <button className="btn-primary" onClick={()=>{setSubmitted(false);setStep(1);setGearData(emptyGear);}}>Submit Another</button>
    </div>
  );

  return(
    <div style={{maxWidth:800,margin:"0 auto",padding:"clamp(24px,4vw,60px) clamp(16px,3vw,32px)"}} className="fade-in">
      <div className="mb24">
        <div style={{fontSize:11,fontWeight:700,color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>Custom Gear Design</div>
        <h1 style={{marginBottom:6}}>Design Your Custom Gear</h1>
        <p>Real-time engineering validation as you type.</p>
      </div>
      {/* Step bar */}
      <div className="step-bar mb24">
        {["Gear Specs","Application","Your Details"].map((s,i)=>(
          <div key={s} className="step-item">
            <div className={`step-dot ${step>i+1?"done":step===i+1?"active":"pending"}`}>{step>i+1?"✓":i+1}</div>
            <span style={{fontSize:12,fontWeight:step===i+1?600:400,color:step===i+1?"var(--gold)":"var(--text3)",whiteSpace:"nowrap"}}>{s}</span>
            {i<2&&<div className={`step-line${step>i+1?" done":""}`}/>}
          </div>
        ))}
      </div>

      {step===1&&(
        <div className="card fade-in">
          <h3 className="mb20">Gear Geometry & Material</h3>
          <div className="form-row-3 mb16">
            <div><label>Gear Type *</label><select value={gearData.gearType} onChange={e=>handleGearChange("gearType",e.target.value)}><option value="">— Select —</option>{GEAR_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
            <div><label>Module (m) *</label><input type="number" step="0.5" min="0.5" placeholder="e.g. 2" value={gearData.module} onChange={e=>handleGearChange("module",e.target.value)}/></div>
            <div><label>Number of Teeth *</label><input type="number" min="6" placeholder="e.g. 30" value={gearData.teeth} onChange={e=>handleGearChange("teeth",e.target.value)}/></div>
            <div><label>Pressure Angle *</label><select value={gearData.pressureAngle} onChange={e=>handleGearChange("pressureAngle",e.target.value)}><option value="">— Select —</option>{PRESSURE_ANGLES.map(p=><option key={p}>{p}°</option>)}</select></div>
            <div><label>Face Width (mm) *</label><input type="number" placeholder="e.g. 30" value={gearData.faceWidth} onChange={e=>handleGearChange("faceWidth",e.target.value)}/></div>
            <div><label>Bore Diameter (mm) *</label><input type="number" placeholder="e.g. 14" value={gearData.boreDia} onChange={e=>handleGearChange("boreDia",e.target.value)}/></div>
            <div><label>Shaft Diameter (mm)</label><input type="number" placeholder="e.g. 12" value={gearData.shaftDia} onChange={e=>handleGearChange("shaftDia",e.target.value)}/></div>
            {gearData.gearType==="Helical"&&<div><label>Helix Angle (°) *</label><input type="number" placeholder="e.g. 20" value={gearData.helixAngle} onChange={e=>handleGearChange("helixAngle",e.target.value)}/></div>}
            <div><label>Material *</label><select value={gearData.material} onChange={e=>handleGearChange("material",e.target.value)}><option value="">— Select —</option>{MATERIALS.map(m=><option key={m}>{m}</option>)}</select></div>
            <div><label>Heat Treatment</label><select value={gearData.heatTreatment} onChange={e=>handleGearChange("heatTreatment",e.target.value)}>{HEAT_TREATMENTS.map(h=><option key={h}>{h}</option>)}</select></div>
            <div><label>Surface Finish</label><select value={gearData.surfaceFinish} onChange={e=>handleGearChange("surfaceFinish",e.target.value)}>{SURFACE_FINISHES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label>Quality Grade</label><select value={gearData.qualityGrade} onChange={e=>handleGearChange("qualityGrade",e.target.value)}>{QUALITY_GRADES.map(q=><option key={q}>{q}</option>)}</select></div>
            <div><label>Quantity</label><input type="number" min="1" value={gearData.qty} onChange={e=>handleGearChange("qty",e.target.value)}/></div>
          </div>

          {/* Validation */}
          {validation.errors.length>0&&(
            <div className="mb16">
              <div style={{fontSize:13,fontWeight:600,color:"var(--red)",marginBottom:8}}>⛔ {validation.errors.length} Error{validation.errors.length>1?"s":""} — Fix before proceeding</div>
              {validation.errors.map((e,i)=>(
                <div key={i} className="alert-error">
                  <div style={{fontSize:11,fontWeight:700,color:"var(--red)",marginBottom:2}}>{e.field.toUpperCase()}</div>
                  <div style={{fontSize:13,color:"var(--red)"}}>{e.message}</div>
                </div>
              ))}
            </div>
          )}
          {validation.warnings.length>0&&(
            <div className="mb16">
              {validation.warnings.map((w,i)=>(
                <div key={i} className="alert-warn">
                  <div style={{fontSize:11,fontWeight:700,color:"var(--yellow)",marginBottom:2}}>⚠ {w.field.toUpperCase()}</div>
                  <div style={{fontSize:13,color:"var(--yellow)"}}>{w.message}</div>
                </div>
              ))}
            </div>
          )}
          {validation.isValid&&gearData.gearType&&gearData.module&&gearData.teeth&&(
            <div className="alert-success mb16"><span style={{fontSize:13,color:"var(--green)"}}>✅ Specifications valid and manufacturable</span></div>
          )}

          {/* Calc dims */}
          {pitchDia&&(
            <div className="mb16">
              <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>Calculated Dimensions</div>
              <div className="calc-grid">
                {[
                  ["Pitch Dia",`${pitchDia.toFixed(2)} mm`],
                  ["Addendum Dia",`${(pitchDia+2*parseFloat(gearData.module)).toFixed(2)} mm`],
                  ["Dedendum Dia",`${(pitchDia-2.5*parseFloat(gearData.module)).toFixed(2)} mm`],
                  ["Circular Pitch",`${(Math.PI*parseFloat(gearData.module)).toFixed(3)} mm`],
                ].map(([k,v])=>(
                  <div key={k} className="calc-item">
                    <div style={{fontSize:10,color:"var(--text3)",marginBottom:2}}>{k}</div>
                    <div style={{fontSize:14,fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <button className="btn-primary" onClick={()=>{const v=validateGearDesign(gearData);setValidation(v);if(v.isValid)setStep(2);else notify("Fix errors first","error");}}>Next →</button>
          </div>
        </div>
      )}

      {step===2&&(
        <div className="card fade-in">
          <h3 className="mb20">Application & Load Data</h3>
          <div className="form-row mb16">
            <div><label>Operating Speed (RPM)</label><input type="number" placeholder="e.g. 1450" value={gearData.rpm} onChange={e=>handleGearChange("rpm",e.target.value)}/></div>
            <div><label>Transmitted Power (kW)</label><input type="number" step="0.1" placeholder="e.g. 5.5" value={gearData.power} onChange={e=>handleGearChange("power",e.target.value)}/></div>
            <div><label>Safety Factor</label><input type="number" step="0.1" min="1" value={gearData.safetyFactor} onChange={e=>handleGearChange("safetyFactor",e.target.value)}/></div>
            <div><label>Tolerance / Fit Class</label><input placeholder="e.g. H7/k6" value={gearData.tolerance} onChange={e=>handleGearChange("tolerance",e.target.value)}/></div>
          </div>
          <div className="mb16"><label>Additional Notes</label><textarea rows={3} placeholder="Mounting requirements, environmental conditions, special coatings, drawing reference..." value={gearData.additionalNotes} onChange={e=>handleGearChange("additionalNotes",e.target.value)}/></div>
          <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
            <button className="btn-secondary" onClick={()=>setStep(1)}>← Back</button>
            <button className="btn-primary" onClick={()=>setStep(3)}>Next →</button>
          </div>
        </div>
      )}

      {step===3&&(
        <div className="card fade-in">
          <h3 className="mb20">Your Contact Details</h3>
          <div className="form-row mb20">
            <div><label>Full Name *</label><input placeholder="John Smith" value={custData.name} onChange={e=>setCustData(p=>({...p,name:e.target.value}))}/></div>
            <div><label>Company</label><input placeholder="ABC Manufacturing" value={custData.company} onChange={e=>setCustData(p=>({...p,company:e.target.value}))}/></div>
            <div><label>Email *</label><input type="email" placeholder="you@company.com" value={custData.email} onChange={e=>setCustData(p=>({...p,email:e.target.value}))}/></div>
            <div><label>Phone</label><input placeholder="+91 98765 43210" value={custData.phone} onChange={e=>setCustData(p=>({...p,phone:e.target.value}))}/></div>
            <div><label>Country</label><input placeholder="India" value={custData.country} onChange={e=>setCustData(p=>({...p,country:e.target.value}))}/></div>
          </div>
          <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,padding:16,marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:10,textTransform:"uppercase"}}>Inquiry Summary</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8,fontSize:13}}>
              {[["Gear Type",gearData.gearType||"—"],["Module × Teeth",`${gearData.module}×${gearData.teeth}`],["Material",gearData.material||"—"],["Quantity",gearData.qty],["Pitch Dia",pitchDia?`${pitchDia.toFixed(1)} mm`:"—"],["Grade",gearData.qualityGrade.split(" ")[0]]].map(([k,v])=>(
                <div key={k}><span style={{color:"var(--text3)"}}>{k}: </span><span style={{fontWeight:600}}>{v}</span></div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <button className="btn-secondary" onClick={()=>setStep(2)}>← Back</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{opacity:submitting?.7:1}}>
              {submitting?"Sending...":"Submit Inquiry →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STANDARD GEARS PAGE ──────────────────────────────────────────
function StandardGearsPage({gears,addToCart,notify}){
  const [selected,setSelected]=useState(null);
  const [qty,setQty]=useState(1);
  const [filter,setFilter]=useState("");
  const filtered=gears.filter(g=>g.name.toLowerCase().includes(filter.toLowerCase())||g.type.toLowerCase().includes(filter.toLowerCase()));
  return(
    <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(24px,4vw,60px) clamp(16px,3vw,32px)"}} className="fade-in">
      <div className="mb32">
        <div style={{fontSize:11,fontWeight:700,color:"var(--gold)",letterSpacing:".1em",textTransform:"uppercase",marginBottom:6}}>Standard Gear Catalog</div>
        <h1 style={{marginBottom:6}}>Ready-Stock Gears</h1>
        <p>Volume discounts applied automatically. All prices in INR.</p>
      </div>
      <input placeholder="🔍 Search by name or type..." value={filter} onChange={e=>setFilter(e.target.value)} style={{maxWidth:380,marginBottom:28}}/>
      <div className="grid3" style={{gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))"}}>
        {filtered.map(gear=>(
          <div key={gear.id} className="gear-card" onClick={()=>{setSelected(gear);setQty(1);}}>
            <div className="gear-card-img"><GearSVG size={64}/></div>
            <div className="gear-card-body">
              <div style={{fontSize:10,fontWeight:700,color:"var(--gold)",letterSpacing:".08em",textTransform:"uppercase",marginBottom:4}}>{gear.type}</div>
              <div style={{fontWeight:600,fontSize:15,marginBottom:6}}>{gear.name}</div>
              <div style={{fontSize:11,color:"var(--text3)",marginBottom:12}}>M{gear.module} · Z{gear.teeth} · Ø{gear.boreDia}mm · {gear.material}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div><span style={{fontSize:18,fontWeight:700,color:"var(--gold)"}}>₹{gear.pricing[0].price}</span><span style={{fontSize:11,color:"var(--text3)"}}>/pc</span></div>
                <span className={`badge ${gear.stock>50?"badge-green":gear.stock>10?"badge-yellow":"badge-red"}`}>{gear.stock>0?`${gear.stock} in stock`:"Out of stock"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="modal-box">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h2 style={{fontSize:18}}>{selected.name}</h2>
              <button className="btn-icon" onClick={()=>setSelected(null)} style={{fontSize:18}}>✕</button>
            </div>
            <div style={{background:"var(--bg2)",borderRadius:8,height:120,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16,border:"1px solid var(--border)"}}>
              <GearSVG size={72} animate/>
            </div>
            <div className="grid3" style={{marginBottom:16}}>
              {[["Type",selected.type],["Module",`M${selected.module}`],["Teeth",selected.teeth],["Bore Dia",`${selected.boreDia}mm`],["Material",selected.material],["Stock",`${selected.stock} pcs`]].map(([k,v])=>(
                <div key={k} className="card-sm">
                  <div style={{fontSize:10,color:"var(--text3)",marginBottom:2}}>{k}</div>
                  <div style={{fontWeight:600,fontSize:13}}>{v}</div>
                </div>
              ))}
            </div>
            {/* Tier pricing */}
            <div className="mb16">
              <div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:8,textTransform:"uppercase"}}>Tier Pricing (₹ per piece)</div>
              <div className="tbl-wrap">
                <table style={{minWidth:"auto"}}>
                  <thead><tr><th>Min Qty</th><th>Max Qty</th><th>Price/pc</th><th>Savings</th></tr></thead>
                  <tbody>
                    {selected.pricing.map((tier,i)=>(
                      <tr key={i} style={{background:qty>=tier.minQty&&qty<=tier.maxQty?"var(--gold-bg)":"transparent"}}>
                        <td>{tier.minQty}</td>
                        <td>{tier.maxQty>=999?"100+":tier.maxQty}</td>
                        <td style={{fontWeight:700,color:"var(--gold)"}}>₹{tier.price}</td>
                        <td style={{color:"var(--green)",fontSize:12}}>{i===0?"—":`-${Math.round((1-tier.price/selected.pricing[0].price)*100)}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"flex-end",marginBottom:16,flexWrap:"wrap"}}>
              <div style={{flex:1,minWidth:100}}>
                <label>Quantity</label>
                <input type="number" min="1" max={selected.stock} value={qty} onChange={e=>setQty(Math.max(1,parseInt(e.target.value)||1))}/>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"var(--text3)"}}>Total</div>
                <div style={{fontSize:22,fontWeight:700,color:"var(--gold)"}}>₹{(getPriceForQty(selected.pricing,qty)*qty).toLocaleString()}</div>
              </div>
            </div>
            <button className="btn-primary" style={{width:"100%",padding:"12px",fontSize:15}} onClick={()=>{addToCart({...selected,qty,unitPrice:getPriceForQty(selected.pricing,qty),total:getPriceForQty(selected.pricing,qty)*qty});setSelected(null);}}>
              Add to Cart — ₹{(getPriceForQty(selected.pricing,qty)*qty).toLocaleString()}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CART MODAL ────────────────────────────────────────────────────
function CartModal({cart,removeFromCart,onClose,notify,customers,setInvoices,company}){
  const [custId,setCustId]=useState("");
  const [payType,setPayType]=useState("cash");
  const [dueDate,setDueDate]=useState("");
  const total=cart.reduce((s,i)=>s+i.total,0);
  const customer=customers.find(c=>c.id===custId);
  const handleCheckout=()=>{
    if(!custId){notify("Select a customer","error");return;}
    if(payType==="credit"&&!dueDate){notify("Enter due date","error");return;}
    const inv={id:`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,customerId:custId,date:new Date().toISOString().split("T")[0],dueDate:payType==="credit"?dueDate:null,items:cart.map(i=>({name:i.name,qty:i.qty,unitPrice:i.unitPrice,tax:customer?.taxRate||0})),currency:customer?.currency||"INR",paymentType:payType,status:payType==="cash"?"paid":"pending",total:total*(1+(customer?.taxRate||0)/100)};
    setInvoices(p=>[inv,...p]);
    notify("Order placed! Invoice generated.");
    onClose();
  };
  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box">
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
          <h2 style={{fontSize:18}}>Your Cart</h2>
          <button className="btn-icon" onClick={onClose} style={{fontSize:18}}>✕</button>
        </div>
        {cart.length===0?<p style={{textAlign:"center",padding:"40px 0",color:"var(--text3)"}}>Cart is empty.</p>:(
          <>
            {cart.map(item=>(
              <div key={item.cartId} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)",gap:8}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name}</div>
                  <div style={{fontSize:12,color:"var(--text3)"}}>Qty: {item.qty} × ₹{item.unitPrice}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                  <span style={{fontWeight:700}}>₹{item.total.toLocaleString()}</span>
                  <button className="btn-danger btn-sm" onClick={()=>removeFromCart(item.cartId)}>✕</button>
                </div>
              </div>
            ))}
            <div className="mb12 mt16" style={{marginTop:16}}>
              <label>Customer</label>
              <select value={custId} onChange={e=>setCustId(e.target.value)}><option value="">— Select Customer —</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} ({c.currency})</option>)}</select>
            </div>
            <div className="mb12">
              <label>Payment Type</label>
              <select value={payType} onChange={e=>setPayType(e.target.value)}><option value="cash">Cash / Immediate</option><option value="credit">Credit (Pay Later)</option></select>
            </div>
            {payType==="credit"&&<div className="mb12"><label>Due Date *</label><input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} min={new Date().toISOString().split("T")[0]}/></div>}
            <div style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderTop:"1px solid var(--border)",fontWeight:700,marginTop:4}}>
              <span>Subtotal</span><span>₹{total.toLocaleString()}</span>
            </div>
            {customer?.taxEnabled&&<div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"var(--text3)",marginBottom:12}}><span>{customer.taxType} {customer.taxRate}%</span><span>₹{(total*customer.taxRate/100).toLocaleString()}</span></div>}
            <button className="btn-primary" style={{width:"100%",padding:"12px"}} onClick={handleCheckout}>Place Order & Generate Invoice</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CUSTOMER REGISTER ─────────────────────────────────────────────
function CustomerRegisterPage({customers,setCustomers,setPage,notify}){
  const [form,setForm]=useState({name:"",company:"",email:"",phone:"",address:"",country:"India",currency:"INR",taxEnabled:true,taxType:"GST",taxRate:18,gstNumber:"",creditAllowed:false,password:""});
  const [submitted,setSubmitted]=useState(false);
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const handleSubmit=()=>{
    if(!form.name||!form.email||!form.phone){notify("Name, email and phone required","error");return;}
    setCustomers(p=>[...p,{...form,id:`C${String(customers.length+1).padStart(3,"0")}`}]);
    setSubmitted(true);notify("Registration successful!");
  };
  if(submitted) return(
    <div style={{maxWidth:480,margin:"0 auto",padding:"clamp(32px,6vw,80px) 16px",textAlign:"center"}} className="fade-in">
      <div style={{fontSize:56,marginBottom:20}}>🎉</div>
      <h2 style={{marginBottom:12}}>Registration Complete!</h2>
      <p style={{marginBottom:28}}>Your account is created. Start browsing gears.</p>
      <button className="btn-primary" onClick={()=>setPage("standard")}>Browse Standard Gears</button>
    </div>
  );
  return(
    <div style={{maxWidth:680,margin:"0 auto",padding:"clamp(24px,4vw,60px) clamp(16px,3vw,24px)"}} className="fade-in">
      <h1 style={{marginBottom:6}}>Create Account</h1>
      <p style={{marginBottom:28}}>Register to access pricing, track orders and invoices.</p>
      <div className="card">
        <h3 style={{marginBottom:16,color:"var(--gold)"}}>Personal & Company Details</h3>
        <div className="form-row mb20">
          <div><label>Full Name *</label><input placeholder="John Smith" value={form.name} onChange={e=>s("name",e.target.value)}/></div>
          <div><label>Company</label><input placeholder="ABC Pvt Ltd" value={form.company} onChange={e=>s("company",e.target.value)}/></div>
          <div><label>Email *</label><input type="email" placeholder="you@company.com" value={form.email} onChange={e=>s("email",e.target.value)}/></div>
          <div><label>Phone *</label><input placeholder="+91 98765 43210" value={form.phone} onChange={e=>s("phone",e.target.value)}/></div>
          <div><label>Country</label><input placeholder="India" value={form.country} onChange={e=>s("country",e.target.value)}/></div>
          <div><label>Currency</label><select value={form.currency} onChange={e=>s("currency",e.target.value)}>{CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}</select></div>
        </div>
        <h3 style={{marginBottom:14,color:"var(--gold)"}}>Tax & Invoice Settings</h3>
        <div className="toggle-wrap mb12">
          <div><div style={{fontSize:13,fontWeight:600}}>Enable Taxation</div><div style={{fontSize:11,color:"var(--text3)"}}>GST/VAT on invoices</div></div>
          <button className="toggle-btn" style={{background:form.taxEnabled?"var(--gold)":"var(--border2)"}} onClick={()=>s("taxEnabled",!form.taxEnabled)}>
            <div className="toggle-knob" style={{left:form.taxEnabled?20:3}}/>
          </button>
        </div>
        {form.taxEnabled&&(
          <div className="form-row mb12">
            <div><label>Tax Type</label><select value={form.taxType} onChange={e=>s("taxType",e.target.value)}>{Object.entries(TAX_TYPES).filter(([k])=>k!=="NONE").map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select></div>
            <div><label>Tax Rate</label><select value={form.taxRate} onChange={e=>s("taxRate",parseFloat(e.target.value))}>{(TAX_TYPES[form.taxType]?.rates||[18]).map(r=><option key={r} value={r}>{r}%</option>)}</select></div>
            <div><label>GST/VAT Number</label><input placeholder="27AABCU9603R1ZX" value={form.gstNumber} onChange={e=>s("gstNumber",e.target.value)}/></div>
          </div>
        )}
        <div className="toggle-wrap mb20">
          <div><div style={{fontSize:13,fontWeight:600}}>Allow Credit Transactions</div><div style={{fontSize:11,color:"var(--text3)"}}>Buy now, pay later</div></div>
          <button className="toggle-btn" style={{background:form.creditAllowed?"var(--gold)":"var(--border2)"}} onClick={()=>s("creditAllowed",!form.creditAllowed)}>
            <div className="toggle-knob" style={{left:form.creditAllowed?20:3}}/>
          </button>
        </div>
        <div className="mb20"><label>Password</label><input type="password" placeholder="Create a password" value={form.password} onChange={e=>s("password",e.target.value)}/></div>
        <button className="btn-primary" style={{width:"100%",padding:"12px",fontSize:15}} onClick={handleSubmit}>Create Account →</button>
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────
function ContactPage({company,notify}){
  const [form,setForm]=useState({name:"",email:"",message:""});
  return(
    <div style={{maxWidth:860,margin:"0 auto",padding:"clamp(24px,4vw,60px) clamp(16px,3vw,24px)"}} className="fade-in">
      <h1 style={{marginBottom:6}}>Get in Touch</h1>
      <p style={{marginBottom:32}}>Our engineers are ready to help with your gear requirements.</p>
      <div className="grid2" style={{gap:28}}>
        <div className="card">
          <h3 style={{marginBottom:18}}>Send a Message</h3>
          <div className="mb12"><label>Name</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
          <div className="mb12"><label>Email</label><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
          <div className="mb16"><label>Message</label><textarea rows={4} value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))}/></div>
          <button className="btn-primary" style={{width:"100%"}} onClick={()=>{if(!form.name||!form.email||!form.message){notify("All fields required","error");return;}notify("Message sent! We'll respond within 24h.");setForm({name:"",email:"",message:""});}}>Send Message</button>
        </div>
        <div>
          <h3 style={{marginBottom:20}}>Contact Information</h3>
          {[["📍","Address",company.address],["📧","Email",company.email],["📞","Phone",company.phone],["🏢","GSTIN",company.gstin]].map(([icon,label,value])=>(
            <div key={label} style={{display:"flex",gap:14,marginBottom:20}}>
              <div style={{fontSize:20,flexShrink:0,marginTop:2}}>{icon}</div>
              <div><div style={{fontSize:11,fontWeight:700,color:"var(--text3)",marginBottom:2,textTransform:"uppercase"}}>{label}</div><div style={{fontSize:13,color:"var(--text)"}}>{value}</div></div>
            </div>
          ))}
          <div style={{background:"var(--gold-bg)",border:"1px solid #E8D49A",borderRadius:8,padding:16,marginTop:8}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:6}}>Business Hours</div>
            <div style={{fontSize:13,color:"var(--text2)"}}>Mon – Sat: 9:00 AM – 6:00 PM IST</div>
            <div style={{fontSize:13,color:"var(--text2)"}}>Sunday: Closed</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FOOTER ────────────────────────────────────────────────────────
function PublicFooter({company,setPage}){
  return(
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><GearSVG size={26}/><span style={{fontSize:15,fontWeight:700,color:"var(--gold)"}}>PrecisionGear India</span></div>
            <p style={{fontSize:12,lineHeight:1.65,maxWidth:260}}>Leading manufacturer of custom and standard gears. ISO 9001 certified. Serving industries globally since 1998.</p>
          </div>
          <div>
            <div className="footer-label">Products</div>
            {["Custom Gears","Standard Gears","Spur Gears","Bevel Gears"].map(l=><button key={l} className="footer-link" onClick={()=>setPage(l.includes("Custom")?"custom":"standard")}>{l}</button>)}
          </div>
          <div>
            <div className="footer-label">Company</div>
            {["About Us","Quality Policy","Contact Us","Register"].map(l=><button key={l} className="footer-link" onClick={()=>setPage(l==="Contact Us"?"contact":"register")}>{l}</button>)}
          </div>
          <div>
            <div className="footer-label">Contact</div>
            <div style={{fontSize:12,color:"var(--text2)",lineHeight:1.7}}>{company.email}<br/>{company.phone}<br/>{company.address}</div>
          </div>
        </div>
        <div style={{borderTop:"1px solid var(--border)",paddingTop:20,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,fontSize:11,color:"var(--text3)"}}>
          <span>© {new Date().getFullYear()} PrecisionGear India. All rights reserved.</span>
          <span>GSTIN: {company.gstin}</span>
        </div>
      </div>
    </footer>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────
function AdminLogin({company,onLogin}){
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  return(
    <div className="admin-login-wrap">
      <div className="card" style={{width:"100%",maxWidth:360}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <GearSVG size={48} animate/>
          <h2 style={{marginTop:12,marginBottom:4}}>Admin Login</h2>
          <p style={{fontSize:13}}>PrecisionGear India</p>
        </div>
        {err&&<div className="alert-error mb12" style={{fontSize:13}}>{err}</div>}
        <div className="mb16"><label>Admin Password</label><input type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&(pw===company.adminPassword?onLogin():setErr("Incorrect password."))} placeholder="Enter password"/></div>
        <button className="btn-primary" style={{width:"100%",padding:"11px"}} onClick={()=>pw===company.adminPassword?onLogin():setErr("Incorrect password. Default: admin123")}>Login →</button>
        <p style={{textAlign:"center",fontSize:11,color:"var(--text3)",marginTop:14}}>Default: admin123</p>
      </div>
    </div>
  );
}

// ─── ADMIN SHELL ──────────────────────────────────────────────────
function AdminDashboard({page,setPage,standardGears,setStandardGears,customers,setCustomers,invoices,setInvoices,inventory,setInventory,company,setCompany,customInquiries,overdueInvoices,notify,onLogout}){
  const nav=[
    {id:"dashboard",icon:"📊",label:"Dashboard"},
    {id:"standard-gears",icon:"⚙️",label:"Catalog"},
    {id:"custom-inquiries",icon:"📋",label:"Inquiries"},
    {id:"customers",icon:"👥",label:"Customers"},
    {id:"invoices",icon:"🧾",label:"Invoices"},
    {id:"inventory",icon:"📦",label:"Inventory"},
    {id:"credit-tracker",icon:"💳",label:"Credit"},
    {id:"reminders",icon:"🔔",label:"Reminders" + (overdueInvoices.length>0?" ("+overdueInvoices.length+")":"")},
    {id:"settings",icon:"⚙",label:"Settings"},
  ];
  return(
    <div className="admin-shell">
      <div className="admin-sidebar">
        <div style={{padding:"12px 16px 10px",borderBottom:"1px solid var(--border)",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><GearSVG size={26}/><span style={{fontSize:13,fontWeight:700,color:"var(--gold)"}}>Admin Panel</span></div>
        </div>
        <div className="admin-sidebar-nav" style={{display:"flex",flexDirection:"column",flex:1}}>
          {nav.map(item=>(
            <button key={item.id} className={`sidebar-nav-btn${page===item.id?" active":""}`} onClick={()=>setPage(item.id)}>
              <span>{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>
        <div style={{padding:"10px 12px",borderTop:"1px solid var(--border)",marginTop:"auto"}}>
          <button className="btn-secondary btn-sm" style={{width:"100%"}} onClick={onLogout}>Logout</button>
        </div>
      </div>
      <div className="admin-main">
        {page==="dashboard"&&<AdminHome invoices={invoices} customers={customers} standardGears={standardGears} overdueInvoices={overdueInvoices} customInquiries={customInquiries} setPage={setPage}/>}
        {page==="standard-gears"&&<AdminStandardGears gears={standardGears} setGears={setStandardGears} notify={notify}/>}
        {page==="custom-inquiries"&&<AdminInquiries inquiries={customInquiries}/>}
        {page==="customers"&&<AdminCustomers customers={customers} setCustomers={setCustomers} notify={notify}/>}
        {page==="invoices"&&<AdminInvoices invoices={invoices} setInvoices={setInvoices} customers={customers} notify={notify}/>}
        {page==="inventory"&&<AdminInventory inventory={inventory} setInventory={setInventory} gears={standardGears} notify={notify}/>}
        {page==="credit-tracker"&&<AdminCreditTracker invoices={invoices} setInvoices={setInvoices} customers={customers} notify={notify}/>}
        {page==="reminders"&&<AdminReminders overdueInvoices={overdueInvoices} customers={customers} setInvoices={setInvoices} notify={notify} company={company}/>}
        {page==="settings"&&<AdminSettings company={company} setCompany={setCompany} notify={notify}/>}
      </div>
    </div>
  );
}

// ─── ADMIN: DASHBOARD HOME ────────────────────────────────────────
function AdminHome({invoices,customers,standardGears,overdueInvoices,customInquiries,setPage}){
  const revenue=invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.total,0);
  const pending=invoices.filter(i=>i.status!=="paid").reduce((s,i)=>s+i.total,0);
  return(
    <div className="fade-in">
      <h2 style={{marginBottom:4}}>Dashboard</h2>
      <p style={{marginBottom:20,fontSize:13}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p>
      {overdueInvoices.length>0&&(
        <div className="overdue-banner">
          <span style={{fontSize:14,color:"var(--red)",fontWeight:600}}>🔔 {overdueInvoices.length} credit invoice{overdueInvoices.length>1?"s are":" is"} overdue!</span>
          <button className="btn-danger btn-sm" onClick={()=>setPage("reminders")}>View →</button>
        </div>
      )}
      <div className="grid4" style={{marginBottom:24}}>
        {[["👥","Customers",customers.length,"var(--blue)"],["🧾","Invoices",invoices.length,"var(--green)"],["💰","Revenue",`₹${revenue.toLocaleString()}`,"var(--gold)"],["⏳","Pending",`₹${pending.toLocaleString()}`,"var(--red)"]].map(([icon,lbl,val,col])=>(
          <div key={lbl} className="stat-card" style={{textAlign:"center"}}>
            <div style={{fontSize:24,marginBottom:6}}>{icon}</div>
            <div style={{fontSize:20,fontWeight:700,color:col}}>{val}</div>
            <div style={{fontSize:11,color:"var(--text3)"}}>{lbl}</div>
          </div>
        ))}
      </div>
      <div className="grid2">
        <div className="card">
          <h3 style={{marginBottom:14,fontSize:14}}>Recent Invoices</h3>
          {invoices.slice(0,5).map(inv=>(
            <div key={inv.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13,gap:8}}>
              <div><div style={{fontWeight:600}}>{inv.id}</div><div style={{fontSize:11,color:"var(--text3)"}}>{inv.date}</div></div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontWeight:700}}>{fmtCur(inv.total,inv.currency)}</div>
                <span className={`badge ${inv.status==="paid"?"badge-green":inv.status==="overdue"?"badge-red":"badge-yellow"}`}>{inv.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{marginBottom:14,fontSize:14}}>Low Stock Alerts</h3>
          {standardGears.filter(g=>g.stock<60).map(g=>(
            <div key={g.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid var(--border)",fontSize:13}}>
              <span style={{flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8}}>{g.name}</span>
              <span className={`badge ${g.stock<20?"badge-red":"badge-yellow"}`}>{g.stock} pcs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: STANDARD GEARS ────────────────────────────────────────
function AdminStandardGears({gears,setGears,notify}){
  const [editing,setEditing]=useState(null);
  const [showForm,setShowForm]=useState(false);
  const emptyG={name:"",type:"Spur",module:1,teeth:20,boreDia:6,material:"Steel (AISI 1045)",stock:0,pricing:[{minQty:1,maxQty:9,price:0},{minQty:10,maxQty:49,price:0},{minQty:50,maxQty:99,price:0},{minQty:100,maxQty:999,price:0}]};
  const [form,setForm]=useState(emptyG);
  const openEdit=(g)=>{setForm({...g});setEditing(g.id);setShowForm(true);};
  const openNew=()=>{setForm({...emptyG,id:`SG${String(gears.length+1).padStart(3,"0")}`});setEditing(null);setShowForm(true);};
  const save=()=>{
    if(!form.name){notify("Name required","error");return;}
    if(editing) setGears(p=>p.map(g=>g.id===editing?{...form}:g));
    else setGears(p=>[...p,form]);
    setShowForm(false);notify(editing?"Gear updated":"Gear added");
  };
  return(
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <h2>Standard Gear Catalog</h2>
        <button className="btn-primary btn-sm" onClick={openNew}>+ Add Gear</button>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Name</th><th>Type</th><th>M×Z</th><th>Stock</th><th>Base ₹</th><th>Actions</th></tr></thead>
          <tbody>
            {gears.map(g=>(
              <tr key={g.id}>
                <td style={{fontWeight:600}}>{g.name}</td>
                <td><span className="badge badge-blue">{g.type}</span></td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{g.module}×{g.teeth}</td>
                <td><span className={`badge ${g.stock>50?"badge-green":g.stock>0?"badge-yellow":"badge-red"}`}>{g.stock}</span></td>
                <td style={{fontWeight:600}}>₹{g.pricing[0]?.price}</td>
                <td>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-secondary btn-sm" onClick={()=>openEdit(g)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={()=>{setGears(p=>p.filter(i=>i.id!==g.id));notify("Deleted");}}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="modal-box" style={{maxWidth:680}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3>{editing?"Edit Gear":"New Standard Gear"}</h3>
              <button className="btn-icon" onClick={()=>setShowForm(false)}>✕</button>
            </div>
            <div className="form-row-3 mb16">
              <div style={{gridColumn:"span 2"}}><label>Gear Name</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
              <div><label>Type</label><select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}>{GEAR_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label>Module</label><input type="number" value={form.module} onChange={e=>setForm(p=>({...p,module:parseFloat(e.target.value)}))}/></div>
              <div><label>Teeth</label><input type="number" value={form.teeth} onChange={e=>setForm(p=>({...p,teeth:parseInt(e.target.value)}))}/></div>
              <div><label>Bore Dia (mm)</label><input type="number" value={form.boreDia} onChange={e=>setForm(p=>({...p,boreDia:parseFloat(e.target.value)}))}/></div>
              <div style={{gridColumn:"span 2"}}><label>Material</label><select value={form.material} onChange={e=>setForm(p=>({...p,material:e.target.value}))}>{MATERIALS.map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label>Stock (pcs)</label><input type="number" value={form.stock} onChange={e=>setForm(p=>({...p,stock:parseInt(e.target.value)}))}/></div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:10}}>Tier Pricing (₹/pc)</div>
              {form.pricing.map((tier,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:8}}>
                  <div><label>Min Qty</label><input type="number" value={tier.minQty} onChange={e=>{const p=[...form.pricing];p[i]={...p[i],minQty:parseInt(e.target.value)};setForm(f=>({...f,pricing:p}));}}/></div>
                  <div><label>Max Qty</label><input type="number" value={tier.maxQty} onChange={e=>{const p=[...form.pricing];p[i]={...p[i],maxQty:parseInt(e.target.value)};setForm(f=>({...f,pricing:p}));}}/></div>
                  <div><label>Price (₹)</label><input type="number" value={tier.price} onChange={e=>{const p=[...form.pricing];p[i]={...p[i],price:parseFloat(e.target.value)};setForm(f=>({...f,pricing:p}));}}/></div>
                </div>
              ))}
              <button className="btn-secondary btn-sm" onClick={()=>setForm(f=>({...f,pricing:[...f.pricing,{minQty:200,maxQty:999,price:0}]}))}>+ Add Tier</button>
            </div>
            <button className="btn-primary" style={{width:"100%"}} onClick={save}>Save Gear</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: INQUIRIES ─────────────────────────────────────────────
function AdminInquiries({inquiries}){
  const [sel,setSel]=useState(null);
  return(
    <div className="fade-in">
      <h2 style={{marginBottom:20}}>Custom Gear Inquiries</h2>
      {inquiries.length===0?<p style={{textAlign:"center",padding:"60px 0",color:"var(--text3)"}}>No inquiries yet.</p>:(
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>ID</th><th>Name</th><th>Gear Type</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {inquiries.map(inq=>(
                <tr key={inq.id}>
                  <td style={{fontSize:12,color:"var(--text3)",fontWeight:600}}>{inq.id.slice(-8)}</td>
                  <td><div style={{fontWeight:600}}>{inq.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{inq.company}</div></td>
                  <td><span className="badge badge-blue">{inq.gearType}</span></td>
                  <td style={{fontSize:12,color:"var(--text3)"}}>{new Date(inq.date).toLocaleDateString()}</td>
                  <td><span className="badge badge-yellow">{inq.status}</span></td>
                  <td><button className="btn-secondary btn-sm" onClick={()=>setSel(inq)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sel&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal-box">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3>Inquiry Details</h3>
              <button className="btn-icon" onClick={()=>setSel(null)}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
              {Object.entries(sel).filter(([k])=>!["id","status"].includes(k)).map(([k,v])=>(
                <div key={k} className="card-sm">
                  <div style={{fontSize:10,color:"var(--text3)",marginBottom:2}}>{k}</div>
                  <div style={{fontSize:13,fontWeight:500,wordBreak:"break-all"}}>{String(v)||"—"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: CUSTOMERS ─────────────────────────────────────────────
function AdminCustomers({customers,setCustomers,notify}){
  const [sel,setSel]=useState(null);
  return(
    <div className="fade-in">
      <h2 style={{marginBottom:20}}>Customers</h2>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Name</th><th>Country</th><th>Currency</th><th>Tax</th><th>Credit</th><th>Actions</th></tr></thead>
          <tbody>
            {customers.map(c=>(
              <tr key={c.id}>
                <td><div style={{fontWeight:600}}>{c.name}</div><div style={{fontSize:11,color:"var(--text3)"}}>{c.email}</div></td>
                <td>{c.country}</td>
                <td><span className="badge badge-blue">{c.currency}</span></td>
                <td>{c.taxEnabled?<span className="badge badge-green">{c.taxType} {c.taxRate}%</span>:<span className="badge badge-gray">None</span>}</td>
                <td>{c.creditAllowed?<span className="badge badge-green">Yes</span>:<span className="badge badge-red">No</span>}</td>
                <td>
                  <div style={{display:"flex",gap:6}}>
                    <button className="btn-secondary btn-sm" onClick={()=>setSel(c)}>View</button>
                    <button className="btn-danger btn-sm" onClick={()=>{setCustomers(p=>p.filter(i=>i.id!==c.id));notify("Deleted");}}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setSel(null)}>
          <div className="modal-box">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3>{sel.name}</h3>
              <button className="btn-icon" onClick={()=>setSel(null)}>✕</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:10}}>
              {[["ID",sel.id],["Email",sel.email],["Phone",sel.phone],["Country",sel.country],["Currency",sel.currency],["Tax",sel.taxEnabled?`${sel.taxType} @ ${sel.taxRate}%`:"None"],["GST/VAT",sel.gstNumber||"—"],["Credit",sel.creditAllowed?"Yes":"No"]].map(([k,v])=>(
                <div key={k} className="card-sm"><div style={{fontSize:10,color:"var(--text3)",marginBottom:2}}>{k}</div><div style={{fontSize:13,fontWeight:500}}>{v}</div></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: INVOICES ──────────────────────────────────────────────
function AdminInvoices({invoices,setInvoices,customers,notify}){
  const [showNew,setShowNew]=useState(false);
  const [printInv,setPrintInv]=useState(null);
  const [form,setForm]=useState({customerId:"",items:[{name:"",qty:1,unitPrice:0,tax:0}],paymentType:"cash",dueDate:"",notes:""});
  const customer=customers.find(c=>c.id===form.customerId);
  const subtotal=form.items.reduce((s,i)=>s+i.qty*i.unitPrice,0);
  const taxAmt=form.items.reduce((s,i)=>s+i.qty*i.unitPrice*(i.tax/100),0);
  const total=subtotal+taxAmt;
  const updateItem=(i,field,val)=>setForm(p=>{const items=[...p.items];items[i]={...items[i],[field]:val};return{...p,items};});
  const saveInv=()=>{
    if(!form.customerId){notify("Select customer","error");return;}
    if(form.paymentType==="credit"&&!form.dueDate){notify("Enter due date","error");return;}
    const inv={id:`INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,customerId:form.customerId,date:new Date().toISOString().split("T")[0],dueDate:form.paymentType==="credit"?form.dueDate:null,items:form.items,currency:customer?.currency||"INR",paymentType:form.paymentType,status:form.paymentType==="cash"?"paid":"pending",total,notes:form.notes};
    setInvoices(p=>[inv,...p]);setShowNew(false);notify("Invoice created");
    setForm({customerId:"",items:[{name:"",qty:1,unitPrice:0,tax:0}],paymentType:"cash",dueDate:"",notes:""});
  };
  return(
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <h2>Invoice Manager</h2>
        <button className="btn-primary btn-sm" onClick={()=>setShowNew(true)}>+ New Invoice</button>
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Amount</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {invoices.map(inv=>{
              const cust=customers.find(c=>c.id===inv.customerId);
              return(
                <tr key={inv.id}>
                  <td style={{fontSize:12,fontWeight:600}}>{inv.id}</td>
                  <td style={{fontSize:13}}>{cust?.name||"Unknown"}</td>
                  <td style={{fontWeight:700}}>{fmtCur(inv.total,inv.currency)}</td>
                  <td><span className={`badge ${inv.paymentType==="cash"?"badge-green":"badge-yellow"}`}>{inv.paymentType}</span></td>
                  <td><span className={`badge ${inv.status==="paid"?"badge-green":inv.status==="overdue"?"badge-red":"badge-yellow"}`}>{inv.status}</span></td>
                  <td>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                      <button className="btn-secondary btn-sm" onClick={()=>setPrintInv(inv)}>Print</button>
                      {inv.status!=="paid"&&<button className="btn-primary btn-sm" onClick={()=>{setInvoices(p=>p.map(i=>i.id===inv.id?{...i,status:"paid"}:i));notify("Marked paid!");}}>✓ Paid</button>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showNew&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowNew(false)}>
          <div className="modal-box" style={{maxWidth:700}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3>New Invoice</h3>
              <button className="btn-icon" onClick={()=>setShowNew(false)}>✕</button>
            </div>
            <div className="form-row mb14" style={{marginBottom:14}}>
              <div><label>Customer *</label><select value={form.customerId} onChange={e=>setForm(p=>({...p,customerId:e.target.value}))}><option value="">— Select —</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name} ({c.currency})</option>)}</select></div>
              <div><label>Payment Type</label><select value={form.paymentType} onChange={e=>setForm(p=>({...p,paymentType:e.target.value}))}><option value="cash">Cash</option><option value="credit">Credit</option></select></div>
              {form.paymentType==="credit"&&<div><label>Due Date *</label><input type="date" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))}/></div>}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--gold)",marginBottom:8}}>Line Items</div>
              {form.items.map((item,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr auto",gap:8,marginBottom:8,alignItems:"end"}}>
                  <div><label>Description</label><input placeholder="Item" value={item.name} onChange={e=>updateItem(i,"name",e.target.value)}/></div>
                  <div><label>Qty</label><input type="number" min="1" value={item.qty} onChange={e=>updateItem(i,"qty",parseInt(e.target.value)||1)}/></div>
                  <div><label>Price</label><input type="number" value={item.unitPrice} onChange={e=>updateItem(i,"unitPrice",parseFloat(e.target.value)||0)}/></div>
                  <div><label>Tax %</label><input type="number" value={item.tax} onChange={e=>updateItem(i,"tax",parseFloat(e.target.value)||0)}/></div>
                  <button className="btn-danger btn-sm" onClick={()=>setForm(p=>({...p,items:p.items.filter((_,j)=>j!==i)}))}>✕</button>
                </div>
              ))}
              <button className="btn-secondary btn-sm" onClick={()=>setForm(p=>({...p,items:[...p.items,{name:"",qty:1,unitPrice:0,tax:customer?.taxRate||0}]}))}>+ Add Item</button>
            </div>
            <div className="mb12"><label>Notes</label><textarea rows={2} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}/></div>
            <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:8,padding:14,marginBottom:16,fontSize:13}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{color:"var(--text3)"}}>Subtotal</span><span>{fmtCur(subtotal,customer?.currency||"INR")}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{color:"var(--text3)"}}>Tax</span><span>{fmtCur(taxAmt,customer?.currency||"INR")}</span></div>
              <div style={{display:"flex",justifyContent:"space-between",fontWeight:700,fontSize:15,borderTop:"1px solid var(--border)",paddingTop:8,color:"var(--gold)"}}><span>Total</span><span>{fmtCur(total,customer?.currency||"INR")}</span></div>
            </div>
            <button className="btn-primary" style={{width:"100%"}} onClick={saveInv}>Save Invoice</button>
          </div>
        </div>
      )}
      {printInv&&<PrintableInvoice invoice={printInv} customer={customers.find(c=>c.id===printInv.customerId)} onClose={()=>setPrintInv(null)}/>}
    </div>
  );
}

// ─── PRINTABLE INVOICE ────────────────────────────────────────────
function PrintableInvoice({invoice,customer,onClose}){
  const sub=invoice.items.reduce((s,i)=>s+i.qty*i.unitPrice,0);
  const tax=invoice.items.reduce((s,i)=>s+i.qty*i.unitPrice*(i.tax/100),0);
  return(
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{background:"#fff",color:"#111",maxWidth:680}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12}}>
          <div><div style={{fontSize:20,fontWeight:700,color:"#B8860B"}}>PrecisionGear India</div><div style={{fontSize:12,color:"#666",marginTop:2}}>Plot 45, Industrial Area, Pune</div><div style={{fontSize:12,color:"#666"}}>orders@precisiongear.in</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:800}}>INVOICE</div><div style={{fontWeight:700}}>{invoice.id}</div><div style={{fontSize:12,color:"#666"}}>{invoice.date}</div>{invoice.dueDate&&<div style={{fontSize:12,color:"#c0392b",fontWeight:700}}>Due: {invoice.dueDate}</div>}</div>
        </div>
        {customer&&<div style={{background:"#f8f8f8",borderRadius:8,padding:14,marginBottom:20}}><div style={{fontSize:10,fontWeight:700,color:"#999",marginBottom:6}}>BILL TO</div><div style={{fontWeight:700}}>{customer.name}</div><div style={{fontSize:13,color:"#666"}}>{customer.email} · {customer.phone}</div>{customer.gstNumber&&<div style={{fontSize:12,color:"#666"}}>GST: {customer.gstNumber}</div>}</div>}
        <div style={{overflowX:"auto",marginBottom:16}}>
          <table style={{minWidth:"auto",background:"#fff",border:"1px solid #eee",borderRadius:6,overflow:"hidden"}}>
            <thead style={{background:"#f5f5f5"}}><tr><th style={{color:"#333"}}>Description</th><th style={{color:"#333"}}>Qty</th><th style={{color:"#333"}}>Price</th><th style={{color:"#333"}}>Tax</th><th style={{color:"#333"}}>Amount</th></tr></thead>
            <tbody>{invoice.items.map((item,i)=><tr key={i}><td style={{color:"#111"}}>{item.name}</td><td style={{color:"#111"}}>{item.qty}</td><td style={{color:"#111"}}>{fmtCur(item.unitPrice,invoice.currency)}</td><td style={{color:"#111"}}>{item.tax}%</td><td style={{color:"#111",fontWeight:600}}>{fmtCur(item.qty*item.unitPrice*(1+item.tax/100),invoice.currency)}</td></tr>)}</tbody>
          </table>
        </div>
        <div style={{textAlign:"right",fontSize:13}}><div style={{marginBottom:4}}><span style={{color:"#666"}}>Subtotal: </span>{fmtCur(sub,invoice.currency)}</div><div style={{marginBottom:8}}><span style={{color:"#666"}}>Tax: </span>{fmtCur(tax,invoice.currency)}</div><div style={{fontSize:18,fontWeight:800,borderTop:"2px solid #111",paddingTop:8}}>TOTAL: {fmtCur(invoice.total,invoice.currency)}</div></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:20}}>
          <button className="btn-primary" onClick={()=>window.print()}>🖨 Print</button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN: INVENTORY ─────────────────────────────────────────────
function AdminInventory({inventory,setInventory,gears,notify}){
  const [tab,setTab]=useState("all");
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({type:"inward",gearId:"",qty:1,supplier:"",batchNo:"",orderId:"",notes:""});
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  const saveEntry=()=>{
    if(!form.gearId||!form.qty){notify("Select gear and qty","error");return;}
    const gear=gears.find(g=>g.id===form.gearId);
    setInventory(p=>[{...form,id:`INV${String(p.length+1).padStart(3,"0")}`,gearName:gear?.name,date:new Date().toISOString().split("T")[0],qty:parseInt(form.qty)},...p]);
    setShowForm(false);notify("Entry recorded");
  };
  const filtered=tab==="all"?inventory:inventory.filter(i=>i.type===tab);
  return(
    <div className="fade-in">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <h2>Inventory Manager</h2>
        <div style={{display:"flex",gap:8}}>
          <button className="btn-secondary btn-sm" onClick={()=>{s("type","inward");setShowForm(true);}}>+ Inward</button>
          <button className="btn-primary btn-sm" onClick={()=>{s("type","outward");setShowForm(true);}}>+ Outward</button>
        </div>
      </div>
      <div className="grid3" style={{marginBottom:20}}>
        {gears.map(g=>{
          const inw=inventory.filter(i=>i.gearId===g.id&&i.type==="inward").reduce((s,i)=>s+i.qty,0);
          const out=inventory.filter(i=>i.gearId===g.id&&i.type==="outward").reduce((s,i)=>s+i.qty,0);
          const net=inw-out;
          return(
            <div key={g.id} className="stat-card">
              <div style={{fontSize:12,fontWeight:600,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</div>
              <div style={{fontSize:20,fontWeight:700,color:net<20?"var(--red)":"var(--gold)"}}>{net}</div>
              <div style={{fontSize:11,color:"var(--text3)"}}>↑{inw} in · ↓{out} out</div>
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:14,borderBottom:"1px solid var(--border)"}}>
        {["all","inward","outward"].map(t=>(
          <button key={t} style={{background:"none",border:"none",padding:"8px 14px",color:tab===t?"var(--gold)":"var(--text3)",fontWeight:tab===t?600:400,borderBottom:tab===t?"2px solid var(--gold)":"2px solid transparent",fontSize:13,cursor:"pointer"}} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Gear</th><th>Type</th><th>Qty</th><th>Date</th><th>Ref</th></tr></thead>
          <tbody>
            {filtered.map(e=>(
              <tr key={e.id}>
                <td style={{fontWeight:600,fontSize:13}}>{e.gearName}</td>
                <td><span className={`badge ${e.type==="inward"?"badge-green":"badge-red"}`}>{e.type}</span></td>
                <td style={{fontWeight:700}}>{e.qty}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{e.date}</td>
                <td style={{fontSize:12,color:"var(--text3)"}}>{e.supplier||e.orderId||"—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showForm&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setShowForm(false)}>
          <div className="modal-box">
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <h3>New {form.type==="inward"?"Inward":"Outward"} Entry</h3>
              <button className="btn-icon" onClick={()=>setShowForm(false)}>✕</button>
            </div>
            <div className="form-row mb14" style={{marginBottom:14}}>
              <div><label>Type</label><select value={form.type} onChange={e=>s("type",e.target.value)}><option value="inward">Inward</option><option value="outward">Outward</option></select></div>
              <div><label>Gear *</label><select value={form.gearId} onChange={e=>s("gearId",e.target.value)}><option value="">— Select —</option>{gears.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
              <div><label>Qty *</label><input type="number" min="1" value={form.qty} onChange={e=>s("qty",e.target.value)}/></div>
              {form.type==="inward"?<><div><label>Supplier</label><input value={form.supplier} onChange={e=>s("supplier",e.target.value)}/></div><div><label>Batch No.</label><input value={form.batchNo} onChange={e=>s("batchNo",e.target.value)}/></div></>:<div><label>Order / Invoice ID</label><input value={form.orderId} onChange={e=>s("orderId",e.target.value)}/></div>}
            </div>
            <div className="mb14" style={{marginBottom:14}}><label>Notes</label><textarea rows={2} value={form.notes} onChange={e=>s("notes",e.target.value)}/></div>
            <button className="btn-primary" style={{width:"100%"}} onClick={saveEntry}>Save Entry</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN: CREDIT TRACKER ────────────────────────────────────────
function AdminCreditTracker({invoices,setInvoices,customers,notify}){
  const creditInvs=invoices.filter(i=>i.paymentType==="credit");
  const markPaid=(id)=>{setInvoices(p=>p.map(i=>i.id===id?{...i,status:"paid"}:i));notify("Marked as paid!");};
  return(
    <div className="fade-in">
      <h2 style={{marginBottom:6}}>Credit Tracker</h2>
      <p style={{marginBottom:20,fontSize:13}}>Buy-now-pay-later transactions. Red rows = overdue.</p>
      <div className="grid3" style={{marginBottom:20}}>
        {[["Total Credit",creditInvs.length,"var(--blue)"],["Pending",`₹${creditInvs.filter(i=>i.status!=="paid").reduce((s,i)=>s+i.total,0).toLocaleString()}`,"var(--gold)"],["Overdue",creditInvs.filter(i=>i.status!=="paid"&&new Date(i.dueDate)<new Date()).length,"var(--red)"]].map(([l,v,c])=>(
          <div key={l} className="stat-card" style={{textAlign:"center"}}><div style={{fontSize:22,fontWeight:700,color:c}}>{v}</div><div style={{fontSize:11,color:"var(--text3)"}}>{l}</div></div>
        ))}
      </div>
      <div className="tbl-wrap">
        <table>
          <thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Due Date</th><th>Status</th><th>Days</th><th></th></tr></thead>
          <tbody>
            {creditInvs.map(inv=>{
              const cust=customers.find(c=>c.id===inv.customerId);
              const daysLeft=Math.ceil((new Date(inv.dueDate)-new Date())/86400000);
              const overdue=daysLeft<0&&inv.status!=="paid";
              return(
                <tr key={inv.id} style={{background:overdue?"var(--red-bg)":"transparent"}}>
                  <td style={{fontSize:12,fontWeight:600}}>{inv.id}</td>
                  <td>{cust?.name||"—"}</td>
                  <td style={{fontWeight:700}}>{fmtCur(inv.total,inv.currency)}</td>
                  <td style={{fontSize:12,color:overdue?"var(--red)":"var(--text3)",fontWeight:overdue?600:400}}>{inv.dueDate}</td>
                  <td><span className={`badge ${inv.status==="paid"?"badge-green":overdue?"badge-red":"badge-yellow"}`}>{overdue&&inv.status!=="paid"?"OVERDUE":inv.status}</span></td>
                  <td style={{fontSize:12,fontWeight:600,color:overdue?"var(--red)":daysLeft<=7?"var(--yellow)":"var(--green)"}}>{inv.status==="paid"?"—":overdue?`${Math.abs(daysLeft)}d late`:`${daysLeft}d left`}</td>
                  <td>{inv.status!=="paid"&&<button className="btn-primary btn-sm" onClick={()=>markPaid(inv.id)}>✓ Paid</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ADMIN: REMINDERS ────────────────────────────────────────────
function AdminReminders({overdueInvoices,customers,setInvoices,notify,company}){
  const [sent,setSent]=useState([]);
  return(
    <div className="fade-in">
      <h2 style={{marginBottom:6}}>Overdue Reminders</h2>
      <p style={{marginBottom:20,fontSize:13}}>Credit invoices past due date.</p>
      {overdueInvoices.length===0?(
        <div style={{textAlign:"center",padding:"60px 0"}}>
          <div style={{fontSize:48,marginBottom:12}}>✅</div>
          <h3>No overdue invoices</h3>
          <p>All credit transactions are up to date.</p>
        </div>
      ):overdueInvoices.map(inv=>{
        const cust=customers.find(c=>c.id===inv.customerId);
        const daysLate=Math.ceil((new Date()-new Date(inv.dueDate))/86400000);
        const wasSent=sent.includes(inv.id);
        return(
          <div key={inv.id} className="card" style={{borderColor:"var(--red-border)",borderWidth:1,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{fontWeight:700}}>{inv.id}</span>
                  <span className="badge badge-red">{daysLate}d overdue</span>
                </div>
                <div style={{fontSize:13}}>{cust?.name||"Unknown"} · {cust?.email}</div>
                <div style={{fontSize:13,color:"var(--text3)"}}>Due: {inv.dueDate} · <span style={{fontWeight:700,color:"var(--gold)"}}>{fmtCur(inv.total,inv.currency)}</span></div>
              </div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-start"}}>
                <button className={wasSent?"btn-secondary btn-sm":"btn-primary btn-sm"} onClick={()=>{setSent(p=>[...p,inv.id]);notify(`Reminder sent to ${cust?.email||"customer"}`);}} style={{opacity:wasSent?.7:1}}>{wasSent?"✓ Sent":"📧 Send Reminder"}</button>
                <button className="btn-primary btn-sm" onClick={()=>{setInvoices(p=>p.map(i=>i.id===inv.id?{...i,status:"paid"}:i));notify("Marked paid!");}}>✓ Mark Paid</button>
              </div>
            </div>
            {wasSent&&(
              <div style={{marginTop:12,background:"var(--gold-bg)",border:"1px solid #E8D49A",borderRadius:6,padding:"10px 14px",fontSize:12}}>
                <div style={{fontWeight:700,color:"var(--gold)",marginBottom:4}}>Email preview → {cust?.email}</div>
                <div style={{color:"var(--text2)"}}>Subject: Payment Reminder — {inv.id} Overdue<br/>Dear {cust?.name}, your invoice {inv.id} for {fmtCur(inv.total,inv.currency)} was due {inv.dueDate} and is {daysLate} day(s) overdue. Please arrange payment. — PrecisionGear India</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ADMIN: SETTINGS ─────────────────────────────────────────────
function AdminSettings({company,setCompany,notify}){
  const [form,setForm]=useState({...company});
  const s=(k,v)=>setForm(p=>({...p,[k]:v}));
  return(
    <div className="fade-in">
      <h2 style={{marginBottom:20}}>Company Settings</h2>
      <div className="card" style={{maxWidth:640}}>
        <h3 style={{marginBottom:16,color:"var(--gold)"}}>Company Information</h3>
        <div className="form-row mb20">
          <div><label>Company Name</label><input value={form.name} onChange={e=>s("name",e.target.value)}/></div>
          <div><label>Email *</label><input type="email" value={form.email} onChange={e=>s("email",e.target.value)}/></div>
          <div><label>Phone</label><input value={form.phone} onChange={e=>s("phone",e.target.value)}/></div>
          <div><label>GSTIN</label><input value={form.gstin} onChange={e=>s("gstin",e.target.value)}/></div>
        </div>
        <div style={{marginBottom:20}}><label>Address</label><textarea rows={2} value={form.address} onChange={e=>s("address",e.target.value)}/></div>
        <div className="alert-success mb20" style={{fontSize:13}}>Email is used for all inquiry notifications and reminder emails.</div>
        <h3 style={{marginBottom:12,color:"var(--gold)"}}>Security</h3>
        <div style={{marginBottom:20}}><label>Admin Password</label><input type="password" value={form.adminPassword} onChange={e=>s("adminPassword",e.target.value)}/></div>
        <button className="btn-primary" style={{width:"100%",padding:"12px"}} onClick={()=>{setCompany({...form});notify("Settings saved!");}}>Save Settings</button>
      </div>
    </div>
  );
}
