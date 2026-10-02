VIEWS.log=v=>{
  page(v,"📜 Журнал операцій","log.list",{limit:200},d=>`<input id="fq" placeholder="Фільтр" style="margin-bottom:12px">`+tbl([["time","Час"],["user","Користувач"],["type","Тип"],["desc","Опис"],["status","Статус"]],d)).then(d=>{if(d)$("#fq").oninput=e=>document.querySelectorAll("#pb tr:not(:first-child)").forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase()))});
};
