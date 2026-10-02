/* ===== утиліти ===== */
const $=(s,e=document)=>e.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(m,t="ok"){const d=document.createElement("div");d.className="t "+t;d.textContent=m;$("#toast").append(d);setTimeout(()=>d.remove(),4000)}
const stock=n=>S.inv[n]??0;
const fmtT=s=>s>=60?Math.floor(s/60)+" хв "+(s%60?s%60+" с":""):s+" с";
const noSrv=()=>!CONFIG.API_URL&&`<div class="note">Сервер не підключено. Залишки, ціни та статистика з'являться після підключення Google Apps Script (CONFIG.API_URL). Дані не вигадуються.</div>`;

