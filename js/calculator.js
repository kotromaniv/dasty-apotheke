/* ===== підрахунок ===== */
VIEWS.calc=v=>{
  v.innerHTML=`<div class="top"><h2>🧮 Підрахунок</h2><button class="btn ghost" id="kp">Оновити ціну</button></div>${noSrv()}<div class="card"><div class="row">
  <div><label>Категорія</label><select id="kc">${CATS.map((c,i)=>`<option value="${i}">${c}</option>`).join("")}</select></div>
  <div><label>Рецепт</label><select id="kr"></select></div>
  <div><label>Потрібна кількість продукції</label><input id="kq" type="number" min="1" value="100"></div></div></div><div id="ko" style="margin-top:14px"></div>`;
  const fill=()=>{$("#kr").innerHTML=RECIPES.filter(r=>r.cat==+$("#kc").value&&!r.na).map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join("")||"<option value=''>Немає доступних рецептів</option>";run()};
  const run=()=>{
    const r=RECIPES.find(x=>x.id===$("#kr").value),q=Math.max(1,parseInt($("#kq").value)||1);
    if(!r){$("#ko").innerHTML="";return}
    const cy=Math.ceil(q/r.yield),out=cy*r.yield;let cost=0,unk=0;
    const rows=Object.entries(r.ing).map(([n,per])=>{
      const need=per*cy,have=stock(n),def=Math.max(0,need-have),p=S.prices[n];let c="—";
      if(def>0){if(p==null){unk++;c="—"}else{c=def*p;cost+=c}}
      return`<tr><td>${esc(n)}</td><td>${need}</td><td>${have}</td><td class="${def?"bad":""}">${def}</td><td>${p??"Ціну не вказано"}</td><td>${c}</td></tr>`}).join("");
    $("#ko").innerHTML=`<div class="card"><h3>${esc(r.name)}</h3>
    <p class="meta">Цільова кількість: ${q} · Циклів: <b>${cy}</b> · Фактичний вихід: <b>${out}</b> · Надлишок: ${out-q} · Час: ${fmtT(cy*r.time)}</p>
    <div style="overflow-x:auto"><table><tr><th>Інгредієнт</th><th>Потрібно</th><th>На складі</th><th>Дефіцит</th><th>Ціна/од.</th><th>Вартість дефіциту</th></tr>${rows}</table></div>
    <p style="margin-top:10px">Орієнтовна вартість закупівлі: <b>${cost}</b>${unk?` <span class="meta">(без ${unk} поз. — ціну не вказано)</span>`:""}</p></div>`};
  $("#kc").onchange=fill;$("#kr").onchange=run;$("#kq").oninput=run;fill();
  $("#kp").onclick=()=>form("Ціна закупівлі (від інших гравців)",[{k:"item",l:"Предмет",o:[...new Set(RECIPES.flatMap(r=>Object.keys(r.ing||{})))].sort()},{k:"price",l:"Ціна за одиницю",t:"number"},{k:"note",l:"Джерело / примітка"}],async d=>{await api("prices.set",d);await loadRef();run()});
};

