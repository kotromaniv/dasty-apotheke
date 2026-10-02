/* ===== крафт ===== */
let craftCat=0;
VIEWS.craft=v=>{
  v.innerHTML=`<div class="top"><h2>⚗️ Крафт</h2></div>${noSrv()}<div class="chips" id="cc"></div><div class="grid" id="rg"></div>`;
  $("#cc").innerHTML=CATS.map((c,i)=>`<span class="chip ${i===craftCat?"on":""}" data-i="${i}">${ICON[i]} ${c}</span>`).join("");
  $("#cc").onclick=e=>{const i=e.target.dataset.i;if(i!=null){craftCat=+i;VIEWS.craft(v)}};
  $("#rg").innerHTML=RECIPES.filter(r=>r.cat===craftCat).map(r=>{
    if(r.na)return`<div class="card rc"><h3>${esc(r.name)}</h3><span class="tag">Наразі недоступний</span><button class="btn" disabled>Створити</button></div>`;
    const ok=Object.entries(r.ing).every(([n,q])=>stock(n)>=q);
    return`<div class="card rc">${ph(r)}<h3>${esc(r.name)}</h3>
    <div class="meta">Вміння: ${r.skill} · ${fmtT(r.time)} · вихід: ${r.yield}</div>
    ${Object.entries(r.ing).map(([n,q])=>`<div class="ing ${stock(n)<q?"bad":""}"><span>${esc(n)}</span><span>${stock(n)} / ${q}</span></div>`).join("")}
    <div class="meta">${ok?"✅ Ресурсів достатньо":"⛔ Ресурсів не вистачає"}</div>
    <button class="btn" data-r="${r.id}">Створити</button></div>`}).join("");
  $("#rg").onclick=e=>{const id=e.target.dataset.r;if(id)craftModal(RECIPES.find(r=>r.id===id))};
};
function craftModal(r){
  const m=document.createElement("div");m.className="modal";
  m.innerHTML=`<div class="mb"><h2>${esc(r.name)}</h2><label>Кількість виробничих циклів</label><input id="cy" type="number" min="1" value="1"><div id="sm"></div>
  <div style="display:flex;gap:8px;margin-top:14px"><button class="btn" id="ok">Підтвердити крафт</button><button class="btn ghost" id="no">Скасувати</button></div></div>`;
  document.body.append(m);
  const total=()=>S.total??Object.values(S.inv).reduce((a,b)=>a+b,0);
  const calc=()=>{
    const c=Math.max(1,parseInt($("#cy").value)||1),ins=Object.entries(r.ing).map(([n,q])=>[n,q*c,stock(n)]);
    const used=ins.reduce((a,x)=>a+x[1],0),out=r.yield*c,fin=total()-used+out;
    const w=[];ins.forEach(([n,q,s])=>{if(s<q)w.push(`Не вистачає: ${n} (${q-s})`)});
    if(CONFIG.API_URL&&fin>CONFIG.CAPACITY)w.push("Перевищено місткість складу "+CONFIG.CAPACITY);
    if(!CONFIG.API_URL)w.push("Сервер не підключено");
    $("#sm").innerHTML=`<p class="meta">Час: ${fmtT(r.time*c)} · Продукції на склад: <b>${out}</b></p>
    <table><tr><th>Інгредієнт</th><th>Списати</th><th>Є</th><th>Залишиться</th></tr>${ins.map(([n,q,s])=>`<tr><td>${esc(n)}</td><td>${q}</td><td class="${s<q?"bad":""}">${s}</td><td>${s-q}</td></tr>`).join("")}</table>
    <p class="meta">Підсумок складу після операції: ${fin} / ${CONFIG.CAPACITY}</p>${w.map(x=>`<div class="warn">${esc(x)}</div>`).join("")}`;
    $("#ok").disabled=w.length>0;return c};
  $("#cy").oninput=calc;calc();$("#no").onclick=()=>m.remove();
  $("#ok").onclick=async()=>{const c=calc();$("#ok").innerHTML='<span class="spin"></span>Виконується';
    try{await api("craft",{recipeId:r.id,cycles:c});toast("Крафт завершено ✅");celebrate(r.name);sfx("done");m.remove();loadRef().then(()=>go("craft"))}
    catch(e){toast(e.message,"er");$("#ok").textContent="Підтвердити крафт"}};
}

