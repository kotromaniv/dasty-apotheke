/* спільні UI-хелпери */
const isAdmin=()=>S.user?.role==="admin"||S.preview;
const tbl=(c,r)=>r?.length?`<div style="overflow-x:auto"><table><tr>${c.map(x=>`<th>${x[1]}</th>`).join("")}</tr>${r.map(o=>`<tr>${c.map(x=>`<td>${x[2]?x[2](o):esc(o[x[0]]??"—")}</td>`).join("")}</tr>`).join("")}</table></div>`:`<p class="meta">Даних немає.</p>`;
const ra=(id,l)=>l.map(([a,t])=>`<button class="btn ghost" data-a="${a}" data-id="${esc(id)}">${t}</button>`).join(" ");
async function loadRef(){
  if(!CONFIG.API_URL||S.preview)return;
  try{const d=await api("snapshot");S.inv=d.inv||{};S.prices=d.prices||{};S.total=d.total;CONFIG.CAPACITY=d.capacity||CONFIG.CAPACITY;
    if(d.recipes?.length){RECIPES.length=0;RECIPES.push(...d.recipes)}}catch(e){toast(e.message,"er")}
}
async function act(a,d,m){try{await api(a,d);toast(m||"Готово");return true}catch(e){toast(e.message,"er");return false}}
async function page(v,title,action,data,render,btns=""){
  v.onclick=null;
  v.innerHTML=`<div class="top"><h2>${title}</h2><div>${btns}</div></div>${noSrv()}<div class="card" id="pb"><span class="meta">Завантаження…</span></div>`;
  try{const d=await api(action,data);$("#pb").innerHTML=render(d);return d}
  catch(e){const b=$("#pb");if(b)b.innerHTML=`<p class="meta">${esc(e.message)}</p>`;return null}
}
function modal(h){const m=document.createElement("div");m.className="modal";m.innerHTML=`<div class="mb">${h}</div>`;document.body.append(m);return m}
function form(title,fields,done){
  const m=modal(`<h2>${title}</h2>${fields.map(f=>`<label>${f.l}</label>`+(f.o?`<select name="${f.k}">${f.o.map(o=>{o=Array.isArray(o)?o:[o,o];return`<option value="${esc(o[0])}">${esc(o[1])}</option>`}).join("")}</select>`:f.t==="area"?`<textarea name="${f.k}" rows="4">${esc(f.v??"")}</textarea>`:`<input name="${f.k}" type="${f.t||"text"}" value="${esc(f.v??"")}">`)).join("")}<div class="err" id="fe"></div><div style="display:flex;gap:8px;margin-top:14px"><button class="btn" id="fs">Зберегти</button><button class="btn ghost" id="fc">Скасувати</button></div>`);
  $("#fc",m).onclick=()=>m.remove();
  $("#fs",m).onclick=async()=>{const d={};m.querySelectorAll("[name]").forEach(e=>d[e.name]=e.type==="number"?+e.value:e.value);
    try{await done(d);m.remove()}catch(e){$("#fe",m).textContent=e.message}};
}
