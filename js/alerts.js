VIEWS.alerts=v=>{
  if(!isAdmin()){v.innerHTML='<div class="warn">Доступно лише адміністратору</div>';return}
  page(v,"🔔 Система оповіщення","alerts.list",{},d=>tbl([["item","Предмет"],["condition","Умова"],["interval","Інтервал, хв"],["sent","Надіслано"],["repeats","Всього"],["status","Статус"],["lastError","Помилка"],["a","",o=>ra(o.id,[["toggle","Вкл/Викл"],["stop","Зупинити"],["restart","Перезапуск"],["del","Видалити"]])]],d),`<button class="btn" id="b1">Нове сповіщення</button>`);
  const names=Object.keys(S.inv).sort();
  $("#b1").onclick=()=>form("Нове сповіщення",[names.length?{k:"item",l:"Предмет",o:names}:{k:"item",l:"Предмет"},{k:"condition",l:"Умова запуску",o:[["manual","Ручний"],["min","Досягнуто мін. залишку"],["zero","Предмет відсутній"]]},{k:"message",l:"Додатковий текст",t:"area"},{k:"interval",l:"Інтервал, хв",t:"number",v:5},{k:"repeats",l:"Кількість повідомлень",t:"number",v:5},{k:"chatId",l:"Telegram chat ID"},{k:"start",l:"Час початку (Київ)",t:"datetime-local"}],async x=>{await api("alerts.save",x);go("alerts")});
  v.onclick=async e=>{const b=e.target.closest("[data-a]");if(b&&await act("alerts.action",{id:b.dataset.id,op:b.dataset.a}))go("alerts")};
  api("alerts.history").then(h=>v.insertAdjacentHTML("beforeend",`<div class="card" style="margin-top:14px"><h3>Історія відправлення</h3>${tbl([["time","Час"],["item","Предмет"],["n","№"],["status","Статус"],["error","Помилка"]],h)}</div>`)).catch(()=>{});
};
