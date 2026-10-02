/* ===== навігація ===== */
const PAGES=[["home","🏠","Головна"],["craft","⚗️","Крафт"],["goods","🛒","Товари"],["stock","📦","Склад аптеки"],["alerts","🔔","Система оповіщення"],["orders","📑","Оптові замовлення"],["calc","🧮","Підрахунок"],["log","📜","Журнал операцій"],["profile","👤","Профіль"],["admin","🛡️","Адмін-панель"]];
function buildNav(){
  const n=$("#nav");n.querySelectorAll("a").forEach(a=>a.remove());
  PAGES.forEach(([id,ic,t])=>{
    if(id==="admin"&&S.user?.role!=="admin"&&!S.preview)return;
    const a=document.createElement("a");a.dataset.p=id;a.innerHTML=`<span>${ic}</span>${t}`;
    a.onclick=()=>go(id);n.append(a)});
}
function go(id){
  document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("on",a.dataset.p===id));
  const v=$("#view");v.style.animation="none";void v.offsetWidth;v.style.animation="";
  (VIEWS[id]||stub)(v,id);location.hash=id;
}
function stub(v,id){
  const p=PAGES.find(x=>x[0]===id);
  v.innerHTML=`<div class="top"><h2>${p[1]} ${p[2]}</h2></div>${noSrv()}<div class="card">Розділ недоступний.</div>`;
}


const VIEWS={};
