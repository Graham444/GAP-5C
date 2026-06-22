
import { useState, useEffect, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ComposedChart, Line, PieChart, Pie, Cell, ResponsiveContainer, ReferenceLine
} from "recharts";

const T = {
  bg:"#F0F4F8", surface:"#FFFFFF", surfaceL:"#F8FAFC",
  border:"#CBD5E1", borderL:"#E2E8F0",
  text:"#0F172A", textSec:"#475569", textMut:"#94A3B8",
  blue:"#1D4ED8", blueL:"#DBEAFE", blueD:"#1E3A8A",
  amber:"#B45309", amberL:"#FEF3C7", amberD:"#78350F",
  green:"#065F46", greenL:"#D1FAE5", greenM:"#10B981",
  red:"#991B1B", redL:"#FEE2E2", redM:"#EF4444",
  orange:"#C2410C", orangeL:"#FFEDD5", orangeM:"#F97316",
  purple:"#5B21B6", purpleL:"#EDE9FE", purpleM:"#8B5CF6",
  cyan:"#0E7490", cyanL:"#CFFAFE", cyanM:"#06B6D4",
  shadow:"0 1px 3px rgba(0,0,0,0.10)",
  shadowM:"0 4px 6px rgba(0,0,0,0.07)",
  shadowL:"0 10px 15px rgba(0,0,0,0.07)",
};
const FONT_BODY="'Inter','Segoe UI',system-ui,sans-serif";
const FONT_MONO="'JetBrains Mono','Courier New',monospace";

const LINES=[
  {id:"L1",name:"Assembly Line 1",area:"Assembly"},
  {id:"L2",name:"Assembly Line 2",area:"Assembly"},
  {id:"L3",name:"Assembly Line 3",area:"Assembly"},
  {id:"CN",name:"CNC / Machining",area:"Fabrication"},
  {id:"GC",name:"Glass Cut & Fab",area:"Glass"},
  {id:"FF",name:"Frame Fabrication",area:"Fabrication"},
  {id:"PL",name:"Paint Line",area:"Finishing"},
  {id:"PK",name:"Packaging & Shipping",area:"Logistics"},
  {id:"QA",name:"Quality / Inspection",area:"Quality"},
];

const EMPLOYEES=[
  "Adams, Brian","Baker, Carol","Brooks, David","Carter, Emily","Chen, Frank",
  "Clark, Grace","Davis, Henry","Evans, Isabel","Foster, James","Garcia, Karen",
  "Green, Luis","Hall, Maria","Harris, Nathan","Jackson, Olivia","Johnson, Paul",
  "Jones, Rachel","Kim, Samuel","Lee, Tina","Lewis, Victor","Martin, Wendy",
  "Martinez, Xavier","Miller, Yvonne","Moore, Zachary","Nelson, Alice",
  "Nguyen, Bobby","Parker, Christine","Phillips, Derek","Rivera, Elena",
  "Roberts, Felix","Rodriguez, Gina","Scott, Harold","Smith, Irene",
  "Taylor, Jason","Thomas, Kelly","Thompson, Larry","Turner, Michelle",
  "Walker, Nicholas","White, Olivia","Williams, Peter","Wilson, Quinn",
];

const DEFECT_TAXONOMY={
  A:{name:"Assembly & Hardware",color:"#F59E0B",codes:{"A01":"Missing hardware","A02":"Wrong hardware","A03":"Hardware not seated","A04":"Assembly sequence error","A05":"Wrong component","A06":"Reversed orientation","A07":"Loose fastener","A08":"Damaged hardware"}},
  D:{name:"Dimensional / Fabrication",color:"#3B82F6",codes:{"D01":"Width out of tolerance","D02":"Height out of tolerance","D03":"Squareness off","D04":"Cut angle error","D05":"Frame weld gap","D06":"Notch/cope error","D07":"Hole location error","D08":"Profile deformation","D09":"Missing drill operation"}},
  G:{name:"Glass",color:"#06B6D4",codes:{"G01":"Scratched glass","G02":"Chipped edge","G03":"Wrong glass type","G04":"Broken unit","G05":"Seal failure/fog","G06":"Glass size wrong","G07":"Glass inclusion","G08":"Wrong orientation"}},
  P:{name:"Paint / Finish",color:"#8B5CF6",codes:{"P01":"Wrong color","P02":"Drip/run","P03":"Orange peel","P04":"Adhesion failure","P05":"Bare spot","P06":"Contamination","P07":"Scratched finish","P08":"Uneven coverage"}},
  S:{name:"Sealant / Weatherproofing",color:"#10B981",codes:{"S01":"Missing sealant","S02":"Insufficient sealant","S03":"Wrong sealant","S04":"Sealant not cured","S05":"Weatherstrip missing","S06":"Wrong weatherstrip","S07":"Air leakage","S08":"Water infiltration"}},
  F:{name:"Functional / Operational",color:"#EF4444",codes:{"F01":"Sash won't open/close","F02":"Lock won't engage","F03":"Balance issue","F04":"Tilt mechanism failure","F05":"Hinge binding","F06":"Screen fit problem","F07":"Grille alignment","F08":"Operator handle issue"}},
  K:{name:"Packaging / Shipping",color:"#F97316",codes:{"K01":"Inadequate protection","K02":"Wrong label","K03":"Shipping damage","K04":"Missing components","K05":"Wrong product packed","K06":"Over/under packed"}},
  E:{name:"Engineering / Docs",color:"#64748B",codes:{"E01":"Wrong work order","E02":"Drawing error","E03":"BOM discrepancy","E04":"Missing instructions","E05":"Change order missed"}},
};

const STATUS_META={
  open:{label:"C1 – Concern",short:"C1",color:"#B45309",bg:"#FEF3C7",step:0},
  containment:{label:"C2 – Containment",short:"C2",color:"#1D4ED8",bg:"#DBEAFE",step:1},
  cause:{label:"C3 – Root Cause",short:"C3",color:"#5B21B6",bg:"#EDE9FE",step:2},
  countermeasure:{label:"C4 – Countermeasure",short:"C4",color:"#0E7490",bg:"#CFFAFE",step:3},
  confirm:{label:"C5 – Confirming",short:"C5",color:"#065F46",bg:"#D1FAE5",step:4},
  closed:{label:"Closed",short:"✓",color:"#475569",bg:"#F8FAFC",step:5},
};

const STATUSES=Object.keys(STATUS_META);
const SHIFTS=["1st Shift","2nd Shift","3rd Shift","Weekend"];
const ADMIN_PIN="gap2026";

(function(){
  const l=document.createElement("link");
  l.rel="stylesheet";
  l.href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap";
  document.head.appendChild(l);
  const s=document.createElement("style");
  s.textContent=`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT_BODY};background:#F0F4F8;color:#0F172A;-webkit-font-smoothing:antialiased}input,textarea,select,button{font-family:inherit}::-webkit-scrollbar{width:6px;height:6px}::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:3px}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn .25s ease}.rec-pulse{animation:pulse 1.2s ease infinite}`;
  document.head.appendChild(s);
})();

function pad(n,len=4){return String(n).padStart(len,"0");}
function genId(records){return `5C-${new Date().getFullYear()}-${pad(records.length+1)}`;}
function addBizDays(date,n){const d=new Date(date);let a=0;while(a<n){d.setDate(d.getDate()+1);if(d.getDay()%6!==0)a++;}return d.toISOString().split("T")[0];}
function daysDiff(s){if(!s)return null;return Math.round((new Date(s)-new Date())/86400000);}
function fmtDate(d){if(!d)return"—";return new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});}
function firstName(s){const p=s.split(", ");return p.length>1?p[1].split(" ")[0]:p[0];}
function newRecord(id,session){
  const today=new Date().toISOString().split("T")[0];
  return{id,lineId:session.line.id,lineName:session.line.name,team:session.employees,shift:session.shift||"",createdAt:today,dueDate:addBizDays(today,5),status:"open",repeatFlag:false,aiCategory:null,
    c1:{description:"",defectFamily:"",defectCode:"",partNumber:"",quantity:"",shift:"",discoveredBy:"",location:""},
    c2:{immediateAction:"",responsible:"",dueDate:today,completedAt:""},
    c3:{whys:["","","","",""],rootCause:"",contributingFactors:""},
    c4:{longTermAction:"",processChange:"",responsible:"",dueDate:addBizDays(today,5),completedAt:""},
    c5:{verificationMethod:"",confirmedAt:"",confirmedBy:"",effective:null,notes:""},
    history:[{at:new Date().toISOString(),by:session.employees[0]||"System",note:"Record created"}],
  };
}

function saveRecs(r){try{localStorage.setItem("gap5c_v3",JSON.stringify(r));}catch(e){}}
function loadRecs(){try{const r=localStorage.getItem("gap5c_v3");return r?JSON.parse(r):[];}catch(e){return[];}}
function getApiKey(){return localStorage.getItem("gap5c_apikey")||"";}
function setApiKey(k){localStorage.setItem("gap5c_apikey",k);}
function getSheetsUrl(){return localStorage.getItem("gap5c_sheets")||"";}
function setSheetsUrl(u){localStorage.setItem("gap5c_sheets",u);}

async function callClaude(sys,usr,key){
  const r=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1200,system:sys,messages:[{role:"user",content:usr}]}),
  });
  if(!r.ok)throw new Error(`API ${r.status}`);
  const d=await r.json();
  const t=d.content?.[0]?.text||"{}";
  try{return JSON.parse(t.replace(/```json|```/g,"").trim());}catch(e){return{raw:t};}
}

const AGENT_SYS=`You are the GAP Continuous Improvement Agent — a TPS, Lean, and Six Sigma expert for Graham Architectural Products (GAP), a commercial window and fenestration manufacturer. Respond in JSON only, no markdown, no preamble.`;

async function getDefectSuggestion(desc,line,key,codes){
  return callClaude(AGENT_SYS,`Line: ${line}. Issue: "${desc}". Available codes: ${JSON.stringify(codes)}. Return: {"suggestedFamily":"letter or null","suggestedCode":"code or null","suggestedLabel":"5-8 word label","confidence":"high|medium|low","reasoning":"one sentence","isNewCode":true/false,"proposedNewCode":"if new","containmentIdeas":["1","2","3"],"likelyRootCauses":["1","2","3"],"countermeasureIdeas":["1","2"]}`,key);
}
async function getCoaching(stepKey,rec,key){
  return callClaude(AGENT_SYS,`Coaching for ${stepKey}. Line:${rec.lineName} Code:${rec.c1.defectCode||"?"} Desc:"${rec.c1.description}" RootCause:"${rec.c3?.rootCause||""}". Return: {"suggestions":["1","2","3"],"watchOuts":["1","2"],"tpsInsight":"one specific insight"}`,key);
}
async function getAdminAnalysis(records,key){
  const s=records.map(r=>({id:r.id,line:r.lineName,status:r.status,family:r.c1.defectFamily,code:r.c1.defectCode,desc:r.c1.description?.slice(0,60),root:r.c3?.rootCause?.slice(0,60),created:r.createdAt,due:r.dueDate,closed:r.c5?.confirmedAt,repeat:r.repeatFlag}));
  return callClaude(AGENT_SYS,`Analyze these 5C records: ${JSON.stringify(s)}. Return: {"execSummary":"2-3 sentences","topPatterns":[{"pattern":"","frequency":"high|medium|low","recommendation":""}],"sixSigmaInsights":[{"insight":"","tool":"","action":""}],"processImprovements":[{"improvement":"","expectedImpact":"","priority":"1"}],"repeatRiskAreas":[{"area":"","risk":"high|medium|low","reason":""}],"positives":[""],"recommendedFocus":"single most important thing"}`,key);
}

function useVoice(){
  const [transcript,setTranscript]=useState("");
  const [interim,setInterim]=useState("");
  const [listening,setListening]=useState(false);
  const [supported,setSupported]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{setSupported(!!(window.SpeechRecognition||window.webkitSpeechRecognition));}, []);
  const start=useCallback(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR)return;
    const r=new SR();r.continuous=true;r.interimResults=true;r.lang="en-US";
    r.onresult=e=>{let f="",i="";for(let j=e.resultIndex;j<e.results.length;j++){if(e.results[j].isFinal)f+=e.results[j][0].transcript+" ";else i+=e.results[j][0].transcript;}if(f)setTranscript(p=>p+f);setInterim(i);};
    r.onend=()=>{setListening(false);setInterim("");};
    r.onerror=()=>setListening(false);
    ref.current=r;r.start();setListening(true);
  },[]);
  const stop=useCallback(()=>{ref.current?.stop();setListening(false);},[]);
  const reset=useCallback(()=>{setTranscript("");setInterim("");},[]);
  return{transcript,interim,listening,supported,start,stop,reset};
}

// ── UI Primitives ──
function Lbl({children,req}){return(<div style={{fontSize:12,fontWeight:600,color:T.textSec,marginBottom:5}}>{children}{req&&<span style={{color:T.redM,marginLeft:3}}>*</span>}</div>);}
function FG({label,req,children,helper}){return(<div style={{display:"flex",flexDirection:"column"}}>{label&&<Lbl req={req}>{label}</Lbl>}{children}{helper&&<div style={{fontSize:11,color:T.textMut,marginTop:4}}>{helper}</div>}</div>);}

function Inp({value,onChange,placeholder,type="text",style={},readOnly}){
  return(<input type={type} value={value||""} readOnly={readOnly} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder}
    style={{width:"100%",padding:"9px 12px",fontSize:14,color:T.text,background:readOnly?T.surfaceL:T.surface,border:`1px solid ${T.border}`,borderRadius:8,outline:"none",boxSizing:"border-box",...style}}
    onFocus={e=>{if(!readOnly)e.target.style.borderColor=T.blue;}} onBlur={e=>e.target.style.borderColor=T.border} />);
}
function TA({value,onChange,placeholder,rows=3,style={}}){
  return(<textarea value={value||""} onChange={e=>onChange&&onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={{width:"100%",padding:"9px 12px",fontSize:14,color:T.text,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,outline:"none",resize:"vertical",fontFamily:FONT_BODY,lineHeight:1.5,boxSizing:"border-box",...style}}
    onFocus={e=>e.target.style.borderColor=T.blue} onBlur={e=>e.target.style.borderColor=T.border} />);
}
function Sel({value,onChange,options,placeholder,disabled}){
  return(<select value={value||""} onChange={e=>onChange(e.target.value)} disabled={disabled}
    style={{width:"100%",padding:"9px 12px",fontSize:14,color:value?T.text:T.textMut,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,outline:"none",cursor:disabled?"not-allowed":"pointer",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 10px center",backgroundSize:16,paddingRight:36,boxSizing:"border-box"}}>
    <option value="">{placeholder||"— Select —"}</option>
    {options.map(o=><option key={o.value||o} value={o.value||o}>{o.label||o}</option>)}
  </select>);
}

function Btn({onClick,children,variant="primary",disabled=false,sm=false,fullWidth=false,style={}}){
  const V={primary:{bg:T.blue,color:"#fff",border:`1px solid ${T.blue}`},success:{bg:T.greenM,color:"#fff",border:`1px solid ${T.greenM}`},danger:{bg:T.redL,color:T.red,border:`1px solid ${T.redM}`},secondary:{bg:T.surface,color:T.text,border:`1px solid ${T.border}`},ghost:{bg:"transparent",color:T.textSec,border:"1px solid transparent"},warning:{bg:T.amberL,color:T.amberD,border:`1px solid #FCD34D`}};
  const v=V[variant]||V.secondary;
  const [hov,setHov]=useState(false);
  return(<button onClick={onClick} disabled={disabled} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,padding:sm?"7px 14px":"10px 20px",fontSize:sm?12:14,fontWeight:600,background:disabled?"#F1F5F9":(hov&&!disabled?"rgba(0,0,0,0.08)":"transparent"),backgroundBlendMode:"multiply",backgroundColor:disabled?"#F1F5F9":v.bg,color:disabled?T.textMut:v.color,border:disabled?`1px solid ${T.borderL}`:v.border,borderRadius:8,cursor:disabled?"not-allowed":"pointer",transition:"all 0.15s",width:fullWidth?"100%":"auto",whiteSpace:"nowrap",...style}}>
    {children}
  </button>);
}

function Card({children,style={},onClick}){
  const [hov,setHov]=useState(false);
  return(<div onClick={onClick} onMouseEnter={()=>onClick&&setHov(true)} onMouseLeave={()=>setHov(false)}
    style={{background:T.surface,border:`1px solid ${hov&&onClick?T.blue:T.borderL}`,borderRadius:12,padding:20,boxShadow:T.shadow,cursor:onClick?"pointer":"default",transition:"all 0.15s",...style}}>
    {children}
  </div>);
}

function Badge({label,color,bg,sm}){
  return(<span style={{display:"inline-flex",alignItems:"center",padding:sm?"2px 8px":"4px 10px",fontSize:sm?10:11,fontWeight:700,color,background:bg,borderRadius:20,whiteSpace:"nowrap"}}>{label}</span>);
}
function SBadge({status,sm}){const m=STATUS_META[status]||STATUS_META.open;return <Badge label={m.label} color={m.color} bg={m.bg} sm={sm} />;}
function AgBadge({dueDate,status}){
  if(status==="closed")return null;const d=daysDiff(dueDate);if(d===null)return null;
  if(d<0)return <Badge label={`Overdue ${Math.abs(d)}d`} color={T.red} bg={T.redL} />;
  if(d===0)return <Badge label="Due Today" color={T.orange} bg={T.orangeL} />;
  if(d<=2)return <Badge label={`${d}d left`} color={T.amber} bg={T.amberL} />;
  return <Badge label={`${d}d left`} color={T.textSec} bg={T.surfaceL} />;
}

function Steps({status}){
  const s=STATUSES.filter(x=>x!=="closed");const cur=STATUS_META[status]?.step??0;
  return(<div style={{display:"flex",alignItems:"center",gap:0}}>
    {s.map((st,i)=>{const m=STATUS_META[st];const done=i<cur,active=i===cur;return(<div key={st} style={{display:"flex",alignItems:"center",flex:1}}>
      <div style={{width:20,height:20,borderRadius:"50%",flexShrink:0,background:done?T.greenM:(active?m.color:T.borderL),border:`2px solid ${done?T.greenM:(active?m.color:T.border)}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:800,color:done||active?"#fff":T.textMut,transition:"all 0.2s"}}>
        {done?"✓":m.short}
      </div>
      {i<s.length-1&&<div style={{flex:1,height:2,background:done?T.greenM:T.borderL,transition:"background 0.2s"}} />}
    </div>);})}
  </div>);
}

function Divider({label}){return(<div style={{display:"flex",alignItems:"center",gap:12,margin:"8px 0"}}><div style={{flex:1,height:1,background:T.borderL}}/>{label&&<span style={{fontSize:11,color:T.textMut,fontWeight:600,letterSpacing:"0.06em"}}>{label}</span>}<div style={{flex:1,height:1,background:T.borderL}}/></div>);}
function Spin(){return(<div style={{width:18,height:18,border:`2px solid ${T.borderL}`,borderTopColor:T.blue,borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>);}
function SH({icon,label,color,action}){return(<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:4,height:22,background:color||T.blue,borderRadius:2}}/><span style={{fontSize:13,fontWeight:700,color:T.text}}>{icon&&<span style={{marginRight:7}}>{icon}</span>}{label}</span></div>{action}</div>);}
function IBox({type="info",children}){
  const t={info:{bg:T.blueL,color:T.blueD,icon:"ℹ️"},warning:{bg:T.amberL,color:T.amberD,icon:"⚠️"},success:{bg:T.greenL,color:T.green,icon:"✅"},danger:{bg:T.redL,color:T.red,icon:"🚨"}}[type];
  return(<div style={{background:t.bg,border:`1px solid ${t.color}44`,borderRadius:8,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:14,flexShrink:0}}>{t.icon}</span><div style={{fontSize:13,color:t.color,lineHeight:1.5}}>{children}</div></div>);
}

// ── API Key Setup ──
function ApiKeySetup({onDone}){
  const [key,setKey]=useState("");const [sheets,setSheets]=useState("");const [err,setErr]=useState("");
  return(<div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{width:"100%",maxWidth:480}} className="fade-in">
      <div style={{textAlign:"center",marginBottom:32}}>
        <div style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:64,height:64,background:T.blue,borderRadius:16,marginBottom:16,boxShadow:T.shadowM}}>
          <span style={{fontSize:26,fontWeight:800,color:"#fff",fontFamily:FONT_MONO}}>5C</span>
        </div>
        <h1 style={{fontSize:22,fontWeight:800,color:T.text,marginBottom:6}}>GAP Corrective Action System</h1>
        <p style={{fontSize:14,color:T.textSec}}>First-Time Configuration</p>
      </div>
      <Card>
        <SH label="AI Assist — Anthropic API Key" color={T.blue} />
        <IBox type="info">Your key enables voice-to-defect categorization and the GAP CI Agent. Stored only in this browser — never shared externally.</IBox>
        <div style={{marginTop:16}}><FG label="API Key" required helper="Get one at console.anthropic.com"><Inp value={key} onChange={setKey} placeholder="sk-ant-api03-..." type="password"/></FG></div>
        <Divider label="OPTIONAL"/>
        <FG label="Google Apps Script URL" helper="Paste your deployment URL to sync records to Google Sheets"><Inp value={sheets} onChange={setSheets} placeholder="https://script.google.com/macros/s/..."/></FG>
        {err&&<div style={{color:T.redM,fontSize:12,marginTop:8}}>{err}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:20}}>
          <Btn variant="secondary" onClick={()=>{setApiKey("");setSheetsUrl("");onDone();}}>Skip — No AI</Btn>
          <Btn onClick={()=>{if(key&&!key.startsWith("sk-ant")){setErr("Key must start with sk-ant");return;}setApiKey(key);setSheetsUrl(sheets);onDone();}}>Save & Continue →</Btn>
        </div>
      </Card>
    </div>
  </div>);
}

// ── Login ──
function LoginScreen({onLogin}){
  const [line,setLine]=useState(null);const [emps,setEmps]=useState([]);const [shift,setShift]=useState("");const [search,setSearch]=useState("");
  const filtered=EMPLOYEES.filter(e=>e.toLowerCase().includes(search.toLowerCase()));
  const toggle=e=>setEmps(p=>p.includes(e)?p.filter(x=>x!==e):[...p,e]);
  const areas=[...new Set(LINES.map(l=>l.area))];
  return(<div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
    <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:32}}>
      <div style={{width:52,height:52,background:T.blue,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.shadowM}}>
        <span style={{fontSize:20,fontWeight:800,color:"#fff",fontFamily:FONT_MONO}}>5C</span>
      </div>
      <div><h1 style={{fontSize:20,fontWeight:800,color:T.text}}>Corrective Action System</h1>
        <p style={{fontSize:12,color:T.textSec,marginTop:2}}>Graham Architectural Products · Toyota Production System</p></div>
    </div>
    <div style={{width:"100%",maxWidth:900,display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}} className="fade-in">
      <Card>
        <SH label="Select Line & Shift" color={T.blue}/>
        {areas.map(area=>(<div key={area} style={{marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textMut,letterSpacing:"0.08em",marginBottom:8,textTransform:"uppercase"}}>{area}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {LINES.filter(l=>l.area===area).map(l=>{const sel=line?.id===l.id;return(
              <button key={l.id} onClick={()=>setLine(l)} style={{background:sel?T.blueL:T.surfaceL,border:`2px solid ${sel?T.blue:T.borderL}`,borderRadius:8,padding:"10px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.15s"}}>
                <div style={{fontSize:10,fontWeight:700,color:sel?T.blue:T.textMut,letterSpacing:"0.1em",fontFamily:FONT_MONO}}>{l.id}</div>
                <div style={{fontSize:12,fontWeight:600,color:sel?T.blueD:T.text,marginTop:2}}>{l.name}</div>
              </button>);
            })}
          </div>
        </div>))}
        <Divider/>
        <div style={{marginTop:14}}><FG label="Shift" required><Sel value={shift} onChange={setShift} options={SHIFTS} placeholder="Select shift"/></FG></div>
      </Card>
      <Card>
        <SH label={`Team Members${emps.length>0?` (${emps.length})`:""}` } color={T.blue}/>
        <Inp value={search} onChange={setSearch} placeholder="Search by name..." style={{marginBottom:10}}/>
        <div style={{maxHeight:310,overflowY:"auto",border:`1px solid ${T.borderL}`,borderRadius:8}}>
          {filtered.map((emp,i)=>{const sel=emps.includes(emp);return(
            <button key={emp} onClick={()=>toggle(emp)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 12px",background:sel?T.blueL:"transparent",border:"none",borderBottom:i<filtered.length-1?`1px solid ${T.borderL}`:"none",cursor:"pointer",textAlign:"left",transition:"background 0.1s"}}>
              <div style={{width:16,height:16,borderRadius:4,border:`2px solid ${sel?T.blue:T.border}`,background:sel?T.blue:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {sel&&<span style={{color:"#fff",fontSize:9,fontWeight:900}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:sel?T.blueD:T.text,fontWeight:sel?600:400}}>{emp}</span>
            </button>);
          })}
        </div>
        {emps.length>0&&(<div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12,paddingTop:12,borderTop:`1px solid ${T.borderL}`}}>
          {emps.map(e=>(<button key={e} onClick={()=>toggle(e)} style={{background:T.blueL,border:`1px solid ${T.blue}44`,borderRadius:20,padding:"3px 10px",fontSize:12,color:T.blueD,cursor:"pointer",fontWeight:500}}>{firstName(e)} ×</button>))}
        </div>)}
      </Card>
    </div>
    <Btn onClick={()=>line&&emps.length>0&&shift&&onLogin({line,employees:emps,shift})} disabled={!line||emps.length===0||!shift}
      style={{marginTop:24,padding:"13px 60px",fontSize:15,boxShadow:T.shadowM}}>Begin Session →</Btn>
  </div>);
}

// ── Voice Recorder ──
function VoiceRecorder({onTranscriptChange,initialValue}){
  const {transcript,interim,listening,supported,start,stop,reset}=useVoice();
  const [edited,setEdited]=useState(initialValue||"");
  useEffect(()=>{if(transcript)setEdited(p=>(p?p+" ":"")+transcript.trim());},[transcript]);
  const combined=(edited+(interim?" "+interim:"")).trim();
  useEffect(()=>{onTranscriptChange&&onTranscriptChange(edited);},[edited]);
  const toggle=()=>{if(listening){stop();}else{reset();start();}};
  if(!supported)return(<TA value={edited} onChange={v=>{setEdited(v);onTranscriptChange&&onTranscriptChange(v);}} placeholder="Describe the defect — what happened, where, and what it should have been..." rows={4}/>);
  return(<div>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"16px 0"}}>
      <button onClick={toggle} style={{width:76,height:76,borderRadius:"50%",border:"none",cursor:"pointer",background:listening?"linear-gradient(135deg,#EF4444,#DC2626)":"linear-gradient(135deg,#1D4ED8,#1E40AF)",boxShadow:listening?"0 0 0 10px rgba(239,68,68,0.2)":T.shadowL,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s"}} className={listening?"rec-pulse":""}>
        <span style={{fontSize:26}}>{listening?"⏹":"🎤"}</span>
      </button>
      <div style={{fontSize:13,fontWeight:600,color:listening?T.redM:T.blue}}>{listening?"Recording — tap to stop":"Tap to record description"}</div>
      {listening&&<div style={{fontSize:11,color:T.textMut}}>Speak clearly — your words appear below in real time</div>}
    </div>
    <FG label="Description" required helper="Review and edit the transcription if needed">
      <TA value={combined} onChange={v=>{setEdited(v);onTranscriptChange&&onTranscriptChange(v);}} placeholder="Your spoken description will appear here..." rows={4}/>
    </FG>
    {combined&&<div style={{marginTop:8}}><Btn sm variant="ghost" onClick={()=>{setEdited("");reset();onTranscriptChange&&onTranscriptChange("");}}>🗑 Clear</Btn></div>}
  </div>);
}

// ── Wizard ──
function Wizard({record,session,records,apiKey,onSave,onCancel}){
  const [rec,setRec]=useState({...record});
  const [step,setStep]=useState(0);
  const [aiSug,setAiSug]=useState(null);const [aiLoading,setAiLoading]=useState(false);const [aiErr,setAiErr]=useState("");
  const [coach,setCoach]=useState(null);const [coachLoading,setCoachLoading]=useState(false);
  const [savedTs,setSavedTs]=useState(null);
  const STEPS=[{key:"c1",label:"C1",title:"Concern",color:T.amber},{key:"c2",label:"C2",title:"Containment",color:T.blue},{key:"c3",label:"C3",title:"Root Cause",color:T.purple},{key:"c4",label:"C4",title:"Countermeasure",color:T.cyan},{key:"c5",label:"C5",title:"Confirm",color:T.green}];
  const statusSeq=["open","containment","cause","countermeasure","confirm","closed"];
  const upd=(sec,fld,val)=>setRec(r=>({...r,[sec]:{...r[sec],[fld]:val}}));
  const save=(ns)=>{
    const updated={...rec,status:ns||rec.status,history:[...rec.history,{at:new Date().toISOString(),by:session.employees[0]||"User",note:`Saved — ${STEPS[step]?.title}`}]};
    const prior=records.filter(r=>r.id!==updated.id&&r.status==="closed"&&r.c1.defectCode&&r.c1.defectCode===updated.c1.defectCode&&r.lineId===updated.lineId);
    const final={...updated,repeatFlag:prior.length>0};
    onSave(final);setRec(final);setSavedTs(Date.now());
  };
  const fetchSug=async()=>{
    if(!apiKey){setAiErr("No API key configured.");return;}
    if(!rec.c1.description){setAiErr("Enter a description first.");return;}
    setAiLoading(true);setAiErr("");setAiSug(null);
    const codes=Object.entries(DEFECT_TAXONOMY).flatMap(([f,v])=>Object.entries(v.codes).map(([c,l])=>({fam:f,code:c,label:l})));
    try{const r=await getDefectSuggestion(rec.c1.description,rec.lineName,apiKey,codes);setAiSug(r);if(r.suggestedFamily&&!r.isNewCode){upd("c1","defectFamily",r.suggestedFamily);}if(r.suggestedCode&&!r.isNewCode){upd("c1","defectCode",r.suggestedCode);}}catch(e){setAiErr("AI unavailable. Continue manually.");}
    setAiLoading(false);
  };
  const fetchCoach=async()=>{
    if(!apiKey||!rec.c1.description)return;
    setCoachLoading(true);setCoach(null);
    try{const r=await getCoaching(STEPS[step].key,rec,apiKey);setCoach(r);}catch(e){}
    setCoachLoading(false);
  };
  const prior=records.filter(r=>r.id!==rec.id&&r.status==="closed"&&r.c1.defectCode&&r.c1.defectCode===rec.c1.defectCode&&r.lineId===rec.lineId);
  const s=STEPS[step];
  return(<div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,overflow:"hidden"}}>
    {/* Topbar */}
    <div style={{background:T.surface,borderBottom:`1px solid ${T.borderL}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:T.shadow}}>
      <div style={{display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:36,height:36,background:T.blue,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:800,color:"#fff",fontFamily:FONT_MONO}}>5C</span></div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:FONT_MONO}}>{rec.id}</span>
            <span style={{fontSize:12,color:T.textSec}}>·</span>
            <span style={{fontSize:13,color:T.textSec}}>{rec.lineName}</span>
            {rec.repeatFlag&&<Badge label="⚠ Repeat Issue" color={T.red} bg={T.redL} sm/>}
          </div>
          <div style={{fontSize:11,color:T.textMut}}>{rec.team.map(firstName).join(", ")} · {rec.shift}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        {savedTs&&<span style={{fontSize:11,color:T.greenM,fontWeight:600}}>Saved {new Date(savedTs).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</span>}
        <Btn variant="secondary" sm onClick={()=>save()}>Save Draft</Btn>
        <Btn variant="ghost" sm onClick={onCancel}>✕ Close</Btn>
      </div>
    </div>
    {/* Step tabs */}
    <div style={{background:T.surface,borderBottom:`1px solid ${T.borderL}`,display:"flex",flexShrink:0}}>
      {STEPS.map((st,i)=>{const active=step===i,past=i<step;return(
        <button key={st.key} onClick={()=>setStep(i)} style={{flex:1,padding:"12px 0",border:"none",cursor:"pointer",background:"transparent",borderBottom:`3px solid ${active?st.color:past?T.greenM:"transparent"}`,transition:"all 0.15s"}}>
          <div style={{fontSize:10,fontWeight:700,color:active?st.color:past?T.greenM:T.textMut,letterSpacing:"0.08em"}}>STEP {i+1}</div>
          <div style={{fontSize:13,fontWeight:600,color:active?st.color:past?T.greenM:T.textSec,marginTop:2}}>{past?"✓ ":""}{st.label} — {st.title}</div>
        </button>);
      })}
    </div>
    {/* Body */}
    <div style={{flex:1,overflowY:"auto",padding:24,display:"grid",gridTemplateColumns:"1fr 340px",gap:20,alignItems:"start"}}>
      {/* LEFT */}
      <div className="fade-in">
        {/* C1 */}
        {step===0&&(<Card>
          <SH icon="📋" label="C1 — Describe the Concern" color={T.amber}/>
          <IBox type="warning">Record exactly what is wrong, where it was found, and how many units are affected.</IBox>
          <div style={{marginTop:20,display:"grid",gap:16}}>
            <FG label="Voice or Type Description" required>
              <VoiceRecorder initialValue={rec.c1.description} onTranscriptChange={v=>upd("c1","description",v)}/>
            </FG>
            {rec.c1.description&&<Btn onClick={fetchSug} disabled={aiLoading}>{aiLoading?<><Spin/> Analyzing...</>:"🤖 Get AI Defect Analysis"}</Btn>}
            {aiErr&&<IBox type="danger">{aiErr}</IBox>}
            {aiSug&&(<div style={{background:T.surfaceL,border:`1px solid ${T.borderL}`,borderRadius:10,padding:16}}>
              <div style={{fontSize:12,fontWeight:700,color:T.textSec,marginBottom:10,letterSpacing:"0.05em"}}>AI ANALYSIS RESULTS</div>
              <div style={{display:"grid",gap:6}}>
                <div style={{fontSize:13,color:T.text}}><strong>Category:</strong> {aiSug.suggestedLabel||"—"} {aiSug.suggestedCode&&<Badge label={aiSug.suggestedCode} color={T.blue} bg={T.blueL} sm/>} {aiSug.isNewCode&&<Badge label="NEW CODE" color={T.orange} bg={T.orangeL} sm/>}</div>
                <div style={{fontSize:12,color:T.textSec}}>{aiSug.reasoning}</div>
                {aiSug.confidence&&<div style={{fontSize:12}}>Confidence: <Badge label={aiSug.confidence.toUpperCase()} color={aiSug.confidence==="high"?T.green:aiSug.confidence==="medium"?T.amber:T.red} bg={aiSug.confidence==="high"?T.greenL:aiSug.confidence==="medium"?T.amberL:T.redL} sm/></div>}
              </div>
            </div>)}
            <Divider label="DEFECT CLASSIFICATION"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <FG label="Defect Family" required><Sel value={rec.c1.defectFamily} onChange={v=>{upd("c1","defectFamily",v);upd("c1","defectCode","");}} options={Object.entries(DEFECT_TAXONOMY).map(([k,v])=>({value:k,label:`${k} — ${v.name}`}))} placeholder="Select family"/></FG>
              <FG label="Defect Code" required><Sel value={rec.c1.defectCode} onChange={v=>upd("c1","defectCode",v)} options={rec.c1.defectFamily?Object.entries(DEFECT_TAXONOMY[rec.c1.defectFamily]?.codes||{}).map(([k,v])=>({value:k,label:`${k} — ${v}`})):[]} disabled={!rec.c1.defectFamily} placeholder={rec.c1.defectFamily?"Select code":"Select family first"}/></FG>
              <FG label="Part / Work Order #"><Inp value={rec.c1.partNumber} onChange={v=>upd("c1","partNumber",v)} placeholder="WO-12345"/></FG>
              <FG label="Quantity Affected"><Inp type="number" value={rec.c1.quantity} onChange={v=>upd("c1","quantity",v)} placeholder="# units"/></FG>
              <FG label="Shift"><Sel value={rec.c1.shift} onChange={v=>upd("c1","shift",v)} options={SHIFTS} placeholder="Select shift"/></FG>
              <FG label="Discovered By"><Sel value={rec.c1.discoveredBy} onChange={v=>upd("c1","discoveredBy",v)} options={session.employees} placeholder="Select..."/></FG>
              <FG label="Location on Line / Product" style={{gridColumn:"1/-1"}}><Inp value={rec.c1.location} onChange={v=>upd("c1","location",v)} placeholder="e.g. Final assembly station 3, top rail corner weld"/></FG>
            </div>
          </div>
        </Card>)}
        {/* C2 */}
        {step===1&&(<Card>
          <SH icon="🚧" label="C2 — Immediate Containment" color={T.blue}/>
          <IBox type="warning">Stop further defects from reaching the next operation or customer. Complete <strong>this shift</strong> if at all possible.</IBox>
          <div style={{marginTop:20,display:"grid",gap:16}}>
            <FG label="Immediate Containment Action" required helper="What was done right now?"><TA value={rec.c2.immediateAction} onChange={v=>upd("c2","immediateAction",v)} placeholder="Describe exactly what was done to contain the problem..." rows={4}/></FG>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <FG label="Responsible Person"><Sel value={rec.c2.responsible} onChange={v=>upd("c2","responsible",v)} options={session.employees} placeholder="Assign to..."/></FG>
              <FG label="Target Completion"><Inp type="date" value={rec.c2.dueDate} onChange={v=>upd("c2","dueDate",v)}/></FG>
              <FG label="Actual Completion"><Inp type="date" value={rec.c2.completedAt} onChange={v=>upd("c2","completedAt",v)}/></FG>
            </div>
          </div>
        </Card>)}
        {/* C3 */}
        {step===2&&(<Card>
          <SH icon="🔍" label="C3 — Root Cause Analysis (5-Why)" color={T.purple}/>
          <IBox type="info">Ask "why" five times. Stop when you reach a <strong>system or process failure</strong> — never blame a person.</IBox>
          <div style={{marginTop:20,display:"grid",gap:12}}>
            {rec.c3.whys.map((w,i)=>(<div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{minWidth:52,height:36,borderRadius:8,background:T.purpleL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:T.purple,flexShrink:0}}>WHY {i+1}</div>
              <div style={{flex:1}}><Inp value={w} onChange={v=>{const ws=[...rec.c3.whys];ws[i]=v;setRec(r=>({...r,c3:{...r.c3,whys:ws}}));}} placeholder={i===0?"Why did the defect occur?":`Because "${rec.c3.whys[i-1]||"..."}" — but why?`}/></div>
            </div>))}
            <Divider label="CONCLUSION"/>
            <FG label="Root Cause Statement" required helper="One clear sentence: what fundamental process failure caused this?"><TA value={rec.c3.rootCause} onChange={v=>upd("c3","rootCause",v)} placeholder="The root cause is..." rows={3}/></FG>
            <FG label="Contributing Factors"><TA value={rec.c3.contributingFactors} onChange={v=>upd("c3","contributingFactors",v)} placeholder="Other conditions that enabled this..." rows={2}/></FG>
          </div>
        </Card>)}
        {/* C4 */}
        {step===3&&(<Card>
          <SH icon="🔒" label="C4 — Permanent Countermeasure" color={T.cyan}/>
          <IBox type="info">The fix must address the verified root cause and prevent recurrence — not just fix this batch.</IBox>
          <div style={{marginTop:20,display:"grid",gap:16}}>
            <FG label="Long-Term Corrective Action" required helper="Specific process, tooling, procedure, or design change that eliminates the root cause"><TA value={rec.c4.longTermAction} onChange={v=>upd("c4","longTermAction",v)} placeholder="The permanent fix is..." rows={4}/></FG>
            <FG label="Process / Document Updates Required" helper="Which work instructions or control plans need updating?"><TA value={rec.c4.processChange} onChange={v=>upd("c4","processChange",v)} placeholder="Work instruction WI-XXX needs to be updated..." rows={3}/></FG>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <FG label="Responsible Person"><Sel value={rec.c4.responsible} onChange={v=>upd("c4","responsible",v)} options={session.employees} placeholder="Assign to..."/></FG>
              <FG label="Target Completion"><Inp type="date" value={rec.c4.dueDate} onChange={v=>upd("c4","dueDate",v)}/></FG>
              <FG label="Actual Completion"><Inp type="date" value={rec.c4.completedAt} onChange={v=>upd("c4","completedAt",v)}/></FG>
            </div>
          </div>
        </Card>)}
        {/* C5 */}
        {step===4&&(<Card>
          <SH icon="✅" label="C5 — Confirm Effectiveness" color={T.green}/>
          <IBox type="success">Verify with data that the countermeasure actually eliminated the root cause. Observation is not confirmation.</IBox>
          <div style={{marginTop:20,display:"grid",gap:16}}>
            <FG label="Verification Method" required helper="How was effectiveness confirmed? (30-day count, capability run, audit)"><TA value={rec.c5.verificationMethod} onChange={v=>upd("c5","verificationMethod",v)} placeholder="Effectiveness was confirmed by..." rows={3}/></FG>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <FG label="Confirmed By"><Sel value={rec.c5.confirmedBy} onChange={v=>upd("c5","confirmedBy",v)} options={session.employees} placeholder="Select..."/></FG>
              <FG label="Confirmation Date"><Inp type="date" value={rec.c5.confirmedAt} onChange={v=>upd("c5","confirmedAt",v)}/></FG>
            </div>
            <FG label="Was the Countermeasure Effective?" required>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {[{v:true,l:"✅ Yes — Effective, close this 5C"},{v:false,l:"❌ No — Re-open root cause"}].map(opt=>(
                  <button key={String(opt.v)} onClick={()=>upd("c5","effective",opt.v)} style={{padding:14,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:600,background:rec.c5.effective===opt.v?(opt.v?T.greenL:T.redL):T.surfaceL,border:`2px solid ${rec.c5.effective===opt.v?(opt.v?T.greenM:T.redM):T.border}`,color:rec.c5.effective===opt.v?(opt.v?T.green:T.red):T.textSec,transition:"all 0.15s"}}>{opt.l}</button>
                ))}
              </div>
            </FG>
            <FG label="Lessons Learned"><TA value={rec.c5.notes} onChange={v=>upd("c5","notes",v)} placeholder="What did we learn? What would we do differently?" rows={3}/></FG>
          </div>
        </Card>)}
        {/* Nav */}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:16}}>
          <Btn variant="secondary" onClick={()=>setStep(x=>Math.max(0,x-1))} disabled={step===0}>← Previous</Btn>
          <div style={{display:"flex",gap:10}}>
            <Btn variant="secondary" onClick={()=>save()}>Save Draft</Btn>
            {step<4?<Btn onClick={()=>{save(statusSeq[step+1]);setStep(x=>x+1);}}>Save & Next →</Btn>:
              <Btn variant={rec.c5.effective?"success":"danger"} disabled={rec.c5.effective===null} onClick={()=>{save(rec.c5.effective?"closed":"cause");onCancel();}}>
                {rec.c5.effective?"✅ Close 5C":"↩ Re-open Root Cause"}
              </Btn>}
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {prior.length>0&&(<Card style={{borderColor:`${T.redM}44`,background:T.redL}}>
          <div style={{fontSize:12,fontWeight:700,color:T.red,marginBottom:10}}>⚠️ REPEAT ISSUE — {prior.length} prior occurrence{prior.length>1?"s":""}</div>
          {prior.slice(0,2).map(r=>(<div key={r.id} style={{background:T.surface,borderRadius:8,padding:"10px 12px",marginBottom:8,fontSize:12}}>
            <div style={{fontFamily:FONT_MONO,fontWeight:700,color:T.blue,marginBottom:3}}>{r.id}</div>
            <div style={{color:T.textSec,marginBottom:3}}>{r.c1.description?.slice(0,60)}...</div>
            <div style={{color:T.textMut}}>Fix: {r.c4.longTermAction?.slice(0,50)||"—"}</div>
          </div>))}
        </Card>)}
        {aiSug&&(aiSug.containmentIdeas||aiSug.likelyRootCauses||aiSug.countermeasureIdeas)&&(<Card>
          <div style={{fontSize:12,fontWeight:700,color:T.blue,marginBottom:12}}>🤖 AI Suggestions</div>
          {aiSug.containmentIdeas&&step<=1&&(<div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:T.textMut,letterSpacing:"0.06em",marginBottom:6}}>CONTAINMENT IDEAS</div>
            {aiSug.containmentIdeas.map((a,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
              <span style={{color:T.blue,fontSize:12,marginTop:1}}>›</span>
              <span style={{fontSize:12,color:T.textSec,flex:1}}>{a}</span>
              <button onClick={()=>upd("c2","immediateAction",rec.c2.immediateAction?(rec.c2.immediateAction+"\n"+a):a)} style={{background:T.blueL,border:"none",borderRadius:4,padding:"1px 7px",fontSize:10,color:T.blue,cursor:"pointer",fontWeight:600,flexShrink:0}}>USE</button>
            </div>))}
          </div>)}
          {aiSug.likelyRootCauses&&step>=2&&(<div style={{marginBottom:12}}>
            <div style={{fontSize:11,fontWeight:700,color:T.textMut,letterSpacing:"0.06em",marginBottom:6}}>LIKELY ROOT CAUSES</div>
            {aiSug.likelyRootCauses.map((a,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
              <span style={{color:T.purple,fontSize:12,marginTop:1}}>›</span>
              <span style={{fontSize:12,color:T.textSec,flex:1}}>{a}</span>
              <button onClick={()=>upd("c3","rootCause",a)} style={{background:T.purpleL,border:"none",borderRadius:4,padding:"1px 7px",fontSize:10,color:T.purple,cursor:"pointer",fontWeight:600,flexShrink:0}}>USE</button>
            </div>))}
          </div>)}
          {aiSug.countermeasureIdeas&&step>=3&&(<div>
            <div style={{fontSize:11,fontWeight:700,color:T.textMut,letterSpacing:"0.06em",marginBottom:6}}>COUNTERMEASURE IDEAS</div>
            {aiSug.countermeasureIdeas.map((a,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6,alignItems:"flex-start"}}>
              <span style={{color:T.cyan,fontSize:12,marginTop:1}}>›</span>
              <span style={{fontSize:12,color:T.textSec,flex:1}}>{a}</span>
              <button onClick={()=>upd("c4","longTermAction",a)} style={{background:T.cyanL,border:"none",borderRadius:4,padding:"1px 7px",fontSize:10,color:T.cyan,cursor:"pointer",fontWeight:600,flexShrink:0}}>USE</button>
            </div>))}
          </div>)}
        </Card>)}
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:700,color:T.text}}>🧠 Step Coaching</div>
            <Btn sm variant="secondary" onClick={fetchCoach} disabled={coachLoading||!apiKey}>{coachLoading?<><Spin/> Loading...</>:"Get Tips"}</Btn>
          </div>
          {!apiKey&&<div style={{fontSize:12,color:T.textMut}}>Add an API key to enable coaching.</div>}
          {coach&&(<div style={{display:"grid",gap:10}}>
            {coach.suggestions&&(<div>{coach.suggestions.map((s,i)=>(<div key={i} style={{fontSize:12,color:T.textSec,paddingLeft:12,borderLeft:`2px solid ${T.blue}`,marginBottom:6}}>{s}</div>))}</div>)}
            {coach.tpsInsight&&<IBox type="info"><strong>TPS Insight:</strong> {coach.tpsInsight}</IBox>}
          </div>)}
        </Card>
        <Card style={{background:T.surfaceL}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textMut,letterSpacing:"0.08em",marginBottom:12}}>RECORD DETAILS</div>
          <Steps status={rec.status}/>
          <div style={{marginTop:14,display:"grid",gap:7}}>
            {[{l:"ID",v:<span style={{fontFamily:FONT_MONO,fontWeight:700,color:T.blue}}>{rec.id}</span>},{l:"Line",v:rec.lineName},{l:"Status",v:<SBadge status={rec.status} sm/>},{l:"Due",v:<span style={{color:daysDiff(rec.dueDate)<0?T.red:T.text}}>{fmtDate(rec.dueDate)}</span>},{l:"Defect",v:rec.c1.defectCode||(rec.c1.defectFamily?DEFECT_TAXONOMY[rec.c1.defectFamily]?.name:"—")}].map(({l,v})=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,padding:"5px 0",borderBottom:`1px solid ${T.borderL}`}}>
                <span style={{color:T.textMut,fontWeight:500}}>{l}</span><span style={{textAlign:"right"}}>{v}</span>
              </div>))}
          </div>
        </Card>
      </div>
    </div>
  </div>);
}

// ── Dashboard ──
function Dashboard({records,session,onNew,onOpen,onLogout,onAdmin}){
  const active=records.filter(r=>r.status!=="closed");
  const closed=records.filter(r=>r.status==="closed");
  const overdue=active.filter(r=>daysDiff(r.dueDate)<0);
  const dueToday=active.filter(r=>daysDiff(r.dueDate)===0);
  const dueSoon=active.filter(r=>{const d=daysDiff(r.dueDate);return d>0&&d<=2;});
  const sorted=[...active].sort((a,b)=>daysDiff(a.dueDate)-daysDiff(b.dueDate));
  return(<div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,overflow:"hidden"}}>
    <div style={{background:T.surface,borderBottom:`1px solid ${T.borderL}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:T.shadow}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:40,height:40,background:T.blue,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:T.shadowM}}><span style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:FONT_MONO}}>5C</span></div>
        <div><h1 style={{fontSize:16,fontWeight:800,color:T.text}}>Corrective Action System</h1><p style={{fontSize:11,color:T.textSec}}>Graham Architectural Products · Toyota Production System</p></div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:600,color:T.text}}>{session.line.name} · {session.shift}</div><div style={{fontSize:11,color:T.textSec}}>{session.employees.map(firstName).join(", ")}</div></div>
        <Btn variant="primary" onClick={onNew}>+ New 5C</Btn>
        <Btn variant="ghost" sm onClick={onAdmin}>Admin</Btn>
        <Btn variant="ghost" sm onClick={onLogout}>Switch Line</Btn>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:24}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:24}}>
        {[{label:"Active 5Cs",value:active.length,color:T.blue,bg:T.blueL,note:"in progress"},{label:"Overdue",value:overdue.length,color:T.red,bg:T.redL,note:"past due date"},{label:"Due Today",value:dueToday.length,color:T.orange,bg:T.orangeL,note:"action needed"},{label:"Due in 2 Days",value:dueSoon.length,color:T.amber,bg:T.amberL,note:"act soon"},{label:"Closed Total",value:closed.length,color:T.green,bg:T.greenL,note:"all time"}].map(k=>(
          <div key={k.label} style={{background:T.surface,border:`1px solid ${k.color}33`,borderRadius:12,padding:"18px 20px",boxShadow:T.shadow,borderTop:`3px solid ${k.color}`}}>
            <div style={{fontSize:36,fontWeight:800,color:k.color,fontFamily:FONT_MONO,lineHeight:1}}>{k.value}</div>
            <div style={{fontSize:13,fontWeight:700,color:T.text,marginTop:6}}>{k.label}</div>
            <div style={{fontSize:11,color:T.textMut,marginTop:2}}>{k.note}</div>
          </div>))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><h2 style={{fontSize:14,fontWeight:700,color:T.text}}>Active Corrective Actions</h2><span style={{fontSize:12,color:T.textSec}}>{sorted.length} open · sorted by urgency</span></div>
      {sorted.length===0&&(<Card style={{textAlign:"center",padding:60,borderStyle:"dashed"}}><div style={{fontSize:48,marginBottom:12}}>✅</div><h3 style={{fontSize:18,color:T.text,marginBottom:6}}>All Clear</h3><p style={{fontSize:13,color:T.textSec}}>No active 5C records. Tap <strong>+ New 5C</strong> to document an issue.</p></Card>)}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
        {sorted.map(r=>{const urgent=daysDiff(r.dueDate)<0;const m=STATUS_META[r.status];return(
          <Card key={r.id} onClick={()=>onOpen(r)} style={{borderLeft:`4px solid ${urgent?T.redM:m.color}`,background:urgent?"#FFFAF9":T.surface}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <span style={{fontFamily:FONT_MONO,fontSize:12,fontWeight:700,color:T.blue}}>{r.id}</span>
                {r.repeatFlag&&<Badge label="Repeat" color={T.red} bg={T.redL} sm/>}
              </div>
              <AgBadge dueDate={r.dueDate} status={r.status}/>
            </div>
            <p style={{fontSize:13,color:T.text,fontWeight:500,marginBottom:10,lineHeight:1.4}}>{r.c1.description?.slice(0,90)}{r.c1.description?.length>90?"…":""}</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}><SBadge status={r.status} sm/>{r.c1.defectCode&&<Badge label={r.c1.defectCode} color={DEFECT_TAXONOMY[r.c1.defectFamily]?.color||T.blue} bg={T.surfaceL} sm/>}</div>
            <Steps status={r.status}/>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:10,fontSize:11,color:T.textMut}}><span>{r.lineName}</span><span>{r.team.map(firstName).join(", ")} · {fmtDate(r.createdAt)}</span></div>
          </Card>);})}
      </div>
      {closed.length>0&&(<div><h2 style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>Recently Closed</h2>
        <div style={{background:T.surface,border:`1px solid ${T.borderL}`,borderRadius:12,overflow:"hidden",boxShadow:T.shadow}}>
          {closed.slice(-5).reverse().map((r,i,arr)=>(<div key={r.id} onClick={()=>onOpen(r)} style={{display:"grid",gridTemplateColumns:"130px 1fr auto auto",gap:16,alignItems:"center",padding:"12px 16px",cursor:"pointer",borderBottom:i<arr.length-1?`1px solid ${T.borderL}`:"none"}} onMouseEnter={e=>e.currentTarget.style.background=T.surfaceL} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <span style={{fontFamily:FONT_MONO,fontSize:12,fontWeight:700,color:T.blue}}>{r.id}</span>
            <span style={{fontSize:13,color:T.textSec}}>{r.c1.description?.slice(0,55)}…</span>
            <SBadge status="closed" sm/>
            <span style={{fontSize:11,color:T.textMut}}>{fmtDate(r.c5.confirmedAt||r.createdAt)}</span>
          </div>))}
        </div>
      </div>)}
    </div>
  </div>);
}

// ── Admin Login ──
function AdminLogin({onAuth,onBack}){
  const [pin,setPin]=useState("");const [err,setErr]=useState("");
  return(<div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <Card style={{width:360}} className="fade-in">
      <div style={{textAlign:"center",marginBottom:20}}><div style={{fontSize:32,marginBottom:8}}>🔐</div><h2 style={{fontSize:16,fontWeight:700,color:T.text}}>Admin Access</h2><p style={{fontSize:12,color:T.textSec,marginTop:4}}>Quality leadership only</p></div>
      <FG label="Admin PIN"><Inp type="password" value={pin} onChange={setPin} placeholder="Enter PIN"/></FG>
      {err&&<div style={{color:T.redM,fontSize:12,marginTop:8}}>{err}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:16}}>
        <Btn variant="secondary" onClick={onBack}>← Back</Btn>
        <Btn onClick={()=>{if(pin===ADMIN_PIN)onAuth();else setErr("Incorrect PIN");}}>Enter →</Btn>
      </div>
      <p style={{fontSize:11,color:T.textMut,textAlign:"center",marginTop:12}}>Default PIN: gap2026</p>
    </Card>
  </div>);
}

// ── Admin Dashboard ──
function AdminSection({records,apiKey,onBack}){
  const [analysis,setAnalysis]=useState(null);const [loading,setLoading]=useState(false);const [err,setErr]=useState("");
  const closed=records.filter(r=>r.status==="closed");
  const active=records.filter(r=>r.status!=="closed");
  const byLine=LINES.map(l=>{const rs=records.filter(r=>r.lineId===l.id);return{name:l.id,total:rs.length,open:rs.filter(r=>r.status!=="closed").length,closed:rs.filter(r=>r.status==="closed").length,overdue:rs.filter(r=>r.status!=="closed"&&daysDiff(r.dueDate)<0).length};}).filter(d=>d.total>0);
  const byFamily=Object.entries(DEFECT_TAXONOMY).map(([k,v])=>{const n=records.filter(r=>r.c1.defectFamily===k).length;return{name:v.name,count:n,color:v.color,pct:records.length?Math.round(n/records.length*100):0};}).filter(d=>d.count>0).sort((a,b)=>b.count-a.count);
  let cum=0;const paretoData=byFamily.map(d=>{cum+=d.pct;return{...d,cumulative:Math.min(cum,100)};});
  const cycleTimes=closed.map(r=>{const days=Math.round((new Date(r.c5.confirmedAt||r.createdAt)-new Date(r.createdAt))/86400000);return{id:r.id.replace(/5C-\d+-/,""),days,late:days>5};});
  const avgCycle=cycleTimes.length?Math.round(cycleTimes.reduce((a,b)=>a+b.days,0)/cycleTimes.length):0;
  const onTime=cycleTimes.filter(c=>!c.late).length;
  const fetchAnalysis=async()=>{
    if(!apiKey){setErr("API key required.");return;}if(records.length<2){setErr("Need at least 2 records.");return;}
    setLoading(true);setErr("");setAnalysis(null);
    try{const r=await getAdminAnalysis(records,apiKey);setAnalysis(r);}catch(e){setErr("Analysis failed: "+e.message);}
    setLoading(false);
  };
  const TOOLTIP_STYLE={background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12};
  return(<div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg,overflow:"hidden"}}>
    <div style={{background:T.surface,borderBottom:`1px solid ${T.borderL}`,padding:"12px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,boxShadow:T.shadow}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,background:T.purple,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16}}>📊</span></div>
        <div><h1 style={{fontSize:15,fontWeight:800,color:T.text}}>Admin Intelligence Dashboard</h1><p style={{fontSize:11,color:T.textSec}}>Quality Leadership · GAP Continuous Improvement Agent</p></div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn onClick={fetchAnalysis} disabled={loading} variant="primary">{loading?<><Spin/> Analyzing…</>:"🤖 Run Weekly Analysis"}</Btn>
        <Btn variant="secondary" onClick={onBack}>← Exit Admin</Btn>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",padding:24}}>
      {err&&<div style={{marginBottom:16}}><IBox type="danger">{err}</IBox></div>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:24}}>
        {[{label:"Total Records",value:records.length,color:T.blue},{label:"Active",value:active.length,color:T.amber},{label:"Overdue",value:active.filter(r=>daysDiff(r.dueDate)<0).length,color:T.red},{label:"Closed",value:closed.length,color:T.green},{label:"Avg Cycle",value:`${avgCycle}d`,color:T.purple,note:"target 5d"}].map(k=>(
          <div key={k.label} style={{background:T.surface,border:`1px solid ${k.color}22`,borderRadius:12,padding:"16px 18px",boxShadow:T.shadow,borderTop:`3px solid ${k.color}`}}>
            <div style={{fontSize:32,fontWeight:800,color:k.color,fontFamily:FONT_MONO,lineHeight:1}}>{k.value}</div>
            <div style={{fontSize:12,fontWeight:700,color:T.text,marginTop:5}}>{k.label}</div>
            {k.note&&<div style={{fontSize:11,color:T.textMut}}>{k.note}</div>}
          </div>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        <Card><SH label="5Cs by Manufacturing Line" color={T.blue}/>
          {byLine.length===0?<div style={{textAlign:"center",padding:40,color:T.textMut}}>No data yet</div>:
          <ResponsiveContainer width="100%" height={220}><BarChart data={byLine} margin={{top:0,right:0,bottom:0,left:-15}}><CartesianGrid strokeDasharray="3 3" stroke={T.borderL}/><XAxis dataKey="name" tick={{fill:T.textSec,fontSize:11}}/><YAxis tick={{fill:T.textSec,fontSize:11}} allowDecimals={false}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="open" name="Active" fill={T.amber} radius={[3,3,0,0]}/><Bar dataKey="closed" name="Closed" fill={T.greenM} radius={[3,3,0,0]}/><Bar dataKey="overdue" name="Overdue" fill={T.redM} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer>}
        </Card>
        <Card><SH label="Defect Family Pareto (80/20)" color={T.orange}/>
          {paretoData.length===0?<div style={{textAlign:"center",padding:40,color:T.textMut}}>No data yet</div>:
          <ResponsiveContainer width="100%" height={220}><ComposedChart data={paretoData} margin={{top:0,right:20,bottom:0,left:-15}}><CartesianGrid strokeDasharray="3 3" stroke={T.borderL}/><XAxis dataKey="name" tick={{fill:T.textSec,fontSize:9}} interval={0} angle={-20} textAnchor="end" height={50}/><YAxis yAxisId="left" tick={{fill:T.textSec,fontSize:11}} allowDecimals={false}/><YAxis yAxisId="right" orientation="right" tickFormatter={v=>`${v}%`} tick={{fill:T.textSec,fontSize:11}} domain={[0,100]}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Bar yAxisId="left" dataKey="count" name="Count" radius={[3,3,0,0]}>{paretoData.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar><Line yAxisId="right" type="monotone" dataKey="cumulative" name="Cumulative %" stroke={T.redM} dot={false} strokeWidth={2}/><ReferenceLine yAxisId="right" y={80} stroke={T.amber} strokeDasharray="5 5"/></ComposedChart></ResponsiveContainer>}
        </Card>
        <Card><SH label="Cycle Time to Close (days)" color={T.purple}/>
          {cycleTimes.length===0?<div style={{textAlign:"center",padding:40,color:T.textMut}}>No closed records yet</div>:
          <ResponsiveContainer width="100%" height={220}><BarChart data={cycleTimes} margin={{top:0,right:0,bottom:0,left:-15}}><CartesianGrid strokeDasharray="3 3" stroke={T.borderL}/><XAxis dataKey="id" tick={{fill:T.textSec,fontSize:10}}/><YAxis tick={{fill:T.textSec,fontSize:11}}/><Tooltip contentStyle={TOOLTIP_STYLE}/><ReferenceLine y={5} stroke={T.amber} strokeDasharray="5 5" label={{value:"5d target",fill:T.amber,fontSize:10,position:"right"}}/><Bar dataKey="days" name="Days to close" radius={[3,3,0,0]}>{cycleTimes.map((d,i)=><Cell key={i} fill={d.late?T.redM:T.greenM}/>)}</Bar></BarChart></ResponsiveContainer>}
        </Card>
        <Card><SH label="Closure Performance" color={T.green}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            {[{label:"On Time (≤5d)",value:onTime,color:T.green},{label:"Late (>5d)",value:cycleTimes.length-onTime,color:T.red},{label:"On-Time Rate",value:cycleTimes.length?`${Math.round(onTime/cycleTimes.length*100)}%`:"—",color:T.blue}].map(m=>(<div key={m.label} style={{textAlign:"center",padding:14,borderRadius:8,background:T.surfaceL}}><div style={{fontSize:28,fontWeight:800,color:m.color,fontFamily:FONT_MONO}}>{m.value}</div><div style={{fontSize:11,color:T.textSec,marginTop:4}}>{m.label}</div></div>))}
          </div>
          {records.filter(r=>r.repeatFlag).length>0&&<IBox type="warning"><strong>{records.filter(r=>r.repeatFlag).length} repeat issue{records.filter(r=>r.repeatFlag).length>1?"s":""}</strong> — root causes may not have been fully eliminated.</IBox>}
        </Card>
      </div>
      {!analysis&&!loading&&(<Card style={{textAlign:"center",padding:48,borderStyle:"dashed"}}>
        <div style={{fontSize:40,marginBottom:12}}>🤖</div>
        <h3 style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:6}}>GAP Continuous Improvement Agent</h3>
        <p style={{fontSize:13,color:T.textSec,marginBottom:20,maxWidth:460,margin:"0 auto 20px"}}>Run a full AI analysis across all 5C records to identify patterns, Six Sigma insights, cross-line correlations, and ranked improvement opportunities.</p>
        <Btn onClick={fetchAnalysis} disabled={!apiKey} style={{margin:"0 auto"}}>{!apiKey?"API Key Required":"🤖 Run Analysis Now"}</Btn>
      </Card>)}
      {loading&&(<Card style={{textAlign:"center",padding:40}}><Spin/><p style={{fontSize:14,color:T.textSec,marginTop:12}}>The GAP CI Agent is analyzing your quality data…</p></Card>)}
      {analysis&&(<div style={{display:"grid",gap:16}} className="fade-in">
        <Card style={{borderLeft:`4px solid ${T.blue}`}}><SH label="Executive Summary" color={T.blue}/><p style={{fontSize:14,color:T.text,lineHeight:1.6}}>{analysis.execSummary}</p></Card>
        {analysis.recommendedFocus&&<IBox type="warning"><strong>This Week's Priority:</strong> {analysis.recommendedFocus}</IBox>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          {analysis.topPatterns?.length>0&&(<Card><SH label="Top Patterns Identified" color={T.amber}/>
            {analysis.topPatterns.map((p,i)=>(<div key={i} style={{borderBottom:`1px solid ${T.borderL}`,paddingBottom:12,marginBottom:12}}>
              <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}><Badge label={p.frequency} color={p.frequency==="high"?T.red:p.frequency==="medium"?T.amber:T.green} bg={p.frequency==="high"?T.redL:p.frequency==="medium"?T.amberL:T.greenL} sm/><span style={{fontSize:13,fontWeight:600,color:T.text}}>{p.pattern}</span></div>
              <p style={{fontSize:12,color:T.textSec}}>→ {p.recommendation}</p>
            </div>))}
          </Card>)}
          {analysis.sixSigmaInsights?.length>0&&(<Card><SH label="Six Sigma Insights" color={T.purple}/>
            {analysis.sixSigmaInsights.map((s,i)=>(<div key={i} style={{borderBottom:`1px solid ${T.borderL}`,paddingBottom:12,marginBottom:12}}>
              <div style={{marginBottom:4}}><Badge label={s.tool} color={T.purple} bg={T.purpleL} sm/></div>
              <p style={{fontSize:13,color:T.text,marginBottom:4}}>{s.insight}</p>
              <p style={{fontSize:12,color:T.blue}}>→ {s.action}</p>
            </div>))}
          </Card>)}
        </div>
        {analysis.processImprovements?.length>0&&(<Card><SH label="Process Improvement Recommendations" color={T.green}/>
          <div style={{display:"grid",gap:10}}>
            {[...analysis.processImprovements].sort((a,b)=>a.priority-b.priority).map((p,i)=>(<div key={i} style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:12,alignItems:"start",padding:"12px 14px",background:T.surfaceL,borderRadius:8,border:`1px solid ${T.borderL}`}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:p.priority==="1"?T.blue:p.priority==="2"?T.purple:T.textSec,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0}}>{p.priority}</div>
              <div><p style={{fontSize:13,fontWeight:600,color:T.text,marginBottom:3}}>{p.improvement}</p><p style={{fontSize:12,color:T.textSec}}>Expected: {p.expectedImpact}</p></div>
            </div>))}
          </div>
        </Card>)}
        {analysis.positives?.length>0&&(<Card style={{borderLeft:`4px solid ${T.greenM}`}}><SH label="What's Going Well" color={T.green}/>
          {analysis.positives.map((p,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6}}><span style={{color:T.greenM}}>✓</span><span style={{fontSize:13,color:T.textSec}}>{p}</span></div>))}
        </Card>)}
      </div>)}
      <div style={{marginTop:20}}>
        <h2 style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:12}}>All Records</h2>
        <div style={{background:T.surface,border:`1px solid ${T.borderL}`,borderRadius:12,overflow:"hidden",boxShadow:T.shadow}}>
          <div style={{display:"grid",gridTemplateColumns:"110px 1fr 100px 90px 90px 90px",padding:"10px 16px",background:T.surfaceL,borderBottom:`1px solid ${T.borderL}`,fontSize:11,fontWeight:700,color:T.textMut,letterSpacing:"0.06em"}}><span>ID</span><span>Description</span><span>Line</span><span>Code</span><span>Status</span><span>Due</span></div>
          {records.length===0&&<div style={{textAlign:"center",padding:32,color:T.textMut}}>No records yet</div>}
          {records.slice().reverse().map((r,i)=>(<div key={r.id} style={{display:"grid",gridTemplateColumns:"110px 1fr 100px 90px 90px 90px",padding:"10px 16px",borderBottom:i<records.length-1?`1px solid ${T.borderL}`:"none",fontSize:12,alignItems:"center"}}>
            <span style={{fontFamily:FONT_MONO,fontWeight:700,color:T.blue}}>{r.id}</span>
            <span style={{color:T.textSec}}>{r.c1.description?.slice(0,50)||"—"}{r.c1.description?.length>50?"…":""}</span>
            <span style={{color:T.textSec,fontSize:11}}>{r.lineName?.split(" ").slice(0,2).join(" ")}</span>
            <span style={{fontFamily:FONT_MONO,fontSize:11,color:T.textSec}}>{r.c1.defectCode||"—"}</span>
            <SBadge status={r.status} sm/>
            <span style={{color:daysDiff(r.dueDate)<0&&r.status!=="closed"?T.redM:T.textSec}}>{fmtDate(r.dueDate)}</span>
          </div>))}
        </div>
      </div>
    </div>
  </div>);
}

// ── Root ──
export default function App(){
  const [screen,setScreen]=useState("loading");
  const [session,setSession]=useState(null);
  const [records,setRecords]=useState([]);
  const [activeRec,setActiveRec]=useState(null);
  const [apiKey,setApiKeyState]=useState("");
  const [adminAuthed,setAdminAuthed]=useState(false);
  useEffect(()=>{const data=loadRecs();const key=getApiKey();setRecords(data);setApiKeyState(key);setScreen(key?"login":"apikey");},[]);
  const persist=useCallback((u)=>{setRecords(u);saveRecs(u);},[]);
  const handleSave=useCallback((updated)=>{
    const next=records.find(r=>r.id===updated.id)?records.map(r=>r.id===updated.id?updated:r):[...records,updated];
    persist(next);setActiveRec(updated);
    const su=getSheetsUrl();if(su){try{fetch(su,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:updated.id,line:updated.lineName,status:updated.status,desc:updated.c1.description,code:updated.c1.defectCode,created:updated.createdAt})});}catch(e){}}
  },[records,persist]);
  if(screen==="loading")return(<div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{display:"flex",alignItems:"center",gap:12}}><div style={{width:40,height:40,background:T.blue,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:16,fontWeight:800,color:"#fff",fontFamily:FONT_MONO}}>5C</span></div><span style={{fontSize:14,color:T.textSec}}>Loading…</span></div></div>);
  if(screen==="apikey")return <ApiKeySetup onDone={()=>{setApiKeyState(getApiKey());setScreen("login");}}/>;
  if(screen==="login")return <LoginScreen onLogin={s=>{setSession(s);setScreen("dashboard");}}/>;
  if(screen==="admin-login")return <AdminLogin onAuth={()=>{setAdminAuthed(true);setScreen("admin");}} onBack={()=>setScreen("dashboard")}/>;
  if(screen==="admin"&&adminAuthed)return <AdminSection records={records} apiKey={apiKey} onBack={()=>setScreen("dashboard")}/>;
  if(screen==="wizard"&&activeRec)return <Wizard record={activeRec} session={session} records={records} apiKey={apiKey} onSave={handleSave} onCancel={()=>setScreen("dashboard")}/>;
  return <Dashboard records={records} session={session}
    onNew={()=>{const r=newRecord(genId(records),session);setActiveRec(r);setScreen("wizard");}}
    onOpen={r=>{setActiveRec(r);setScreen("wizard");}}
    onLogout={()=>setScreen("login")}
    onAdmin={()=>setScreen(adminAuthed?"admin":"admin-login")}/>;
}
