/* ===== головна ===== */
VIEWS.home=async v=>{
  const kyiv=()=>new Intl.DateTimeFormat("uk-UA",{timeZone:"Europe/Kyiv",dateStyle:"full",timeStyle:"medium"}).format(new Date());
  v.innerHTML=`<div class="top"><div><h2>Вітаємо, ${esc(S.user?.name||"гостю")}</h2><div class="meta" id="clk">${kyiv()} (Київ)</div></div></div>${noSrv()}
  <div class="grid" id="st"></div>
  <div class="grid" style="margin-top:14px"><div class="card"><h3>Швидкі переходи</h3><div class="chips" style="margin-top:10px"><span class="chip" onclick="go('craft')">⚗️ Крафт</span><span class="chip" onclick="go('calc')">🧮 Підрахунок</span><span class="chip" onclick="go('stock')">📦 Склад</span></div></div>
  <div class="card"><h3>Повідомлення адміністратора</h3><p class="meta" id="msg">—</p></div>
  <div class="card"><h3>Останні дії</h3><p class="meta" id="act">—</p></div></div>`;
  const t=setInterval(()=>{const c=$("#clk");c?c.textContent=kyiv()+" (Київ)":clearInterval(t)},1000);
  let d={};try{if(CONFIG.API_URL&&!S.preview)d=await api("dashboard")||{}}catch(e){toast(e.message,"er")}
  const cap=d.capacity||CONFIG.CAPACITY,tot=d.totalUnits;
  const items=[["Позицій на складі",d.positions],["Заповненість складу",tot!=null?Math.round(tot/cap*100)+"% ("+tot+"/"+cap+")":null],["Одиниць готової продукції",d.products],["Активні оптові замовлення",d.activeOrders],["Активні сповіщення",d.activeAlerts]];
  $("#st").innerHTML=items.map(([l,x])=>`<div class="card stat"><b>${x??"—"}</b><span>${l}</span></div>`).join("");
  if(d.adminMessage)$("#msg").textContent=d.adminMessage;
  if(d.recent?.length)$("#act").innerHTML=d.recent.map(r=>esc(r)).join("<br>");
};

