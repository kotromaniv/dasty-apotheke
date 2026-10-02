VIEWS.stock=v=>{
  const p=page(v,"📦 Склад аптеки","inventory.list",{},d=>{const pc=Math.round(d.total/d.capacity*100);
    return`<p>${d.total} / ${d.capacity} (${pc}%) · найменувань: ${d.items.length}</p><div class="bar"><i style="width:${Math.min(100,pc)}%"></i></div>${pc>=90?'<div class="warn">Склад майже заповнений</div>':""}<input id="fq" placeholder="Пошук за назвою" style="margin:12px 0">`+
    tbl([["name","Назва"],["category","Категорія"],["qty","К-сть"],["unit","Од."],["reserved","Резерв"],["min","Мін."],["updated","Змінено"]],d.items)},
    `<button class="btn" id="b1">Операція зі складом</button>${isAdmin()?'<button class="btn ghost" id="b2">Новий предмет</button>':""}`);
  p.then(d=>{if(!d)return;
    $("#fq").oninput=e=>document.querySelectorAll("#pb tr:not(:first-child)").forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(e.target.value.toLowerCase()));
    $("#b1").onclick=()=>form("Операція зі складом",[{k:"type",l:"Тип",o:[["in","Надходження"],["out","Ручне списання"],["adjust","Коригування (нове значення)"]]},{k:"itemId",l:"Предмет",o:d.items.map(i=>[i.id,i.name])},{k:"qty",l:"Кількість",t:"number"},{k:"reason",l:"Причина (обов'язково)"}],async x=>{await api("inventory.move",x);toast("Збережено");loadRef();go("stock")});
    if($("#b2"))$("#b2").onclick=()=>form("Новий предмет",[{k:"name",l:"Назва"},{k:"category",l:"Категорія",o:CATS},{k:"unit",l:"Одиниця обліку",v:"шт"},{k:"min",l:"Мінімальний залишок",t:"number"},{k:"note",l:"Примітка"}],async x=>{await api("inventory.addItem",x);go("stock")});
    api("inventory.history").then(h=>v.insertAdjacentHTML("beforeend",`<div class="card" style="margin-top:14px"><h3>Історія руху</h3>${tbl([["time","Час"],["user","Користувач"],["item","Предмет"],["delta","Зміна"],["reason","Причина"]],h)}</div>`)).catch(()=>{});
  });
};
