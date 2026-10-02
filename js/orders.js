VIEWS.orders=v=>{
  page(v,"📑 Оптові замовлення","orders.list",{},d=>tbl([["title","Назва"],["party","Замовник"],["total","Сума"],["due","Дата"],["status","Статус"],["progress","Прогрес"],["a","",o=>ra(o.id,[["info","Деталі"],["fulfil","Виконати"],["cancel","Скасувати"]])]],d),`<button class="btn" id="b1">Нове замовлення</button>`);
  $("#b1").onclick=()=>form("Нове замовлення",[{k:"title",l:"Назва"},{k:"party",l:"Замовник / постачальник"},{k:"due",l:"Планова дата",t:"date"},{k:"items",l:"Позиції (рядок: Назва;кількість;ціна)",t:"area"},{k:"comment",l:"Коментар"}],async x=>{
    x.items=x.items.split("\n").map(s=>s.trim()).filter(Boolean).map(s=>{const[n,q,p]=s.split(";");return{name:n.trim(),qty:+q,price:p===undefined||p===""?null:+p}});
    if(!x.items.length||x.items.some(i=>!i.name||!(i.qty>0)))throw new Error("Перевірте позиції");
    await api("orders.save",x);go("orders")});
  v.onclick=async e=>{const b=e.target.closest("[data-a]");if(!b)return;const{a,id}=b.dataset;
    if(a==="info"){try{const o=await api("orders.get",{id});modal(`<h2>${esc(o.title)}</h2><p class="meta">${esc(o.status)} · прогрес ${esc(o.progress)}</p>${tbl([["name","Предмет"],["qty","Потрібно"],["stock","На складі"],["missing","Бракує"],["price","Ціна"]],o.items)}<h3 style="margin-top:12px">Історія</h3>${tbl([["time","Час"],["user","Хто"],["text","Зміна"]],o.history)}<button class="btn ghost" style="margin-top:12px" onclick="this.closest('.modal').remove()">Закрити</button>`)}catch(x){toast(x.message,"er")}return}
    if(a==="fulfil"&&!confirm("Підтвердити виконання та списання зі складу?"))return;
    if(await(a==="fulfil"?act("orders.fulfil",{id}):act("orders.status",{id,status:"Скасовано"})))go("orders")};
};
